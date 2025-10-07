#!/bin/bash

# FinAutoJobs - Quick Deployment Script
# This script prepares and deploys your app to Vercel

echo "🚀 FinAutoJobs - Quick Deployment Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ required. Current: $(node --version)"
    echo "Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build frontend
echo "🏗️  Building frontend..."
npm run build:frontend

# Check if build was successful
if [ ! -d "frontend/dist" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (staging)"
echo "2) Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔄 Deploying to preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Deploying to preview..."
        vercel
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in Vercel dashboard"
echo "2. Update FRONTEND_URL and CORS_ORIGINS with your actual domain"
echo "3. Test your deployment at the provided URL"
echo ""
echo "📖 For detailed setup: see DEPLOYMENT_ENV_SETUP.md"
