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

// Import and start the backend server
import('./server.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
