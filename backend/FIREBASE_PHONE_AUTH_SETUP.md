# Firebase Phone Authentication Setup Guide - FinAutoJobs

## 🔥 Firebase Phone Auth Integration

This guide will help you set up Firebase Phone Authentication for your FinAutoJobs MERN application with **FREE** SMS verification (up to 3000 SMS/day).

## 📋 Prerequisites

- Google account for Firebase Console
- FinAutoJobs backend running
- Basic understanding of Firebase

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**: Click "Add project"
   - Project name: `FinAutoJobs-Auth` (or your preferred name)
   - Enable Google Analytics: Optional
   - Choose default account for Firebase features

3. **Enable Authentication**:
   - In Firebase Console, go to **Authentication** → **Sign-in method**
   - Click **Phone** provider
   - Toggle **Enable**
   - Click **Save**

## 🔧 Step 2: Get Firebase Configuration

### For Frontend (Public Config):
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** section
3. Click **Web app** icon (`</>`) to add web app
4. Register app with nickname: `FinAutoJobs-Web`
5. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "finautojobs-auth.firebaseapp.com",
  projectId: "finautojobs-auth",
  storageBucket: "finautojobs-auth.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### For Backend (Service Account):
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. **IMPORTANT**: Rename to `firebase-service-account.json`
5. Place in your backend root directory
6. Add to `.gitignore`: `firebase-service-account.json`

## 🔐 Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# Firebase Configuration (for Phone Authentication)
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=finautojobs-auth.firebaseapp.com
FIREBASE_PROJECT_ID=finautojobs-auth

# For production, use this instead of the JSON file:
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"finautojobs-auth",...}
```

## 🧪 Step 4: Add Test Phone Numbers (Development)

For testing without using real SMS:

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Scroll to **Phone** provider settings
3. Click **Phone numbers for testing**
4. Add test numbers:
   ```
   Phone: +1234567890, Code: 123456
   Phone: +9876543210, Code: 654321
   ```

## 🔥 Step 5: Test Backend Integration

1. **Start your backend**:
   ```bash
   cd backend
   NODE_ENV=development node server.js
   ```

2. **Check phone auth status**:
   ```bash
   curl http://localhost:5000/api/phone-auth/status
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Phone authentication service status",
     "phoneAuth": {
       "enabled": true,
       "provider": "Firebase",
       "testMode": true
     }
   }
   ```

3. **Get Firebase config for frontend**:
   ```bash
   curl http://localhost:5000/api/phone-auth/firebase-config
   ```

## 📱 Step 6: Frontend Integration (React)

### Install Dependencies:
```bash
cd frontend
npm install firebase
```

### Create Firebase Config (`src/config/firebase.js`):
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  // Use your config from Step 2
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "finautojobs-auth.firebaseapp.com",
  projectId: "finautojobs-auth",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA solved');
      }
    }, auth);
  }
};
```

### Create Phone Verification Component (`src/components/PhoneVerify.jsx`):
```jsx
import React, { useState } from 'react';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, setupRecaptcha } from '../config/firebase';
import axios from 'axios';

function PhoneVerify() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      setupRecaptcha('recaptcha-container');
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
      console.log('OTP sent successfully');
    } catch (error) {
      console.error('OTP send failed:', error);
      alert('Failed to send OTP: ' + error.message);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const credential = await confirmationResult.confirm(code);
      const idToken = await credential.user.getIdToken();

      // Send to backend for verification
      const response = await axios.post('http://localhost:5000/api/phone-auth/verify-phone', {
        idToken,
        role: 'applicant' // or get from form
      });

      localStorage.setItem('token', response.data.token);
      alert('Phone verified successfully!');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Phone Verification</h2>
      
      {step === 1 ? (
        <div>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button 
            onClick={sendOTP} 
            disabled={loading || !phone}
            style={{ width: '100%', padding: '10px' }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div>
          <p>Enter the 6-digit code sent to {phone}</p>
          <input
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button 
            onClick={verifyOTP} 
            disabled={loading || code.length !== 6}
            style={{ width: '100%', padding: '10px' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}
      
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PhoneVerify;
```

## 🧪 Step 7: Testing

### Test with Development Numbers:
1. Use `+1234567890` with code `123456`
2. Use `+9876543210` with code `654321`

### Test Flow:
1. Enter test phone number → Click "Send OTP"
2. Enter test code → Click "Verify OTP"
3. Should redirect to dashboard with JWT token

## 🚀 Step 8: Production Deployment

### Backend (.env.render):
```env
FIREBASE_API_KEY=your-production-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...full-json-here...}
```

### Frontend:
- Update Firebase config with production values
- Remove test phone numbers from Firebase Console
- Enable real SMS sending

## 📊 Free Tier Limits

- **SMS**: 3000 verifications/day
- **Users**: 3000 DAU (Daily Active Users)
- **Cost**: $0.01-$0.06 per SMS after free tier

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**:
   - Check service account JSON file exists
   - Verify environment variables

2. **"reCAPTCHA error"**:
   - Add your domain to Firebase authorized domains
   - Check console for JavaScript errors

3. **"Invalid phone number"**:
   - Use E.164 format: +[country code][number]
   - Example: +919876543210 (India), +12345678901 (US)

4. **"Quota exceeded"**:
   - Check Firebase Console → Usage
   - Use test numbers for development

## 🎯 Integration with Existing Auth

The phone auth integrates with your existing OAuth system:
- Users can sign up with phone OR Google OAuth
- Phone verification creates JWT tokens compatible with your auth system
- User model supports both email and phone authentication

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Verify environment variables
3. Test with provided test numbers first
4. Check network connectivity for SMS delivery

Your phone authentication system is now ready! 🎉
