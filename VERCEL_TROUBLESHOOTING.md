# 🔧 Vercel Deployment Troubleshooting Guide

## 🚨 **Error: 500 INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED**

This error indicates your serverless function crashed. Here's how to fix it:

### ✅ **Step 1: Fixed Backend Configuration**

I've updated your backend configuration to work with Vercel's serverless environment:

1. **Updated `vercel.json`** - Now points to `api/index.js` (Vercel standard)
2. **Created `api/index.js`** - Vercel-optimized entry point
3. **Updated `package.json`** - Main entry point changed

### 🔍 **Step 2: Check Environment Variables**

Ensure these are set in your Vercel Dashboard:

**Required Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=finautojobs-super-secure-jwt-secret-2024-production
SESSION_SECRET=finautojobs-super-secure-session-secret-2024-production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 🚀 **Step 3: Redeploy with Fixes**

```bash
cd backend
vercel --prod
```

### 📋 **Step 4: Common Issues & Solutions**

#### **Issue 1: Database Connection Timeout**
**Symptoms:** Function times out, MongoDB connection fails
**Solution:**
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Ensure database user has proper permissions

#### **Issue 2: Missing Dependencies**
**Symptoms:** Module not found errors
**Solution:**
- All dependencies are in `package.json`
- Vercel automatically installs them
- Check for ES module compatibility

#### **Issue 3: Environment Variables Not Loading**
**Symptoms:** `undefined` values for process.env variables
**Solution:**
- Set variables in Vercel Dashboard (not .env files)
- Redeploy after adding variables
- Use exact variable names (case-sensitive)

#### **Issue 4: CORS Errors**
**Symptoms:** Frontend can't connect to backend
**Solution:**
- Update `FRONTEND_URL` with actual frontend domain
- Ensure CORS is configured for production

#### **Issue 5: Session/Authentication Issues**
**Symptoms:** Login fails, session not persisting
**Solution:**
- Set `SESSION_SECRET` environment variable
- Configure cookie settings for production
- Use MongoDB session store

### 🔧 **Step 5: Debugging Steps**

#### **Check Vercel Logs:**
1. Go to Vercel Dashboard
2. Select your backend project
3. Go to **Functions** tab
4. Click on failed function
5. Check **Logs** for error details

#### **Test Health Endpoint:**
```bash
curl https://your-backend-domain.vercel.app/
curl https://your-backend-domain.vercel.app/api/health
```

#### **Common Error Messages:**

**"Cannot find module"**
- Missing dependency in package.json
- ES module import issue

**"Database connection failed"**
- Wrong MongoDB URI
- Network access not configured
- Database user permissions

**"JWT_SECRET is required"**
- Missing JWT_SECRET environment variable
- Variable name mismatch

**"CORS error"**
- Frontend URL not in CORS whitelist
- Missing FRONTEND_URL environment variable

### 📊 **Step 6: Vercel Function Limits**

Ensure your app stays within Vercel limits:
- **Execution Time:** 30 seconds (configured in vercel.json)
- **Memory:** 1024MB (default)
- **Payload Size:** 4.5MB request/response
- **File System:** Read-only (except /tmp)

### 🎯 **Step 7: Production Optimizations**

#### **Database Connection Pooling:**
```javascript
// Already implemented in api/index.js
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};
```

#### **Error Handling:**
```javascript
// Comprehensive error handling in place
app.use(errorHandler);
```

#### **Security Headers:**
```javascript
// Helmet configured for Vercel
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
```

### 🔄 **Step 8: Redeployment Checklist**

Before redeploying:
- [ ] Environment variables set in Vercel Dashboard
- [ ] MongoDB Atlas network access configured
- [ ] FRONTEND_URL updated with actual domain
- [ ] All required secrets generated and set
- [ ] Database user has read/write permissions

### 📞 **Step 9: If Issues Persist**

1. **Check Vercel Status:** [status.vercel.com](https://status.vercel.com)
2. **Review Function Logs:** Vercel Dashboard → Functions → Logs
3. **Test Locally:** Ensure app works with production environment variables
4. **MongoDB Atlas:** Verify connection from external tools

### 🎉 **Success Indicators**

Your deployment is successful when:
- [ ] Health endpoint returns 200: `https://your-backend.vercel.app/api/health`
- [ ] Database connection working
- [ ] Authentication endpoints responding
- [ ] No 500 errors in Vercel logs
- [ ] Frontend can communicate with backend

## 🚀 **Quick Fix Commands**

```bash
# Redeploy backend with fixes
cd backend
vercel --prod

# Test health endpoint
curl https://your-backend-domain.vercel.app/api/health

# Check if environment variables are loaded
curl https://your-backend-domain.vercel.app/
```

Your FinAutoJobs backend should now deploy successfully on Vercel! 🎯
