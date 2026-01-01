import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/unified/BaseUser.js';
// Removed console.error import - using console.error instead

// Enhanced token generation with additional security
export const generateToken = (payload, expiresIn = '15m') => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(), // JWT ID for token tracking
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

// Generate token pair (access + refresh)
export const generateTokenPair = (payload) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
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
    const user = await User.findById(decoded.userId);
    
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
    
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      console.error('❌ MISSING_TOKEN');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Verify token with enhanced error handling
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error('❌ INVALID_TOKEN:', error.message);
      
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
    const user = await User.findById(decoded.userId).select('+last_login +login_attempts +lock_until');
    
    if (!user) {
      console.error('❌ USER_NOT_FOUND:', decoded.userId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if user account is locked
    if (user.isLocked) {
      console.error('❌ ACCOUNT_LOCKED:', user._id);
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    // Check if user account is active
    if (user.status !== 'active') {
      console.error('❌ INACTIVE_ACCOUNT:', { userId: user._id, status: user.status });
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}`,
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Update user activity tracking (with safe property access)
    if (user.analytics) {
      user.analytics.lastActivity = new Date();
      user.analytics.loginCount = (user.analytics.loginCount || 0) + 1;
    }
    
    // Update last login time (throttled to avoid too many DB writes)
    const now = new Date();
    if (!user.last_login || (now - user.last_login) > 60000) { // Only update if > 1 minute
      user.last_login = now;
    }
    
    // Save user updates safely
    try {
      await user.save();
    } catch (saveError) {
      console.warn('⚠️ Could not save user activity:', saveError.message);
    }
    
    // Attach comprehensive user data to request object (with safe property access)
    req.user = {
      id: user._id,
      userId: user._id,
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'applicant',
      status: user.status || 'active',
      email_verified: user.email_verified || user.isEmailVerified || false,
      phone_verified: user.phone_verified || user.isPhoneVerified || false,
      profile_completed: user.profile_completed || false,
      created_at: user.createdAt,
      full_name: user.fullName || user.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      phone: user.phone || '',
      profile_picture: user.profile_picture || user.profileImage || '',
      preferences: user.preferences || {},
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
    console.error('❌ AUTH_ERROR:', error.message);
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
      
      const user = await User.findById(decoded.userId)
      
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
      const user = await User.findById(req.user.userId);
      
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
      console.error('AUTH_RATE_LIMIT', req, { 
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
    const user = await User.findById(req.user.userId);
    
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
      console.error('INVALID_API_KEY', req, { providedKey: apiKey.substring(0, 8) + '...' });
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
