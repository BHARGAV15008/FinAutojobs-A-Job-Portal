# FinAutoJobs Environment Setup Guide

## 🚀 Quick Start

### 1. Automated Setup (Recommended)
```bash
npm run setup
```
This will:
- Create `.env` file from `.env.example`
- Install all dependencies for frontend and backend
- Provide setup guidance

### 2. Manual Setup
```bash
# Copy environment file
cp .env.example .env

# Install dependencies
npm run install-all

# Edit environment variables
# Edit .env file with your actual values
```

## 📁 File Structure

```
FinAutoJobs/
├── .env                    # ← SINGLE environment file (create from .env.example)
├── .env.example           # ← Template with all variables
├── setup-env.js          # ← Setup script
├── config/
│   ├── README.md         # ← Configuration documentation
│   └── examples/         # ← Legacy example files (moved here)
├── backend/              # ← Reads from root .env
└── frontend/             # ← Reads from root .env via Vite
```

## 🔧 Environment Variables

### Core Configuration
```bash
# Server
PORT=5000                    # Backend server port
NODE_ENV=development         # Environment mode
BACKEND_PORT=5000           # Backend port (alternative name)

# Database
MONGODB_URI=mongodb://localhost:27017/finautojobs
DATABASE_URL=mongodb://localhost:27017/finautojobs

# Frontend
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api      # Frontend API URL
VITE_BACKEND_PORT=5000                      # Frontend backend port
VITE_PROD_API_URL=/api                      # Production API URL
```

### Security & Authentication
```bash
# JWT & Sessions
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Admin Account
ADMIN_EMAIL=admin@finautojobs.com
ADMIN_PASSWORD=change-this-admin-password
ADMIN_NAME=Super Admin
```

### OAuth Providers
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=/api/auth/microsoft/callback

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### Email Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=your-email@gmail.com
SEND_EMAILS_IN_DEV=true
```

### Feature Flags
```bash
ENABLE_REGISTRATION=true
ENABLE_COMPANY_VERIFICATION=true
ALLOW_UNVERIFIED_JOB_POSTING=false
REQUIRE_PROFILE_COMPLETION=true
ENABLE_SOCKET_IO=true
```

## 🌍 Environment-Specific Configuration

### Development (Default)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finautojobs
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
```

### Production
```bash
NODE_ENV=production
PORT=10000  # Or use process.env.PORT for hosting platforms
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finautojobs
FRONTEND_URL=https://your-domain.com
VITE_PROD_API_URL=/api  # Relative path for same-domain deployment
```

### Staging
```bash
NODE_ENV=staging
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/finautojobs-staging
FRONTEND_URL=https://staging.your-domain.com
VITE_API_URL=https://staging-api.your-domain.com/api
```

## 🔒 Security Best Practices

### Secrets Management
1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for production
3. **Rotate secrets regularly**
4. **Use environment-specific values** for different deployments

### Required Strong Secrets
```bash
# Generate strong secrets (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
SESSION_SECRET=your-session-secret-key-change-this-in-production-987654321
ADMIN_PASSWORD=create-a-strong-admin-password-here
```

### OAuth Setup
1. **Google OAuth**: Create project in Google Cloud Console
2. **Microsoft OAuth**: Register app in Azure AD
3. **Apple OAuth**: Configure in Apple Developer Console
4. **LinkedIn OAuth**: Create app in LinkedIn Developer Portal

## 🚀 Deployment Configuration

### Render.com
```bash
# Build Command: npm run install-all
# Start Command: npm run start:production
# Environment Variables: Set in Render dashboard
```

### Vercel (Frontend) + Railway (Backend)
```bash
# Vercel Environment Variables:
VITE_API_URL=https://your-backend.railway.app/api

# Railway Environment Variables:
FRONTEND_URL=https://your-app.vercel.app
```

### Netlify (Frontend) + Heroku (Backend)
```bash
# Netlify Environment Variables:
VITE_API_URL=https://your-app.herokuapp.com/api

# Heroku Environment Variables:
FRONTEND_URL=https://your-app.netlify.app
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check if port is in use
netstat -an | grep :5000

# Kill process using port
lsof -ti:5000 | xargs kill -9
```

#### 2. Database Connection
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/finautojobs"

# For MongoDB Atlas, ensure IP whitelist is configured
```

#### 3. Environment Variables Not Loading
```bash
# Verify .env file location (should be in project root)
ls -la .env

# Check file permissions
chmod 644 .env

# Restart development server after changes
```

#### 4. CORS Issues
```bash
# Ensure CORS_ORIGINS includes your frontend URL
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGIN=http://localhost:3000
```

### Debug Commands
```bash
# Check environment variables
npm run setup-env

# Test network connectivity
npm run network-info

# Generate new secrets
npm run generate-secrets
```

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Verify `.env` file configuration
3. Ensure all required services are running
4. Check console logs for specific error messages

## 🔄 Migration from Multiple .env Files

If you previously had separate `.env` files:
1. Run `npm run setup-env` to create unified `.env`
2. Merge values from old files into new `.env`
3. Remove old `.env` files from backend/frontend directories
4. Restart all services

The new unified approach ensures:
- ✅ Single source of truth for all configuration
- ✅ Consistent environment variables across frontend/backend
- ✅ Simplified deployment and development setup
- ✅ Better security with centralized secrets management
