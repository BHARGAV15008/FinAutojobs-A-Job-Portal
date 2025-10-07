# FinAutoJobs - Deployment Environment Variables Setup

## 🚀 Quick Deployment Guide

### Step 1: Deploy to Vercel

1. **Connect to Vercel:**
   ```bash
   # Install Vercel CLI (if not installed)
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy (first time)
   vercel
   
   # Deploy to production
   vercel --prod
   ```

2. **Or use GitHub Integration:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

### Step 2: Configure Environment Variables in Vercel Dashboard

Go to **Vercel Dashboard > Your Project > Settings > Environment Variables** and add these:

#### 🔐 **REQUIRED VARIABLES** (Copy these exactly):

```bash
# Database (MongoDB Atlas - Ready to use)
MONGODB_URI=mongodb+srv://technogenius1500_db_user:30SNKn8r6dIagg3E@cluster0.e8nknea.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0

# Security
NODE_ENV=production
JWT_SECRET=31bf748d8d2c77a9fa390d0f1da642e3ba8d60fcf18245fef848828d4c24dff22681a2c6e0cd80a260722056a0dec1bd1c4da462d59f46f916029688cd568a62
SESSION_SECRET=session_ee82eabfa45c6e84a7244465b0baa0c43db0f3a479079d96e04ea459f8965b78c6ceb8ad9a2675885ee0bba87831ea19738ffe891d5358b9ea5ed7bcde242e58

# Email (Gmail SMTP - Ready to use)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hiddenshadow032025@gmail.com
EMAIL_PASS=rxdn afad anzi obxx
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=hiddenshadow032025@gmail.com

# Frontend URL (Update after deployment)
FRONTEND_URL=https://your-app-name.vercel.app
CORS_ORIGINS=https://your-app-name.vercel.app
```

#### 🔧 **OPTIONAL VARIABLES** (Add if needed):

```bash
# OAuth (Google/Microsoft login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMS/Phone Auth (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Firebase (Phone authentication)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-email

# Additional Settings
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_ENABLED=true
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Update Frontend Environment Variables

In Vercel Dashboard, also add these **Frontend Variables**:

```bash
# Frontend Configuration
VITE_API_BASE_URL=/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0
VITE_ENABLE_OAUTH=true
VITE_ENABLE_PHONE_AUTH=true
VITE_ENABLE_SMS_OTP=true

# Firebase (Frontend - if using)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Step 4: Post-Deployment Updates

After your first deployment:

1. **Update URLs in Vercel Dashboard:**
   - Replace `FRONTEND_URL` with your actual Vercel URL
   - Replace `CORS_ORIGINS` with your actual Vercel URL

2. **Test Your Deployment:**
   ```bash
   # Test API health
   curl https://your-app-name.vercel.app/api/health
   
   # Test frontend
   curl https://your-app-name.vercel.app
   ```

### Step 5: Enable OAuth (Optional)

If you want Google/Microsoft login:

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add redirect URL: `https://your-app-name.vercel.app/api/auth/google/callback`

2. **Microsoft OAuth:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Register your app
   - Add redirect URL: `https://your-app-name.vercel.app/api/auth/microsoft/callback`

## 🎯 **Ready-to-Deploy Checklist**

- ✅ Vercel configuration updated (`vercel.json`)
- ✅ Package.json scripts optimized
- ✅ MongoDB Atlas database ready
- ✅ Email service configured
- ✅ Environment variables template ready
- ✅ Frontend build configuration set
- ✅ Backend API entry point configured

## 🚨 **Troubleshooting**

### Common Issues:

1. **Build Fails:**
   ```bash
   # Check Node version
   node --version  # Should be 20+
   
   # Clean and rebuild
   npm run clean
   npm run build
   ```

2. **Database Connection:**
   - Verify MongoDB Atlas allows all IPs (0.0.0.0/0)
   - Check connection string format
   - Test connection locally first

3. **API Routes Not Working:**
   - Check Vercel function logs
   - Verify environment variables are set
   - Test API endpoints individually

### Debug Commands:

```bash
# Local testing
npm run test:build

# Deploy preview (staging)
npm run deploy:preview

# Deploy production
npm run deploy:vercel
```

## 🎉 **Success!**

Your app will be available at: `https://your-app-name.vercel.app`

Features included:
- ✅ Full-stack MERN deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless backend
- ✅ Static frontend hosting
- ✅ Database integration
- ✅ Email service
- ✅ File uploads
- ✅ Authentication system
