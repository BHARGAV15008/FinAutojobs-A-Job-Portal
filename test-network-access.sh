#!/bin/bash

echo "🌐 Testing FinAutoJobs Network Access..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get local IP address
get_local_ip() {
    # Try multiple methods to get local IP
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null)
    
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    fi
    
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null)
    fi
    
    echo "$LOCAL_IP"
}

LOCAL_IP=$(get_local_ip)

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}❌ Could not determine local IP address${NC}"
    echo "Please check your network connection"
    exit 1
fi

echo -e "${BLUE}🔍 Local IP Address: ${LOCAL_IP}${NC}"
echo ""

# Test port availability
test_port() {
    local port=$1
    local service=$2
    
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service (port $port): RUNNING${NC}"
            return 0
        else
            echo -e "${RED}❌ $service (port $port): NOT RUNNING${NC}"
            return 1
        fi
    else
        # Fallback using /dev/tcp
        if timeout 3 bash -c "</dev/tcp/localhost/$port" 2>/dev/null; then
            echo -e "${GREEN}✅ $service (port $port): RUNNING${NC}"
            return 0
        else
            echo -e "${RED}❌ $service (port $port): NOT RUNNING${NC}"
            return 1
        fi
    fi
}

# Test HTTP endpoints
test_http() {
    local url=$1
    local description=$2
    
    if command -v curl >/dev/null 2>&1; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ $description: ACCESSIBLE (HTTP $HTTP_CODE)${NC}"
            return 0
        else
            echo -e "${RED}❌ $description: FAILED (HTTP $HTTP_CODE)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ $description: SKIPPED (curl not available)${NC}"
        return 1
    fi
}

# Test network binding
test_network_binding() {
    local port=$1
    local service=$2
    
    if command -v netstat >/dev/null 2>&1; then
        BINDING=$(netstat -tlnp 2>/dev/null | grep ":$port ")
        if echo "$BINDING" | grep -q "0.0.0.0:$port"; then
            echo -e "${GREEN}✅ $service: Bound to 0.0.0.0 (network accessible)${NC}"
            return 0
        elif echo "$BINDING" | grep -q "127.0.0.1:$port"; then
            echo -e "${YELLOW}⚠️ $service: Bound to localhost only${NC}"
            return 1
        elif echo "$BINDING" | grep -q ":$port"; then
            echo -e "${GREEN}✅ $service: Network binding detected${NC}"
            return 0
        else
            echo -e "${RED}❌ $service: No binding found${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ $service: Cannot check binding (netstat not available)${NC}"
        return 1
    fi
}

echo "🔍 Testing Service Availability..."
echo "=================================="

# Test if services are running
BACKEND_RUNNING=0
FRONTEND_RUNNING=0

if test_port 5000 "Backend API"; then
    BACKEND_RUNNING=1
fi

if test_port 3000 "Frontend Server"; then
    FRONTEND_RUNNING=1
fi

echo ""
echo "🔍 Testing Network Binding..."
echo "============================="

test_network_binding 5000 "Backend API"
test_network_binding 3000 "Frontend Server"

echo ""
echo "🔍 Testing Local Access..."
echo "=========================="

# Test local endpoints
if [ $BACKEND_RUNNING -eq 1 ]; then
    test_http "http://192.168.41.134:5000/api/health" "Backend Health Check (localhost)"
fi

if [ $FRONTEND_RUNNING -eq 1 ]; then
    test_http "http://192.168.41.134:3000" "Frontend (localhost)"
fi

echo ""
echo "🔍 Testing Network Access..."
echo "============================"

# Test network endpoints
if [ $BACKEND_RUNNING -eq 1 ]; then
    test_http "http://$LOCAL_IP:5000/api/health" "Backend Health Check (network)"
fi

if [ $FRONTEND_RUNNING -eq 1 ]; then
    test_http "http://$LOCAL_IP:3000" "Frontend (network)"
fi

echo ""
echo "🔍 Firewall Check..."
echo "==================="

# Check firewall status (Linux)
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1)
    if echo "$UFW_STATUS" | grep -q "inactive"; then
        echo -e "${GREEN}✅ UFW Firewall: Inactive (no blocking)${NC}"
    elif echo "$UFW_STATUS" | grep -q "active"; then
        echo -e "${YELLOW}⚠️ UFW Firewall: Active (check rules)${NC}"
        # Check if ports are allowed
        UFW_RULES=$(sudo ufw status 2>/dev/null)
        if echo "$UFW_RULES" | grep -q "3000\|5000"; then
            echo -e "${GREEN}✅ Ports 3000/5000: Found in UFW rules${NC}"
        else
            echo -e "${RED}❌ Ports 3000/5000: Not found in UFW rules${NC}"
            echo -e "${YELLOW}💡 Run: sudo ufw allow 3000 && sudo ufw allow 5000${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️ UFW not available, cannot check firewall status${NC}"
fi

echo ""
echo "📱 Network Access URLs..."
echo "========================"

if [ $FRONTEND_RUNNING -eq 1 ]; then
    echo -e "${BLUE}🌐 Frontend:${NC}"
    echo "   📱 Local:   http://192.168.41.134:3000"
    echo "   🌍 Network: http://$LOCAL_IP:3000"
fi

if [ $BACKEND_RUNNING -eq 1 ]; then
    echo -e "${BLUE}🔧 Backend:${NC}"
    echo "   📱 Local:   http://192.168.41.134:5000"
    echo "   🌍 Network: http://$LOCAL_IP:5000"
    echo "   🔍 Health:  http://$LOCAL_IP:5000/api/health"
fi

echo ""
echo "📋 Summary..."
echo "============="

TOTAL_TESTS=0
PASSED_TESTS=0

# Count results
if [ $BACKEND_RUNNING -eq 1 ]; then
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ Backend is running and accessible${NC}"
else
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${RED}❌ Backend is not running${NC}"
    echo -e "${YELLOW}💡 Start with: npm run backend${NC}"
fi

if [ $FRONTEND_RUNNING -eq 1 ]; then
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ Frontend is running and accessible${NC}"
else
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${RED}❌ Frontend is not running${NC}"
    echo -e "${YELLOW}💡 Start with: npm run frontend${NC}"
fi

echo ""
if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Your app is accessible across the network.${NC}"
    echo ""
    echo -e "${BLUE}📱 Share these URLs with other devices on your network:${NC}"
    echo -e "   Frontend: ${GREEN}http://$LOCAL_IP:3000${NC}"
    echo -e "   Backend:  ${GREEN}http://$LOCAL_IP:5000${NC}"
else
    echo -e "${YELLOW}⚠️ Some tests failed. Check the issues above.${NC}"
    echo ""
    echo -e "${BLUE}🔧 Quick fixes:${NC}"
    echo "   1. Start services: npm run dev"
    echo "   2. Check firewall: sudo ufw allow 3000 && sudo ufw allow 5000"
    echo "   3. Verify network connection"
fi

echo ""
echo -e "${BLUE}🔍 For detailed troubleshooting, see: NETWORK_ACCESS_GUIDE.md${NC}"
