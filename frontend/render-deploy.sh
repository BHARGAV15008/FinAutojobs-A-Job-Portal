#!/bin/bash

# Render deployment script for FinAutoJobs Frontend
echo "🚀 Starting FinAutoJobs Frontend Deployment..."

# Print environment info
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"

# Print environment variables (without sensitive data)
echo "Environment variables:"
echo "VITE_API_URL: ${VITE_API_URL:-'Not set'}"
echo "VITE_APP_NAME: ${VITE_APP_NAME:-'Not set'}"
echo "VITE_NODE_ENV: ${VITE_NODE_ENV:-'Not set'}"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build dist node_modules/.vite

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run build check
echo "🔍 Running build check..."
node build-check.js

# Build the application
echo "🏗️ Building application..."
npm run build

# Verify build output
if [ -d "build" ]; then
    echo "✅ Build directory created successfully"
    echo "Build contents:"
    ls -la build/
    
    # Check if index.html exists
    if [ -f "build/index.html" ]; then
        echo "✅ index.html found in build directory"
    else
        echo "❌ index.html not found in build directory"
        exit 1
    fi
    
    # Check if assets directory exists
    if [ -d "build/assets" ]; then
        echo "✅ Assets directory found"
        echo "Assets count: $(ls build/assets/ | wc -l)"
    else
        echo "⚠️ Assets directory not found (this might be normal)"
    fi
else
    echo "❌ Build directory not created"
    exit 1
fi

echo "🎉 Build completed successfully!"
