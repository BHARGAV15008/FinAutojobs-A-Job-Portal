#!/bin/bash

# =============================================================================
# FinAutoJobs Localhost Setup (Quick Start)
# =============================================================================

echo "🏠 FinAutoJobs Localhost Setup"
echo "=============================="
echo ""
echo "Setting up for localhost access (no network configuration needed)"
echo ""

# Configure Frontend for localhost
echo "🎨 Configuring Frontend for localhost..."
cd frontend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Frontend - Localhost Configuration
# =============================================================================
# Generated on: $(date)

# API Configuration for Localhost
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_EXPIRES_IN=7d

# File Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Feature Flags
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PREMIUM_FEATURES=false

# Development Settings
VITE_NODE_ENV=development
VITE_DEBUG=true

# Social Login (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
EOF

echo "✅ Frontend configured for localhost"
cd ..

# Configure Backend for localhost
echo "🔧 Configuring Backend for localhost..."
cd backend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Backend - Localhost Configuration
# =============================================================================
# Generated on: $(date)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/finautojobs

# Server Configuration
PORT=5000
NODE_ENV=development
HOST=localhost

# Frontend URL Configuration
FRONTEND_URL=http://localhost:3000

# CORS Origins - Localhost only
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173

# Session & JWT Configuration
SESSION_SECRET=finautojobs-localhost-session-secret-2024
JWT_SECRET=finautojobs-localhost-jwt-secret-2024
JWT_REFRESH_SECRET=finautojobs-localhost-refresh-secret-2024
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FinAutoJobs" <no-reply@finautojobs.com>

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WEBSOCKET_ENABLED=true

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
EOF

echo "✅ Backend configured for localhost"
cd ..

# Create localhost startup script
cat > start-localhost.sh << 'EOF'
#!/bin/bash

echo "🏠 Starting FinAutoJobs (Localhost Only)"
echo "========================================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   sudo service mongodb start"
    echo "   or"
    echo "   brew services start mongodb/brew/mongodb-community (Mac)"
    exit 1
fi

# Start backend in background
echo "🔧 Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ FinAutoJobs is now running!"
echo "================================"
echo "📱 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "💡 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 For network access, run: ./manual-setup.sh"
echo ""

# Wait for user to stop
wait
EOF

chmod +x start-localhost.sh

echo ""
echo "🎉 Localhost setup complete!"
echo "============================"
echo ""
echo "📋 What was configured:"
echo "   ✅ Frontend: http://localhost:3000"
echo "   ✅ Backend: http://localhost:5000"
echo "   ✅ MongoDB: localhost:27017"
echo ""
echo "🚀 Quick Start:"
echo "1. Make sure MongoDB is running:"
echo "   sudo systemctl start mongod"
echo ""
echo "2. Start the application:"
echo "   ./start-localhost.sh"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📝 Files created:"
echo "   ✅ frontend/.env (localhost config)"
echo "   ✅ backend/.env (localhost config)"
echo "   ✅ start-localhost.sh (startup script)"
echo ""
echo "🌐 For network access later:"
echo "   Run: ./manual-setup.sh"
echo ""