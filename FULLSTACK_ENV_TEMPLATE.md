# Full-Stack MERN Deployment - Environment Variables

## 🚀 Single Service Configuration

Copy these environment variables to your Render service dashboard:

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0

# Security Configuration
JWT_SECRET=YOUR_SECURE_JWT_SECRET
SESSION_SECRET=YOUR_SECURE_SESSION_SECRET

# CORS Configuration (same domain for full-stack)
CORS_ORIGIN=https://finautojobs-fullstack.onrender.com

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL@gmail.com
EMAIL_PASS=YOUR_APP_PASSWORD
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=YOUR_EMAIL@gmail.com

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_ENABLED=true

# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://finautojobs-fullstack.onrender.com/api/auth/google/callback

# Firebase Configuration (Backend)
FIREBASE_PROJECT_ID=fineautojobs-429be
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Frontend URL (for backend reference)
FRONTEND_URL=https://finautojobs-fullstack.onrender.com
```

## 🔧 Build-Time Variables (Automatically Set)

These are set during the build process in render.yaml:

```bash
# Frontend API Configuration (set during build)
VITE_API_URL=/api
VITE_APP_URL=https://finautojobs-fullstack.onrender.com

# Firebase Configuration (Frontend - set during build)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=fineautojobs-429be.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fineautojobs-429be
VITE_FIREBASE_STORAGE_BUCKET=fineautojobs-429be.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

## 📋 Deployment Checklist

### 1. Set Environment Variables in Render
- Copy all variables from "Required Environment Variables" section
- Replace `YOUR_*` placeholders with actual values from `credentials-reference.local`

### 2. Update OAuth Settings
After deployment, update these settings:

**Google OAuth Console:**
- Add authorized redirect URI: `https://finautojobs-fullstack.onrender.com/api/auth/google/callback`

**Firebase Console:**
- Add authorized domain: `finautojobs-fullstack.onrender.com`

### 3. Verify Deployment
- Frontend: `https://finautojobs-fullstack.onrender.com`
- Backend API: `https://finautojobs-fullstack.onrender.com/api/health`
- Database: Check MongoDB Atlas connection logs

## 💰 Cost Savings

**Before (Separate Services):**
- Backend Service: $7/month
- Frontend Service: $7/month
- **Total: $14/month**

**After (Single Service):**
- Full-Stack Service: $7/month
- **Total: $7/month**
- **Savings: 50%** 🎉

## 🛡️ Security Benefits

1. **No CORS Issues**: Frontend and backend on same domain
2. **Simplified Authentication**: No cross-origin token issues
3. **Single SSL Certificate**: One domain to secure
4. **Reduced Attack Surface**: Fewer endpoints to protect

## 🚀 Performance Benefits

1. **Faster Loading**: No cross-service network delays
2. **Simplified Routing**: Direct API calls without proxy
3. **Better Caching**: Static assets and API on same domain
4. **Reduced Latency**: Eliminates inter-service communication

Your full-stack MERN application will be deployed as a single, efficient service! 🎯
