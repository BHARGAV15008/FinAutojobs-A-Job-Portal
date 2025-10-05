#!/bin/bash

# FinAutoJobs - Quick Netlify Deployment Script
# This script automates the deployment process

echo "🚀 FinAutoJobs - Netlify Deployment Script"
echo "=========================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "🔑 Please login to Netlify..."
    netlify login
fi

# Create production environment file if it doesn't exist
if [ ! -f "frontend/.env.production" ]; then
    echo "📝 Creating production environment file..."
    cp frontend/env.production frontend/.env.production
    echo "✅ Created frontend/.env.production"
fi

# Build the frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Netlify dashboard"
echo "2. Set up environment variables from 'netlify-env-template.txt'"
echo "3. Update FRONTEND_URL and CORS_ORIGINS with your actual domain"
echo "4. Test your deployment at your Netlify URL"
echo ""
echo "📖 For detailed instructions, see: NETLIFY_DEPLOYMENT_GUIDE.md"
