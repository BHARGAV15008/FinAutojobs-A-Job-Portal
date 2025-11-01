import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { BaseUser } from '../../models/UserModels.js';

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: function(origin, callback) {
          // Allow requests with no origin (like mobile apps, curl, postman)
          if (!origin) return callback(null, true);
          
          // List of allowed origins
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:4173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173'
          ];
          
          // Check if origin is in allowed list
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          
          // Check if origin matches network IP patterns (192.168.x.x or 10.x.x.x)
          const networkIPPattern = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.0\.0\.1):\d+$/;
          if (networkIPPattern.test(origin)) {
            return callback(null, true);
          }
          
          // Allow any localhost or 127.0.0.1 with any port
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
          
          callback(null, true); // Allow all origins in development
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e8
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
          // Allow connection without authentication for now
          socket.user = { username: 'anonymous', role: 'guest' };
          socket.userId = 'anonymous';
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await BaseUser.findOne({ 
          $or: [{ _id: decoded.id || decoded.userId }, { userId: decoded.userId }]
        });

        if (!user) {
          // Allow connection but mark as guest if user not found
          socket.user = { username: 'guest', role: 'guest' };
          socket.userId = 'guest';
          return next();
        }

        socket.user = user;
        socket.userId = decoded.id || decoded.userId;
        next();
      } catch (err) {
        // Allow connection but mark as guest on token error
        socket.user = { username: 'guest', role: 'guest' };
        socket.userId = 'guest';
        next();
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
      if (socket.user.companyInfo?.companyName) {
        socket.join(`company_${socket.user.companyInfo.companyName}`);
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

      // Handle real-time job application updates (simplified)
      socket.on('application_update', async (data) => {
        try {
          const { applicationId, status, notes } = data;
          
          // Basic permission check
          if (!socket.user || !['admin', 'recruiter'].includes(socket.user.role)) {
            socket.emit('error', { message: 'Permission denied' });
            return;
          }

          // Broadcast update to relevant users (simplified)
          this.io.to(`role_applicant`).emit('application_status_updated', {
            applicationId,
            status,
            message: `Application status updated to ${status}`,
            timestamp: new Date().toISOString()
          });

          socket.emit('application_update_success', {
            applicationId,
            status,
            message: 'Application updated successfully'
          });

        } catch (error) {
          console.error('Application update error:', error);
          socket.emit('error', { message: 'Failed to update application' });
        }
      });

      // Handle new job posting notifications (simplified)
      socket.on('new_job_posted', async (data) => {
        try {
          const { jobId, jobTitle, companyName } = data;
          
          // Basic permission check
          if (!socket.user || !['admin', 'recruiter'].includes(socket.user.role)) {
            socket.emit('error', { message: 'Permission denied' });
            return;
          }

          // Broadcast to all job seekers
          this.io.to('role_applicant').emit('new_job_alert', {
            jobId,
            jobTitle,
            companyName,
            message: `New job posted: ${jobTitle} at ${companyName}`,
            timestamp: new Date().toISOString()
          });

          // Also broadcast to admin room
          this.io.to('role_admin').emit('new_job_posted_admin', {
            jobId,
            jobTitle,
            companyName,
            postedBy: socket.user.username,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('New job notification error:', error);
          socket.emit('error', { message: 'Failed to send job notification' });
        }
      });

      // Handle real-time messaging between applicants and recruiters (simplified)
      socket.on('send_message', async (data) => {
        try {
          const { recipientId, message, jobId } = data;
          
          const messageData = {
            id: Date.now(), // Simple ID for demo
            senderId: socket.userId,
            senderName: socket.user.fullName || socket.user.username,
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
          userName: socket.user.fullName || socket.user.username,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { recipientId } = data;
        this.io.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.fullName || socket.user.username,
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

  // Notify about job updates (create, update, delete)
  notifyJobUpdate(action, jobData, recruiterId = null) {
    const event = {
      action, // 'created', 'updated', 'deleted', 'status_changed'
      job: jobData,
      timestamp: new Date().toISOString()
    };

    // Notify the recruiter who owns the job
    if (recruiterId) {
      this.io.to(`user_${recruiterId}`).emit('job_updated', event);
    }

    // Notify all recruiters
    this.broadcastToRole('recruiter', 'job_updated', event);

    // Notify applicants about new jobs
    if (action === 'created' && jobData.status === 'active') {
      this.broadcastToRole('applicant', 'new_job_posted', {
        job: jobData,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Notify about application updates
  notifyApplicationUpdate(action, applicationData, applicantId = null, recruiterId = null) {
    const event = {
      action, // 'created', 'updated', 'status_changed'
      application: applicationData,
      timestamp: new Date().toISOString()
    };

    // Notify the applicant
    if (applicantId) {
      this.io.to(`user_${applicantId}`).emit('application_updated', event);
    }

    // Notify the recruiter
    if (recruiterId) {
      this.io.to(`user_${recruiterId}`).emit('application_updated', event);
    }

    // Notify all recruiters about new applications
    if (action === 'created') {
      this.broadcastToRole('recruiter', 'new_application_received', event);
    }
  }

  // Notify about data refresh needed
  notifyDataRefresh(userId = null, role = null) {
    const event = {
      message: 'Data has been updated, please refresh',
      timestamp: new Date().toISOString()
    };

    if (userId) {
      this.io.to(`user_${userId}`).emit('data_refresh_needed', event);
    } else if (role) {
      this.broadcastToRole(role, 'data_refresh_needed', event);
    } else {
      this.broadcastToAll('data_refresh_needed', event);
    }
  }
}

export default WebSocketService;
