import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Import configurations
import corsOptions from './config/cors.js';
import { errorHandler, notFoundHandler } from './middlewares/Others/errorHandler.js';

// Import enhanced routes
import enhancedAuthRoutes from './routes/enhanced/auth.js';
import enhancedJobsRoutes from './routes/enhanced/jobs.js';
import enhancedApplicationsRoutes from './routes/enhanced/applications.js';
import enhancedResumesRoutes from './routes/enhanced/resumes.js';
import enhancedFavoritesRoutes from './routes/enhanced/favorites.js';
import enhancedMessagesRoutes from './routes/enhanced/messages.js';
import enhancedInterviewsRoutes from './routes/enhanced/interviews.js';
import enhancedAnalyticsRoutes from './routes/enhanced/analytics.js';

// Import existing routes (for backward compatibility)
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import applicationsRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';
import notificationsRoutes from './routes/notifications.js';
import interviewsRoutes from './routes/interviews.js';
import companiesRoutes from './routes/companies-simple.js';

// Import services
import { verifyEmailConfig } from './services/enhanced/emailService.js';
import { cleanupOldNotifications } from './services/enhanced/notificationService.js';

// Configure environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io available globally for services
global.io = io;
app.set('io', io);

// Trust proxy if behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes - Enhanced versions (v2)
app.use('/api/v2/auth', enhancedAuthRoutes);
app.use('/api/v2/jobs', enhancedJobsRoutes);
app.use('/api/v2/applications', enhancedApplicationsRoutes);
app.use('/api/v2/resumes', enhancedResumesRoutes);
app.use('/api/v2/favorites', enhancedFavoritesRoutes);
app.use('/api/v2/messages', enhancedMessagesRoutes);
app.use('/api/v2/interviews', enhancedInterviewsRoutes);
app.use('/api/v2/analytics', enhancedAnalyticsRoutes);

// API Routes - Original versions (v1) for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/companies', companiesRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user authentication for socket
  socket.on('authenticate', (data) => {
    try {
      const { userId, role } = data;
      socket.userId = userId;
      socket.role = role;
      
      // Join user-specific room
      socket.join(`user_${userId}`);
      
      // Join role-specific room
      socket.join(`role_${role}`);
      
      socket.emit('authenticated', { success: true });
      console.log(`User ${userId} (${role}) authenticated and joined rooms`);
    } catch (error) {
      socket.emit('authentication_error', { message: 'Authentication failed' });
    }
  });

  // Handle real-time messaging
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    // Broadcast to all users in the conversation except sender
    socket.to(`conversation_${conversationId}`).emit('new_message', {
      senderId: socket.userId,
      message,
      timestamp: new Date()
    });
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: false
    });
  });

  // Handle application status updates
  socket.on('application_status_update', (data) => {
    const { applicationId, status, recipientId } = data;
    io.to(`user_${recipientId}`).emit('application_status_changed', {
      applicationId,
      status,
      timestamp: new Date()
    });
  });

  // Handle interview updates
  socket.on('interview_update', (data) => {
    const { interviewId, update, recipientId } = data;
    io.to(`user_${recipientId}`).emit('interview_updated', {
      interviewId,
      update,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Initialize server
const initializeServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Verify email configuration
    const emailConfigValid = await verifyEmailConfig();
    if (emailConfigValid) {
      console.log('✅ Email service configured successfully');
    } else {
      console.warn('⚠️ Email service configuration issues detected');
    }

    // Start server on all network interfaces
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Enhanced FinAutoJobs Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Network access: http://0.0.0.0:${PORT} (accessible from other devices)`);
      console.log(`🔗 Socket.IO enabled for real-time features`);
      console.log(`🛡️ Enhanced security and error handling enabled`);
      console.log(`📧 Email service: ${emailConfigValid ? 'Ready' : 'Limited functionality'}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log available API versions
      console.log('\n📋 Available API Endpoints:');
      console.log('   v1 (Legacy): /api/*');
      console.log('   v2 (Enhanced): /api/v2/*');
      console.log('\n🔧 Enhanced Features:');
      console.log('   ✅ Real-time messaging');
      console.log('   ✅ Advanced analytics');
      console.log('   ✅ File upload system');
      console.log('   ✅ Email notifications');
      console.log('   ✅ Push notifications');
      console.log('   ✅ Role-based access control');
      console.log('   ✅ Comprehensive error handling');
    });

    // Schedule cleanup tasks
    setInterval(async () => {
      try {
        await cleanupOldNotifications(30); // Clean notifications older than 30 days
        // Auto-complete interviews functionality removed for now
      } catch (error) {
        console.error('Cleanup task error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Run daily

  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize the server
initializeServer();

export default app;
