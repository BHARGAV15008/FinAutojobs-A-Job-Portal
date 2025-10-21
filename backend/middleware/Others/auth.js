import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { BaseUser, getUserModel } from '../../models/UserModels.js';
import { securityLogger } from './logger.js';

// Enhanced token generation with session management
export const generateToken = (payload, expiresIn = '15m', sessionId = null) => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(), // JWT ID for token tracking
    sessionId: sessionId || crypto.randomUUID(), // Session ID for single login
    iss: 'finautojobs-api', // Issuer
    aud: 'finautojobs-client' // Audience
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
    expiresIn,
    algorithm: 'HS256'
  });
};

// Generate refresh token with enhanced security
export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(),
    type: 'refresh',
    iss: 'finautojobs-api',
    aud: 'finautojobs-client'
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

// Generate token pair (access + refresh) with session management
export const generateTokenPair = (payload, sessionId = null) => {
  const sessionIdToUse = sessionId || crypto.randomUUID();
  const accessToken = generateToken(payload, '15m', sessionIdToUse);
  const refreshToken = generateRefreshToken({...payload, sessionId: sessionIdToUse});
  
  return {
    accessToken,
    refreshToken,
    sessionId: sessionIdToUse,
    tokenType: 'Bearer',
    expiresIn: 900, // 15 minutes in seconds
    refreshExpiresIn: 604800 // 7 days in seconds
  };
};

// Enhanced token verification with detailed error handling
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'finautojobs-api',
      audience: 'finautojobs-client'
    });
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Enhanced refresh token verification
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: 'finautojobs-api',
      audience: 'finautojobs-client'
    });
    
    // Verify it's actually a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Token refresh endpoint logic
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user to ensure they still exist and are active
    const UserModel = getUserModel(decoded.role);
    const user = await UserModel.findById(decoded.userId);
    
    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }
    
    // Generate new token pair
    const tokenPair = generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    return tokenPair;
  } catch (error) {
    throw error;
  }
};

