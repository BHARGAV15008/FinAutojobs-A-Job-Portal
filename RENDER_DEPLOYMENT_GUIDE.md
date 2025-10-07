# Render Deployment Guide for FinAutoJobs - Full-Stack MERN

## 🚀 Single Service Deployment (Cost-Effective)

This configuration deploys your entire MERN stack as **one service** instead of separate frontend/backend services.

**Benefits:**
- 💰 **Cost**: Only $7/month (instead of $14/month for two services)
- 🔧 **Simpler**: Single service to manage
- 🚀 **Faster**: No cross-service communication delays
- 🛡️ **Secure**: No CORS issues between services

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for full-stack Render deployment"
git push origin beta
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository (select `beta` branch)
4. Render will detect `render.yaml` and create **one full-stack service**

### 3. Configure Environment Variables

#### Full-Stack Service Environment Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=https://finautojobs-fullstack.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 4. Update OAuth Settings
After deployment, update your OAuth provider settings:
- **Google OAuth**: Add `https://finautojobs-fullstack.onrender.com/api/auth/google/callback` to authorized redirect URIs
- **Firebase**: Add `finautojobs-fullstack.onrender.com` to authorized domains

## 💰 Cost
- **Full-Stack Service**: $7/month (Starter plan)
- **Total**: $7/month (50% savings!)

## 🔧 Troubleshooting
- **Build Fails**: Check Node.js version (20+)
- **Database Issues**: Verify MongoDB Atlas connection string
- **CORS Errors**: Update CORS_ORIGIN with frontend URL

## 📚 Additional Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com)

Your job portal will be live in 5-10 minutes! 🎉
