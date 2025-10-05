# Production OAuth Setup Guide

## 🚀 Create New Google OAuth Client for Production

### Step 1: Create Production OAuth Client

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services > Credentials
3. **Click**: "Create Credentials" > "OAuth 2.0 Client ID"
4. **Application Type**: Web application
5. **Name**: "FinAutoJobs Production"

### Step 2: Configure Authorized Redirect URIs

Add these URIs to your production OAuth client:
```
https://your-backend-domain.onrender.com/api/oauth/google/callback
```

**Replace `your-backend-domain` with your actual Render backend URL**

### Step 3: Update Environment Variables

Once you get your production OAuth credentials, update `.env.render`:

```env
# Replace with your NEW production OAuth credentials
GOOGLE_CLIENT_ID=your-new-production-client-id
GOOGLE_CLIENT_SECRET=your-new-production-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/oauth/google/callback

# Update with your actual domains
OAUTH_SUCCESS_REDIRECT=https://your-frontend-domain.onrender.com/oauth/success
OAUTH_FAILURE_REDIRECT=https://your-frontend-domain.onrender.com/login?error=oauth_failed
FRONTEND_URL=https://your-frontend-domain.onrender.com
```

### Step 4: Render Deployment Configuration

When deploying to Render:

1. **Environment Variables**: Copy all variables from `.env.render`
2. **Update URLs**: Replace placeholder domains with actual Render URLs
3. **Test OAuth**: After deployment, test the OAuth flow

### Step 5: Domain Configuration

**Backend Domain Example**: `finautojobs-backend.onrender.com`
**Frontend Domain Example**: `finautojobs-frontend.onrender.com`

Update these in:
- Google Cloud Console redirect URIs
- Environment variables
- Frontend OAuth button URLs

## 🔐 Security Best Practices

1. **Separate Credentials**: Use different OAuth clients for dev/prod
2. **Environment Variables**: Never hardcode credentials in source code
3. **HTTPS Only**: Production OAuth requires HTTPS
4. **Domain Verification**: Verify domains in Google Cloud Console

## 🧪 Testing Production OAuth

1. **Deploy to Render**: Deploy both backend and frontend
2. **Update Google Console**: Add production redirect URIs
3. **Test OAuth Flow**: Visit your production app and test Google login
4. **Monitor Logs**: Check Render logs for OAuth debugging

## 📋 Checklist

- [ ] Create new production OAuth client
- [ ] Configure redirect URIs in Google Console
- [ ] Update environment variables with production credentials
- [ ] Deploy to Render with correct environment variables
- [ ] Test OAuth flow on production domain
- [ ] Verify user creation and login works

## 🚨 Troubleshooting

**Common Issues**:
- **Redirect URI Mismatch**: Ensure exact match in Google Console
- **HTTPS Required**: Production OAuth requires HTTPS
- **CORS Errors**: Update CORS_ORIGINS with production domains
- **Environment Variables**: Verify all OAuth vars are set in Render

**Debug URLs**:
- OAuth Status: `https://your-backend-domain.onrender.com/api/oauth/status`
- Health Check: `https://your-backend-domain.onrender.com/api/health`
