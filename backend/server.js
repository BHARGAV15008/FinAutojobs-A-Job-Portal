import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';

// Load environment variables
console.log('🔧 Loading environment variables...');
dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
// Server restart trigger - fix backend crash
import { fileURLToPath } from 'url';

// Import configurations
import corsOptions from './config/cors.js';
import securityHeaders from './config/security.js';
import joi from 'joi';

// Import middleware
import { errorHandler, notFoundHandler, errorMonitor } from './middlewares/Others/errorHandler.js';
import { xssMiddleware, sqlInjectionMiddleware, payloadSizeMiddleware } from './middlewares/Others/security.js';
import { apiLimiter } from './middlewares/Others/rateLimiter.js';
import { sanitizeRequest, sqlInjectionPrevention, preventNoSqlInjection } from './middlewares/Others/sanitization.js';

// Configure file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

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

// Make io available to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Join role-specific rooms for role-based notifications
  socket.on('join-role-room', (role) => {
    socket.join(`role-${role}`);
    console.log(`🎭 User joined ${role} room`);
  });

  // Handle job posting notifications
  socket.on('job-posted', (jobData) => {
    // Notify all applicants about new job
    io.to('role-applicant').emit('new-job-posted', {
      message: 'New job opportunity available!',
      job: jobData,
      timestamp: new Date()
    });
  });

  // Handle application notifications
  socket.on('new-application', (applicationData) => {
    // Notify recruiter about new application
    io.to(`user-${applicationData.recruiterId}`).emit('new-application-received', {
      message: 'New application received for your job posting',
      application: applicationData,
      timestamp: new Date()
    });
  });

  // Handle application status updates
  socket.on('application-status-update', (updateData) => {
    // Notify applicant about status change
    io.to(`user-${updateData.applicantId}`).emit('application-status-changed', {
      message: `Your application status has been updated to: ${updateData.status}`,
      application: updateData,
      timestamp: new Date()
    });
  });

  // Handle admin notifications
  socket.on('admin-notification', (notificationData) => {
    // Notify all admins
    io.to('role-admin').emit('admin-alert', {
      message: notificationData.message,
      type: notificationData.type || 'info',
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Make io instance available to routes
app.set('io', io);

// Configure basic middleware
app.use(compression());

// Enable request parsing before any security middleware
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        if (buf.length) {
            try {
                JSON.parse(buf);
            } catch(e) {
                res.status(400).json({ 
                    status: 'error',
                    message: 'Invalid JSON payload',
                    error: e.message 
                });
                throw e;
            }
        }
    }
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Apply CORS
app.use(cors(corsOptions));

// Apply security headers
app.use(helmet({
    ...securityHeaders,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));

// Apply security middleware
app.use(xssMiddleware);
app.use(sqlInjectionMiddleware);
app.use(payloadSizeMiddleware);

// Apply request sanitization
app.use(sanitizeRequest);
app.use(sqlInjectionPrevention);
app.use(preventNoSqlInjection);

// Apply rate limiting to API routes (disabled for development)
// app.use('/api/', apiLimiter);

// Session configuration with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/finauto_jobs',
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database initialization
import { initializeDatabase } from './config/database.js';
await initializeDatabase();

// Import models to register discriminators
import { BaseUser, Applicant, Recruiter } from './models/UserModels.js';
console.log('✅ User models registered successfully');

// Import routes
import authRoutes from './routes/auth.js';

import jobRoutes from './routes/jobs.js';
import dashboardRoutes from './routes/dashboard.js';

import companyRoutes from './routes/companies.js';
console.log('🔄 Loading applications routes...');
import applicationRoutes from './routes/applications.js';
console.log('✅ Applications routes loaded successfully');
import oauthRoutes from './routes/oauth.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import savedJobsRoutes from './routes/savedJobs.js';
import recruiterRoutes from './routes/recruiters.js';
import candidatesRoutes from './routes/candidates.js';
import interviewsRoutes from './routes/interviews.js';
import enhancedApplicationsRoutes from './routes/enhancedApplications.js';
import fileUploadRoutes from './routes/fileUpload.js';
import recommendationsRoutes from './routes/recommendations.js';
import analyticsRoutes from './routes/analytics.js';
import applicationInformationRoutes from './routes/applicationInformation.js';
import communicationsRoutes from './routes/communications.js';
import jobAlertsRoutes from './routes/jobAlerts.js';
import contactRoutes from './routes/contact.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import smsOtpRoutes from './routes/smsOtp.js';

// Mount routes under /api
app.use('/api/auth', authRoutes);

const apiRouter = express.Router();
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
// Add placeholder routes to prevent 404 errors

apiRouter.use('/oauth', oauthRoutes);
apiRouter.use('/companies', companyRoutes);
console.log('🔄 Registering /api/applications routes...');
apiRouter.use('/applications', applicationRoutes);
console.log('✅ /api/applications routes registered successfully');
apiRouter.use('/enhanced-applications', enhancedApplicationsRoutes);
apiRouter.use('/upload', fileUploadRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/saved-jobs', savedJobsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/recruiters', recruiterRoutes);
apiRouter.use('/candidates', candidatesRoutes);
apiRouter.use('/interviews', interviewsRoutes);
apiRouter.use('/recommendations', recommendationsRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/application-information', applicationInformationRoutes);
apiRouter.use('/communications', communicationsRoutes);
apiRouter.use('/job-alerts', jobAlertsRoutes);
apiRouter.use('/contact', contactRoutes);
apiRouter.use('/messages', messagesRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/otp', smsOtpRoutes);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url} - Headers:`, {
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'Bearer ***' : 'None',
    contentType: req.headers['content-type']
  });
  next();
});

app.use('/api', apiRouter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Root health check
app.get('/', (req, res) => {
    res.json({
        message: 'FinAutoJobs API Service',
        apiDocs: '/api/docs',
        timestamp: new Date().toISOString()
    });
});

// Catch-all 404 handler for debugging (must be last)
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: ['/api/applications', '/api/jobs', '/api/auth', '/api/health']
  });
});

// Add health check endpoint under /api 
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs API is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        services: {
            database: 'connected',
            cors: 'configured',
            security: 'enabled'
        }
    });
});

// Enhanced error handling middleware
app.use(errorMonitor);
app.use(notFoundHandler);
app.use(errorHandler);

// Import network configuration
import { displayNetworkInfo, getNetworkConfig } from './config/network.js';

// Start server with proper error handling and network access
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all network interfaces
server.listen(PORT, HOST, () => {
    console.log(`🚀 FinAutoJobs Backend Server running on ${HOST}:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🛡️ Enhanced error handling enabled`);
    
    // Display network access information
    displayNetworkInfo();
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});
