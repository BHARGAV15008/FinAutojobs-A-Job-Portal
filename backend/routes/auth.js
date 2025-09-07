import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
  sendEmailOTP,
  verifyEmailOTP,
  sendSMSOTP,
  verifySMSOTP,
  forgotPassword,
  resetPassword,
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

// OTP verification routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/send-sms-otp', sendSMSOTP);
router.post('/verify-sms-otp', verifySMSOTP);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Export authenticateToken middleware for use in other routes
export { authenticateToken };

export default router;
