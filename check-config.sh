#!/bin/bash

# =============================================================================
# FinAutoJobs Configuration Checker
# =============================================================================

echo "🔍 FinAutoJobs Configuration Check"
echo "=================================="
echo ""

# Get machine IP using multiple methods
get_machine_ip() {
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
    
    echo "$ip"
}

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    MACHINE_IP=$(get_machine_ip)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    MACHINE_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
fi

echo "📍 Machine IP: $MACHINE_IP"
echo ""

# Check Frontend Configuration
echo "🎨 Frontend Configuration:"
echo "========================="
if [ -f "frontend/.env" ]; then
    echo "✅ frontend/.env exists"
    
    API_URL=$(grep "VITE_API_URL" frontend/.env | cut -d'=' -f2)
    BACKEND_URL=$(grep "VITE_BACKEND_URL" frontend/.env | cut -d'=' -f2)
    
    echo "   API URL: $API_URL"
    echo "   Backend URL: $BACKEND_URL"
    
    if [[ "$API_URL" == *"localhost"* ]]; then
        echo "   ⚠️  Using localhost - only local access"
    else
        echo "   ✅ Configured for network access"
    fi
else
    echo "❌ frontend/.env not found"
fi
echo ""

# Check Backend Configuration
echo "🔧 Backend Configuration:"
echo "========================"
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
    
    MONGODB_URI=$(grep "MONGODB_URI" backend/.env | cut -d'=' -f2)
    CORS_ORIGINS=$(grep "CORS_ORIGINS" backend/.env | cut -d'=' -f2)
    FRONTEND_URL=$(grep "FRONTEND_URL" backend/.env | cut -d'=' -f2)
    
    echo "   MongoDB: $MONGODB_URI"
    echo "   Frontend URL: $FRONTEND_URL"
    echo "   CORS Origins: $CORS_ORIGINS"
    
    if [[ "$CORS_ORIGINS" == *"$MACHINE_IP"* ]]; then
        echo "   ✅ CORS configured for network access"
    else
        echo "   ⚠️  CORS limited to localhost"
    fi
else
    echo "❌ backend/.env not found"
fi
echo ""

# Check MongoDB
echo "🗄️  Database Status:"
echo "==================="
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    echo "   Start with: sudo systemctl start mongod"
fi
echo ""

# Check Ports
echo "🌐 Port Status:"
echo "==============="
if netstat -tulpn 2>/dev/null | grep -q ":3000"; then
    echo "✅ Port 3000 is in use (Frontend)"
else
    echo "⚪ Port 3000 is available"
fi

if netstat -tulpn 2>/dev/null | grep -q ":5000"; then
    echo "✅ Port 5000 is in use (Backend)"
else
    echo "⚪ Port 5000 is available"
fi
echo ""

# Network Access URLs
echo "🔗 Access URLs:"
echo "==============="
echo "📱 Local Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api/health"
echo ""
echo "🌐 Network Access:"
echo "   Frontend: http://$MACHINE_IP:3000"
echo "   Backend:  http://$MACHINE_IP:5000/api/health"
echo ""

# Quick Setup Commands
echo "⚡ Quick Commands:"
echo "=================="
echo "Setup for network:  ./setup-network.sh"
echo "Start application:  ./start-network.sh"
echo "Frontend only:      cd frontend && npm run dev:network"
echo "Backend only:       cd backend && npm run dev:network"
echo ""

# Firewall Check
echo "🔥 Firewall Check:"
echo "=================="
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "3000\|5000"; then
        echo "✅ UFW rules found for ports 3000/5000"
    else
        echo "⚠️  No UFW rules found. Add with:"
        echo "   sudo ufw allow 3000"
        echo "   sudo ufw allow 5000"
    fi
elif command -v iptables &> /dev/null; then
    if iptables -L | grep -q "3000\|5000"; then
        echo "✅ iptables rules found"
    else
        echo "⚠️  Check iptables rules for ports 3000/5000"
    fi
else
    echo "ℹ️  Firewall status unknown - ensure ports 3000/5000 are open"
fi
echo ""

echo "🎯 Status Summary:"
echo "=================="
if [ -f "frontend/.env" ] && [ -f "backend/.env" ]; then
    if [[ "$CORS_ORIGINS" == *"$MACHINE_IP"* ]] && [[ "$API_URL" == *"$MACHINE_IP"* ]]; then
        echo "✅ Ready for network access"
    else
        echo "⚠️  Configured for localhost only"
        echo "   Run ./setup-network.sh to enable network access"
    fi
else
    echo "❌ Configuration incomplete"
    echo "   Run ./setup-network.sh to configure"
fi
echo ""