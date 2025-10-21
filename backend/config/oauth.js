import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import session from 'express-session';
import { BaseUser, createUserByRole } from '../models/UserModels.js';
import jwt from 'jsonwebtoken';

// JWT Secret function
const getJWTSecret = () => {
  return process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
};

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'finautojobs-session-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.role });
});

passport.deserializeUser(async (userData, done) => {
  try {
    const user = await BaseUser.findById(userData.id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth profile:', profile.id, profile.emails[0].value);
      
      // Check if user already exists
      let user = await BaseUser.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        console.log('✅ Existing user found:', user.email);
        return done(null, user);
      }

      // Create new user - default to applicant role
      const userData = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        role: 'applicant', // Default role
        isEmailVerified: true,
        profileImage: profile.photos[0]?.value || '',
        authProvider: 'google'
      };

      user = await createUserByRole(userData);
      console.log('✅ New Google user created:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read'],
    tenant: process.env.MICROSOFT_TENANT_ID || 'common'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Microsoft OAuth profile:', profile.id, profile.emails[0].value);
      
      // Check if user already exists
      let user = await BaseUser.findOne({ 
        $or: [
          { microsoftId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        // Update Microsoft ID if not set
        if (!user.microsoftId) {
          user.microsoftId = profile.id;
          await user.save();
        }
        console.log('✅ Existing user found:', user.email);
        return done(null, user);
      }

      // Create new user - default to applicant role
      const userData = {
        microsoftId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        role: 'applicant', // Default role
        isEmailVerified: true,
        authProvider: 'microsoft'
      };

      user = await createUserByRole(userData);
      console.log('✅ New Microsoft user created:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ Microsoft OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Apple OAuth Strategy (Note: Apple OAuth is more complex and requires additional setup)
// For now, we'll create a placeholder that can be implemented when Apple credentials are available
export const configureAppleOAuth = () => {
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    console.log('🍎 Apple OAuth configuration detected - implementation needed');
    // Apple OAuth implementation would go here
    // Requires additional setup with Apple Sign-In service
  }
};

// OAuth success handler
export const handleOAuthSuccess = async (user, role = null) => {
  try {
    // If role is specified and user has multiple roles, handle role selection
    if (role && user.role !== role) {
      // Check if user has this role
      const userWithRole = await BaseUser.findOne({ 
        email: user.email, 
        role: role 
      });
      
      if (userWithRole) {
        user = userWithRole;
      }
    }

    // Generate JWT token
    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      { 
        id: user._id, 
        userId: user.userId,
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return {
      success: true,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      },
      token
    };
  } catch (error) {
    console.error('❌ OAuth success handler error:', error);
    throw error;
  }
};

export default passport;
