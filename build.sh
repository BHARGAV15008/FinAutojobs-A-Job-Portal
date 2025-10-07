#!/bin/bash

# Build script for FinAutoJobs deployment
echo "🚀 Starting FinAutoJobs build process..."

# Set Node.js version
export NODE_VERSION=20.18.0

# Install root dependencies
echo "📦 Installing root dependencies..."
yarn install

# Build backend
echo "🔧 Building backend..."
cd backend && npm install
cd ..

# Build frontend with dev dependencies
echo "🎨 Building frontend..."
cd frontend
echo "📦 Installing frontend dependencies (including devDependencies)..."
npm install --production=false
echo "🏗️ Building frontend application..."
npm run build
cd ..

echo "✅ Build completed successfully!"
