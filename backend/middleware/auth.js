import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import * as schema from '../schema.js';
import { eq } from 'drizzle-orm';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    // Get user from database
    const users = await db.select().from(schema.users).where(eq(schema.users.id, decoded.userId)).limit(1);
    
    if (!users.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = users[0];
    
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to require specific roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to require admin role
export const requireAdmin = requireRole(['admin']);

// Middleware to require employer role
export const requireEmployer = requireRole(['employer', 'admin']);

// Middleware to require jobseeker role
export const requireJobseeker = requireRole(['jobseeker', 'admin']);

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireEmployer,
  requireJobseeker
};
