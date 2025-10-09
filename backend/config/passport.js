import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/User.js';
import { createUserProfile } from '../services/profileService.js';

// Helper function to find or create user from OAuth profile
const findOrCreateUser = async (profile, provider) => {
  try {
    const { id: providerId, emails, name, displayName, photos } = profile;
    const email = emails?.[0]?.value;
    
    if (!email) {
      throw new Error('Email is required from OAuth provider');
    }

    // Check if user exists with this OAuth provider
    let user = await User.findOne({
      [`oauthProviders.${provider}.id`]: providerId
    });

    if (user) {
      // Update last login for existing OAuth user
      user.lastLogin = new Date();
      await user.save();
      return { user, isNewUser: false };
    }

    // Check if user exists with this email
    user = await User.findOne({ email });

    if (user) {
      // Link OAuth account to existing user
      user.oauthProviders = user.oauthProviders || {};
      user.oauthProviders[provider] = {
        id: providerId,
        email,
        linkedAt: new Date()
      };
      user.lastLogin = new Date();
      await user.save();
      return { user, isNewUser: false };
    }

    // Create new user
    const firstName = name?.givenName || displayName?.split(' ')[0] || 'User';
    const lastName = name?.familyName || displayName?.split(' ').slice(1).join(' ') || '';
    const avatar = photos?.[0]?.value;

    const newUser = new User({
      firstName,
      lastName,
      email,
      isEmailVerified: true, // OAuth emails are considered verified
      oauthProviders: {
        [provider]: {
          id: providerId,
          email,
          linkedAt: new Date()
        }
      },
      profile: {
        avatar,
        completionPercentage: 20
      },
      lastLogin: new Date(),
      registrationSource: provider
    });

    await newUser.save();
    
    // Note: Role selection will be handled separately for OAuth users
    return { user: newUser, isNewUser: true };

  } catch (error) {
    console.error(`Error in findOrCreateUser for ${provider}:`, error);
    throw error;
  }
};

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { user, isNewUser } = await findOrCreateUser(profile, 'google');
    return done(null, user, { isNewUser });
  } catch (error) {
    console.error('Google OAuth Strategy Error:', error);
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || '/api/auth/microsoft/callback',
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { user, isNewUser } = await findOrCreateUser(profile, 'microsoft');
    return done(null, user, { isNewUser });
  } catch (error) {
    console.error('Microsoft OAuth Strategy Error:', error);
    return done(error, null);
  }
}));

// Apple OAuth Strategy
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
  callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback',
  scope: ['name', 'email']
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    // Apple returns user info differently
    const appleProfile = {
      id: profile.id,
      emails: [{ value: profile.email }],
      name: {
        givenName: profile.name?.firstName,
        familyName: profile.name?.lastName
      },
      displayName: profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : profile.email
    };

    const { user, isNewUser } = await findOrCreateUser(appleProfile, 'apple');
    return done(null, user, { isNewUser });
  } catch (error) {
    console.error('Apple OAuth Strategy Error:', error);
    return done(error, null);
  }
}));

// Serialize user for session (not used in JWT setup, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session (not used in JWT setup, but required by passport)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
