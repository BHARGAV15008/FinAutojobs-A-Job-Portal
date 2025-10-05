#!/usr/bin/env node

/**
 * FinAutoJobs Production Server Entry Point
 * This file serves as the main entry point for Render deployment
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Set default environment variables for production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '10000';

// Set working directory to backend
const backendPath = join(__dirname, 'backend');
process.chdir(backendPath);

console.log('🚀 Starting FinAutoJobs Backend Server...');
console.log('📁 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);

// Check critical environment variables
console.log('🔍 Environment Variables Check:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('- SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');

// Set fallback values for missing environment variables
if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not set, using fallback (will likely fail)');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/finautojobs';
}

if (!process.env.JWT_SECRET) {
  console.log('⚠️  JWT_SECRET not set, using fallback');
  process.env.JWT_SECRET = 'fallback-jwt-secret-change-this';
}

if (!process.env.SESSION_SECRET) {
  console.log('⚠️  SESSION_SECRET not set, using fallback');
  process.env.SESSION_SECRET = 'fallback-session-secret-change-this';
}

if (!process.env.FRONTEND_URL) {
  console.log('⚠️  FRONTEND_URL not set, using fallback');
  process.env.FRONTEND_URL = 'http://localhost:3000';
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Import and start the backend server
try {
  console.log('📦 Importing backend server...');
  await import('./server.js');
  console.log('✅ Backend server imported successfully');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Provide helpful error messages
  if (error.message.includes('MONGODB_URI') || error.message.includes('MongooseError')) {
    console.error('💡 This looks like a MongoDB connection issue. Please check:');
    console.error('   1. MONGODB_URI environment variable is set correctly');
    console.error('   2. MongoDB cluster is accessible');
    console.error('   3. Database user credentials are correct');
  }
  
  process.exit(1);
};
