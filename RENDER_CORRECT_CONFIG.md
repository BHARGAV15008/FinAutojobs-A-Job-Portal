# Render.yaml Correct Configuration - Final Fix

## Issue Resolution
**Problem**: `unknown type "static_site"` - Render doesn't support this service type in YAML
**Solution**: Use two `web` services - one for backend API, one for frontend static serving

## Final Working Configuration

### Backend Service
```yaml
- name: finautojobs-backend
  type: web
  env: node
  plan: free
  rootDir: backend
  buildCommand: "npm install"
  startCommand: "npm start"
```

### Frontend Service
```yaml
- name: finautojobs-frontend
  type: web
  env: node
  plan: free
  rootDir: frontend
  buildCommand: "npm install --production=false && npm run build"
  startCommand: "npx serve -s dist"
```

## Key Corrections Made

### 1. Service Types
- **❌ Before**: `type: static_site` (unsupported)
- **✅ After**: `type: web` (supported)

### 2. Frontend Serving Strategy
- **Method**: Use `npx serve` to serve built React files as a web service
- **Build**: Include `--production=false` to install Vite and build tools
- **Start**: `npx serve -s dist` serves the built files

### 3. Environment Variables
- **Property**: Use `property: url` for service references
- **Google Callback**: Include proper `path: /api/auth/google/callback`
- **Cross-Service**: Services reference each other correctly

### 4. Dependencies
- **Serve Package**: Already included in frontend/package.json
- **Vite Tools**: Moved to dependencies (not devDependencies)
- **Build Tools**: Available during build process

## How This Works

### Service Architecture
1. **Backend Service**: 
   - Runs Express.js server
   - Serves API endpoints at `/api/*`
   - Handles authentication, database operations

2. **Frontend Service**:
   - Builds React app with Vite
   - Serves static files using `npx serve`
   - Acts as a web service serving frontend

### Communication Flow
1. **Frontend → Backend**: Via `VITE_API_URL` environment variable
2. **OAuth Callbacks**: Point to backend service with proper path
3. **CORS**: Backend configured to allow frontend domain

## Expected Deployment Results

### Two Services Created
1. **finautojobs-backend**: `https://finautojobs-backend-[hash].onrender.com`
2. **finautojobs-frontend**: `https://finautojobs-frontend-[hash].onrender.com`

### Service Status
- Both services will show as "web" type in Render dashboard
- Frontend service serves static React app
- Backend service provides API functionality

## Build Process
1. **Backend**: `npm install` → Installs Node.js dependencies
2. **Frontend**: `npm install --production=false && npm run build` → Builds React with Vite
3. **Backend Start**: Express server starts on assigned port
4. **Frontend Start**: `serve` command serves built files on assigned port

## Testing Checklist
After deployment:
- [ ] Backend health check: `GET /api/health`
- [ ] Frontend loads React application
- [ ] Frontend can call backend APIs
- [ ] OAuth authentication flows work
- [ ] Database connections established

## Why This Works
- **Only Web Services**: Render reliably supports `type: web`
- **Static Serving**: `npx serve` is a proven method for serving React builds
- **Environment Variables**: Proper service-to-service communication
- **Build Dependencies**: Vite available during build process

This configuration eliminates the `unknown type` error and provides a reliable deployment strategy using only supported Render service types.
