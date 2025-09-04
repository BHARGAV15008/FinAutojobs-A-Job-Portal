import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
  authenticateToken
} from '../controllers/authController.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile
router.get('/me', authenticateToken, getProfile);

// Refresh token
router.post('/refresh', refreshToken);

// Logout user
router.post('/logout', authenticateToken, logout);

// Change password
router.put('/change-password', authenticateToken, changePassword);

// Export authenticateToken middleware for use in other routes
export { authenticateToken };

export default router;
