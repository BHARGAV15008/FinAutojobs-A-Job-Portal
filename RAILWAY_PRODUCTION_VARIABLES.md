# 🚂 Railway Production Environment Variables

## 🔑 **ACTUAL PRODUCTION VARIABLES FROM YOUR DEVELOPMENT ENV**

### **Add these EXACT values to Railway Dashboard → Variables:**

---

## **Essential Variables**

```env
NODE_ENV=production
PORT=8888
```

---

## **Database Configuration (MongoDB Atlas)**

```env
MONGODB_URI=mongodb+srv://technogenius1500_db_user:30SNKn8r6dIagg3E@cluster0.e8nknea.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://technogenius1500_db_user:30SNKn8r6dIagg3E@cluster0.e8nknea.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
```

---

## **Security Secrets**

```env
JWT_SECRET=31bf748d8d2c77a9fa390d0f1da642e3ba8d60fcf18245fef848828d4c24dff22681a2c6e0cd80a260722056a0dec1bd1c4da462d59f46f916029688cd568a62
JWT_EXPIRES_IN=24h
SESSION_SECRET=session_ee82eabfa45c6e84a7244465b0baa0c43db0f3a479079d96e04ea459f8965b78c6ceb8ad9a2675885ee0bba87831ea19738ffe891d5358b9ea5ed7bcde242e58
```

---

## **CORS & Frontend URLs (Updated for Railway)**

```env
FRONTEND_URL=https://web-production-44f5.up.railway.app
CORS_ORIGINS=https://web-production-44f5.up.railway.app
```

---

## **Email Configuration (Gmail)**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hiddenshadow032025@gmail.com
EMAIL_PASS=rxdn afad anzi obxx
EMAIL_FROM_NAME=FinAutoJobs
EMAIL_FROM_ADDRESS=hiddenshadow032025@gmail.com
```

---

## **Optional Configuration**

```env
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_ENABLED=true
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WEBSOCKET_ENABLED=true
```

---

## 🚀 **How to Add to Railway Dashboard**

### **Step 1: Go to Railway Dashboard**
1. Visit: https://railway.com/project/c3d6c87c-0c65-43c7-aee2-90117e23176b
2. Click on your **`web`** service
3. Go to **Variables** tab

### **Step 2: Add Variables**
For each variable above:
1. Click **"New Variable"**
2. **Name**: Copy the variable name (e.g., `NODE_ENV`)
3. **Value**: Copy the exact value (e.g., `production`)
4. Click **"Add"**

### **Step 3: Priority Order (Add these first)**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://technogenius1500_db_user:30SNKn8r6dIagg3E@cluster0.e8nknea.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=31bf748d8d2c77a9fa390d0f1da642e3ba8d60fcf18245fef848828d4c24dff22681a2c6e0cd80a260722056a0dec1bd1c4da462d59f46f916029688cd568a62
SESSION_SECRET=session_ee82eabfa45c6e84a7244465b0baa0c43db0f3a479079d96e04ea459f8965b78c6ceb8ad9a2675885ee0bba87831ea19738ffe891d5358b9ea5ed7bcde242e58
```

---

## 🎯 **Expected Success After Adding Variables**

```
✅ Database connected successfully to MongoDB Atlas
✅ Email service initialized (hiddenshadow032025@gmail.com)
✅ JWT authentication configured
✅ Session management configured
🚀 FinAutoJobs Backend Server running on port 8888
📡 Frontend served at: https://web-production-44f5.up.railway.app
📡 API available at: https://web-production-44f5.up.railway.app/api/*
```

---

## 🌐 **Your Live App URLs**

- **Frontend**: https://web-production-44f5.up.railway.app/
- **API Health**: https://web-production-44f5.up.railway.app/api/health
- **Dashboard**: https://web-production-44f5.up.railway.app/dashboard
- **Authentication**: https://web-production-44f5.up.railway.app/api/auth/login

---

## 📋 **MongoDB Atlas Details (Already Configured)**

- ✅ **Username**: technogenius1500_db_user
- ✅ **Password**: 30SNKn8r6dIagg3E
- ✅ **Cluster**: cluster0.e8nknea.mongodb.net
- ✅ **Database**: finautojobs
- ✅ **Connection**: Ready to use

---

## 🔐 **Security Notes**

- ✅ All secrets are production-ready
- ✅ MongoDB Atlas connection is configured
- ✅ Gmail SMTP is configured with app password
- ✅ JWT tokens are properly secured
- ✅ CORS is configured for Railway domain

---

**Next Step**: Add these variables to Railway dashboard and your full-stack app will be live! 🎉
