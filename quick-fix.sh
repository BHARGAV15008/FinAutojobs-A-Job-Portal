#!/bin/bash

# FinAutoJobs - Quick Fix Script
# Fixes common integration issues

echo "🔧 FinAutoJobs Quick Fix Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📋 Running system checks..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    echo -e "${GREEN}✓${NC} MongoDB installed"
else
    echo -e "${YELLOW}⚠${NC} MongoDB not found locally (you may be using Atlas)"
fi

echo ""
echo "🔍 Checking environment files..."
echo ""

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env exists"
else
    echo -e "${YELLOW}⚠${NC} Backend .env not found"
    echo "  Creating from example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓${NC} Created backend/.env from example"
        echo -e "${YELLOW}⚠${NC} Please update backend/.env with your actual values"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
    fi
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env exists"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env not found"
    echo "  Creating default frontend/.env..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_PORT=5000
VITE_NODE_ENV=development
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_OAUTH=true
VITE_ENABLE_PHONE_AUTH=true
VITE_ENABLE_OTP=true
EOF
    echo -e "${GREEN}✓${NC} Created frontend/.env with default values"
fi

echo ""
echo "📦 Checking dependencies..."
echo ""

# Check backend dependencies
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Backend node_modules not found"
    echo "  Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Backend dependencies installed"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Backend dependencies exist"
fi
cd ..

# Check frontend dependencies
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Frontend node_modules not found"
    echo "  Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Frontend dependencies installed"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Frontend dependencies exist"
fi
cd ..

echo ""
echo "🗂️ Checking directory structure..."
echo ""

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo -e "${YELLOW}⚠${NC} uploads/ directory not found"
    mkdir -p uploads/documents uploads/resumes uploads/applications/documents uploads/applications/resumes
    echo -e "${GREEN}✓${NC} Created uploads directories"
else
    echo -e "${GREEN}✓${NC} uploads/ directory exists"
fi

# Create logs directory
if [ ! -d "backend/logs" ]; then
    mkdir -p backend/logs
    echo -e "${GREEN}✓${NC} Created logs directory"
fi

echo ""
echo "🧪 Testing API connection..."
echo ""

# Check if backend is running
BACKEND_RUNNING=0
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running and healthy"
    BACKEND_RUNNING=1
else
    echo -e "${YELLOW}⚠${NC} Backend is not running"
    echo "  To start backend: cd backend && npm run dev"
fi

echo ""
echo "🔧 Running fixes..."
echo ""

# Fix 1: Clean and rebuild
echo "1. Cleaning build artifacts..."
rm -rf frontend/dist frontend/node_modules/.vite backend/dist
echo -e "${GREEN}✓${NC} Build artifacts cleaned"

# Fix 2: Clear npm cache if there are issues
# echo "2. Clearing npm cache..."
# npm cache clean --force
# echo -e "${GREEN}✓${NC} npm cache cleared"

# Fix 3: Fix file permissions
echo "2. Fixing file permissions..."
chmod -R 755 uploads 2>/dev/null || true
echo -e "${GREEN}✓${NC} File permissions fixed"

# Fix 3: Database connectivity test
if [ $BACKEND_RUNNING -eq 1 ]; then
    echo "3. Testing database connection..."
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
    if echo "$HEALTH_RESPONSE" | grep -q "database"; then
        echo -e "${GREEN}✓${NC} Database connection healthy"
    else
        echo -e "${YELLOW}⚠${NC} Could not verify database connection"
    fi
else
    echo "3. Skipping database test (backend not running)"
fi

echo ""
echo "📊 Summary"
echo "================================"
echo ""

if [ $BACKEND_RUNNING -eq 1 ]; then
    echo -e "${GREEN}✓${NC} System Status: Ready"
    echo ""
    echo "🚀 Quick Start:"
    echo "   Frontend: cd frontend && npm run dev"
    echo "   Frontend URL: http://localhost:3000"
    echo "   Backend: Already running on http://localhost:5000"
    echo ""
    echo "📝 Run API tests: node test-api-connection.js"
else
    echo -e "${YELLOW}⚠${NC} System Status: Needs Backend"
    echo ""
    echo "🚀 To start the application:"
    echo ""
    echo "   Terminal 1 - Backend:"
    echo "   $ cd backend"
    echo "   $ npm run dev"
    echo ""
    echo "   Terminal 2 - Frontend:"
    echo "   $ cd frontend"
    echo "   $ npm run dev"
    echo ""
    echo "   Access: http://localhost:3000"
fi

echo ""
echo "📚 Documentation:"
echo "   - ENVIRONMENT_SETUP_GUIDE.md - Complete setup instructions"
echo "   - SYSTEM_AUDIT_REPORT.md - Known issues and fixes"
echo "   - README.md - Project overview"
echo ""
echo -e "${GREEN}✓${NC} Quick fix completed!"
