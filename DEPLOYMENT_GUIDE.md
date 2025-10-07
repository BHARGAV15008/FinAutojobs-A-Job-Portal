# FinAutoJobs - Complete Deployment Guide for Vercel

## 🚀 Free Full-Stack Deployment on Vercel

This guide will help you deploy your complete MERN stack application (frontend + backend) for FREE on Vercel with zero configuration needed after setup.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **MongoDB Atlas Account** - For production database (free tier available)
4. **Email Service** - Gmail SMTP or similar
5. **Domain Name** (Optional) - For custom domain

## 🛠️ Step-by-Step Deployment Process

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Set Up MongoDB Atlas (Free Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (choose the free tier)
4. Create a database user
5. Whitelist all IP addresses (0.0.0.0/0) for Vercel
6. Get your connection string

### Step 3: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - Framework Preset: **Other**
   - Root Directory: **./** (root)
   - Build Command: **npm run vercel-build**
   - Output Directory: **frontend/dist**
   - Install Command: **npm install**

### Step 4: Configure Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

#### Required Environment Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs?retryWrites=true&w=majority

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=FinAutoJobs

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Firebase (Optional - for phone auth)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-email
```

#### Frontend Environment Variables:

```bash
# API Configuration
VITE_API_BASE_URL=/api

# App Info
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_OAUTH=true
VITE_ENABLE_PHONE_AUTH=true
VITE_ENABLE_SMS_OTP=true

# Firebase (if using)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Step 5: Deploy and Test

1. **Click "Deploy"** in Vercel
2. **Wait for deployment to complete** (5-10 minutes)
3. **Test your application:**
   - Visit the provided Vercel URL
   - Test registration/login
   - Test job posting
   - Test file uploads

## 🔧 Post-Deployment Configuration

### 1. Update OAuth Redirect URLs

If using OAuth providers, update their redirect URLs:
- **Google OAuth**: Add `https://your-app.vercel.app/api/oauth/google/callback`
- **Microsoft OAuth**: Add `https://your-app.vercel.app/api/oauth/microsoft/callback`

### 2. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

### 3. Set Up Monitoring (Optional)

- **Vercel Analytics**: Free analytics included
- **Error Tracking**: Consider Sentry for error monitoring
- **Uptime Monitoring**: Use UptimeRobot (free tier)

## 📁 Project Structure After Deployment

```
your-app.vercel.app/
├── /api/*          # Backend API routes
├── /uploads/*      # File uploads
├── /               # Frontend React app
└── /static/*       # Static assets
```

## 🔒 Security Checklist

- ✅ Environment variables properly configured
- ✅ Database connection secured
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Helmet security headers enabled
- ✅ Input validation implemented
- ✅ File upload restrictions in place

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version (requires 20+)
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist includes 0.0.0.0/0
   - Ensure database user has proper permissions

3. **API Routes Not Working**:
   - Check vercel.json configuration
   - Verify route patterns match your API structure
   - Check function timeout settings

4. **Frontend Not Loading**:
   - Check if frontend build completed successfully
   - Verify static file serving configuration
   - Check browser console for errors

### Debug Commands:

```bash
# Test API locally
curl https://your-app.vercel.app/api/health

# Check deployment logs
vercel logs --follow

# Test specific endpoint
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 Performance Optimization

1. **Enable Vercel Analytics** (free)
2. **Use Vercel Edge Functions** for faster response times
3. **Optimize images** with Vercel's Image Optimization
4. **Enable caching** for static assets
5. **Use CDN** (automatically provided by Vercel)

## 💰 Cost Breakdown (Free Tier Limits)

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **MongoDB Atlas**: 512MB storage, shared clusters
- **Email**: Gmail SMTP (free with Gmail account)
- **Domain**: Optional, can use Vercel subdomain

## 🔄 Continuous Deployment

Once set up, your app will automatically redeploy when you:
1. Push changes to your main branch
2. Update environment variables
3. Trigger manual deployments

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Test API endpoints individually
4. Check browser console for frontend errors

## 🎉 Success!

Your full-stack MERN application is now deployed for FREE on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Built-in analytics
- ✅ Serverless backend
- ✅ Static frontend hosting

**Your app URL**: `https://your-app-name.vercel.app`

---

*This deployment setup provides a production-ready, scalable solution for your job portal application with zero ongoing costs on the free tier.*
