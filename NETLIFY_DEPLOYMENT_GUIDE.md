# 🚀 FinAutoJobs - Netlify Deployment Guide

This guide will help you deploy your FinAutoJobs application to Netlify with full backend functionality using Netlify Functions.

## 📋 Prerequisites

- [x] Node.js 18+ installed
- [x] Netlify CLI installed (`npm install -g netlify-cli`)
- [x] MongoDB Atlas account (for production database)
- [x] Git repository (GitHub recommended)

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

### 1.2 Create a New Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select AWS as cloud provider
4. Choose a region closest to your users
5. Name your cluster: `finautojobs-cluster`
6. Click "Create Cluster"

### 1.3 Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `finautojobs_user`
5. Generate a strong password (save this!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Add `/finautojobs` at the end

**Example:**
```
mongodb+srv://finautojobs_user:YourPassword123@finautojobs-cluster.xxxxx.mongodb.net/finautojobs
```

## 🔐 Step 2: Environment Variables Setup

### 2.1 Use Generated Secrets
Your secure secrets have been generated and saved in `netlify-env-template.txt`:

```env
JWT_SECRET=31bf748d8d2c77a9fa390d0f1da642e3ba8d60fcf18245fef848828d4c24dff22681a2c6e0cd80a260722056a0dec1bd1c4da462d59f46f916029688cd568a62
SESSION_SECRET=session_ee82eabfa45c6e84a7244465b0baa0c43db0f3a479079d96e04ea459f8965b78c6ceb8ad9a2675885ee0bba87831ea19738ffe891d5358b9ea5ed7bcde242e58
```

### 2.2 Frontend Environment
Copy `frontend/env.production` to `frontend/.env.production`:

```bash
cp frontend/env.production frontend/.env.production
```

## 🚀 Step 3: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. **Login to Netlify:**
   ```bash
   netlify login
   ```

2. **Deploy from project root:**
   ```bash
   cd "/run/media/technog/Data & Files/Projects/prf/FinAutojobs-A-Job-Portal"
   netlify deploy --prod
   ```

3. **Follow the prompts:**
   - Choose "Create & configure a new site"
   - Select your team
   - Enter site name (e.g., `finautojobs-portal`)

### Option B: Deploy via GitHub Integration

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your GitHub repository
   - Netlify will auto-detect your `netlify.toml` settings

## ⚙️ Step 4: Configure Environment Variables in Netlify

1. **Go to your Netlify site dashboard**
2. **Navigate to:** Site settings → Environment variables
3. **Add each variable from `netlify-env-template.txt`:**

### Critical Variables (MUST SET):
```env
MONGODB_URI=mongodb+srv://technogenius1500_db_user:30SNKn8r6dIagg3E@cluster0.mongodb.net/finautojobs
JWT_SECRET=31bf748d8d2c77a9fa390d0f1da642e3ba8d60fcf18245fef848828d4c24dff22681a2c6e0cd80a260722056a0dec1bd1c4da462d59f46f916029688cd568a62
SESSION_SECRET=session_ee82eabfa45c6e84a7244465b0baa0c43db0f3a479079d96e04ea459f8965b78c6ceb8ad9a2675885ee0bba87831ea19738ffe891d5358b9ea5ed7bcde242e58
NODE_ENV=production
FRONTEND_URL=https://finautojobs.netlify.app
CORS_ORIGINS=https://finautojobs.netlify.app
```

### Email Configuration (Already Set):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hiddenshadow032025@gmail.com
EMAIL_PASS=rxdn afad anzi obxx
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=hiddenshadow032025@gmail.com
```

## 🧪 Step 5: Test Your Deployment

### 5.1 Health Check
Visit: `https://finautojobs.netlify.app/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "FinAutoJobs API is running on Netlify",
  "timestamp": "2024-10-05T01:19:52.000Z",
  "environment": "production"
}
```

### 5.2 Frontend Test
Visit: `https://finautojobs.netlify.app`

**Should show:**
- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ No console errors

### 5.3 API Integration Test
1. Try registering a new user
2. Try logging in
3. Check browser console for API errors
4. Test job posting/browsing functionality

## 🔧 Troubleshooting

### Issue: Functions not working
**Solution:**
```bash
netlify deploy --prod --functions netlify/functions
```

### Issue: Database connection failed
**Solutions:**
- Verify MongoDB Atlas connection string
- Check Network Access settings (allow 0.0.0.0/0)
- Ensure database user has correct permissions
- Check environment variable spelling

### Issue: CORS errors
**Solution:**
- Update `FRONTEND_URL` and `CORS_ORIGINS` in Netlify environment variables
- Use your actual Netlify domain

### Issue: Build fails
**Solutions:**
- Check Node.js version (should be 20)
- Clear cache: `npm run clean && npm install`
- Check for missing dependencies

## 📊 Post-Deployment Checklist

### ✅ Functionality Test:
- [ ] User registration/login
- [ ] Job posting/browsing
- [ ] Application system
- [ ] Dashboard functionality
- [ ] File uploads
- [ ] Email notifications

### ✅ Security Checklist:
- [ ] JWT secrets are secure (32+ characters)
- [ ] CORS origins set to your domain
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Environment variables properly set

### ✅ Performance:
- [ ] Site loads quickly
- [ ] API responses are fast
- [ ] No console errors
- [ ] Mobile responsive

## 🎯 Quick Commands Reference

```bash
# Build locally
npm run build:production

# Deploy to Netlify
netlify deploy --prod

# Check deployment status
netlify open

# View function logs
netlify functions:log

# Test functions locally
netlify dev
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check Netlify function logs for errors
4. Ensure MongoDB Atlas is properly configured

## 🎉 Success!

Your FinAutoJobs application is now live on Netlify with:
- ✅ Full-stack functionality
- ✅ Serverless backend via Netlify Functions
- ✅ MongoDB Atlas database
- ✅ Email notifications
- ✅ Secure authentication
- ✅ Production-ready configuration

**Your app is available at:** `https://finautojobs.netlify.app`
