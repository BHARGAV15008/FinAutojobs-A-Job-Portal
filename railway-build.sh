#!/bin/bash
set -e

echo "🚂 Railway Full-Stack Build Script"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ -f package-lock.json ]; then
    rm package-lock.json
fi
npm install --legacy-peer-deps --no-audit
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ -f package-lock.json ]; then
    rm package-lock.json
fi
npm install --legacy-peer-deps --no-audit
cd ..

# Build frontend
echo "🏗️ Building React frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete!"
echo "Frontend built to: frontend/dist/"
echo "Backend ready to serve frontend static files"

# Verify build
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend build directory exists"
    ls -la frontend/dist/
else
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi
