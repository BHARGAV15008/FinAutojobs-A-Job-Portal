import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, applications, jobs, companies } from '../schema.js';
import { eq, and, or, desc } from 'drizzle-orm';

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
          'http://localhost:5173',
          'http://localhost:4173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3002',
          'http://127.0.0.1:5173'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Store connected users with their socket IDs and user info
    this.connectedUsers = new Map();
    this.userRooms = new Map(); // Track which rooms each user is in

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await db.select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (user.length === 0) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.user = user[0];
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.username} (${socket.userId})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join role-based rooms
      socket.join(`role_${socket.user.role}`);
      
      // Handle joining company room if user is associated with a company
      if (socket.user.company_id) {
        socket.join(`company_${socket.user.company_id}`);
      }

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Successfully connected to real-time services',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Handle joining job-specific rooms
      socket.on('join_job_room', (jobId) => {
        socket.join(`job_${jobId}`);
        this.userRooms.get(socket.userId).add(`job_${jobId}`);
        socket.emit('joined_job_room', { jobId, message: `Joined room for job ${jobId}` });
      });

      // Handle leaving job-specific rooms
      socket.on('leave_job_room', (jobId) => {
        socket.leave(`job_${jobId}`);
        this.userRooms.get(socket.userId).delete(`job_${jobId}`);
        socket.emit('left_job_room', { jobId, message: `Left room for job ${jobId}` });
      });

      // Handle real-time job application updates
      socket.on('application_update', async (data) => {
        try {
          const { applicationId, status, notes } = data;
          
          // Verify user has permission to update this application
          const application = await db.select({
            id: applications.id,
            job_id: applications.job_id,
            user_id: applications.user_id,
            status: applications.status
          })
          .from(applications)
          .where(eq(applications.id, applicationId))
          .limit(1);

          if (application.length === 0) {
            socket.emit('error', { message: 'Application not found' });
            return;
          }

          const app = application[0];
          
          // Check permissions: admin, company recruiter, or the applicant
          const hasPermission = socket.user.role === 'admin' || 
                               (socket.user.company_id && app.job_id === socket.user.company_id) ||
                               app.user_id === socket.userId;

          if (!hasPermission) {
            socket.emit('error', { message: 'Permission denied' });
            return;
          }

          // Update application status
          await db.update(applications)
            .set({
              status: status,
              updated_at: new Date().toISOString(),
              hr_notes: notes || app.hr_notes
            })
            .where(eq(applications.id, applicationId));

          // Get updated application with job details
          const updatedApplication = await db.select({
            id: applications.id,
            status: applications.status,
            job_id: applications.job_id,
            user_id: applications.user_id,
            created_at: applications.created_at,
            job_title: jobs.title,
            company_name: companies.name
          })
          .from(applications)
          .leftJoin(jobs, eq(applications.job_id, jobs.id))
          .leftJoin(companies, eq(jobs.company_id, companies.id))
          .where(eq(applications.id, applicationId))
          .limit(1);

          const appData = updatedApplication[0];

          // Notify the applicant
          this.io.to(`user_${app.user_id}`).emit('application_status_updated', {
            application: appData,
            message: `Your application status for ${appData.job_title} has been updated to ${status}`,
            timestamp: new Date().toISOString()
          });

          // Notify company recruiters
          if (appData.company_name) {
            this.io.to(`role_employer`).to(`role_admin`).emit('application_updated', {
              application: appData,
              updatedBy: socket.user.username,
              timestamp: new Date().toISOString()
            });
          }

          socket.emit('application_update_success', {
            application: appData,
            message: 'Application updated successfully'
          });

        } catch (error) {
          console.error('Application update error:', error);
          socket.emit('error', { message: 'Failed to update application' });
        }
      });

      // Handle new job posting notifications
      socket.on('new_job_posted', async (data) => {
        try {
          const { jobId } = data;
          
          // Get job details
          const job = await db.select({
            id: jobs.id,
            title: jobs.title,
            company_name: companies.name,
            location: jobs.location,
            job_type: jobs.job_type,
            created_at: jobs.created_at
          })
          .from(jobs)
          .leftJoin(companies, eq(jobs.company_id, companies.id))
          .where(eq(jobs.id, jobId))
          .limit(1);

          if (job.length === 0) {
            socket.emit('error', { message: 'Job not found' });
            return;
          }

          const jobData = job[0];

          // Broadcast to all job seekers
          this.io.to('role_jobseeker').emit('new_job_alert', {
            job: jobData,
            message: `New job posted: ${jobData.title} at ${jobData.company_name}`,
            timestamp: new Date().toISOString()
          });

          // Also broadcast to admin room
          this.io.to('role_admin').emit('new_job_posted_admin', {
            job: jobData,
            postedBy: socket.user.username,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('New job notification error:', error);
          socket.emit('error', { message: 'Failed to send job notification' });
        }
      });

      // Handle real-time messaging between applicants and recruiters
      socket.on('send_message', async (data) => {
        try {
          const { recipientId, message, jobId } = data;
          
          // Verify recipient exists
          const recipient = await db.select()
            .from(users)
            .where(eq(users.id, recipientId))
            .limit(1);

          if (recipient.length === 0) {
            socket.emit('error', { message: 'Recipient not found' });
            return;
          }

          const messageData = {
            id: Date.now(), // Simple ID for demo
            senderId: socket.userId,
            senderName: socket.user.full_name || socket.user.username,
            recipientId,
            message,
            jobId,
            timestamp: new Date().toISOString()
          };

          // Send to recipient
          this.io.to(`user_${recipientId}`).emit('new_message', messageData);
          
          // Send confirmation to sender
          socket.emit('message_sent', {
            ...messageData,
            status: 'delivered'
          });

        } catch (error) {
          console.error('Message sending error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { recipientId } = data;
        this.io.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.full_name || socket.user.username,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { recipientId } = data;
        this.io.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.full_name || socket.user.username,
          isTyping: false
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username} (${socket.userId})`);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.userId);
        
        // Clean up user rooms
        if (this.userRooms.has(socket.userId)) {
          this.userRooms.get(socket.userId).forEach(room => {
            socket.leave(room);
          });
          this.userRooms.delete(socket.userId);
        }

        // Notify other users about disconnection
        this.io.emit('user_disconnected', {
          userId: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });
      });

      // Initialize user rooms tracking
      this.userRooms.set(socket.userId, new Set());
    });
  }

  // Utility method to send notifications to specific users
  sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Utility method to broadcast to all users in a role
  broadcastToRole(role, event, data) {
    this.io.to(`role_${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Utility method to broadcast to all connected users
  broadcastToAll(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole(role) {
    return Array.from(this.connectedUsers.values()).filter(
      user => user.user.role === role
    );
  }
}

export default WebSocketService;
