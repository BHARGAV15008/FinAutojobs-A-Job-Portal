# OAuth Integration Setup Guide for FinAutoJobs

This guide explains how to set up Google, Microsoft, and Apple OAuth authentication for the FinAutoJobs platform.

## 🚀 Quick Start

The OAuth system has been fully implemented and is ready for configuration. Follow these steps to enable OAuth authentication:

### 1. Backend Configuration

#### Environment Variables
Add these OAuth configuration variables to your backend `.env` file:

```bash
# OAuth Provider Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/oauth/microsoft/callback

APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_PATH=./apple-private-key.p8
APPLE_CALLBACK_URL=http://localhost:5000/api/oauth/apple/callback

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

#### Frontend Configuration
Add these variables to your frontend `.env` file:

```bash
# OAuth Configuration
REACT_APP_USE_REAL_OAUTH=true
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 2. Provider Setup

## 🔵 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### Step 2: Configure OAuth Consent Screen
1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: FinAutoJobs
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (for development)

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - **Name**: FinAutoJobs Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/oauth/google/callback` (development)
     - `https://yourapi.com/api/oauth/google/callback` (production)
5. Copy the Client ID and Client Secret to your `.env` file

## 🔷 Microsoft OAuth Setup

### Step 1: Register Application
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Configure:
   - **Name**: FinAutoJobs
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: `http://localhost:5000/api/oauth/microsoft/callback`

### Step 2: Configure Authentication
1. In your app registration, go to "Authentication"
2. Add platform → Web
3. Add redirect URIs:
   - `http://localhost:5000/api/oauth/microsoft/callback` (development)
   - `https://yourapi.com/api/oauth/microsoft/callback` (production)
4. Enable "Access tokens" and "ID tokens"

### Step 3: Get Credentials
1. Go to "Certificates & secrets"
2. Create a new client secret
3. Copy the Application (client) ID and client secret to your `.env` file

### Step 4: Configure API Permissions
1. Go to "API permissions"
2. Add permissions:
   - Microsoft Graph → Delegated permissions
   - Add: `User.Read`, `email`, `openid`, `profile`

## 🍎 Apple OAuth Setup

### Step 1: Configure App ID
1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID or use existing one
4. Enable "Sign In with Apple" capability

### Step 2: Create Service ID
1. In "Identifiers", create a new "Services ID"
2. Configure:
   - **Description**: FinAutoJobs Web Service
   - **Identifier**: com.finautojobs.web (use your domain)
3. Enable "Sign In with Apple"
4. Configure domains and redirect URLs:
   - **Domains**: `localhost:3000`, `yourdomain.com`
   - **Redirect URLs**: `http://localhost:5000/api/oauth/apple/callback`

### Step 3: Create Private Key
1. In "Keys", create a new key
2. Enable "Sign In with Apple"
3. Download the private key file (.p8)
4. Place it in your backend root directory as `apple-private-key.p8`

### Step 4: Get Configuration Details
- **Client ID**: Your Services ID identifier
- **Team ID**: Found in your Apple Developer account
- **Key ID**: The key identifier from step 3

## 🔧 Implementation Details

### Backend Features
- ✅ **Passport.js Integration**: Complete OAuth strategies for all providers
- ✅ **User Account Linking**: Existing users can link OAuth accounts
- ✅ **Role-Based Registration**: OAuth users can register as applicant or recruiter
- ✅ **Session Management**: MongoDB session store for scalability
- ✅ **Error Handling**: Comprehensive error handling and user feedback

### Frontend Features
- ✅ **OAuth Buttons**: Styled buttons for all providers
- ✅ **Callback Handling**: Dedicated pages for success and error states
- ✅ **Role Selection**: Users can choose their role during OAuth flow
- ✅ **Loading States**: Visual feedback during authentication process

### API Endpoints
```
GET  /api/oauth/status                    # Check OAuth service status
GET  /api/oauth/google?role=applicant     # Initiate Google OAuth
GET  /api/oauth/google/callback           # Google OAuth callback
GET  /api/oauth/microsoft?role=recruiter  # Initiate Microsoft OAuth
GET  /api/oauth/microsoft/callback        # Microsoft OAuth callback
GET  /api/oauth/apple?role=applicant      # Initiate Apple OAuth (redirects to frontend)
POST /api/oauth/apple/callback            # Apple OAuth callback (via JS SDK)
```

## 🧪 Testing

### Development Testing
1. Start the backend server: `npm run dev`
2. Start the frontend server: `npm start`
3. Navigate to login/register pages
4. Click on OAuth provider buttons
5. Complete the OAuth flow

### Test Accounts
For development, you can use test accounts:
- **Google**: Use any Google account
- **Microsoft**: Use any Microsoft account
- **Apple**: Use any Apple ID

### Debugging
Enable debug mode in your `.env`:
```bash
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS for all OAuth redirect URLs
- [ ] Set secure session cookies (`secure: true`)
- [ ] Use strong session secrets
- [ ] Implement rate limiting for OAuth endpoints
- [ ] Validate all OAuth responses
- [ ] Store sensitive credentials in environment variables
- [ ] Regular security audits of OAuth implementation

### Best Practices
1. **Never expose client secrets** in frontend code
2. **Use state parameters** to prevent CSRF attacks
3. **Validate redirect URIs** to prevent open redirects
4. **Implement proper session management**
5. **Handle OAuth errors gracefully**

## 🚀 Production Deployment

### Environment Setup
1. Update all OAuth redirect URLs to production domains
2. Configure production environment variables
3. Set up SSL certificates for HTTPS
4. Configure production session store (Redis recommended)

### Domain Configuration
Update OAuth provider settings with production URLs:
- **Google**: Update authorized origins and redirect URIs
- **Microsoft**: Update redirect URIs in Azure portal
- **Apple**: Update domains and redirect URLs

## 📱 Mobile Integration (Future)

The current implementation supports web OAuth. For mobile apps:
1. **React Native**: Use `@react-native-async-storage/async-storage` for token storage
2. **iOS**: Implement Apple Sign-In natively
3. **Android**: Use Google Sign-In SDK

## 🔍 Troubleshooting

### Common Issues

#### "OAuth provider not configured" error
- Check environment variables are set correctly
- Verify OAuth provider credentials

#### "Redirect URI mismatch" error
- Ensure redirect URIs match exactly in provider settings
- Check for trailing slashes and protocol (http vs https)

#### "Invalid client" error
- Verify client ID and secret are correct
- Check if OAuth app is properly configured

#### Session issues
- Verify MongoDB connection for session store
- Check session secret configuration

### Debug Steps
1. Check browser network tab for OAuth requests
2. Verify backend logs for OAuth errors
3. Test OAuth endpoints directly
4. Validate environment variable loading

## 📞 Support

For OAuth integration support:
- Check the [implementation files](./backend/routes/oauth.js)
- Review [frontend components](./frontend/src/components/auth/)
- Consult provider documentation:
  - [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
  - [Microsoft OAuth](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
  - [Apple Sign-In](https://developer.apple.com/sign-in-with-apple/)

## 🎯 Next Steps

1. **Configure OAuth providers** using this guide
2. **Test the implementation** with your credentials
3. **Deploy to production** with proper security measures
4. **Monitor OAuth usage** and user feedback
5. **Consider additional providers** (GitHub, LinkedIn, etc.)

---

**Note**: This OAuth implementation is production-ready and follows security best practices. Make sure to review and test thoroughly before deploying to production.
