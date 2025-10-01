import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import { corsOptions, serverConfig, displayNetworkInfo } from './config/network.js';
import connectDB from './config/database.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';
import messagesRoutes from './routes/messages.js';
import comprehensiveAPI from './routes/comprehensive-api.js';
import enhancedMessaging from './routes/enhanced-messaging.js';

// Import models for job deadline management
import Job from './models/Job.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// ============================================================================
// SOCKET.IO SETUP FOR REAL-TIME FEATURES
// ============================================================================

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        // Production CORS logic here
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

io.use((socket, next) => {
  // Socket authentication middleware
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify JWT token here if needed
    next();
  } else {
    next();
  }
});

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });

  // Handle real-time messaging
  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content, messageType = 'text' } = data;
      
      // Emit to receiver
      socket.to(`user_${receiverId}`).emit('newMessage', {
        senderId,
        content,
        messageType,
        timestamp: new Date()
      });

      console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  // Handle application status updates
  socket.on('applicationStatusUpdate', (data) => {
    const { applicantId, recruiterId, applicationId, status } = data;
    
    // Notify applicant of status change
    socket.to(`user_${applicantId}`).emit('statusUpdate', {
      applicationId,
      status,
      timestamp: new Date()
    });

    // Notify recruiter of acknowledgment
    socket.to(`user_${recruiterId}`).emit('statusUpdateAck', {
      applicationId,
      status
    });

    console.log(`📋 Application ${applicationId} status updated to ${status}`);
  });

  // Handle interview scheduling
  socket.on('interviewScheduled', (data) => {
    const { candidateId, recruiterId, interviewDetails } = data;
    
    socket.to(`user_${candidateId}`).emit('interviewNotification', {
      ...interviewDetails,
      timestamp: new Date()
    });

    console.log(`📅 Interview scheduled for candidate ${candidateId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
        break;
      }
    }
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// CORS configuration for cross-device access
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

connectDB();

// ============================================================================
// AUTOMATIC JOB DEADLINE MANAGEMENT
// ============================================================================

// Function to update expired jobs
const updateExpiredJobs = async () => {
  try {
    const result = await Job.updateExpiredJobs();
    if (result.modifiedCount > 0) {
      console.log(`🕒 Updated ${result.modifiedCount} expired jobs to closed status`);
      
      // Emit real-time updates to connected recruiters
      const expiredJobs = await Job.find({ 
        status: 'closed', 
        updatedAt: { $gte: new Date(Date.now() - 60000) } // Updated in last minute
      }).populate('postedBy');
      
      expiredJobs.forEach(job => {
        io.to(`user_${job.postedBy._id}`).emit('jobExpired', {
          jobId: job._id,
          jobTitle: job.jobTitle,
          message: 'Your job posting has been automatically closed due to deadline expiration'
        });
      });
    }
  } catch (error) {
    console.error('❌ Error updating expired jobs:', error);
  }
};

// Run job deadline check every 5 minutes
setInterval(updateExpiredJobs, 5 * 60 * 1000);

// Run initial check on startup
setTimeout(updateExpiredJobs, 5000);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinAutoJobs API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      realTimeMessaging: true,
      automaticJobDeadlines: true,
      crossDeviceAccess: true,
      comprehensiveAPI: true
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messagesRoutes);

// Enhanced comprehensive API routes
app.use('/api/v2', comprehensiveAPI);
app.use('/api/messaging', enhancedMessaging);

// ============================================================================
// REAL-TIME NOTIFICATION SYSTEM
// ============================================================================

// Middleware to add real-time notification capability to requests
app.use((req, res, next) => {
  req.sendRealTimeNotification = (userId, type, data) => {
    io.to(`user_${userId}`).emit(type, {
      ...data,
      timestamp: new Date()
    });
  };
  next();
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/health',
      '/api/auth/*',
      '/api/jobs/*',
      '/api/applications/*',
      '/api/analytics/*',
      '/api/messages/*',
      '/api/v2/*',
      '/api/messaging/*'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = serverConfig.port;
const HOST = serverConfig.host;

server.listen(PORT, HOST, () => {
  console.log('\n🚀 FinAutoJobs Enhanced Backend Server Started!');
  console.log('===============================================');
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Node.js Version: ${process.version}`);
  
  // Display network access information
  displayNetworkInfo();
  
  console.log('🎯 Enhanced Features Enabled:');
  console.log('   ✅ Real-time messaging with Socket.IO');
  console.log('   ✅ Automatic job deadline management');
  console.log('   ✅ Cross-device network access');
  console.log('   ✅ Comprehensive API endpoints');
  console.log('   ✅ Enhanced interview management');
  console.log('   ✅ Dynamic data synchronization');
  console.log('   ✅ Role-based access control');
  console.log('   ✅ Application status tracking');
  
  console.log('\n📡 API Endpoints Available:');
  console.log('   • /api/health - Health check');
  console.log('   • /api/auth/* - Authentication');
  console.log('   • /api/jobs/* - Job management');
  console.log('   • /api/applications/* - Application handling');
  console.log('   • /api/analytics/* - Dashboard analytics');
  console.log('   • /api/messages/* - Basic messaging');
  console.log('   • /api/v2/* - Enhanced comprehensive API');
  console.log('   • /api/messaging/* - Advanced messaging');
  
  console.log('\n🔄 Background Services:');
  console.log('   • Job deadline checker (every 5 minutes)');
  console.log('   • Real-time notifications');
  console.log('   • Socket.IO connection management');
  
  console.log('\n📱 Ready for cross-device testing!');
  console.log('===============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

export default app;
