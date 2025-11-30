#!/bin/bash

echo "🧪 Testing FinAutoJobs Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend health endpoint
echo "🔍 Testing backend health endpoint..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.41.134:5000/api/health)

if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check: PASSED${NC}"
else
    echo -e "${RED}❌ Backend health check: FAILED (HTTP $BACKEND_RESPONSE)${NC}"
    echo "   Make sure backend is running: npm run backend"
fi

# Test frontend accessibility
echo "🔍 Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.41.134:3000)

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend accessibility: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend accessibility: FAILED (HTTP $FRONTEND_RESPONSE)${NC}"
    echo "   Make sure frontend is running: npm run frontend"
fi

# Test API proxy (if frontend is running)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "🔍 Testing API proxy through frontend..."
    PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.41.134:3000/api/health)
    
    if [ "$PROXY_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ API proxy: PASSED${NC}"
    else
        echo -e "${YELLOW}⚠️ API proxy: FAILED (HTTP $PROXY_RESPONSE)${NC}"
        echo "   This might be normal if Vite proxy is not configured"
    fi
fi

# Test database connection (indirect through API)
echo "🔍 Testing database connection..."
DB_TEST=$(curl -s http://192.168.41.134:5000/api/health | grep -o '"database":"connected"')

if [ "$DB_TEST" = '"database":"connected"' ]; then
    echo -e "${GREEN}✅ Database connection: PASSED${NC}"
else
    echo -e "${RED}❌ Database connection: FAILED${NC}"
    echo "   Check MongoDB connection in backend logs"
fi

echo ""
echo "📊 Integration Test Summary:"
echo "   Backend: http://192.168.41.134:5000"
echo "   Frontend: http://192.168.41.134:3000"
echo "   API Health: http://192.168.41.134:5000/api/health"
echo ""

if [ "$BACKEND_RESPONSE" = "200" ] && [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}🎉 Integration test PASSED! Both services are running correctly.${NC}"
else
    echo -e "${YELLOW}⚠️ Some services are not running. Use 'npm run dev' to start both.${NC}"
fi
