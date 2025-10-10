#!/bin/bash

echo "🚀 FinAutoJobs Render.com Quick Deploy Setup"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}This script will help you prepare for Render.com deployment${NC}"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is available${NC}"

# Generate secrets
echo ""
echo -e "${BLUE}🔐 Generating secure secrets...${NC}"
node generate-secrets.js

echo ""
echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo ""

# Checklist
echo "□ 1. Create GitHub repository and push your code"
echo "□ 2. Sign up for MongoDB Atlas (free): https://cloud.mongodb.com"
echo "□ 3. Create MongoDB cluster and get connection string"
echo "□ 4. Sign up for Render.com: https://render.com"
echo "□ 5. Create backend service on Render"
echo "□ 6. Add backend environment variables (see RENDER_BACKEND_ENV.txt)"
echo "□ 7. Create frontend service on Render"
echo "□ 8. Add frontend environment variables (see RENDER_FRONTEND_ENV.txt)"
echo "□ 9. Test deployment"

echo ""
echo -e "${YELLOW}📁 Files created for you:${NC}"
echo "  ✅ RENDER_BACKEND_ENV.txt - Backend environment variables"
echo "  ✅ RENDER_FRONTEND_ENV.txt - Frontend environment variables"
echo "  ✅ GENERATED_SECRETS.txt - Your secure secrets"
echo "  ✅ RENDER_DEPLOYMENT_GUIDE.md - Complete step-by-step guide"

echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo "  📚 MongoDB Atlas: https://cloud.mongodb.com"
echo "  🚀 Render.com: https://render.com"
echo "  📖 Full Guide: ./RENDER_DEPLOYMENT_GUIDE.md"

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Read the complete guide: ${BLUE}RENDER_DEPLOYMENT_GUIDE.md${NC}"
echo "2. Setup MongoDB Atlas database"
echo "3. Deploy to Render using the environment files"
echo "4. Test your deployment"

echo ""
echo -e "${YELLOW}⚠️ Important Security Notes:${NC}"
echo "• Keep your secrets secure (GENERATED_SECRETS.txt)"
echo "• Never commit secrets to version control"
echo "• Delete GENERATED_SECRETS.txt after copying to Render"
echo "• Use strong passwords for MongoDB Atlas"

echo ""
echo -e "${GREEN}🎉 You're ready to deploy to Render.com!${NC}"
