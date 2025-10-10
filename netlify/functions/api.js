// Netlify Function - Main API Handler
// This function handles all backend API routes

import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import your existing backend routes
import authRoutes from '../../backend/routes/authRoutes.js';
import otpRoutes from '../../backend/routes/otpRoutes.js';
import jobRoutes from '../../backend/routes/jobRoutes.js';
import companyRoutes from '../../backend/routes/companyRoutes.js';
import applicationRoutes from '../../backend/routes/applicationRoutes.js';
import userRoutes from '../../backend/routes/userRoutes.js';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://*.netlify.app',
    'https://finautojobs.netlify.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FinAutoJobs API is running on Netlify Functions',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/otp', otpRoutes);
app.use('/jobs', jobRoutes);
app.use('/companies', companyRoutes);
app.use('/applications', applicationRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Export serverless function
export const handler = serverless(app);
