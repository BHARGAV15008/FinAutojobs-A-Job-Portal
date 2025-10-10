# 🚀 Cyclic.sh Deployment Guide

## Why Cyclic.sh?
- ✅ **100% Free**: Unlimited apps forever
- ✅ **Traditional Server**: Full Express.js server (not serverless)
- ✅ **Free Domain**: `finautojobs.cyclic.sh`
- ✅ **No Credit Cards**: Completely free signup
- ✅ **SMTP Support**: Email services work perfectly
- ✅ **Node.js Focused**: Built specifically for Node.js apps

## 🚀 Quick Setup (3 minutes)

### Step 1: Deploy
1. Go to [cyclic.sh](https://cyclic.sh)
2. Sign up with GitHub
3. Click "Deploy" → Connect repository
4. Select: `FinAutojobs-A-Job-Portal`
5. Auto-deploys both frontend and backend

### Step 2: Environment Variables
Add to Cyclic dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs
JWT_SECRET=8f69bcf03020571977a802457bd0ff26edce2f7cd0e7519a80c3342f379d2c59
EMAIL_SERVICE=resend
RESEND_API_KEY=re_XxB7mdQ7_LFqRbZBnKAaL8tdeZH5zdX8h
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

### Benefits
- **$0 Cost**: Forever free
- **Simple Setup**: One-click deployment
- **Reliable**: Good uptime and performance
- **No Limits**: No usage restrictions

## 🎯 Expected URLs
- **Full App**: `https://finautojobs.cyclic.sh`
- **API**: `https://finautojobs.cyclic.sh/api`
