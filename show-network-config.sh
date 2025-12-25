#!/bin/bash

# Network Configuration Display Script
# Shows current network configuration for easy access

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "================================================================"
echo "🌐 FinAutoJobs Network Configuration"
echo "================================================================"
echo ""

# Detect local IP address
detect_local_ip() {
    # Try multiple methods to detect IP
    if command -v ip &> /dev/null; then
        LOCAL_IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7; exit}')
    elif command -v ifconfig &> /dev/null; then
        LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    elif command -v hostname &> /dev/null; then
        LOCAL_IP=$(hostname -I | awk '{print $1}')
    else
        LOCAL_IP="Unable to detect"
    fi
    
    echo "$LOCAL_IP"
}

LOCAL_IP=$(detect_local_ip)

# Display configuration
echo -e "${BLUE}📍 Your Network Configuration:${NC}"
echo ""
echo -e "  ${GREEN}Local IP Address:${NC} $LOCAL_IP"
echo ""

echo -e "${BLUE}🖥️  Access URLs:${NC}"
echo ""
echo -e "  ${YELLOW}From This Computer:${NC}"
echo "    • Frontend: http://localhost:3000"
echo "    • Backend:  http://localhost:5000"
echo "    • Health:   http://localhost:5000/api/health"
echo ""

if [ "$LOCAL_IP" != "Unable to detect" ]; then
    echo -e "  ${YELLOW}From Other Devices on Your Network:${NC}"
    echo "    • Frontend: http://$LOCAL_IP:3000"
    echo "    • Backend:  http://$LOCAL_IP:5000"
    echo "    • Health:   http://$LOCAL_IP:5000/api/health"
    echo ""
fi

echo -e "${BLUE}⚙️  Configuration Notes:${NC}"
echo ""
echo "  ✅ Application is configured for AUTO-DETECTION"
echo "  ✅ No manual IP configuration needed"
echo "  ✅ Works on any network automatically"
echo "  ✅ Accessible from all devices on your network"
echo ""

echo -e "${BLUE}🔒 Firewall:${NC}"
echo ""
echo "  Make sure ports 3000 and 5000 are allowed:"
echo ""
echo "  • Ubuntu/Debian:"
echo "    sudo ufw allow 3000"
echo "    sudo ufw allow 5000"
echo ""
echo "  • Fedora/RHEL:"
echo "    sudo firewall-cmd --add-port=3000/tcp --permanent"
echo "    sudo firewall-cmd --add-port=5000/tcp --permanent"
echo "    sudo firewall-cmd --reload"
echo ""

echo -e "${BLUE}🚀 Quick Start:${NC}"
echo ""
echo "  1. Backend:  cd backend && npm start"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "  The app will automatically use your network IP!"
echo ""

echo "================================================================"
echo ""
