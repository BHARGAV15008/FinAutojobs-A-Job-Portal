#!/bin/bash

# FinAutoJobs Deployment Script for Hostinger
# =============================================
# This script helps prepare the application for deployment

echo "================================================"
echo "FinAutoJobs - Deployment Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js version
echo "Step 1: Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
    # Check if version is 18+
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${YELLOW}⚠ Warning: Node.js 18+ recommended, you have v$NODE_MAJOR${NC}"
    fi
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo ""

# Step 2: Check environment files
echo "Step 2: Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    echo "Creating from template..."
    cp backend/.env.production.example backend/.env
    echo -e "${YELLOW}→ Please edit backend/.env with your production values${NC}"
fi

if [ ! -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}⚠ frontend/.env.production not found${NC}"
    echo "Creating from template..."
    cp frontend/.env.production.example frontend/.env.production
    echo -e "${YELLOW}→ Please edit frontend/.env.production with your production values${NC}"
fi
echo -e "${GREEN}✓ Environment files checked${NC}"
echo ""

# Step 3: Install backend dependencies
echo "Step 3: Installing backend dependencies..."
cd backend
if npm install --production; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Step 4: Install frontend dependencies
echo "Step 4: Installing frontend dependencies..."
cd frontend
if npm install; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..
echo ""

# Step 5: Build frontend
echo "Step 5: Building frontend for production..."
cd frontend
if npm run build; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
    echo -e "${GREEN}→ Build output: frontend/dist/${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 6: Create deployment package
echo "Step 6: Creating deployment information..."
cat > DEPLOYMENT_INFO.txt << EOF
FinAutoJobs - Deployment Package
================================
Created: $(date)

DEPLOYMENT STRUCTURE:
--------------------
/backend/          - Node.js API server (Express)
/frontend/dist/    - Production React build
/uploads/          - File upload directory

DEPLOYMENT STEPS:
-----------------
1. Upload entire project to your Hostinger hosting
2. Navigate to backend folder
3. Ensure .env is configured with production values
4. Start backend: npm start (or use PM2)
5. Point web server to frontend/dist/ folder
6. Set correct permissions on uploads/ folder (755)

REQUIRED SERVICES:
-----------------
- MongoDB Atlas (database)
- SMTP server (for emails)
- Node.js 18+ runtime
- Web server (Nginx/Apache)

BACKEND PORT: 5000 (configurable in .env)
FRONTEND: Static files in frontend/dist/

For detailed instructions, see README.txt
EOF

echo -e "${GREEN}✓ Deployment info created${NC}"
echo ""

echo "================================================"
echo -e "${GREEN}Deployment preparation complete!${NC}"
echo "================================================"
echo ""
echo "NEXT STEPS:"
echo "1. Edit backend/.env with your production credentials"
echo "2. Edit frontend/.env.production with your domain"
echo "3. Review DEPLOYMENT_INFO.txt"
echo "4. Upload to Hostinger"
echo "5. Start the backend server"
echo ""
echo "For support, check README.txt"
echo ""
