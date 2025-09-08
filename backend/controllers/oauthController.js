import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, userSessions } from '../schema.js';
import { eq } from 'drizzle-orm';
import { generateToken, generateRefreshToken } from './authController.js';
import { z } from 'zod';

// OAuth configuration validation
const oauthConfigSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  MICROSOFT_CLIENT_ID: z.string().min(1),
  MICROSOFT_CLIENT_SECRET: z.string().min(1),
  APPLE_CLIENT_ID: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
  APPLE_KEY_ID: z.string().min(1),
  APPLE_PRIVATE_KEY: z.string().min(1)
});

// Validate OAuth configuration
const oauthConfig = oauthConfigSchema.safeParse({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
  APPLE_KEY_ID: process.env.APPLE_KEY_ID,
  APPLE_PRIVATE_KEY: process.env.APPLE_PRIVATE_KEY
});

if (!oauthConfig.success) {
  console.warn('OAuth configuration incomplete:', oauthConfig.error.message);
}

// Request validation schemas
const googleOAuthSchema = z.object({
  token: z.string().min(1),
  role: z.enum(['jobseeker', 'recruiter', 'admin']).optional().default('jobseeker')
});

const microsoftOAuthSchema = z.object({
  token: z.string().min(1),
  role: z.enum(['jobseeker', 'recruiter', 'admin']).optional().default('jobseeker')
});

const appleOAuthSchema = z.object({
  identityToken: z.string().min(1),
  authorizationCode: z.string().optional(),
  role: z.enum(['jobseeker', 'recruiter', 'admin']).optional().default('jobseeker')
});

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
    // Validate request body
    const validatedData = googleOAuthSchema.parse(req.body);
    const { token, role } = validatedData;
    
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        message: 'Google OAuth is not configured'
      });
    }
    
    // Verify Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    
    if (!response.ok) {
      return res.status(401).json({
        message: 'Invalid Google token',
        code: 'INVALID_GOOGLE_TOKEN'
      });
    }
    
    const googleData = await response.json();
    
    // Verify the token is intended for our client
    if (googleData.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        message: 'Token audience mismatch',
        code: 'TOKEN_AUDIENCE_MISMATCH'
      });
    }
    
    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
    
    if (!userResponse.ok) {
      return res.status(401).json({
        message: 'Failed to fetch user info from Google',
        code: 'USER_INFO_FETCH_FAILED'
      });
    }
    
    const userData = await userResponse.json();
    
    // Validate required user data
    if (!userData.email || !userData.id) {
      return res.status(400).json({
        message: 'Incomplete user data from Google',
        code: 'INCOMPLETE_USER_DATA'
      });
    }
    
    const oauthData = {
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      picture: userData.picture,
      providerId: userData.id
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'google');
    
    // Update role if specified and different from current
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
      refreshToken,
      provider: 'google'
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({
      message: 'Google OAuth authentication failed',
      code: 'OAUTH_ERROR'
    });
  }
};

// Microsoft OAuth login
export const microsoftOAuth = async (req, res) => {
  try {
    // Validate request body
    const validatedData = microsoftOAuthSchema.parse(req.body);
    const { token, role } = validatedData;
    
    // Check if Microsoft OAuth is configured
    if (!process.env.MICROSOFT_CLIENT_ID) {
      return res.status(503).json({
        message: 'Microsoft OAuth is not configured',
        code: 'MICROSOFT_OAUTH_NOT_CONFIGURED'
      });
    }
    
    // Verify Microsoft token
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({
        message: 'Invalid Microsoft token',
        code: 'INVALID_MICROSOFT_TOKEN'
      });
    }
    
    const userData = await response.json();
    
    // Validate required user data
    if (!userData.id || (!userData.mail && !userData.userPrincipalName)) {
      return res.status(400).json({
        message: 'Incomplete user data from Microsoft',
        code: 'INCOMPLETE_USER_DATA'
      });
    }
    
    const oauthData = {
      email: userData.mail || userData.userPrincipalName,
      name: userData.displayName || userData.mail?.split('@')[0] || userData.userPrincipalName?.split('@')[0],
      picture: null, // Microsoft Graph API requires separate call for photo
      providerId: userData.id
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'microsoft');
    
    // Update role if specified and different from current
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
      refreshToken,
      provider: 'microsoft'
    });
    
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({
      message: 'Microsoft OAuth authentication failed',
      code: 'OAUTH_ERROR'
    });
  }
};

// Apple OAuth login
export const appleOAuth = async (req, res) => {
  try {
    // Validate request body
    const validatedData = appleOAuthSchema.parse(req.body);
    const { identityToken, authorizationCode, role } = validatedData;
    
    // Check if Apple OAuth is configured
    if (!process.env.APPLE_CLIENT_ID) {
      return res.status(503).json({
        message: 'Apple OAuth is not configured',
        code: 'APPLE_OAUTH_NOT_CONFIGURED'
      });
    }
    
    // Validate token format
    if (!identityToken || typeof identityToken !== 'string') {
      return res.status(400).json({
        message: 'Apple identity token is required and must be a string',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }
    
    // Decode Apple identity token (simplified - in production use proper JWT verification)
    const tokenParts = identityToken.split('.');
    if (tokenParts.length !== 3) {
      return res.status(400).json({
        message: 'Invalid Apple token format',
        code: 'INVALID_TOKEN_STRUCTURE'
      });
    }
    
    let payload;
    try {
      payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    } catch (error) {
      return res.status(400).json({
        message: 'Failed to decode Apple token',
        code: 'TOKEN_DECODE_ERROR'
      });
    }
    
    // Verify token audience and issuer
    if (payload.aud !== process.env.APPLE_CLIENT_ID) {
      return res.status(401).json({
        message: 'Token audience mismatch',
        code: 'TOKEN_AUDIENCE_MISMATCH'
      });
    }
    
    if (payload.iss !== 'https://appleid.apple.com') {
      return res.status(401).json({
        message: 'Invalid token issuer',
        code: 'INVALID_TOKEN_ISSUER'
      });
    }
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Validate required user data
    if (!payload.sub) {
      return res.status(400).json({
        message: 'Missing user identifier in Apple token',
        code: 'MISSING_USER_ID'
      });
    }
    
    const oauthData = {
      email: payload.email,
      name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Apple User'),
      picture: null,
      providerId: payload.sub
    };
    
    // Create or update user
    let user = await createOrUpdateOAuthUser(oauthData, 'apple');
    
    // Update role if specified and different from current
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
      refreshToken,
      provider: 'apple'
    });
    
  } catch (error) {
    console.error('Apple OAuth error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({
      message: 'Apple OAuth authentication failed',
      code: 'OAUTH_ERROR'
    });
  }
};

// Get OAuth configuration for frontend
export const getOAuthConfig = async (req, res) => {
  try {
    res.json({
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        enabled: !!process.env.GOOGLE_CLIENT_ID
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        enabled: !!process.env.MICROSOFT_CLIENT_ID
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        enabled: !!process.env.APPLE_CLIENT_ID
      },
      redirectUris: {
        google: process.env.GOOGLE_REDIRECT_URI,
        microsoft: process.env.MICROSOFT_REDIRECT_URI,
        apple: process.env.APPLE_REDIRECT_URI
      }
    });
  } catch (error) {
    console.error('Get OAuth config error:', error);
    res.status(500).json({
      message: 'Failed to get OAuth configuration',
      code: 'CONFIG_FETCH_ERROR'
    });
  }
};
