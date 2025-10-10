#!/bin/bash

echo "🚀 FinAutoJobs Deployment Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate secure secret
generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
    elif command -v node >/dev/null 2>&1; then
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    else
        # Fallback method
        date +%s | sha256sum | base64 | head -c 32
    fi
}

echo -e "${BLUE}🔧 Deployment Environment Setup${NC}"
echo "=================================="

# Get deployment platform
echo ""
echo "Select your deployment platform:"
echo "1) Render.com (Frontend + Backend)"
echo "2) Netlify + Railway"
echo "3) Vercel + Heroku"
echo "4) Custom/Other"
echo ""
read -p "Enter choice (1-4): " platform_choice

# Get environment type
echo ""
echo "Select environment type:"
echo "1) Production"
echo "2) Staging"
echo ""
read -p "Enter choice (1-2): " env_choice

if [ "$env_choice" = "1" ]; then
    ENV_TYPE="production"
    ENV_SUFFIX="production"
else
    ENV_TYPE="staging"
    ENV_SUFFIX="staging"
fi

echo ""
echo -e "${YELLOW}📝 Please provide the following information:${NC}"

# Get frontend URL
read -p "Frontend URL (e.g., https://myapp.netlify.app): " FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Frontend URL is required${NC}"
    exit 1
fi

# Get backend URL
read -p "Backend URL (e.g., https://myapi.railway.app): " BACKEND_URL
if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required${NC}"
    exit 1
fi

# Get MongoDB URI
read -p "MongoDB URI (MongoDB Atlas recommended): " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo -e "${YELLOW}⚠️ MongoDB URI not provided. Using placeholder.${NC}"
    MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/finautojobs"
fi

# Generate secrets
echo ""
echo -e "${BLUE}🔐 Generating secure secrets...${NC}"
JWT_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)

echo -e "${GREEN}✅ Secrets generated successfully${NC}"

# Create frontend environment file
echo ""
echo -e "${BLUE}📄 Creating frontend environment file...${NC}"

cat > "frontend/.env.${ENV_SUFFIX}" << EOF
# ${ENV_TYPE^} Frontend Environment Configuration
# Generated on $(date)

# API Configuration
VITE_API_URL=${BACKEND_URL}/api
VITE_NODE_ENV=${ENV_TYPE}

# Application Info
VITE_APP_NAME=FinAutoJobs$([ "$ENV_TYPE" = "staging" ] && echo " (Staging)" || echo "")
VITE_APP_VERSION=1.0.0$([ "$ENV_TYPE" = "staging" ] && echo "-staging" || echo "")

# Feature Flags
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PREMIUM_FEATURES=$([ "$ENV_TYPE" = "production" ] && echo "true" || echo "false")

# Debug Mode
VITE_DEBUG=$([ "$ENV_TYPE" = "production" ] && echo "false" || echo "true")

# Optional: Add your Google Client ID for OAuth
# VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Optional: Add your analytics ID
# VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
EOF

echo -e "${GREEN}✅ Frontend .env.${ENV_SUFFIX} created${NC}"

# Create backend environment file
echo ""
echo -e "${BLUE}📄 Creating backend environment file...${NC}"

cat > "backend/.env.${ENV_SUFFIX}" << EOF
# ${ENV_TYPE^} Backend Environment Configuration
# Generated on $(date)

# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
PORT=5000
NODE_ENV=${ENV_TYPE}
HOST=0.0.0.0

# Frontend Configuration
FRONTEND_URL=${FRONTEND_URL}

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGODB_URI=${MONGODB_URI}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
JWT_EXPIRES_IN=24h

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGIN=${FRONTEND_URL}

# Additional patterns (add more domains if needed)
# CORS_ALLOW_PATTERNS=yourdomain.com,yourapp.netlify.app

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_REGISTRATION=true
ENABLE_COMPANY_VERIFICATION=true
ALLOW_UNVERIFIED_JOB_POSTING=$([ "$ENV_TYPE" = "production" ] && echo "false" || echo "true")
REQUIRE_PROFILE_COMPLETION=true
SEND_EMAILS_IN_DEV=false
ENABLE_SOCKET_IO=true
DEBUG_MODE=$([ "$ENV_TYPE" = "production" ] && echo "false" || echo "true")

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================
DB_POOL_SIZE=10
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# =============================================================================
# MONITORING
# =============================================================================
LOG_LEVEL=$([ "$ENV_TYPE" = "production" ] && echo "info" || echo "debug")
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

# =============================================================================
# EMAIL CONFIGURATION (Optional - Update with your SMTP settings)
# =============================================================================
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# EMAIL_FROM_NAME=FinAutoJobs
# EMAIL_FROM_ADDRESS=noreply@finautojobs.com

# =============================================================================
# OAUTH CONFIGURATION (Optional - Update with your OAuth settings)
# =============================================================================
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_REDIRECT_URI=${BACKEND_URL}/api/oauth/google/callback
EOF

