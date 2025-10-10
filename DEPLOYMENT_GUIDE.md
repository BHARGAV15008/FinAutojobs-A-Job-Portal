# Deployment Configuration Guide

## Overview
This guide explains how to deploy FinAutoJobs to various platforms with automatic IP/port detection and environment-based configuration.

## 🚀 Quick Deployment Checklist

### **Pre-Deployment**
- [ ] Update environment variables for your platform
- [ ] Configure database connection (MongoDB Atlas recommended)
- [ ] Set up domain names (if using custom domains)
- [ ] Generate secure JWT and session secrets
- [ ] Configure OAuth redirect URLs

### **Platform-Specific Setup**
- [ ] Frontend: Set `VITE_API_URL` to your backend URL
- [ ] Backend: Set `FRONTEND_URL` to your frontend URL
- [ ] Backend: Configure `CORS_ORIGIN` for your frontend domain
- [ ] Both: Ensure `NODE_ENV=production`

## 🌐 Deployment Platforms

### **1. Render.com (Recommended)**

#### **Frontend Deployment**
```bash
# Build Command
npm run build

# Start Command  
npm run preview

# Environment Variables
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_NODE_ENV=production
```

#### **Backend Deployment**
```bash
# Build Command
npm install

# Start Command
npm start

# Environment Variables
NODE_ENV=production
FRONTEND_URL=https://your-frontend-name.onrender.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finautojobs
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
SESSION_SECRET=your-secure-session-secret-32-chars-minimum
```

### **2. Netlify + Railway**

#### **Frontend (Netlify)**
```bash
# Build Command
npm run build

# Publish Directory
dist

# Environment Variables
VITE_API_URL=https://your-app.railway.app/api
VITE_NODE_ENV=production
```

#### **Backend (Railway)**
```bash
# Environment Variables
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finautojobs
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
```

### **3. Vercel + Heroku**

#### **Frontend (Vercel)**
```bash
# Build Command
npm run build

# Output Directory
dist

# Environment Variables
VITE_API_URL=https://your-app.herokuapp.com/api
VITE_NODE_ENV=production
```

#### **Backend (Heroku)**
```bash
# Procfile
web: npm start

# Environment Variables
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finautojobs
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
```

## 🔧 Environment Configuration

### **Automatic Detection System**

The application automatically detects the deployment environment:

```javascript
// Frontend automatically detects:
- localhost → development mode
- 192.168.x.x → network mode  
- *.onrender.com → production mode
- *.netlify.app → production mode
- *.vercel.app → production mode

// Backend automatically allows CORS for:
- Development: All local IPs
- Production: Deployment platform patterns
- Custom: Environment variable patterns
```

### **Frontend Environment Variables**

#### **Required**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_NODE_ENV=production
```

#### **Optional**
```env
VITE_APP_NAME=FinAutoJobs
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_DEBUG=false
```

### **Backend Environment Variables**

#### **Required**
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finautojobs
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters
SESSION_SECRET=your-secure-session-secret-minimum-32-characters
```

#### **Optional**
```env
CORS_ORIGIN=https://your-frontend-domain.com
CORS_ALLOW_PATTERNS=your-domain.com,your-app.netlify.app
PORT=5000
HOST=0.0.0.0
```

## 🗄️ Database Setup

### **MongoDB Atlas (Recommended)**

1. **Create Cluster**
   ```bash
   # Sign up at https://cloud.mongodb.com
   # Create a new cluster (free tier available)
   # Get connection string
   ```

2. **Configure Connection**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs?retryWrites=true&w=majority
   ```

3. **Network Access**
   ```bash
   # Add 0.0.0.0/0 to IP whitelist for deployment platforms
   # Or add specific IPs for your deployment platform
   ```

## 🔐 Security Configuration

### **Generate Secure Secrets**

```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret (32+ characters)  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **OAuth Configuration**

Update OAuth redirect URLs for production:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/oauth/google/callback
```

## 🌍 Domain Configuration

### **Custom Domains**

#### **Frontend**
```env
# Custom domain
VITE_API_URL=https://api.finautojobs.com/api

# Subdomain
VITE_API_URL=https://api.yourcompany.com/api
```

#### **Backend**
```env
# Custom domain
FRONTEND_URL=https://finautojobs.com
CORS_ORIGIN=https://finautojobs.com

# Multiple domains
CORS_ALLOW_PATTERNS=finautojobs.com,yourcompany.com
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_NODE_ENV: production
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=frontend/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway/cli@v2
        with:
          command: up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🧪 Testing Deployment

### **Pre-Deployment Testing**

```bash
# Test production build locally
cd frontend
npm run build
npm run preview

# Test with production API URL
VITE_API_URL=https://your-backend.com/api npm run build
```

### **Post-Deployment Testing**

```bash
# Test API health
curl https://your-backend-domain.com/api/health

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-domain.com/api/health
```

### **Frontend Testing**

1. **Open your deployed frontend URL**
2. **Check browser console for configuration**:
   ```javascript
   🔧 API Configuration Summary: {
     environment: "production",
     apiUrl: "https://your-backend.com/api",
     socketUrl: "https://your-backend.com"
   }
   ```
3. **Test key features**:
   - [ ] User registration/login
   - [ ] Dashboard navigation
   - [ ] API calls work
   - [ ] Real-time notifications
   - [ ] File uploads

## 🚨 Troubleshooting

### **Common Issues**

#### **1. CORS Errors**
```bash
# Check backend logs for CORS messages
# Add your frontend domain to CORS_ORIGIN
# Verify CORS_ALLOW_PATTERNS if using wildcards
```

#### **2. API Connection Failed**
```bash
# Verify VITE_API_URL is correct
# Check backend is deployed and running
# Test API health endpoint directly
```

#### **3. Database Connection Error**
```bash
# Verify MONGODB_URI is correct
# Check MongoDB Atlas network access
# Ensure database user has proper permissions
```

#### **4. Authentication Issues**
```bash
# Verify JWT_SECRET is set and secure
# Check OAuth redirect URLs match deployment
# Ensure SESSION_SECRET is configured
```

### **Debug Mode**

Enable debug mode for troubleshooting:

```env
# Frontend
VITE_DEBUG=true

# Backend  
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📊 Monitoring

### **Health Checks**

```bash
# Backend health
GET https://your-backend.com/api/health

# Expected response:
{
  "status": "OK",
  "message": "FinAutoJobs API is running",
  "timestamp": "2025-01-10T05:00:00.000Z",
  "env": "production"
}
```

### **Performance Monitoring**

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage analytics
- **Uptime monitoring** for availability

## 🔄 Updates and Maintenance

### **Rolling Updates**

1. **Test in staging environment first**
2. **Deploy backend updates first**
3. **Deploy frontend updates second**
4. **Monitor for errors after deployment**

### **Database Migrations**

```bash
# Run migrations after backend deployment
npm run migrate

# Or set automatic migrations
RUN_MIGRATIONS_ON_START=true
```

## 📋 Deployment Checklist

### **Before Going Live**
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] OAuth providers configured
- [ ] Domain names configured
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] CORS properly configured
- [ ] Secrets are secure (32+ chars)

### **After Deployment**
- [ ] Test all major features
- [ ] Verify real-time notifications
- [ ] Check error monitoring
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Document deployment URLs

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check browser console and server logs
4. Verify environment variables are set correctly
5. Test API endpoints directly

The dynamic configuration system should handle most deployment scenarios automatically, but always verify the environment variables are set correctly for your specific platform!
