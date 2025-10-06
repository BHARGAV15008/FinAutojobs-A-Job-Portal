#!/bin/bash

echo "🚂 Railway Full-Stack Build Script"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
rm -f package-lock.json
npm install --legacy-peer-deps
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
rm -f package-lock.json
npm install --legacy-peer-deps
cd ..

# Build frontend
echo "🏗️ Building React frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete!"
echo "Backend ready to serve frontend from dist/"
