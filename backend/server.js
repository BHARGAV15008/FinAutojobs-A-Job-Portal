import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';

// Load environment variables based on NODE_ENV
let envFile;
if (process.env.NODE_ENV === 'production') {
  envFile = './.env.production';
} else if (process.env.NODE_ENV === 'development') {
  envFile = './.env.development';
} else {
  envFile = './.env';
}

console.log('🔧 Loading environment from:', envFile);
dotenv.config({ path: envFile });

// Fallback to .env if specific environment file doesn't exist
if (!process.env.MONGODB_URI) {
  console.log('🔄 Fallback to .env file...');
  dotenv.config({ path: './.env' });
}
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import os from 'os';

// Import configurations
import corsOptions from './config/cors.js';
import securityHeaders from './config/security.js';
import joi from 'joi';

// Import middleware
import { errorHandler, notFoundHandler, errorMonitor } from './middlewares/Others/errorHandler.js';
import { xssMiddleware, sqlInjectionMiddleware, payloadSizeMiddleware } from './middlewares/Others/security.js';
import { apiLimiter } from './middlewares/Others/rateLimiter.js';
import { sanitizeRequest, sqlInjectionPrevention, preventNoSqlInjection } from './middlewares/Others/sanitization.js';
import WebSocketService from './services/Others/websocketService.js';
import { setWebSocketService } from './services/notifications.js';

// Configure dotenv to read from root .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
// Use environment variable or default port
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

// Enable trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize WebSocket service
const websocketService = new WebSocketService(server);

// Set WebSocket service for notifications
setWebSocketService(websocketService);

// Make WebSocket service available to routes
app.set('websocketService', websocketService);

// Configure basic middleware
app.use(compression());

// Enable request parsing before any security middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length) {
      try {
        JSON.parse(buf);
      } catch (e) {
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
import oauthRoutes, { initializeOAuth } from './routes/oauth.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import savedJobsRoutes from './routes/savedJobs.js';
import recruiterRoutes from './routes/recruiters.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import recommendationsRoutes from './routes/recommendations.js';
import messagesRoutes from './routes/messages.js';
import jobAlertsRoutes from './routes/jobAlerts.js';
import smsOtpRoutes from './routes/smsOtp.js';
import phoneAuthRoutes from './routes/phoneAuth.js';
import otpRoutes from './routes/otpRoutes.js';
import candidatesRoutes from './routes/Applicants/candidates.js';

// Mount routes under /api
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/oauth', oauthRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
// Add placeholder routes to prevent 404 errors
console.log('🔄 Registering /api/applications routes...');
apiRouter.use('/applications', applicationRoutes);
console.log('✅ /api/applications routes registered successfully');
apiRouter.use('/companies', companyRoutes);
console.log('✅ /api/companies routes registered successfully');
apiRouter.use('/users', usersRoutes);
apiRouter.use('/saved-jobs', savedJobsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/recruiters', recruiterRoutes);
apiRouter.use('/recommendations', recommendationsRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/messages', messagesRoutes);
apiRouter.use('/job-alerts', jobAlertsRoutes);
apiRouter.use('/sms-otp', smsOtpRoutes);
apiRouter.use('/phone-auth', phoneAuthRoutes);
apiRouter.use('/otp', otpRoutes);
apiRouter.use('/candidates', candidatesRoutes);
console.log('✅ /api/candidates routes registered successfully');

// Social accounts routes
import socialAccountsRoutes from './routes/socialAccounts.js';
apiRouter.use('/auth', socialAccountsRoutes);
console.log('✅ /api/auth social accounts routes registered successfully');

// Initialize OAuth strategies after environment variables are loaded
console.log('🔧 Initializing OAuth strategies after env load...');
initializeOAuth();

// Initialize Firebase for phone authentication
console.log('🔧 Initializing Firebase for phone authentication...');
import { initializeFirebase } from './config/firebase.js';
initializeFirebase().catch(error => {
  console.error('❌ Firebase initialization failed:', error);
});

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

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));

  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: ['/api/applications', '/api/jobs', '/api/auth', '/api/health']
      });
    }

    // Serve React app for all other routes
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Development mode - show available routes
  app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      availableRoutes: ['/api/applications', '/api/jobs', '/api/auth', '/api/health'],
      note: 'In development mode. Frontend should be served separately on port 5173.'
    });
  });
}

// Add health check endpoint under /api 
apiRouter.get('/health', (req, res) => {
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  res.json({
    status: 'OK',
    message: 'FinAutoJobs API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      cors: 'configured',
      security: 'enabled',
      email: emailConfigured ? 'configured' : 'not configured',
      otp: 'enabled'
    },
    endpoints: {
      auth: '/api/auth',
      otp: '/api/otp',
      jobs: '/api/jobs',
      applications: '/api/applications'
    }
  });
});

// Enhanced error handling middleware
app.use(errorMonitor);
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with proper error handling - bind to 0.0.0.0 for network access
server.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';

  // Find the local IP address
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(interfaceInfo => {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        localIP = interfaceInfo.address;
      }
    });
  });

  console.log(`🚀 FinAutoJobs API Server - Email Fixed - running on port ${PORT}`);
  console.log(`🌐 Network Access:`);
  console.log(`   📱 Local: http://localhost:${PORT}`);
  console.log(`   🌍 Network: http://${localIP}:${PORT}`);
  console.log(`   📊 Health check: http://${localIP}:${PORT}/api/health`);
  console.log(`🛡️ Enhanced error handling enabled`);
  console.log(`📡 Server accessible from any device on the network`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
