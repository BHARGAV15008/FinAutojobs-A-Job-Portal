# Render Unified Deployment Configuration

## Issue Resolution
**Problem**: Render was rejecting both `static_site` and `static` service types
**Solution**: Switched to unified single-service deployment approach

## New Architecture

### Single Web Service Deployment
Instead of separate backend and frontend services, we now use:
- **Single Service**: `finautojobs-fullstack`
- **Type**: `web` (the only reliable type on Render)
- **Serves**: Both API endpoints and static frontend files

## Configuration Details

### Render.yaml Structure
```yaml
services:
  - type: web
    name: finautojobs-fullstack
    env: node
    plan: free
    buildCommand: "npm run build"
    startCommand: "npm start"
```

### Build Process
1. **Root Build**: `npm run build` (from package.json)
2. **Backend Install**: Installs backend dependencies
3. **Frontend Build**: Builds React app with Vite (including devDependencies)
4. **Static Serving**: Backend serves frontend files from `/frontend/dist`

### Server Configuration
The backend server (server.js) already includes:
```javascript
// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}
```

## Benefits of Unified Approach

### ✅ Advantages
- **Simpler Deployment**: Single service to manage
- **No CORS Issues**: Frontend and backend on same domain
- **Cost Effective**: Only one service on free tier
- **Reliable**: Uses only `web` service type (guaranteed to work)
- **Environment Variables**: Simplified configuration

### 🔧 How It Works
1. **API Routes**: `/api/*` → Backend Express routes
2. **Static Files**: `/*` → Frontend React app
3. **React Router**: All non-API routes → `index.html`

## Environment Variables
All environment variables are now in single service:
- **Backend Vars**: MongoDB, JWT, Email, etc.
- **Frontend Vars**: VITE_API_URL, VITE_GOOGLE_CLIENT_ID
- **Self-Reference**: VITE_API_URL points to same service URL

## Expected URLs
- **Single URL**: https://finautojobs-fullstack-[hash].onrender.com
- **API Access**: https://finautojobs-fullstack-[hash].onrender.com/api/*
- **Website**: https://finautojobs-fullstack-[hash].onrender.com/

## Deployment Process
1. **Push Changes**: Git push triggers deployment
2. **Build Phase**: Runs `npm run build` (builds both backend + frontend)
3. **Start Phase**: Runs `npm start` (starts backend server)
4. **Serving**: Backend serves API + static frontend files

## Migration from Previous Setup
- **Before**: Two services (backend + frontend)
- **After**: One service (unified fullstack)
- **URL Change**: New single URL for entire application
- **Functionality**: Identical user experience

This unified approach is more reliable and avoids Render's service type limitations while maintaining all functionality.
