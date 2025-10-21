import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyIdToken } from '../config/firebase.js';

const router = express.Router();

// Verify phone number with Firebase OTP (for both login and registration)
router.post('/verify-phone', async (req, res) => {
  try {
    const { idToken, role = 'applicant', isRegistration = false } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;
    const firebaseUid = decodedToken.uid;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found in token'
      });
    }

    console.log('📱 Phone verification request:', {
      phone: phoneNumber,
      role: role,
      firebaseUid: firebaseUid,
      isRegistration: isRegistration
    });

    // Check if user already exists with this phone number
    let user = await User.findOne({ phoneNumber });

    if (user && isRegistration) {
      // User already exists but trying to register
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered. Please try logging in instead.',
        userExists: true
      });
    }

    if (user) {
      // Existing user logging in
      user.verification.phone = true;
      user.authProviders.phone = true;
      user.authProviders.firebase = firebaseUid;
      user.lastLogin = new Date();
      await user.save();

      console.log('✅ Existing user verified for login:', user._id);
    } else {
      // Create new user (registration)
      user = new User({
        phoneNumber,
        role,
        verification: {
          phone: true,
          email: false
        },
        authProviders: {
          phone: true,
          firebase: firebaseUid
        },
        isVerified: true, // Phone verified
        lastLogin: new Date()
      });

      await user.save();
      console.log('✅ New user created with phone registration:', user._id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        phone: phoneNumber, 
        role: user.role,
        verified: true
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: isRegistration ? 'Account created and phone verified successfully' : 'Phone number verified successfully',
      isNewUser: !user.lastLogin || isRegistration,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.verification.phone,
        profile: user.profile
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('❌ Phone verification error:', error);
    
    if (error.message.includes('Firebase')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Phone verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if phone number is already registered
router.post('/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phoneNumber });

    res.json({
      success: true,
      exists: !!user,
      verified: user ? user.verification.phone : false
    });

  } catch (error) {
    console.error('❌ Phone check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check phone number'
    });
  }
});

// Get Firebase configuration for frontend
router.get('/firebase-config', (req, res) => {
  // Only return public configuration
  res.json({
    success: true,
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
    testNumbers: process.env.NODE_ENV === 'development' ? {
      '+1234567890': '123456',
      '+9876543210': '654321'
    } : undefined
  });
});

// Phone auth status endpoint
router.get('/status', (req, res) => {
  const firebaseConfigured = !!(process.env.FIREBASE_SERVICE_ACCOUNT || 
    (process.env.NODE_ENV === 'development'));

  res.json({
    success: true,
    message: 'Phone authentication service status',
    phoneAuth: {
      enabled: firebaseConfigured,
      provider: 'Firebase',
      testMode: process.env.NODE_ENV === 'development'
    }
  });
});

export default router;
