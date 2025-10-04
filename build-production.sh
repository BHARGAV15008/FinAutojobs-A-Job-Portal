#!/bin/bash

echo "🚀 Starting FinAutoJobs Production Build..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --legacy-peer-deps

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo "📊 Build size analysis:"
    du -sh dist/
    ls -la dist/assets/ | head -10
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Go back to root
cd ..

# Install backend dependencies (for Netlify functions)
echo "📦 Installing Netlify functions dependencies..."
cd netlify/functions
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully!"
else
    echo "❌ Backend dependencies installation failed!"
    exit 1
fi

cd ../..

echo "🎉 Production build completed successfully!"
echo "📁 Frontend build: frontend/dist/"
echo "📁 Backend functions: netlify/functions/"
echo ""
echo "🚀 Ready for deployment to Netlify!"
