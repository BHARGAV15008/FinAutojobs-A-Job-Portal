# 🚂 Railway Deployment Guide for FinAutoJobs

## ✅ Project Analysis Complete

Your project has been successfully configured for Railway deployment! Here's what was done:

### 🔧 Changes Made

1. **Removed Vercel Configurations** ❌
   - Deleted `backend/vercel.json`
   - Deleted `frontend/vercel.json`
   - Deleted `deploy-to-vercel.sh`
   - Removed Vercel documentation files

2. **Added Railway Configurations** ✅
   - Created `railway.json` - Railway project configuration
   - Created `nixpacks.toml` - Build configuration
   - Created `Procfile` - Process definition
   - Updated `package.json` scripts for Railway

3. **Enhanced Backend for Full-Stack Deployment** ✅
   - Added static file serving for React build
   - Configured React Router support
   - Added production/development mode handling

## 🚀 How to Deploy on Railway

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Configure for Railway deployment"
git push origin main  # or your default branch
```

### Step 2: Deploy on Railway

1. **Visit Railway**: Go to [railway.app](https://railway.app)

2. **Sign Up/Login**: Use GitHub, Google, or email

3. **Create New Project**: 
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `FinAutojobs-A-Job-Portal` repository

4. **Configure Environment Variables**:
   Click on your project → Variables → Add the following:

   ```env
   NODE_ENV=production
   PORT=3000
   
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Email Service
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # SMS Service (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   
   # Security
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=https://your-app-name.railway.app
   ```

5. **Deploy**: Railway will automatically build and deploy your app!

### Step 3: Set Up MongoDB Database

**Option A: Railway MongoDB (Recommended)**
1. In your Railway project, click "New Service"
2. Select "Database" → "MongoDB"
3. Copy the connection string to `MONGODB_URI`

**Option B: MongoDB Atlas (Free)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get connection string and add to `MONGODB_URI`

### Step 4: Configure Domain (Optional)

1. In Railway project settings
2. Go to "Domains"
3. Add custom domain or use provided Railway domain

## 📁 Project Structure (Railway Optimized)

```
FinAutojobs-A-Job-Portal/
├── railway.json          # Railway configuration
├── nixpacks.toml         # Build configuration  
├── Procfile             # Process definition
├── backend/             # Node.js API server
│   ├── server.js        # Main server (serves frontend in production)
│   ├── package.json     # Backend dependencies
│   └── ...
├── frontend/            # React application
│   ├── dist/           # Built files (created during deployment)
│   ├── package.json    # Frontend dependencies
│   └── ...
└── README.md
```

## 🔧 Configuration Files Explained

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x']

[phases.install]
cmds = [
  'cd backend && npm ci',
  'cd frontend && npm ci'
]

[phases.build]
cmds = [
  'cd frontend && npm run build'
]

[start]
cmd = 'cd backend && npm start'
```

### `Procfile`
```
web: cd backend && npm start
```

## 🌐 How It Works

1. **Build Process**:
   - Railway installs backend dependencies
   - Railway installs frontend dependencies
   - Railway builds React app (`frontend/dist/`)
   - Railway starts the backend server

2. **Runtime**:
   - Backend serves API routes (`/api/*`)
   - Backend serves React static files for all other routes
   - Single domain serves both frontend and backend

3. **Routing**:
   - `https://your-app.railway.app/api/*` → Backend API
   - `https://your-app.railway.app/*` → React Frontend

## 🔍 Environment Variables Required

### Essential Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### Email Service (for notifications)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SMS Service (for OTP)
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🚨 Troubleshooting

### Build Fails
- Check if all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check Railway build logs

### App Doesn't Start
- Verify `PORT` environment variable
- Check MongoDB connection string
- Review Railway deployment logs

### Frontend Not Loading
- Ensure `frontend/dist/` exists after build
- Check static file serving in `server.js`
- Verify React Router configuration

### API Errors
- Check environment variables are set
- Verify MongoDB connection
- Review backend logs in Railway dashboard

## 💰 Railway Pricing

- **Free Tier**: $5/month credit (enough for small apps)
- **Pro Plan**: $20/month for production apps
- **Usage-based**: Pay only for what you use

## 🎉 Benefits of Railway

✅ **Full-Stack Deployment**: Frontend + Backend in one place
✅ **Automatic HTTPS**: SSL certificates included
✅ **Environment Variables**: Secure configuration management
✅ **Database Integration**: Easy MongoDB setup
✅ **Git Integration**: Auto-deploy on push
✅ **Logs & Monitoring**: Built-in observability
✅ **Custom Domains**: Professional URLs
✅ **Scaling**: Automatic scaling based on traffic

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Railway Dashboard](https://railway.app/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Twilio Console](https://console.twilio.com)

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Review this guide
3. Check Railway community forums
4. Contact Railway support

---

**Your FinAutoJobs app is now ready for Railway deployment! 🚀**

The configuration is optimized for Railway's free tier and will automatically scale as your app grows.
