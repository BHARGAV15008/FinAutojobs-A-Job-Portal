# Render.yaml Configuration Fix

## Issue Identified
**Error**: `unknown type "static_site"`

**Root Cause**: The correct service type for static sites in Render is `static`, not `static_site`.

## Fixes Applied

### 1. Service Type Correction
**Problem**: Using incorrect service type `static_site`
**Solution**: Changed to correct type `static`

**Changes Made**:
```yaml
# Before (INCORRECT)
- type: static_site

# After (CORRECT)
- type: static
```

### 2. Frontend Build Command Restoration
**Problem**: Build command was missing `--production=false` flag needed for Vite
**Solution**: Restored proper build command

**Changes Made**:
```yaml
# Before
buildCommand: "npm install && npm run build"

# After
buildCommand: "npm install --production=false && npm run build"
```

### 3. Environment Variable Format
**Problem**: Inconsistent environment variable formatting
**Solution**: Standardized string values for NODE_VERSION

**Changes Made**:
```yaml
# Standardized format
- key: NODE_VERSION
  value: "20"
```

## Final Configuration

### Backend Service (Web)
```yaml
- type: web
  name: finautojobs-backend
  env: node
  plan: free
  rootDir: backend
  buildCommand: "npm install"
  startCommand: "npm start"
```

### Frontend Service (Static)
```yaml
- type: static
  name: finautojobs-frontend
  plan: free
  rootDir: frontend
  buildCommand: "npm install --production=false && npm run build"
  staticPublishPath: dist
```

## Expected Results

After pushing these changes:
1. **Backend Service**: Will continue running at existing URL
2. **Frontend Service**: Will deploy as static site with separate URL
3. **No More Errors**: `unknown type "static_site"` error resolved
4. **Proper Build**: Vite will be available during frontend build process

## Service URLs
- **Backend API**: https://finautojobs-backend-[hash].onrender.com
- **Frontend Website**: https://finautojobs-frontend-[hash].onrender.com

## Next Steps
1. Commit and push the render.yaml changes
2. Monitor Render dashboard for both services
3. Verify frontend static site deploys successfully
4. Test complete application functionality

The configuration now follows Render's correct service type specifications and should deploy both services successfully.
