/**
 * Authentication Routes
 * 
 * Defines API endpoints for user authentication and profile management
 * using Mongoose controllers and middleware.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import authController from '../../controllers/mongoose/authController.js';

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: {
    firstName: {
      notEmpty: true,
      isLength: { options: { min: 2, max: 50 } },
      errorMessage: 'First name must be between 2 and 50 characters'
    },
    lastName: {
      notEmpty: true,
      isLength: { options: { min: 2, max: 50 } },
      errorMessage: 'Last name must be between 2 and 50 characters'
    },
    email: {
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'Please provide a valid email address'
    },
    password: {
      isLength: { options: { min: 8 } },
      matches: {
        options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      },
      errorMessage: 'Password must be at least 8 characters long'
    },
    role: {
      isIn: {
        options: [['applicant', 'recruiter', 'admin']],
        errorMessage: 'Role must be applicant, recruiter, or admin'
      }
    }
  }
};

const loginSchema = {
  body: {
    email: {
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'Please provide a valid email address'
    },
    password: {
      notEmpty: true,
      errorMessage: 'Password is required'
    }
  }
};

const changePasswordSchema = {
  body: {
    currentPassword: {
      notEmpty: true,
      errorMessage: 'Current password is required'
    },
    newPassword: {
      isLength: { options: { min: 8 } },
      matches: {
        options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      },
      errorMessage: 'New password must be at least 8 characters long'
    }
  }
};

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { firstName, lastName, email, password, role, ...additionalData }
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password, role? }
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh', authController.refreshToken);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { ...profileData }
 */
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put('/change-password', 
  authenticateToken, 
  validateRequest(changePasswordSchema), 
  authController.changePassword
);

export default router;
