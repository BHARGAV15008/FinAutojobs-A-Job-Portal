#!/bin/bash

# Railway Deployment Script for FinAutoJobs
echo "🚀 Preparing FinAutoJobs for Railway deployment..."

# Set environment variables for build
export NODE_ENV=production
export VITE_API_URL=https://finautojobs-a-job-portal-hk5c.onrender.com/api
export VITE_APP_NAME=FinAutoJobs
export VITE_APP_VERSION=1.0.0
export VITE_NODE_ENV=production

echo "📦 Installing dependencies..."
npm ci

echo "📦 Installing frontend dependencies..."
cd frontend && npm ci && cd ..

echo "📦 Installing backend dependencies..."
cd backend && npm ci && cd ..

echo "🏗️ Building frontend..."
cd frontend && npm run build && cd ..

echo "✅ Build completed successfully!"
echo "🚀 Ready for Railway deployment!"

# Show build output
if [ -d "frontend/dist" ]; then
    echo "📁 Frontend build output:"
    ls -la frontend/dist/
else
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi
