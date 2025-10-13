import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables for Vercel
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Import configurations
import corsOptions from '../config/cors.js';
import { initializeDatabase } from '../config/database.js';

// Import middleware
import { errorHandler, notFoundHandler } from '../middlewares/Others/errorHandler.js';
import { apiLimiter } from '../middlewares/Others/rateLimiter.js';

// Import routes
import authRoutes from '../routes/auth.js';
import jobRoutes from '../routes/jobs.js';
import applicationRoutes from '../routes/applications.js';
import userRoutes from '../routes/users.js';
import analyticsRoutes from '../routes/analytics.js';
import messagesRoutes from '../routes/messages.js';
import recommendationsRoutes from '../routes/recommendations.js';
import contactRoutes from '../routes/contact.js';
import healthRoutes from '../routes/health.js';
import devRoutes from '../routes/devRoutes.js';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized for Vercel');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Compression
app.use(compression());

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI ? MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }) : undefined,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'FinAutoJobs Backend API is running on Vercel',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with database initialization
app.use('/api/health', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, healthRoutes);

app.use('/api/auth', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, authRoutes);

app.use('/api/jobs', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, jobRoutes);

app.use('/api/applications', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, applicationRoutes);

app.use('/api/users', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, userRoutes);

app.use('/api/analytics', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, analyticsRoutes);

app.use('/api/messages', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, messagesRoutes);

app.use('/api/recommendations', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, recommendationsRoutes);

app.use('/api/contact', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}, contactRoutes);

// Development routes (no DB required)
console.log('🔧 Registering /api/dev routes...');
app.use('/api/dev', devRoutes);
console.log('✅ /api/dev routes registered successfully');

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Export for Vercel
export default app;
