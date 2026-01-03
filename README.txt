FinAutojobs - Job Portal Application
=====================================

DEPLOYMENT INSTRUCTIONS FOR HOSTINGER
======================================

1. UPLOAD FILES:
   - Upload the entire project folder to your Hostinger hosting
   - Make sure .env files are configured properly

2. BACKEND SETUP:
   - Navigate to /backend folder
   - Run: npm install
   - Configure environment variables in backend/.env:
     * MONGODB_URI (your MongoDB connection string)
     * JWT_SECRET (secret key for authentication)
     * PORT (default: 5000)
     * EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (for email notifications)
   - Start server: npm start or node server.js

3. FRONTEND SETUP:
   - Navigate to /frontend folder
   - Run: npm install
   - Run: npm run build
   - Configure backend API URL in frontend/.env
   - Deploy the /frontend/dist folder to your web hosting

4. REQUIRED ENVIRONMENT VARIABLES:

   Backend (.env):
   - MONGODB_URI=your_mongodb_connection_string
   - JWT_SECRET=your_jwt_secret
   - PORT=5000
   - NODE_ENV=production
   - EMAIL_HOST=smtp.gmail.com
   - EMAIL_PORT=587
   - EMAIL_USER=your_email@gmail.com
   - EMAIL_PASS=your_app_password
   - AWS_ACCESS_KEY_ID (if using S3)
   - AWS_SECRET_ACCESS_KEY (if using S3)
   - AWS_REGION (if using S3)
   - AWS_S3_BUCKET_NAME (if using S3)

   Frontend (.env):
   - VITE_API_URL=https://your-backend-url.com

5. DATABASE:
   - MongoDB Atlas recommended (free tier available)
   - Create database and user with read/write access
   - Whitelist your Hostinger IP address

6. FILE STRUCTURE:
   /backend     - Express.js API server
   /frontend    - React + Vite application
   /uploads     - File upload directory (resumes, documents)

7. IMPORTANT NOTES:
   - Ensure Node.js 18+ is installed on server
   - Set correct file permissions for /uploads folder (755)
   - Configure CORS settings in backend if domains differ
   - Use PM2 or similar for backend process management
   - Enable HTTPS for production

8. POST-DEPLOYMENT:
   - Test all API endpoints
   - Verify email notifications work
   - Test file upload functionality
   - Check user registration and login
   - Verify job posting and application workflows

For support, check the Firebase service account file in backend/

Project cleaned and ready for deployment!
Size: ~96MB (without node_modules)
