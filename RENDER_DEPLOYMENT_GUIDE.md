# Render Deployment Guide for FinAutoJobs

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services

### 3. Configure Environment Variables

#### Backend Service Environment Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=https://your-frontend-name.onrender.com
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

#### Frontend Service Environment Variables:
```
NODE_ENV=production
VITE_API_URL=https://your-backend-name.onrender.com
VITE_APP_NAME=FinAutoJobs
VITE_APP_URL=https://your-frontend-name.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Update OAuth Settings
After deployment, update your OAuth provider settings:
- Google: Add your Render URLs to authorized redirect URIs
- Firebase: Update authorized domains

## 💰 Cost
- Backend: $7/month (Starter plan)
- Frontend: $7/month (Starter plan)
- Total: $14/month

## 🔧 Troubleshooting
- **Build Fails**: Check Node.js version (20+)
- **Database Issues**: Verify MongoDB Atlas connection string
- **CORS Errors**: Update CORS_ORIGIN with frontend URL

## 📚 Additional Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com)

Your job portal will be live in 5-10 minutes! 🎉
