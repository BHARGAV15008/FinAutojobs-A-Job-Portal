# 🚀 FinAutoJobs Vercel Deployment Guide

This guide will help you deploy both the backend and frontend of your FinAutoJobs project to Vercel for free.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up a MongoDB database (free tier available)
4. **Gmail Account**: For email services (if using email features)

## 📋 Step-by-Step Deployment Process

### Phase 1: Prepare Your Project

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

### Phase 2: Deploy Backend

#### 1. Navigate to Backend Directory
```bash
cd backend
```

#### 2. Deploy Backend to Vercel
```bash
vercel --prod
```

#### 3. Set Environment Variables for Backend
After deployment, set these environment variables in Vercel Dashboard:

**Required Environment Variables:**
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/finautojobs
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h
SESSION_SECRET=your-super-secure-session-secret-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Optional Environment Variables (if using these features):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=your-email@gmail.com
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.vercel.app/api/auth/google/callback
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_ENABLED=true
```

### Phase 3: Deploy Frontend

#### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 2. Update API Base URL
Create or update your API configuration file to point to your deployed backend:

**File: `src/config/api.js`** (create if doesn't exist)
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.vercel.app/api'
  : 'http://localhost:5000/api';

export default API_BASE_URL;
```

#### 3. Deploy Frontend to Vercel
```bash
vercel --prod
```

#### 4. Set Environment Variables for Frontend
Set these in Vercel Dashboard for frontend:
```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
VITE_APP_NAME=FinAutoJobs
NODE_ENV=production
```

### Phase 4: Configure Database

#### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Vercel)
5. Get your connection string

#### 2. Update Environment Variables
Update the `MONGODB_URI` and `DATABASE_URL` in your backend Vercel settings with your actual MongoDB connection string.

## 🔧 Vercel Dashboard Configuration

### Setting Environment Variables in Vercel Dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with appropriate values
5. Redeploy your project after adding variables

### Backend Environment Variables:
```
NODE_ENV: production
MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/finautojobs
JWT_SECRET: your-jwt-secret-key
SESSION_SECRET: your-session-secret-key
FRONTEND_URL: https://your-frontend-domain.vercel.app
PORT: 3000
```

### Frontend Environment Variables:
```
VITE_API_BASE_URL: https://your-backend-domain.vercel.app/api
NODE_ENV: production
```

## 🚨 Important Notes

### 1. CORS Configuration
Make sure your backend CORS settings allow your frontend domain:

```javascript
// In your backend server.js or app.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
};
```

### 2. API Endpoints
Update all API calls in your frontend to use the environment variable:

```javascript
// Instead of hardcoded URLs
const response = await fetch('http://localhost:5000/api/jobs');

// Use environment variable
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`);
```

### 3. File Uploads
For file uploads (resumes, profile pictures), consider using:
- **Cloudinary** (free tier available)
- **AWS S3** (with Vercel integration)
- **Vercel Blob** (for simple file storage)

## 📱 Deployment Commands Summary

### Quick Deployment (after initial setup):

**Backend:**
```bash
cd backend
vercel --prod
```

**Frontend:**
```bash
cd frontend  
vercel --prod
```

### Alternative: GitHub Integration

1. Connect your GitHub repository to Vercel
2. Vercel will auto-deploy on every push to main branch
3. Set up separate projects for backend and frontend

## 🔍 Troubleshooting

### Common Issues:

1. **Build Errors**: Check your package.json scripts
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Errors**: Update CORS configuration in backend
4. **Database Connection**: Verify MongoDB URI and network access
5. **API Calls**: Update frontend API base URL

### Debugging Steps:

1. Check Vercel deployment logs
2. Test API endpoints directly
3. Verify environment variables are set
4. Check browser console for errors

## 🎉 Success Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully  
- [ ] Environment variables configured
- [ ] Database connected
- [ ] API calls working between frontend and backend
- [ ] Authentication working
- [ ] File uploads working (if implemented)
- [ ] Email services working (if implemented)

## 📞 Support

If you encounter issues:
1. Check Vercel documentation
2. Review deployment logs
3. Test locally first
4. Verify all environment variables

Your FinAutoJobs application should now be live on Vercel! 🚀
