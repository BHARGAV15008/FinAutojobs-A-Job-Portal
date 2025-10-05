# 🚀 Deploy Backend to Render (Free)

## Prerequisites
- GitHub repository with your backend code
- MongoDB Atlas account (free)

## Step 1: Prepare Backend for Render

### 1.1 Create Render Configuration
```yaml
# render.yaml (in root directory)
services:
  - type: web
    name: finautojobs-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 1.2 Update package.json
Ensure your start script is production-ready:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Step 2: Set Up MongoDB Atlas

### 2.1 Create Free Cluster
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Sandbox - FREE)
4. Choose region closest to your users
5. Create database user
6. Whitelist IP addresses (0.0.0.0/0 for development)

### 2.2 Get Connection String
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/finautojobs?retryWrites=true&w=majority
```

## Step 3: Deploy to Render

### 3.1 Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select backend folder if using monorepo

### 3.2 Configure Environment Variables
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/finautojobs
JWT_SECRET=your-super-strong-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-super-strong-refresh-secret-min-32-characters
SESSION_SECRET=your-super-strong-session-secret-min-32-characters
FRONTEND_URL=https://your-frontend-domain.netlify.app
CORS_ORIGINS=https://your-frontend-domain.netlify.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FinAutoJobs" <noreply@finautojobs.com>
```

### 3.3 Deploy Settings
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18.x
- **Plan:** Free

## Step 4: Test Deployment

### 4.1 Health Check
Your backend will be available at:
```
https://your-app-name.onrender.com/api/health
```

### 4.2 Test API Endpoints
```bash
curl https://your-app-name.onrender.com/api/health
```

## 🔧 Troubleshooting

### Common Issues:
1. **Build Fails:** Check Node.js version compatibility
2. **Database Connection:** Verify MongoDB Atlas IP whitelist
3. **CORS Errors:** Update CORS_ORIGINS with frontend URL
4. **Environment Variables:** Ensure all required vars are set

### Render Free Tier Limitations:
- ⏰ Sleeps after 15 minutes of inactivity
- 🔄 Cold start delay (10-30 seconds)
- 💾 512MB RAM
- 🌐 750 hours/month (enough for 24/7 if only one service)

## 📈 Monitoring

### Render Dashboard Features:
- ✅ Real-time logs
- ✅ Metrics and analytics
- ✅ Auto-deploy on Git push
- ✅ Custom domains (paid plans)

Your backend URL will be:
```
https://finautojobs-backend.onrender.com
```