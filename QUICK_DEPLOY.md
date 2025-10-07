# 🚀 Quick Deploy to Vercel - FinAutoJobs

## One-Click Deployment Setup

### Option 1: Automatic Deploy (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Click "Deploy" (uses existing configuration)

### Option 2: Command Line Deploy

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Run deployment script
./deploy.sh

# Or manual deployment
vercel --prod
```

## ⚡ Quick Environment Setup

### Required Environment Variables (Add in Vercel Dashboard):

```bash
# Database (Replace with your MongoDB Atlas URI)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs

# Security (Generate strong secrets)
SESSION_SECRET=your-super-secret-session-key-32-chars-min
JWT_SECRET=your-super-secret-jwt-key-32-chars-min

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Frontend
VITE_API_BASE_URL=/api
VITE_APP_NAME=FinAutoJobs
```

### Optional Environment Variables:

```bash
# OAuth (for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMS (for OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Firebase (for phone auth)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key\n-----END PRIVATE KEY-----\n"
```

## 🎯 Post-Deployment Checklist

- [ ] Test registration/login
- [ ] Test job posting
- [ ] Test file uploads
- [ ] Update OAuth redirect URLs
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring

## 🔗 Your App Will Be Available At:

`https://your-app-name.vercel.app`

---

**Total Setup Time: ~10 minutes**  
**Cost: $0 (Free tier)**  
**SSL: Automatic**  
**CDN: Global**
