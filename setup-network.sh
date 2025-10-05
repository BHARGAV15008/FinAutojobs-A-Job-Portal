#!/bin/bash

# =============================================================================
# FinAutoJobs Network Setup Script
# =============================================================================
# This script configures your FinAutoJobs application for network access

echo "🌐 FinAutoJobs Network Setup"
echo "============================"

# Get the machine's IP address
get_machine_ip() {
    # Try multiple methods to get IP address
    local ip=""
    
    # Method 1: ip command (most modern Linux)
    if command -v ip &> /dev/null; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    fi
    
    # Method 2: hostname command with -I flag
    if [ -z "$ip" ] && command -v hostname &> /dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    # Method 3: ifconfig command
    if [ -z "$ip" ] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1 | sed 's/addr://')
    fi
    
    # Method 4: ip addr command
    if [ -z "$ip" ] && command -v ip &> /dev/null; then
        ip=$(ip addr show 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)
    fi
    
    # Method 5: route command
    if [ -z "$ip" ] && command -v route &> /dev/null; then
        local interface=$(route 2>/dev/null | grep '^default' | grep -o '[^ ]*$' | head -1)
        if [ -n "$interface" ]; then
            ip=$(ifconfig "$interface" 2>/dev/null | grep "inet " | awk '{print $2}' | sed 's/addr://')
        fi
    fi
    
    echo "$ip"
}

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    MACHINE_IP=$(get_machine_ip)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    MACHINE_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    echo "❌ Unsupported operating system. Please manually configure IP addresses."
    exit 1
fi

if [ -z "$MACHINE_IP" ]; then
    echo "❌ Could not detect machine IP address. Please configure manually."
    exit 1
fi

echo "📍 Detected machine IP: $MACHINE_IP"
echo ""

# Configure Frontend
echo "🔧 Configuring Frontend..."
cd frontend

# Create network-specific .env file
cat > .env << EOF
# =============================================================================
# FinAutoJobs Frontend - Network Configuration (Auto-generated)
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
echo "🔧 Configuring Backend..."
cd backend

# Create network-specific .env file
cat > .env << EOF
# =============================================================================
# FinAutoJobs Backend - Network Configuration (Auto-generated)
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
cat > start-network.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting FinAutoJobs for Network Access"
echo "=========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   brew services start mongodb/brew/mongodb-community"
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
echo "🎉 Network setup complete!"
echo "========================="
echo ""
echo "📋 Next Steps:"
echo "1. Make sure MongoDB is running:"
echo "   sudo systemctl start mongod  # Linux"
echo "   brew services start mongodb/brew/mongodb-community  # Mac"
echo ""
echo "2. Start the application:"
echo "   ./start-network.sh"
echo ""
echo "3. Access from other devices on your network:"
echo "   http://$MACHINE_IP:3000"
echo ""
echo "4. Make sure your firewall allows connections on ports 3000 and 5000"
echo ""
echo "📝 Configuration files created:"
echo "   ✅ frontend/.env (network configuration)"
echo "   ✅ backend/.env (network configuration)"
echo "   ✅ start-network.sh (startup script)"
echo ""