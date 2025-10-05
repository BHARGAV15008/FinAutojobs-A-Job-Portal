#!/bin/bash

# =============================================================================
# FinAutoJobs Manual Network Setup
# =============================================================================

echo "🔧 FinAutoJobs Manual Network Setup"
echo "===================================="
echo ""
echo "Since automatic IP detection failed, let's set up manually."
echo ""

# Prompt user for IP address
echo "📍 Please enter your machine's IP address:"
echo "   (You can find this in your network settings or by running 'ifconfig' or 'ip a')"
echo "   Common formats: 192.168.1.100, 10.0.0.50, 172.16.0.100"
echo ""
read -p "Enter your IP address: " MACHINE_IP

# Validate IP format (basic check)
if [[ ! $MACHINE_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "❌ Invalid IP format. Please enter a valid IP address like 192.168.1.100"
    echo "💡 From the check-config.sh output, your IP appears to be: 192.168.41.134"
    echo "Would you like to use this IP? (y/n)"
    read -p "Use 192.168.41.134? " use_detected
    if [[ $use_detected =~ ^[Yy]$ ]]; then
        MACHINE_IP="192.168.41.134"
    else
        exit 1
    fi
fi

echo ""
echo "📍 Using IP address: $MACHINE_IP"
echo ""

# Configure Frontend
echo "🎨 Configuring Frontend..."
cd frontend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Frontend - Network Configuration (Manual Setup)
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

echo "✅ Frontend configured"
cd ..

# Configure Backend
echo "🔧 Configuring Backend..."
cd backend

cat > .env << EOF
# =============================================================================
# FinAutoJobs Backend - Network Configuration (Manual Setup)
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

echo "✅ Backend configured"
cd ..

# Create startup script
cat > start-network.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting FinAutoJobs for Network Access"
echo "=========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   sudo service mongodb start"
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
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ FinAutoJobs is now running!"
echo "================================"
echo "📱 Local Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🌐 Network Access:"
echo "   Frontend: http://MACHINE_IP:3000"
echo "   Backend:  http://MACHINE_IP:5000"
echo ""
echo "💡 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user to stop
wait
EOF

chmod +x start-network.sh

# Replace MACHINE_IP in the startup script
sed -i "s/MACHINE_IP/$MACHINE_IP/g" start-network.sh

echo ""
echo "🎉 Manual setup complete!"
echo "========================="
echo ""
echo "📋 Configuration Summary:"
echo "   Machine IP: $MACHINE_IP"
echo "   Frontend URL: http://$MACHINE_IP:3000"
echo "   Backend URL: http://$MACHINE_IP:5000"
echo ""
echo "📝 Files created/updated:"
echo "   ✅ frontend/.env"
echo "   ✅ backend/.env"
echo "   ✅ start-network.sh"
echo ""
echo "🚀 Next Steps:"
echo "1. Make sure MongoDB is running:"
echo "   sudo systemctl start mongod"
echo "   # or"
echo "   sudo service mongodb start"
echo ""
echo "2. Start the application:"
echo "   ./start-network.sh"
echo ""
echo "3. Access from other devices:"
echo "   http://$MACHINE_IP:3000"
echo ""
echo "4. Make sure firewall allows ports 3000 and 5000:"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 5000"
echo ""