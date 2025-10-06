# 🚀 Quick Vercel Setup for FinAutoJobs

## Your MongoDB Configuration ✅
**Database URL**: `mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0`

## 📋 Environment Variables for Vercel Dashboard

### Backend Environment Variables:
Copy these **exact values** to your Vercel Backend project:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=finautojobs-super-secure-jwt-secret-2024-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=finautojobs-super-secure-session-secret-2024-production
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hiddenshadow032025@gmail.com
EMAIL_PASS=rxdn afad anzi obxx
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=hiddenshadow032025@gmail.com
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_ENABLED=true
```

### Frontend Environment Variables:
Copy these to your Vercel Frontend project:

```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
NODE_ENV=production
VITE_APP_NAME=FinAutoJobs
```

## ⚡ Quick Deployment Steps:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Backend First
```bash
cd backend
vercel --prod
```
**Note the backend URL** (e.g., `https://finautojobs-backend-xyz.vercel.app`)

### 4. Deploy Frontend
```bash
cd ../frontend
vercel --prod
```
**Note the frontend URL** (e.g., `https://finautojobs-frontend-abc.vercel.app`)

### 5. Update Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Backend Project** → Settings → Environment Variables:
   - Add all backend variables above
   - **Update `FRONTEND_URL`** with your actual frontend URL
3. **Frontend Project** → Settings → Environment Variables:
   - Add all frontend variables above
   - **Update `VITE_API_BASE_URL`** with your actual backend URL

### 6. Redeploy Both Projects
```bash
# Redeploy backend with new environment variables
cd backend
vercel --prod

# Redeploy frontend with new environment variables
cd ../frontend
vercel --prod
```

## 🎯 Your Database is Ready!

Your MongoDB Atlas database is already configured and ready to use:
- ✅ **Cluster**: cluster0.nvq1gwn.mongodb.net
- ✅ **Database**: finautojobs
- ✅ **User**: hiddenshadow032025_db_user
- ✅ **Connection**: Configured for cloud access

## 🔧 Post-Deployment Checklist:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables set in both projects
- [ ] Database connection working
- [ ] Frontend can communicate with backend
- [ ] Authentication working
- [ ] Email services working (using your Gmail configuration)

## 🚨 Important URLs to Update:

After deployment, you'll need to update these in your Vercel environment variables:

1. **FRONTEND_URL** in backend environment variables
2. **VITE_API_BASE_URL** in frontend environment variables

## 🎉 You're Ready to Deploy!

Run the automated script or follow the manual steps above:
```bash
./deploy-to-vercel.sh
```

Your FinAutoJobs application will be live on Vercel with your MongoDB database! 🚀
