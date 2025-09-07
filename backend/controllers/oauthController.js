import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, userSessions } from '../schema.js';
import { eq } from 'drizzle-orm';
import { generateToken, generateRefreshToken } from './authController.js';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

// Apple OAuth configuration
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

// Helper function to create or update user from OAuth data
const createOrUpdateOAuthUser = async (oauthData, provider) => {
  try {
    const { email, name, picture, providerId } = oauthData;
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;
    
    if (existingUser.length > 0) {
      // Update existing user
      user = existingUser[0];
      
      // Update OAuth provider info if not already set
      const updateData = {
        updated_at: new Date().toISOString()
      };
      
      if (!user.profile_picture && picture) {
        updateData.profile_picture = picture;
      }
      
      if (!user.full_name && name) {
        updateData.full_name = name;
      }
      
      // Update OAuth provider field
      updateData[`${provider}_id`] = providerId;
      updateData.email_verified = true; // OAuth providers verify emails
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
        
      user = { ...user, ...updateData };
    } else {
      // Create new user
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const newUserData = {
        username: username,
        email: email,
        password: 'oauth_user', // OAuth users don't have passwords
        full_name: name || '',
        role: 'jobseeker', // Default role
        status: 'active',
        email_verified: true,
        profile_picture: picture || null,
        [`${provider}_id`]: providerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const newUser = await db.insert(users).values(newUserData).returning();
      user = newUser[0];
    }
    
    return user;
  } catch (error) {
    console.error('Error creating/updating OAuth user:', error);
    throw error;
  }
};

// Google OAuth login
export const googleOAuth = async (req, res) => {
  try {
    const { token, role = 'jobseeker' } = req.body;
    
    if (!token) {
      return res.status(400).json({
        message: 'Google token is required'
      });
    }
    
    // Verify Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    
    if (!response.ok) {
      return res.status(401).json({
        message: 'Invalid Google token'
      });
    }
    
    const googleData = await response.json();
    
    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
    const userData = await userResponse.json();
    
    const oauthData = {
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      providerId: userData.id
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'google');
    
    // Update role if specified and user is new
    if (role && role !== user.role) {
      await db.update(users)
        .set({ role: role })
        .where(eq(users.id, user.id));
      user.role = role;
    }
    
    // Generate JWT tokens
    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store session
    await db.insert(userSessions).values({
      user_id: user.id,
      token: jwtToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Google OAuth login successful',
      user: userWithoutPassword,
      token: jwtToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      message: 'Google OAuth authentication failed'
    });
  }
};

// Microsoft OAuth login
export const microsoftOAuth = async (req, res) => {
  try {
    const { token, role = 'jobseeker' } = req.body;
    
    if (!token) {
      return res.status(400).json({
        message: 'Microsoft token is required'
      });
    }
    
    // Verify Microsoft token
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({
        message: 'Invalid Microsoft token'
      });
    }
    
    const userData = await response.json();
    
    const oauthData = {
      email: userData.mail || userData.userPrincipalName,
      name: userData.displayName,
      picture: null, // Microsoft Graph API requires separate call for photo
      providerId: userData.id
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'microsoft');
    
    // Update role if specified and user is new
    if (role && role !== user.role) {
      await db.update(users)
        .set({ role: role })
        .where(eq(users.id, user.id));
      user.role = role;
    }
    
    // Generate JWT tokens
    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store session
    await db.insert(userSessions).values({
      user_id: user.id,
      token: jwtToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Microsoft OAuth login successful',
      user: userWithoutPassword,
      token: jwtToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    res.status(500).json({
      message: 'Microsoft OAuth authentication failed'
    });
  }
};

// Apple OAuth login
export const appleOAuth = async (req, res) => {
  try {
    const { identityToken, authorizationCode, role = 'jobseeker' } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({
        message: 'Apple identity token is required'
      });
    }
    
    // Decode Apple identity token (simplified - in production use proper JWT verification)
    const tokenParts = identityToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    // Verify token audience and issuer
    if (payload.aud !== APPLE_CLIENT_ID || payload.iss !== 'https://appleid.apple.com') {
      return res.status(401).json({
        message: 'Invalid Apple token'
      });
    }
    
    const oauthData = {
      email: payload.email,
      name: payload.name || 'Apple User',
      picture: null,
      providerId: payload.sub
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'apple');
    
    // Update role if specified and user is new
    if (role && role !== user.role) {
      await db.update(users)
        .set({ role: role })
        .where(eq(users.id, user.id));
      user.role = role;
    }
    
    // Generate JWT tokens
    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store session
    await db.insert(userSessions).values({
      user_id: user.id,
      token: jwtToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Apple OAuth login successful',
      user: userWithoutPassword,
      token: jwtToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({
      message: 'Apple OAuth authentication failed'
    });
  }
};

// Get OAuth configuration for frontend
export const getOAuthConfig = async (req, res) => {
  try {
    res.json({
      google: {
        clientId: GOOGLE_CLIENT_ID,
        enabled: !!GOOGLE_CLIENT_ID
      },
      microsoft: {
        clientId: MICROSOFT_CLIENT_ID,
        enabled: !!MICROSOFT_CLIENT_ID
      },
      apple: {
        clientId: APPLE_CLIENT_ID,
        enabled: !!APPLE_CLIENT_ID
      }
    });
  } catch (error) {
    console.error('Get OAuth config error:', error);
    res.status(500).json({
      message: 'Failed to get OAuth configuration'
    });
  }
};
