#!/bin/bash

# =============================================================================
# FinAutoJobs Quick Network Setup with Detected IP
# =============================================================================

echo "🌐 FinAutoJobs Quick Network Setup"
echo "=================================="
echo ""

# Use the IP detected by check-config.sh
MACHINE_IP="192.168.41.134"

echo "📍 Using detected IP address: $MACHINE_IP"
echo ""

# Configure Frontend
echo "🎨 Configuring Frontend for network access..."
cd frontend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Frontend - Network Configuration (Quick Setup)
# =============================================================================
# Generated on: $(date)
# Machine IP: $MACHINE_IP

# API Configuration for Network Access
VITE_API_URL=http://$MACHINE_IP:5000/api
VITE_BACKEND_URL=http://$MACHINE_IP:5000

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

echo "✅ Frontend configured for network access"
cd ..

# Configure Backend
echo "🔧 Configuring Backend for network access..."
cd backend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Backend - Network Configuration (Quick Setup)
# =============================================================================
# Generated on: $(date)
# Machine IP: $MACHINE_IP

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/finautojobs

# Server Configuration
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

# Frontend URL Configuration
FRONTEND_URL=http://$MACHINE_IP:3000

# CORS Origins - Allow network access
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://$MACHINE_IP:3000,http://localhost:5173,http://$MACHINE_IP:5173

# Session & JWT Configuration
SESSION_SECRET=finautojobs-network-session-secret-2024
JWT_SECRET=finautojobs-network-jwt-secret-2024
JWT_REFRESH_SECRET=finautojobs-network-refresh-secret-2024
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

echo "✅ Backend configured for network access"
cd ..

# Create startup script
cat > start-network-quick.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting FinAutoJobs for Network Access"
echo "=========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    exit 1
fi

# Start backend in background
echo "🔧 Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ FinAutoJobs is now running!"
echo "================================"
echo "📱 Local Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🌐 Network Access:"
echo "   Frontend: http://192.168.41.134:3000"
echo "   Backend:  http://192.168.41.134:5000"
echo "   API Health: http://192.168.41.134:5000/api/health"
echo ""
echo "📱 Access from mobile/other devices:"
echo "   Connect to same WiFi and visit: http://192.168.41.134:3000"
echo ""
echo "💡 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
EOF

chmod +x start-network-quick.sh

echo ""
echo "🎉 Quick network setup complete!"
echo "================================"
echo ""
echo "📍 Configuration Summary:"
echo "   Machine IP: $MACHINE_IP"
echo "   Frontend: http://$MACHINE_IP:3000"
echo "   Backend: http://$MACHINE_IP:5000"
echo ""
echo "🚀 Next Steps:"
echo "1. Start the application:"
echo "   ./start-network-quick.sh"
echo ""
echo "2. Access from this computer:"
echo "   http://localhost:3000"
echo ""
echo "3. Access from other devices (same WiFi):"
echo "   http://$MACHINE_IP:3000"
echo ""
echo "4. If firewall blocks access, allow ports:"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 5000"
echo ""
echo "📝 Files created:"
echo "   ✅ frontend/.env (network config)"
echo "   ✅ backend/.env (network config)"
echo "   ✅ start-network-quick.sh (startup script)"
echo ""