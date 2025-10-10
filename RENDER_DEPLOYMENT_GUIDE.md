# 🚀 Complete Render.com Deployment Guide

## Overview
This guide will deploy your full MERN stack FinAutoJobs application on Render.com for **FREE**. Render provides persistent containers (non-serverless) perfect for your needs.

## 📋 Prerequisites Checklist

- [ ] GitHub account
- [ ] Render.com account (free)
- [ ] MongoDB Atlas account (free)
- [ ] Your code pushed to GitHub

## 🗄️ Step 1: Setup MongoDB Atlas (Free Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up for free account
3. Create a new project: "FinAutoJobs"

### 1.2 Create Free Cluster
1. Click "Create Cluster"
2. Choose **FREE** tier (M0 Sandbox)
3. Select region closest to you
4. Name: `finautojobs-cluster`
5. Click "Create Cluster"

### 1.3 Setup Database Access
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `finautojobs-user`
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Setup Network Access
1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `finautojobs`

**Example:**
```
mongodb+srv://finautojobs-user:YOUR_PASSWORD@finautojobs-cluster.xxxxx.mongodb.net/finautojobs?retryWrites=true&w=majority
```

## 🔐 Step 2: Generate Secure Secrets

Run this command in your project directory:
```bash
node generate-secrets.js
```

This will generate:
- `JWT_SECRET` (64 characters)
- `SESSION_SECRET` (64 characters)

**Save these values - you'll need them for Render!**

## 🚀 Step 3: Deploy Backend to Render

### 3.1 Create Backend Service
1. Go to [https://render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select your `FinAutojobs-A-Job-Portal` repository

### 3.2 Configure Backend Service
```
Name: finautojobs-backend
Environment: Node
Region: Choose closest to you
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### 3.3 Add Backend Environment Variables
Click "Advanced" → "Add Environment Variable" and add each of these:

**Copy from `RENDER_BACKEND_ENV.txt`:**
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=https://finautojobs-frontend.onrender.com
MONGODB_URI=mongodb+srv://finautojobs-user:YOUR_PASSWORD@finautojobs-cluster.xxxxx.mongodb.net/finautojobs?retryWrites=true&w=majority
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
SESSION_SECRET=YOUR_GENERATED_SESSION_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://finautojobs-frontend.onrender.com
CORS_ALLOW_PATTERNS=onrender.com
ENABLE_REGISTRATION=true
ENABLE_COMPANY_VERIFICATION=true
ALLOW_UNVERIFIED_JOB_POSTING=false
REQUIRE_PROFILE_COMPLETION=true
SEND_EMAILS_IN_DEV=false
ENABLE_SOCKET_IO=true
DEBUG_MODE=false
DB_POOL_SIZE=10
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
```

### 3.4 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your backend URL will be: `https://finautojobs-backend.onrender.com`

## 🌐 Step 4: Deploy Frontend to Render

### 4.1 Create Frontend Service
1. In Render dashboard, click "New +" → "Web Service"
2. Connect same GitHub repository
3. Select your `FinAutojobs-A-Job-Portal` repository

### 4.2 Configure Frontend Service
```
Name: finautojobs-frontend
Environment: Node
Region: Same as backend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm run preview
```

### 4.3 Add Frontend Environment Variables
Click "Advanced" → "Add Environment Variable":

**Copy from `RENDER_FRONTEND_ENV.txt`:**
```
VITE_API_URL=https://finautojobs-backend.onrender.com/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PREMIUM_FEATURES=true
VITE_DEBUG=false
```

### 4.4 Deploy Frontend
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your frontend URL will be: `https://finautojobs-frontend.onrender.com`

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
1. Open: `https://finautojobs-backend.onrender.com/api/health`
2. Should see:
```json
{
  "status": "OK",
  "message": "FinAutoJobs API is running",
  "timestamp": "2025-01-10T05:09:51.000Z",
  "env": "production"
}
```

### 5.2 Test Frontend
1. Open: `https://finautojobs-frontend.onrender.com`
2. Should see the FinAutoJobs homepage
3. Check browser console for API configuration
4. Test user registration/login

### 5.3 Test Full Integration
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard navigation works
- [ ] Job posting works (for recruiters)
- [ ] Job applications work (for applicants)
- [ ] Real-time notifications work

## 🔧 Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain to Frontend
1. In Render dashboard → Frontend service → Settings
2. Click "Custom Domains"
3. Add your domain: `yourdomain.com`
4. Follow DNS setup instructions

### 6.2 Update Environment Variables
Update these in both services:
```
# Backend
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Frontend  
VITE_API_URL=https://api.yourdomain.com/api
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend Won't Start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check build logs in Render dashboard

#### 2. Frontend Can't Connect to Backend
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Test backend health endpoint directly

#### 3. Database Connection Failed
- Verify MongoDB Atlas network access (0.0.0.0/0)
- Check username/password in connection string
- Ensure database user has proper permissions

#### 4. Environment Variables Not Working
- Ensure no spaces around `=` in environment variables
- Don't include quotes around values in Render
- Restart services after adding variables

### Debug Steps
1. Check Render service logs
2. Test API endpoints directly
3. Check browser console for errors
4. Verify environment variables in Render dashboard

## 💰 Render.com Free Tier Limits

- **750 hours/month** per service (enough for 24/7 operation)
- **500MB RAM** per service
- **1GB disk space** per service
- **100GB bandwidth/month**
- Services sleep after 15 minutes of inactivity
- **Cold start delay** (~30 seconds when waking up)

## 🔄 Auto-Deploy Setup

Your services will automatically redeploy when you push to GitHub:
1. Push changes to your `main` branch
2. Render automatically detects changes
3. Rebuilds and redeploys affected services
4. Zero-downtime deployments

## 📊 Monitoring

### Health Checks
- Backend: `https://finautojobs-backend.onrender.com/api/health`
- Frontend: `https://finautojobs-frontend.onrender.com`

### Render Dashboard
- View logs, metrics, and deployment history
- Monitor resource usage
- Set up notifications

## 🎉 Congratulations!

Your full MERN stack FinAutoJobs application is now deployed on Render.com!

**Your URLs:**
- 🌐 **Frontend**: `https://finautojobs-frontend.onrender.com`
- 🔧 **Backend**: `https://finautojobs-backend.onrender.com`
- 🔍 **API Health**: `https://finautojobs-backend.onrender.com/api/health`

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render service logs
3. Test individual components
4. Check MongoDB Atlas connection
5. Verify all environment variables are set correctly

The deployment is now complete and your application should be fully functional on Render.com!
