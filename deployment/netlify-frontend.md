# 🎨 Deploy Frontend to Netlify (Free)

## Prerequisites
- GitHub repository with your frontend code
- Backend deployed and running

## Step 1: Prepare Frontend for Netlify

### 1.1 Create Netlify Configuration
```toml
# netlify.toml (in frontend root)
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 1.2 Update Build Configuration
Ensure your build script works:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 2: Configure Environment Variables

### 2.1 Production Environment File
Create `.env.production`:
```env
# API Configuration - Update with your Render backend URL
VITE_API_URL=https://finautojobs-backend.onrender.com/api
VITE_BACKEND_URL=https://finautojobs-backend.onrender.com

# App Configuration
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_EXPIRES_IN=7d

# File Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Feature Flags
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PREMIUM_FEATURES=false

# Production Settings
VITE_NODE_ENV=production
VITE_DEBUG=false

# Social Login (Optional)
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
VITE_LINKEDIN_CLIENT_ID=your-production-linkedin-client-id

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Step 3: Deploy to Netlify

### 3.1 Connect Repository
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Select frontend folder if using monorepo

### 3.2 Build Settings
- **Base directory:** `frontend` (if monorepo)
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist` (or just `dist`)

### 3.3 Environment Variables
In Netlify dashboard, go to Site settings → Environment variables:
```
VITE_API_URL=https://finautojobs-backend.onrender.com/api
VITE_BACKEND_URL=https://finautojobs-backend.onrender.com
VITE_APP_NAME=FinAutoJobs
VITE_NODE_ENV=production
VITE_DEBUG=false
```

## Step 4: Configure Custom Domain (Optional)

### 4.1 Free Netlify Subdomain
Your site will be available at:
```
https://amazing-name-123456.netlify.app
```

### 4.2 Custom Domain (Free)
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records with your domain provider

## Step 5: Update Backend CORS

Update your backend environment variables on Render:
```env
FRONTEND_URL=https://your-site-name.netlify.app
CORS_ORIGINS=https://your-site-name.netlify.app
```

## 🔧 Optimization Tips

### 5.1 Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react'],
        },
      },
    },
  },
})
```

### 5.2 Performance Headers
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## 📊 Netlify Free Tier Features

### Included:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Deploy previews
- ✅ Branch deploys
- ✅ Form handling
- ✅ SSL certificates
- ✅ CDN (global)

### Limitations:
- 🔄 Build time limit: 15 minutes
- 📁 File size limit: 125MB per file
- 🌐 1 concurrent build

## 🚀 Deployment Process

### Automatic Deployment:
1. Push to main branch
2. Netlify automatically builds and deploys
3. Site updates in 1-3 minutes

### Manual Deployment:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

Your frontend URL will be:
```
https://finautojobs.netlify.app
```