// Enhanced authentication middleware with security logging
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from multiple sources
    let token = null;
    
    // Check Authorization header (Bearer token)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies as fallback
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    // Check query parameter (for specific endpoints like file downloads)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      securityLogger.warn('MISSING_TOKEN', { ip: req.ip, userAgent: req.get('User-Agent') });
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    // Debug: Log token info
    console.log(`🔍 Verifying token: ${token.substring(0, 20)}...`);
    
    // Verify token with enhanced error handling
    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('✅ Token verified successfully, decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    } catch (error) {
      console.error('❌ Token verification failed:', {
        error: error.message,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
        jwtSecret: process.env.JWT_SECRET ? 'set' : 'not set',
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      });
      securityLogger.error('INVALID_TOKEN', { ip: req.ip, error: error.message });

      let errorCode = 'INVALID_TOKEN';
      let statusCode = 403;

      if (error.message === 'Token expired') {
        errorCode = 'TOKEN_EXPIRED';
        statusCode = 401;
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message,
        code: errorCode
      });
    }
    
    // Find user in database with additional checks
    const UserModel = getUserModel(decoded.role);
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      securityLogger.warn('USER_NOT_FOUND', { ip: req.ip, userId: decoded.userId });
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if user account is locked (skip for now - field doesn't exist in MongoDB model)
    // if (user.isLocked) {
    //   securityLogger.warn('ACCOUNT_LOCKED', { ip: req.ip, userId: user._id });
    //   return res.status(423).json({
    //     success: false,
    //     message: 'Account is temporarily locked',
    //     code: 'ACCOUNT_LOCKED'
    //   });
    // }
    
    // Check if user account is active
    if (user.status !== 'active') {
      securityLogger.warn('INACTIVE_ACCOUNT', { ip: req.ip, userId: user._id, status: user.status });
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}`,
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Check if session is still valid (single session enforcement)
    if (decoded.sessionId) {
      const hasValidSession = user.active_sessions && user.active_sessions.some(
        session => session.session_id === decoded.sessionId
      );
      
      if (!hasValidSession) {
        securityLogger.warn('INVALID_SESSION', { 
          ip: req.ip, 
          userId: user._id, 
          sessionId: decoded.sessionId 
        });
        return res.status(401).json({
          success: false,
          message: 'Session expired or invalid. Please login again.',
          code: 'SESSION_INVALID'
        });
      }
    }
    
    // Update user activity tracking (skip for now - fields don't exist in MongoDB model)
    // user.analytics.lastActivity = new Date();
    // user.analytics.loginCount += 1;
    
    // Update last login time (skip for now)
    // const now = new Date();
    // if (!user.last_login || (now - user.last_login) > 60000) {
    //   user.last_login = now;
    // }
    
    // await user.save();
    
    // Attach comprehensive user data to request object
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      // normalizedRole: user.normalizedRole, // Skip - field doesn't exist
      status: user.status,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      profile_completed: user.profile_completed,
      created_at: user.createdAt,
      full_name: user.full_name,
      phone: user.phone,
      profile_picture: user.profile_picture,
      company_id: user.company_id,
      preferences: user.preferences,
      tokenJti: decoded.jti, // For token tracking
      tokenIat: decoded.iat
    };
    
    // Set req.userId for backward compatibility
    req.userId = user._id;
    
    // Add request metadata for security tracking
    req.authMetadata = {
      tokenSource: authHeader ? 'header' : (req.cookies.accessToken ? 'cookie' : 'query'),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      timestamp: new Date()
    };
    
    next();
  } catch (error) {
    console.error('AUTH_ERROR:', { error: error.message, ip: req.ip });
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }
    
    // Flatten roles array to handle both authorize('admin') and authorize(['admin']) calls
    const flatRoles = roles.flat();
    
    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }
    
    next()
  }
}

// Alias for backward compatibility
export const requireRole = authorize

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token) {
      req.user = null
      return next()
    }
    
    try {
      const decoded = verifyToken(token)
      
      const UserModel = getUserModel(decoded.role);
      const user = await UserModel.findById(decoded.userId)
      
      if (user && user.status === 'active') {
        req.user = {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          profile_completed: user.profile_completed,
          created_at: user.createdAt
        }
      } else {
        req.user = null
      }
    } catch (error) {
      req.user = null
    }
    
    next()
  } catch (error) {
    console.error('Optional auth error:', error)
    req.user = null
    next()
  }
}

// Middleware to check if user's email is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }
  
  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    })
  }
  
  next()
}

// Middleware to check if user's profile is completed
export const requireProfileCompletion = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }
  
  if (!req.user.profile_completed) {
    return res.status(403).json({
      success: false,
      message: 'Profile completion required'
    })
  }
  
  next()
}

// Ownership middleware
export const requireOwnership = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const resourceId = req.params[paramName];
      const userId = req.user.id;

      if (req.user.role === 'admin') {
        // Admins can access any resource
        return next();
      }

      if (resourceId === userId) {
        // Users can access their own resources
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only access your own resources'
      });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during ownership check'
      });
    }
  };
};

// Session management middleware
export const trackUserSession = async (req, res, next) => {
  if (req.user && req.authMetadata) {
    try {
      const UserModel = getUserModel(req.user.role);
      const user = await UserModel.findById(req.user.userId);
      
      if (user) {
        // Update or add session info
        const sessionId = req.authMetadata.sessionId || req.user.tokenJti;
        const existingSession = user.active_sessions.find(s => s.session_id === sessionId);
        
        if (existingSession) {
          existingSession.last_activity = new Date();
          existingSession.ip_address = req.authMetadata.ipAddress;
        } else {
          // Add new session (limit to 5 active sessions)
          if (user.active_sessions.length >= 5) {
            user.active_sessions.shift(); // Remove oldest session
          }
          
          user.active_sessions.push({
            session_id: sessionId,
            device_info: req.authMetadata.userAgent,
            ip_address: req.authMetadata.ipAddress,
            created_at: new Date(),
            last_activity: new Date()
          });
        }
        
        await user.save();
      }
    } catch (error) {
      console.error('Session tracking error:', error);
      // Don't fail the request for session tracking errors
    }
  }
  
  next();
};

// Rate limiting for authentication attempts
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + ':' + (req.body.email || req.body.username || 'unknown');
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const attemptData = attempts.get(key);
    
    if (now > attemptData.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attemptData.count >= maxAttempts) {
      securityLogger.warn('AUTH_RATE_LIMIT', { 
        ip: req.ip,
        attempts: attemptData.count,
        identifier: key.split(':')[1]
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'AUTH_RATE_LIMIT',
        retryAfter: Math.ceil((attemptData.resetTime - now) / 1000)
      });
    }
    
    attemptData.count++;
    next();
  };
};

// Device fingerprinting middleware
export const deviceFingerprint = (req, res, next) => {
  const fingerprint = {
    userAgent: req.get('User-Agent'),
    acceptLanguage: req.get('Accept-Language'),
    acceptEncoding: req.get('Accept-Encoding'),
    ipAddress: req.ip,
    timestamp: new Date()
  };
  
  req.deviceFingerprint = fingerprint;
  next();
};

// Two-factor authentication middleware
export const requireTwoFactor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  try {
    const UserModel = getUserModel(req.user.role);
    const user = await UserModel.findById(req.user.userId);
    
    if (user.two_factor_enabled && !req.user.twoFactorVerified) {
      return res.status(403).json({
        success: false,
        message: 'Two-factor authentication required',
        code: 'TWO_FACTOR_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Two-factor check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking two-factor authentication',
      code: 'TWO_FACTOR_ERROR'
    });
  }
};

// API key authentication (for external integrations)
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
    }
    
    // In a real implementation, you'd validate against stored API keys
    // For now, we'll use a simple check
    if (apiKey !== process.env.API_KEY) {
      securityLogger.error('INVALID_API_KEY', { ip: req.ip, providedKey: apiKey.substring(0, 8) + '...' });
      return res.status(403).json({
        success: false,
        message: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }
    
    req.apiAuthenticated = true;
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'API key authentication error',
      code: 'API_AUTH_ERROR'
    });
  }
};

// Role-specific middleware shortcuts
export const requireRecruiter = requireRole('recruiter');
export const requireApplicant = requireRole('applicant');
export const requireAdmin = requireRole('admin');

// Session management functions
export const createUserSession = async (userId, deviceInfo, ipAddress) => {
  try {
    const sessionId = crypto.randomUUID();
    // Note: We need role to get the right model, but it's not available here
    // Using BaseUser as fallback for session management
    const user = await BaseUser.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Clear existing sessions (single session enforcement)
    user.active_sessions = [];
    
    // Add new session
    const newSession = {
      session_id: sessionId,
      device_info: deviceInfo,
      ip_address: ipAddress,
      created_at: new Date(),
      last_activity: new Date()
    };
    
    user.active_sessions.push(newSession);
    await user.save();
    
    console.log(`✅ Session created for user ${userId}: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error('❌ Failed to create session:', error);
    throw error;
  }
};

export const invalidateUserSession = async (userId, sessionId = null) => {
  try {
    // Using BaseUser for session management
    const user = await BaseUser.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (sessionId) {
      // Remove specific session
      user.active_sessions = user.active_sessions.filter(
        session => session.session_id !== sessionId
      );
    } else {
      // Remove all sessions (logout from all devices)
      user.active_sessions = [];
    }
    
    await user.save();
    console.log(`✅ Session(s) invalidated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to invalidate session:', error);
    throw error;
  }
};

export const checkUserSession = async (userId, sessionId) => {
  try {
    // Using BaseUser for session management
    const user = await BaseUser.findById(userId);
    
    if (!user) {
      return false;
    }
    
    const validSession = user.active_sessions.find(
      session => session.session_id === sessionId
    );
    
    return !!validSession;
  } catch (error) {
    console.error('❌ Failed to check session:', error);
    return false;
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  refreshAccessToken,
  authenticateToken,
  authorize,
  requireRole,
  optionalAuth,
  requireEmailVerification,
  requireProfileCompletion,
  requireOwnership,
  trackUserSession,
  authRateLimit,
  deviceFingerprint,
  requireTwoFactor,
  authenticateApiKey
};
