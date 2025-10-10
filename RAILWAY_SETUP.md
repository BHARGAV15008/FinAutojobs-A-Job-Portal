# 🚀 Railway.app Deployment Guide

## Why Railway.app?
- ✅ **Traditional Server**: Runs your Express.js server continuously (not serverless)
- ✅ **Free Domain**: `finautojobs-backend.railway.app` & `finautojobs-frontend.railway.app`
- ✅ **$5 Monthly Credit**: Usually covers small to medium apps completely
- ✅ **No SMTP Issues**: Gmail SMTP works perfectly
- ✅ **Easy Migration**: Connect GitHub repo and deploy in 2 minutes
- ✅ **Environment Variables**: Easy to configure
- ✅ **Logs & Monitoring**: Built-in debugging tools

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Connect your repository

### Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select: `FinAutojobs-A-Job-Portal`
3. Railway will show detected services
4. **Select "backend"** from the detected services
5. Railway deploys using the railway.json configuration

### Step 3: Configure Backend Service
1. Go to your backend service settings
2. In "Settings" → "Environment", add variables (see below)
3. In "Settings" → "Networking", note your domain
4. Backend will be available at: `https://your-service.railway.app`

### Step 4: Deploy Frontend (Option 1 - Same Project)
1. Click "+ New Service" in the same project
2. Select "GitHub Repo" → Choose same repository
3. Railway detects frontend package.json
4. Frontend deploys automatically

### Step 4: Deploy Frontend (Option 2 - Separate Project)
1. Create a new Railway project
2. Deploy from same GitHub repo
3. Select frontend service
4. Update VITE_API_URL to point to backend domain

### Step 4: Environment Variables
Add these to your Railway backend service:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs

# Security
JWT_SECRET=8f69bcf03020571977a802457bd0ff26edce2f7cd0e7519a80c3342f379d2c59
SESSION_SECRET=d32bb7935507c520472afab198fccdc4e6f9ee12fb25203d9ec953c81d811363

# Email (Resend)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_XxB7mdQ7_LFqRbZBnKAaL8tdeZH5zdX8h
EMAIL_FROM_ADDRESS=onboarding@resend.dev
EMAIL_FROM_NAME=FinAutoJobs

# OAuth
GOOGLE_CLIENT_ID=1091917701977-u8brihbd5v4rtn51b0ihn1k6q39d20d4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_RESEND_COOLDOWN_MINUTES=2
```

### Step 5: Update Frontend API URL
Update your frontend to use Railway backend URL:
```env
VITE_API_URL=https://finautojobs-backend.railway.app/api
```

## 🎯 Expected Results
- **Backend**: `https://finautojobs-backend.railway.app`
- **Frontend**: `https://finautojobs-frontend.railway.app`
- **Real Email Delivery**: ✅ Works perfectly
- **Traditional Server**: ✅ No serverless limitations
- **Free Domain**: ✅ Professional URLs
- **Cost**: $0-5/month (usually free with credits)

## 🔧 Migration Benefits
- **No Code Changes**: Your existing code works as-is
- **Better Performance**: Dedicated server instances
- **No SMTP Issues**: Email delivery works immediately
- **Easy Scaling**: Upgrade when needed
- **Professional URLs**: Better than localhost or IP addresses

## 🚀 Ready to Deploy?
1. Sign up at railway.app
2. Connect GitHub
3. Deploy both frontend and backend
4. Add environment variables
5. Test your application

**Your app will be live in 5 minutes!** 🎉
