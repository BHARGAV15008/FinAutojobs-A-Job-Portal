#!/usr/bin/env node

/**
 * Production Build Script for Render Deployment
 * Optimizes memory usage and build process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build for Render deployment...');

// Set environment variables for production
process.env.NODE_ENV = 'production';
process.env.VITE_NODE_ENV = 'production';
process.env.VITE_API_URL = process.env.VITE_API_URL || 'https://finautojobs-backend.onrender.com/api';
process.env.VITE_APP_NAME = process.env.VITE_APP_NAME || 'FinAutoJobs';
process.env.VITE_APP_VERSION = process.env.VITE_APP_VERSION || '1.0.0';

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  // Set memory limits for Node.js
  const nodeOptions = '--max-old-space-size=1024';
  process.env.NODE_OPTIONS = nodeOptions;

  console.log('📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });

  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Production build completed successfully!');
  console.log('📊 Build statistics:');
  
  // Show build size
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    const stats = execSync('du -sh dist', { encoding: 'utf8' });
    console.log(`   Build size: ${stats.trim()}`);
  }

  console.log('🎉 Ready for deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
