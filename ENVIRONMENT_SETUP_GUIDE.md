# 🔧 Environment Setup Guide - FinAutoJobs

## 📋 **Environment Files Overview**

Your FinAutoJobs backend now supports multiple environment configurations with MongoDB Atlas:

### **Environment Files Structure:**
```
backend/
├── .env                      # Main/Fallback configuration
├── .env.development          # Development environment (✅ Configured)
├── .env.production          # Production environment (Template)
├── .env.production.template # Production template
└── .env.atlas-template      # Atlas setup template
```

## 🎯 **Current Configuration Status**

### **✅ Configured Files:**
- **`.env.development`** - Development with MongoDB Atlas
- **`.env`** - Main fallback with Atlas configuration

### **📝 Template Files:**
- **`.env.production.template`** - Copy to `.env.production` for production
- **`.env.atlas-template`** - Reference for Atlas setup

## 🔄 **Environment Loading Logic**

The backend automatically loads the correct environment file:

```javascript
// Environment file selection
NODE_ENV=development → loads .env.development
NODE_ENV=production  → loads .env.production
No NODE_ENV         → loads .env (fallback)
```

**Fallback Safety:** If the specific environment file fails, it always tries `.env`

## 🚀 **Usage Commands**

### **Development (Recommended):**
```bash
# Uses .env.development (Atlas configured)
NODE_ENV=development npm run dev

# Or simply (defaults to development)
npm run dev
```

### **Production:**
```bash
# First, create production config
cp .env.production.template .env.production
# Edit .env.production with production URLs

# Then run
NODE_ENV=production npm start
```

### **Fallback:**
```bash
# Uses .env file
npm start
```

## 📊 **Environment Configurations**

### **Development Environment (`.env.development`):**
```bash
# ✅ CONFIGURED
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs
FRONTEND_URL=http://localhost:3000
EMAIL_USER=hiddenshadow032025@gmail.com
# ... (full configuration)
```

### **Production Environment (`.env.production.template`):**
```bash
# 📝 TEMPLATE - Copy to .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs
FRONTEND_URL=https://your-frontend-domain.vercel.app
# ... (production URLs and secrets)
```

## 🛠️ **Setup Commands**

### **Quick Setup:**
```bash
# Setup all environments
./setup-environments.sh all

# Test environment loading
./setup-environments.sh test

# Create production config
./setup-environments.sh production
```

### **Manual Setup:**
```bash
# Create production environment
cp .env.production.template .env.production

# Edit production file
nano .env.production
```

## 🔍 **Verification**

### **Test Current Setup:**
```bash
# Test development
NODE_ENV=development node test-vercel-setup.js

# Test production (after creating .env.production)
NODE_ENV=production node test-vercel-setup.js
```

### **Check Environment Loading:**
```bash
# Check which file is loaded
NODE_ENV=development npm run dev
# Look for: "🔧 Loading environment from: ./.env.development"
```

## 📝 **Configuration Details**

### **MongoDB Atlas (All Environments):**
- **Database**: `finautojobs`
- **Cluster**: `cluster0.nvq1gwn.mongodb.net`
- **User**: `hiddenshadow032025_db_user`
- **Connection**: Configured for both development and production

### **Key Differences by Environment:**

| Setting | Development | Production |
|---------|-------------|------------|
| PORT | 5000 | 3000 |
| FRONTEND_URL | http://localhost:3000 | https://your-domain.vercel.app |
| JWT_SECRET | development-key | production-secure-key |
| BASE_URL | http://localhost:5000 | https://your-backend.vercel.app |
| LOG_LEVEL | debug | error |

## 🚨 **Important Notes**

### **Security:**
- ✅ All `.env*` files are in `.gitignore`
- ✅ Production secrets are stronger than development
- ✅ Templates provided for safe sharing

### **MongoDB Atlas:**
- ✅ Same database cluster for all environments
- ✅ Connection string optimized for cloud deployment
- ✅ Network access configured for 0.0.0.0/0

### **Email Configuration:**
- ✅ Gmail SMTP configured with app password
- ✅ Same email service for all environments
- ⚠️ Consider separate email accounts for production

## 🎯 **Next Steps**

### **For Development:**
1. ✅ **Ready to use** - Just run `npm run dev`
2. ✅ **Atlas connected** - Database working
3. ✅ **Environment configured** - All settings ready

### **For Production Deployment:**
1. **Create production config**: `cp .env.production.template .env.production`
2. **Update URLs**: Replace placeholder URLs with actual domains
3. **Deploy to Vercel**: Use production environment variables
4. **Test deployment**: Verify all services working

## 📞 **Troubleshooting**

### **Environment Not Loading:**
```bash
# Check file exists
ls -la .env*

# Test loading
./setup-environments.sh test
```

### **Database Connection Issues:**
```bash
# Test Atlas connection
node test-vercel-setup.js

# Check environment variables
echo $NODE_ENV
```

### **Server Not Starting:**
```bash
# Check which environment file is being loaded
NODE_ENV=development npm run dev
# Look for: "🔧 Loading environment from: ..."
```

Your FinAutoJobs backend is now properly configured with MongoDB Atlas across all environments! 🚀
