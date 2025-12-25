import express from 'express';
import jwt from 'jsonwebtoken';
import { BaseUser, Applicant } from '../models/UserModels.js';
import { verifyIdToken } from '../config/firebase.js';

const router = express.Router();

// Verify a Firebase ID token (from Google, etc.) and login/register user
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken, role = 'applicant' } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const { email, name, uid, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not found in token. Ensure Google Sign-In returns email scope.'
      });
    }

    console.log('🔥 Firebase token verification request:', { email, name, role });

    // Check if user already exists
    let user = await BaseUser.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (user) {
      // Existing user logging in
      console.log('✅ Existing user found, updating for login:', user._id);
      user.lastLogin = new Date();
      // Ensure oauthProviders array exists
      user.oauthProviders = user.oauthProviders || [];
      const providerIndex = user.oauthProviders.findIndex(p => p.provider === 'google');
      if (providerIndex > -1) {
        user.oauthProviders[providerIndex].providerId = uid;
        user.oauthProviders[providerIndex].verified = true;
      } else {
        user.oauthProviders.push({
          provider: 'google',
          providerId: uid,
          email: email,
          name: name,
          verified: true,
          linkedAt: new Date(),
        });
      }
      
      await user.save();
    } else {
      // Create new user (registration)
      isNewUser = true;
      console.log('✅ Creating new user from Firebase token:', email);
      
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || 'New';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      user = new Applicant({
        email: email.toLowerCase(),
        firstName,
        lastName,
        role: 'applicant', // Default role
        isEmailVerified: true,
        profileImage: picture,
        oauthProviders: [{
          provider: 'google',
          providerId: uid,
          email: email,
          name: name,
          verified: true,
          linkedAt: new Date(),
        }],
        lastLogin: new Date()
      });

      await user.save();
      console.log('✅ New user created with ID:', user._id);
    }

    // Generate our backend's JWT token
    const appToken = jwt.sign(
      { 
        id: user._id, 
        userId: user._id,
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      isNewUser,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          profileImage: user.profileImage,
        },
        token: appToken,
      }
    });

  } catch (error) {
    console.error('❌ Firebase token verification error:', error);
    
    if (error.message.includes('Firebase')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired Firebase token.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Firebase authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
