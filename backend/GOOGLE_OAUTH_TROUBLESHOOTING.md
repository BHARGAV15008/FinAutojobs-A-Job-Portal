# Google OAuth Redirect URI Troubleshooting Guide - FinAutoJobs MERN Stack

## 🚨 Current Issue
**Error**: `redirect_uri_mismatch`
**Your App Sends**: `http://localhost:5000/api/oauth/google/callback`
**Client ID**: `694673409935-td8q4m1qlvnf6ddfbnn3o9sljpirhpeh.apps.googleusercontent.com`

## 📋 MERN Stack OAuth Flow
1. **Frontend (React)**: User clicks "Sign in with Google" → Redirects to backend OAuth endpoint
2. **Backend (Node/Express)**: Handles Google OAuth → Receives callback → Issues JWT → Redirects to frontend
3. **Frontend**: Receives token and authenticates user

## 🔧 Step-by-Step Fix

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Make sure you're in the correct project
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth Client
1. Look for: `694673409935-td8q4m1qlvnf6ddfbnn3o9sljpirhpeh.apps.googleusercontent.com`
2. Click the **pencil/edit icon** (not the name)

### Step 3: Add Redirect URIs
In the "Authorized redirect URIs" section, add these **EXACT** URIs:

```
http://localhost:5000/api/oauth/google/callback
http://127.0.0.1:5000/api/oauth/google/callback
http://192.168.41.134:5000/api/oauth/google/callback
```

### Step 4: Save and Wait
1. Click **"SAVE"** button
2. Wait 2-3 minutes for changes to propagate
3. Try OAuth again

## 🔍 Common Mistakes to Avoid

❌ **Wrong**: `https://localhost:5000/api/oauth/google/callback` (https instead of http)
❌ **Wrong**: `http://localhost:5000/api/oauth/google/callback/` (trailing slash)
❌ **Wrong**: `http://localhost:5000/oauth/google/callback` (missing /api)
✅ **Correct**: `http://localhost:5000/api/oauth/google/callback`

## 🧪 Test URLs

After configuration, test these URLs in browser:
- http://localhost:5000/api/oauth/google?role=applicant
- http://localhost:5000/api/oauth/status

## 🔄 Alternative Solutions

### Solution A: Use Different Port
If localhost:5000 doesn't work, try port 3000:

1. Update your backend to run on port 3000
2. Add to Google Console: `http://localhost:3000/api/oauth/google/callback`

### Solution B: Use 127.0.0.1 Instead
Sometimes localhost doesn't work, try:
- `http://127.0.0.1:5000/api/oauth/google/callback`

### Solution C: Check Project Settings
1. In Google Cloud Console, verify you're in the correct project
2. Check if OAuth consent screen is configured
3. Make sure your email is added as a test user

## 📋 Verification Checklist

- [ ] Correct Google Cloud project selected
- [ ] OAuth client ID matches: `694673409935-td8q4m1qlvnf6ddfbnn3o9sljpirhpeh.apps.googleusercontent.com`
- [ ] Redirect URI exactly: `http://localhost:5000/api/oauth/google/callback`
- [ ] Changes saved in Google Console
- [ ] Waited 2-3 minutes after saving
- [ ] Backend server running on port 5000
- [ ] No typos in the redirect URI

## 🆘 If Still Not Working

1. **Clear browser cache** and try again
2. **Try incognito/private browsing mode**
3. **Check browser developer tools** for any console errors
4. **Verify OAuth consent screen** is configured in Google Console
5. **Add your email as a test user** in OAuth consent screen

## 📞 Debug Information

**Current Configuration:**
- Backend URL: http://localhost:5000
- OAuth Endpoint: /api/oauth/google
- Callback URL: /api/oauth/google/callback
- Client ID: 694673409935-td8q4m1qlvnf6ddfbnn3o9sljpirhpeh.apps.googleusercontent.com

**Test Command:**
```bash
curl -I "http://localhost:5000/api/oauth/google?role=applicant"
```

This should return a 302 redirect to Google with the correct redirect_uri parameter.
