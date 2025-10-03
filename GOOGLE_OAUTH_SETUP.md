# Google OAuth Setup Guide

## 🎯 Quick Setup for Google OAuth

The 400 error you're seeing is because we're using test credentials. Here's how to set up real Google OAuth:

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Create New Project:**
   - Click "Select a project" → "New Project"
   - Project name: `FinAutoJobs`
   - Click "Create"

### Step 2: Enable Google+ API

1. **Navigate to APIs & Services** → **Library**
2. **Search for "Google+ API"** and enable it
3. **Search for "Google OAuth2 API"** and enable it

### Step 3: Configure OAuth Consent Screen

1. **Go to APIs & Services** → **OAuth consent screen**
2. **Choose "External"** user type → Click "Create"
3. **Fill required information:**
   - **App name:** FinAutoJobs
   - **User support email:** Your email
   - **Developer contact information:** Your email
4. **Click "Save and Continue"**
5. **Scopes:** Add `email`, `profile`, `openid` → Click "Save and Continue"
6. **Test users:** Add your email for testing → Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth 2.0 Client IDs**
3. **Application type:** Web application
4. **Name:** FinAutoJobs Web Client
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/oauth/google/callback
   http://127.0.0.1:5000/api/oauth/google/callback
   ```
7. **Click "Create"**

### Step 5: Update Backend Configuration

1. **Copy the Client ID and Client Secret** from Google Cloud Console
2. **Update your backend `.env` file:**
   ```bash
   # Replace these lines in /backend/.env
   GOOGLE_CLIENT_ID=your-actual-google-client-id-from-console
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-from-console
   ```

### Step 6: Restart Backend Server

```bash
cd /backend
npm run dev
```

## 🧪 Test the Setup

1. **Go to:** http://localhost:3000/login
2. **Click "Sign in with Google"**
3. **You should see:** Real Google login page (not 400 error)
4. **After login:** You'll be redirected back to FinAutoJobs

## 🔧 Alternative: Use Development Mode

If you want to test without setting up real OAuth, I can temporarily disable real OAuth and show you the development simulation:

```bash
# In frontend/.env, change:
VITE_USE_REAL_OAUTH=false
```

## 📞 Need Help?

If you encounter any issues:
1. Check that all redirect URIs match exactly
2. Ensure the Google Cloud project has the APIs enabled
3. Verify the OAuth consent screen is configured
4. Make sure you're using the correct Client ID and Secret

Would you like me to help you set this up, or would you prefer to see the development simulation working first?
