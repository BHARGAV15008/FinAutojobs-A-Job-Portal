# OAuth Setup Guide for FinAutoJobs

This guide will help you set up OAuth authentication with Google, Microsoft, and Apple for the FinAutoJobs platform.

## 🚀 Quick Start

The OAuth system is now integrated into both login and register pages. Users can choose their role (applicant/recruiter) and authenticate with their preferred provider.

## 📋 Prerequisites

- Backend server running on port 5000
- Frontend application running
- Valid OAuth credentials from providers

## 🔧 Provider Setup

### 1. Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/google/callback`
     - `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/google/callback` (for network access)
5. **Copy credentials** and update `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=694673409935-td8q4m1qlvnf6ddfbnn3o9sljpirhpeh.apps.googleusercontent.com-here
   GOOGLE_CLIENT_SECRET=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-here
   ```

### 2. Microsoft OAuth Setup

1. **Go to Azure Portal**: https://portal.azure.com/
2. **Register a new application**:
   - Go to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name: "FinAutoJobs"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
3. **Set redirect URI**:
   - Platform: Web
   - Redirect URI: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/microsoft/callback`
4. **Create client secret**:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Copy the secret value immediately
5. **Update `.env.local`**:
   ```env
   MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret-here
   MICROSOFT_TENANT_ID=common
   ```

### 3. Apple OAuth Setup

1. **Go to Apple Developer**: https://developer.apple.com/
2. **Create App ID**:
   - Go to "Certificates, Identifiers & Profiles"
   - Create new App ID with "Sign In with Apple" capability
3. **Create Service ID**:
   - Create new Services ID
   - Configure "Sign In with Apple"
   - Add domain and redirect URL: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/apple/callback`
4. **Create Private Key**:
   - Go to "Keys" section
   - Create new key with "Sign In with Apple" capability
   - Download the .p8 file
5. **Update `.env.local`**:
   ```env
   APPLE_CLIENT_ID=your-apple-service-id-here
   APPLE_TEAM_ID=your-apple-team-id-here
   APPLE_KEY_ID=your-apple-key-id-here
   APPLE_PRIVATE_KEY=your-apple-private-key-here
   ```

## 🔄 OAuth Flow

### User Experience:
1. **User visits login/register page**
2. **Selects role** (Applicant or Recruiter)
3. **Clicks OAuth provider button** (Google, Microsoft, or Apple)
4. **Redirected to provider** for authentication
5. **Provider redirects back** with authorization code
6. **Backend processes** the OAuth callback
7. **User account created/linked** with role-specific data
8. **JWT token generated** and user redirected to dashboard

### Technical Flow:
```
Frontend → Backend OAuth Route → Provider → Provider Callback → User Creation → JWT Token → Dashboard
```

## 📁 File Structure

```
backend/
├── config/oauth.js          # OAuth configuration and strategies
├── routes/oauth.js          # OAuth routes and handlers
├── models/UserModels.js     # User models with OAuth support
└── .env.local              # Environment variables

frontend/
├── components/auth/OAuthButtons.jsx    # OAuth button component
├── pages/LoginPage.jsx                 # Login page with OAuth
├── pages/RegisterPage.jsx              # Register page with OAuth
└── pages/OAuthCallback.jsx             # OAuth callback handler
```

## 🧪 Testing OAuth

### Test URLs:
- **OAuth Status**: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/status`
- **Google OAuth**: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/google?role=applicant`
- **Microsoft OAuth**: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/microsoft?role=recruiter`
- **Apple OAuth**: `https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/apple?role=applicant`

### Test Steps:
1. **Start backend server**: `npm run dev`
2. **Start frontend application**
3. **Go to login page**
4. **Select role tab** (Applicant/Recruiter)
5. **Click OAuth provider button**
6. **Complete authentication** with provider
7. **Verify redirect** to appropriate dashboard

## 🔐 Security Features

- **Role-based account creation**: Users can have both applicant and recruiter accounts
- **JWT token generation**: Secure authentication tokens
- **Session management**: Proper session handling
- **CORS protection**: Configured for development and production
- **Error handling**: Comprehensive error handling and user feedback

## 🚨 Troubleshooting

### Common Issues:

1. **"OAuth provider not enabled"**
   - Check if credentials are properly set in `.env.local`
   - Restart the backend server after updating credentials

2. **"Redirect URI mismatch"**
   - Ensure redirect URIs in provider console match exactly
   - Include both localhost and network IP for development

3. **"Invalid client credentials"**
   - Verify client ID and secret are correct
   - Check for extra spaces or characters in `.env.local`

4. **"CORS error"**
   - Ensure frontend URL is in CORS_ORIGINS environment variable
   - Check if provider allows the redirect URI

### Debug Steps:
1. **Check OAuth status**: `curl https://finautojobs-a-job-portal-hk5c.onrender.com/api/oauth/status`
2. **Check server logs** for detailed error messages
3. **Verify environment variables** are loaded correctly
4. **Test with browser developer tools** to see network requests

## 🌐 Production Deployment

### Environment Variables for Production:
```env
# Update redirect URLs for production domain
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
MICROSOFT_CLIENT_ID=production-microsoft-client-id
MICROSOFT_CLIENT_SECRET=production-microsoft-client-secret
APPLE_CLIENT_ID=production-apple-client-id

# Update frontend URL
FRONTEND_URL=https://your-production-domain.com
OAUTH_SUCCESS_REDIRECT=https://your-production-domain.com/oauth/success
OAUTH_FAILURE_REDIRECT=https://your-production-domain.com/login?error=oauth_failed
```

### Production Checklist:
- [ ] Update OAuth redirect URIs in provider consoles
- [ ] Set production environment variables
- [ ] Test OAuth flow on production domain
- [ ] Configure HTTPS for secure OAuth
- [ ] Update CORS origins for production

## 📞 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure OAuth provider configurations match the redirect URIs
4. Test with different browsers to rule out browser-specific issues

## 🎉 Success!

Once configured properly, users will be able to:
- **Sign up/Login** with Google, Microsoft, or Apple accounts
- **Choose their role** during OAuth registration
- **Access role-specific dashboards** immediately after authentication
- **Link multiple OAuth providers** to the same account
- **Maintain secure sessions** with JWT tokens

The OAuth integration provides a seamless, professional authentication experience for your job portal users!
