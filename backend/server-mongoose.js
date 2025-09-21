/**
 * FinAutoJobs Backend Server (Mongoose)
 * 
 * Main server file for the FinAutoJobs job portal application
 * using Mongoose ODM for MongoDB integration.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';

// Import database connection
import { connectDatabase } from './models/index.js';

// Import routes
import mongooseRoutes from './routes/mongoose/index.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeRequest } from './middleware/sanitization.js';
import { securityHeaders } from './middleware/security.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

// Trust proxy for accurate IP addresses behind reverse proxy
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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeRequest);

// Security headers
app.use(securityHeaders);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinAutoJobs Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    database: 'MongoDB (Mongoose)',
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', mongooseRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FinAutoJobs API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    database: 'MongoDB (Mongoose)'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      api: '/api',
      health: '/health',
      docs: '/api/docs'
    }
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDatabase(MONGODB_URI);
    
    const server = app.listen(PORT, () => {
      console.log('\n🚀 FinAutoJobs Server Started Successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📊 Database: MongoDB (Mongoose)`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📋 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
