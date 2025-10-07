# Render.yaml Final Fix - Two Web Services Approach

## Issue Resolution
**Problem**: `unknown type "static_site"` - Render doesn't support this service type
**Solution**: Use two `web` services with different environments

## Final Configuration

### Service 1: Backend API
```yaml
- type: web
  name: finautojobs-backend
  env: node
  plan: free
  rootDir: backend
  buildCommand: "npm install"
  startCommand: "npm start"
```

### Service 2: Frontend Static Site
```yaml
- type: web
  name: finautojobs-frontend
  env: static
  plan: free
  rootDir: frontend
  buildCommand: "npm install --production=false && npm run build"
  startCommand: "npx serve -s dist -l 10000"
```

## Key Changes Made

### 1. Service Types
- **Before**: `type: static_site` ❌
- **After**: `type: web` with `env: static` ✅

### 2. Frontend Serving
- **Method**: Uses `npx serve` to serve built React files
- **Port**: 10000 (standard for Render)
- **Build**: Includes `--production=false` for Vite dependencies

### 3. Environment Variables
- **Property**: Changed from `host` to `url` for better compatibility
- **Cross-Service**: Backend and frontend reference each other correctly
- **VITE_API_URL**: Points to backend service URL
- **GOOGLE_CALLBACK_URL**: Points to backend with proper path

## Expected Results

### Two Separate Services
1. **Backend**: `https://finautojobs-backend-[hash].onrender.com`
   - API endpoints: `/api/*`
   - Health check: `/api/health`

2. **Frontend**: `https://finautojobs-frontend-[hash].onrender.com`
   - React application
   - Connects to backend via VITE_API_URL

### Service Communication
- Frontend calls backend API via environment variable
- CORS configured to allow frontend domain
- OAuth callbacks point to backend service

## Build Process
1. **Backend Build**: `npm install` → Installs Node.js dependencies
2. **Frontend Build**: `npm install --production=false && npm run build` → Builds React app with Vite
3. **Backend Start**: `npm start` → Starts Express server
4. **Frontend Start**: `npx serve -s dist -l 10000` → Serves static files

## Dependencies
- **Backend**: All production dependencies in package.json
- **Frontend**: Vite and build tools moved to dependencies (not devDependencies)
- **Serve**: Added to frontend dependencies for static file serving

## Advantages of This Approach
- ✅ **Reliable**: Uses only supported `web` service type
- ✅ **Separate Concerns**: Backend and frontend are independent
- ✅ **Scalable**: Each service can be scaled independently
- ✅ **Standard**: Follows Render's recommended patterns

## Testing
After deployment, verify:
1. Backend API responds at `/api/health`
2. Frontend loads React application
3. Frontend can communicate with backend
4. OAuth flows work correctly

This configuration should resolve the `unknown type` error and deploy successfully on Render.
