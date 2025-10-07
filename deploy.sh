#!/bin/bash

# FinAutoJobs - Vercel Deployment Script
# This script prepares and deploys your MERN application to Vercel

echo "🚀 FinAutoJobs - Vercel Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
    print_success "Vercel CLI installed successfully"
fi

print_success "Vercel CLI version: $(vercel --version)"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf frontend/dist
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
print_status "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

print_success "Frontend built successfully"

# Go back to root
cd ..

# Check if environment files exist
if [ ! -f ".env.production" ] && [ ! -f "env.production.example" ]; then
    print_warning "No production environment file found. Please create .env.production"
    print_status "You can copy from env.production.example and fill in your values"
fi

# Check if frontend environment files exist
if [ ! -f "frontend/.env.production" ] && [ ! -f "frontend/env.production.example" ]; then
    print_warning "No frontend production environment file found"
    print_status "You can copy from frontend/env.production.example and fill in your values"
fi

# Verify Vercel configuration
print_status "Verifying Vercel configuration..."
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found"
    exit 1
fi

print_success "Vercel configuration found"

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in:"
    vercel login
    if [ $? -ne 0 ]; then
        print_error "Failed to log in to Vercel"
        exit 1
    fi
fi

print_success "Logged in to Vercel as: $(vercel whoami)"

# Deploy to Vercel
print_status "Deploying to Vercel..."
print_warning "This will deploy your application to production!"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deployment cancelled"
    exit 0
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment completed successfully!"
    print_status "Your application is now live on Vercel"
    print_status "Check the Vercel dashboard for your deployment URL"
    print_status "Remember to configure your environment variables in the Vercel dashboard"
else
    print_error "Deployment failed"
    exit 1
fi

print_status "Deployment script completed"
print_success "Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Test your deployed application"
echo "3. Set up custom domain (optional)"
echo "4. Configure OAuth redirect URLs"
echo "5. Set up monitoring and analytics"
