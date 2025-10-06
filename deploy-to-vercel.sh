#!/bin/bash

# FinAutoJobs Vercel Deployment Script
# This script deploys both backend and frontend to Vercel

echo "🚀 Starting FinAutoJobs Deployment to Vercel..."

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login..."
    vercel login
fi

# Deploy Backend
print_status "Deploying Backend to Vercel..."
cd backend

if [ -f "vercel.json" ]; then
    print_status "Found vercel.json configuration"
else
    print_error "vercel.json not found in backend directory"
    exit 1
fi

print_status "Starting backend deployment..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Backend deployed successfully!"
    BACKEND_URL=$(vercel --prod --confirm 2>/dev/null | grep -o 'https://[^[:space:]]*')
    print_success "Backend URL: $BACKEND_URL"
else
    print_error "Backend deployment failed!"
    exit 1
fi

# Deploy Frontend
print_status "Deploying Frontend to Vercel..."
cd ../frontend

if [ -f "vercel.json" ]; then
    print_status "Found vercel.json configuration"
else
    print_error "vercel.json not found in frontend directory"
    exit 1
fi

print_status "Starting frontend deployment..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Frontend deployed successfully!"
    FRONTEND_URL=$(vercel --prod --confirm 2>/dev/null | grep -o 'https://[^[:space:]]*')
    print_success "Frontend URL: $FRONTEND_URL"
else
    print_error "Frontend deployment failed!"
    exit 1
fi

# Return to root directory
cd ..

# Display deployment summary
echo ""
echo "🎉 Deployment Complete!"
echo "================================"
print_success "Backend URL: $BACKEND_URL"
print_success "Frontend URL: $FRONTEND_URL"
echo ""
print_warning "Important Next Steps:"
echo "1. Update environment variables in Vercel Dashboard"
echo "2. Set FRONTEND_URL in backend environment variables"
echo "3. Set VITE_API_BASE_URL in frontend environment variables"
echo "4. Configure your MongoDB Atlas database"
echo "5. Test your deployed application"
echo ""
print_status "Visit your Vercel Dashboard to configure environment variables:"
echo "https://vercel.com/dashboard"
echo ""
print_status "Refer to VERCEL_DEPLOYMENT_GUIDE.md for detailed configuration steps"
