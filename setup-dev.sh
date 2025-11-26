#!/bin/bash

echo "🚀 Setting up FinAutoJobs Development Environment..."

# Create frontend .env file if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
# Development API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_SECRET=dev-jwt-secret-key
VITE_JWT_EXPIRES_IN=7d

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Feature Flags
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PREMIUM_FEATURES=false

# Development
VITE_NODE_ENV=development
VITE_DEBUG=true
EOF
    echo "✅ Frontend .env file created"
else
    echo "ℹ️ Frontend .env file already exists"
fi

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_SECRET=dev-session-secret-key-change-this-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Development Flags
SEND_EMAILS_IN_DEV=false
ENABLE_SOCKET_IO=true
DEBUG_MODE=true

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_COMPANY_VERIFICATION=true
ALLOW_UNVERIFIED_JOB_POSTING=true
REQUIRE_PROFILE_COMPLETION=false

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
EOF
    echo "✅ Backend .env file created"
else
    echo "ℹ️ Backend .env file already exists"
fi

echo "🔧 Installing dependencies..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Get local IP address for network access
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

echo "✅ Development environment setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📊 Backend will run on:"
echo "   📱 Local: http://localhost:5000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   🌍 Network: http://$LOCAL_IP:5000"
fi
echo ""
echo "🌐 Frontend will run on:"
echo "   📱 Local: http://localhost:3000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   🌍 Network: http://$LOCAL_IP:3000"
fi
echo ""
echo "🔍 API Health Check:"
echo "   📱 Local: http://localhost:5000/api/health"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   🌍 Network: http://$LOCAL_IP:5000/api/health"
fi
echo ""
echo "📱 Access from other devices on your network using the Network URLs above"
echo "🔥 Make sure your firewall allows connections on ports 3000 and 5000"