echo -e "${GREEN}✅ Backend .env.${ENV_SUFFIX} created${NC}"

# Create deployment instructions
echo ""
echo -e "${BLUE}📋 Creating deployment instructions...${NC}"

cat > "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
# ${ENV_TYPE^} Deployment Instructions

Generated on: $(date)

## 🚀 Quick Deploy

### Frontend Deployment
\`\`\`bash
# Build command
npm run build

# Environment Variables to set on your platform:
VITE_API_URL=${BACKEND_URL}/api
VITE_NODE_ENV=${ENV_TYPE}
$([ "$ENV_TYPE" = "production" ] && echo "VITE_DEBUG=false" || echo "VITE_DEBUG=true")
\`\`\`

### Backend Deployment
\`\`\`bash
# Start command
npm start

# Environment Variables to set on your platform:
NODE_ENV=${ENV_TYPE}
FRONTEND_URL=${FRONTEND_URL}
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
CORS_ORIGIN=${FRONTEND_URL}
\`\`\`

## 🔧 Platform-Specific Instructions

EOF

# Add platform-specific instructions
case $platform_choice in
    1)
        cat >> "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
### Render.com Deployment

#### Frontend Service
1. Connect your GitHub repository
2. Set build command: \`npm run build\`
3. Set start command: \`npm run preview\`
4. Add environment variables from above

#### Backend Service
1. Connect your GitHub repository
2. Set build command: \`npm install\`
3. Set start command: \`npm start\`
4. Add environment variables from above

EOF
        ;;
    2)
        cat >> "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
### Netlify + Railway Deployment

#### Frontend (Netlify)
1. Connect your GitHub repository
2. Set build command: \`npm run build\`
3. Set publish directory: \`dist\`
4. Add environment variables from above

#### Backend (Railway)
1. Connect your GitHub repository
2. Railway will auto-detect Node.js
3. Add environment variables from above

EOF
        ;;
    3)
        cat >> "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
### Vercel + Heroku Deployment

#### Frontend (Vercel)
1. Connect your GitHub repository
2. Vercel will auto-detect Vite
3. Add environment variables from above

#### Backend (Heroku)
1. Create Procfile: \`web: npm start\`
2. Connect your GitHub repository
3. Add environment variables from above

EOF
        ;;
    4)
        cat >> "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
### Custom Platform Deployment

1. Ensure Node.js 20+ is available
2. Set the environment variables listed above
3. For frontend: run \`npm run build\` and serve the \`dist\` folder
4. For backend: run \`npm start\`

EOF
        ;;
esac

cat >> "DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md" << EOF
## ✅ Post-Deployment Checklist

- [ ] Frontend loads at: ${FRONTEND_URL}
- [ ] Backend health check: ${BACKEND_URL}/api/health
- [ ] CORS is working (no console errors)
- [ ] Database connection is successful
- [ ] User registration/login works
- [ ] Dashboard navigation works
- [ ] Real-time notifications work

## 🔍 Testing

\`\`\`bash
# Test backend health
curl ${BACKEND_URL}/api/health

# Test CORS
curl -H "Origin: ${FRONTEND_URL}" \\
     -H "Access-Control-Request-Method: GET" \\
     -X OPTIONS \\
     ${BACKEND_URL}/api/health
\`\`\`

## 🆘 Troubleshooting

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Check backend logs for CORS/database errors
4. Ensure MongoDB URI is correct and accessible
5. Verify JWT and session secrets are set

## 🔐 Security Notes

- JWT Secret: ${JWT_SECRET:0:8}... (32 characters)
- Session Secret: ${SESSION_SECRET:0:8}... (32 characters)
- Keep these secrets secure and never commit them to version control
EOF

echo -e "${GREEN}✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md${NC}"

# Summary
echo ""
echo -e "${GREEN}🎉 Deployment setup complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo "  - frontend/.env.${ENV_SUFFIX}"
echo "  - backend/.env.${ENV_SUFFIX}"
echo "  - DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md"
echo ""
echo -e "${BLUE}🔗 Your URLs:${NC}"
echo "  - Frontend: ${FRONTEND_URL}"
echo "  - Backend:  ${BACKEND_URL}"
echo "  - API:      ${BACKEND_URL}/api"
echo "  - Health:   ${BACKEND_URL}/api/health"
echo ""
echo -e "${YELLOW}⚠️ Next steps:${NC}"
echo "1. Copy the environment variables to your deployment platform"
echo "2. Update MongoDB URI with your actual database"
echo "3. Configure OAuth settings if needed"
echo "4. Deploy and test using the instructions file"
echo ""
echo -e "${BLUE}📖 For detailed instructions, see: DEPLOYMENT_INSTRUCTIONS_${ENV_TYPE}.md${NC}"
