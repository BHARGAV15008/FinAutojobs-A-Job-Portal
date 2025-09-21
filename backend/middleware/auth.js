import jwt from 'jsonwebtoken';
import { getUserModel } from '../models/schemas/users/UserFactory.js';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    // Get user from database based on role
    const UserModel = getUserModel(decoded.userRole);
    const user = await UserModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      userRole: user.role,
      email: user.email,
      name: user.name,
      ...user.toObject()
    };
    
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

// Middleware to require recruiter role
export const requireRecruiter = requireRole(['recruiter', 'admin']);

// Middleware to require applicant role
export const requireApplicant = requireRole(['applicant', 'admin']);

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireRecruiter,
  requireApplicant
};
