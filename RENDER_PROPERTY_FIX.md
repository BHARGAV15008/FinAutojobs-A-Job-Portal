# Render.yaml Property Fix

## Issue Identified
**Error**: `invalid service property: url. Valid properties are connectionString, host, hostport, port.`

**Root Cause**: Render's `fromService` references only support specific properties, not `url`.

## Valid Properties in Render
- `connectionString` - For database connections
- `host` - Service hostname only
- `hostport` - Host with port
- `port` - Port number only

## Fix Applied

### Before (INCORRECT)
```yaml
- key: GOOGLE_CALLBACK_URL
  fromService:
    type: web
    name: finautojobs-backend
    property: url  # ❌ Not supported
    path: /api/auth/google/callback

- key: VITE_API_URL
  fromService:
    type: web
    name: finautojobs-backend
    property: url  # ❌ Not supported
```

### After (CORRECT)
```yaml
- key: GOOGLE_CALLBACK_URL
  value: "https://finautojobs-backend.onrender.com/api/auth/google/callback"

- key: VITE_API_URL
  value: "https://finautojobs-backend.onrender.com"

- key: FRONTEND_URL
  value: "https://finautojobs-frontend.onrender.com"
```

## Why This Approach Works

### 1. Static URLs
- **Predictable**: Render service URLs follow pattern `https://[service-name].onrender.com`
- **Reliable**: Service names are consistent once deployed
- **Simple**: No complex property references needed

### 2. Service Name Mapping
- **Backend Service**: `finautojobs-backend` → `https://finautojobs-backend.onrender.com`
- **Frontend Service**: `finautojobs-frontend` → `https://finautojobs-frontend.onrender.com`

### 3. Environment Variables
- **VITE_API_URL**: Frontend knows where to find backend API
- **GOOGLE_CALLBACK_URL**: OAuth knows where to redirect
- **FRONTEND_URL**: Backend knows frontend domain for CORS

## Expected Deployment

### Service URLs
- **Backend API**: https://finautojobs-backend.onrender.com
- **Frontend App**: https://finautojobs-frontend.onrender.com

### Communication Flow
1. **User visits**: https://finautojobs-frontend.onrender.com
2. **Frontend calls**: https://finautojobs-backend.onrender.com/api/*
3. **OAuth redirects**: https://finautojobs-backend.onrender.com/api/auth/google/callback

## Benefits
- ✅ **No Property Errors**: Uses static values instead of unsupported properties
- ✅ **Predictable URLs**: Standard Render URL patterns
- ✅ **Simple Configuration**: No complex service references
- ✅ **Reliable**: Works consistently across deployments

This configuration should resolve all property validation errors and deploy successfully.
