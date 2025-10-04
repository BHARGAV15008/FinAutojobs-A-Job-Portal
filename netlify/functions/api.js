import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with multiple fallbacks
dotenv.config({ path: path.join(__dirname, '../../backend/config.env') });
dotenv.config(); // Also load from .env if exists

// Import database connection
import { initializeDatabase } from '../../backend/config/database.js';

// Import routes
import authRoutes from '../../backend/routes/auth.js';
import jobRoutes from '../../backend/routes/jobs.js';
import userRoutes from '../../backend/routes/users.js';
import adminRoutes from '../../backend/routes/admin.js';
import applicationRoutes from '../../backend/routes/applications.js';

// Create Express app
const app = express();

// Initialize database connection with error handling
let dbConnected = false;
const connectWithRetry = async () => {
  try {
    if (!dbConnected) {
      await initializeDatabase();
      dbConnected = true;
      console.log('✅ Database connected successfully in Netlify function');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't throw error to allow API to still respond with error messages
  }
};

// Connect to database
connectWithRetry();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FinAutoJobs API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Export the serverless function
export const handler = serverless(app);
