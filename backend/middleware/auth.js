import jwt from 'jsonwebtoken';
import User from '../models/UserMongoose.js';

// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'NO_TOKEN'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // Check if session exists (single session enforcement)
    const sessionExists = user.active_sessions.some(
      session => session.session_id === decoded.sessionId
    );
    
    if (!sessionExists) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid',
        error: 'INVALID_SESSION'
      });
    }
    
    // Add user info to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: decoded.sessionId
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

export default authenticateToken;
