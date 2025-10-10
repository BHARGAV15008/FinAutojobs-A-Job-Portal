import express from 'express';
import OTPService from '../services/otpService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const otpService = new OTPService();

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/otp/send
 * @desc Send OTP to email
 * @access Public
 */
router.post('/send', otpRateLimit, async (req, res) => {
  try {
    const { email, purpose = 'verification', userData = {} } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Send OTP
    const result = await otpService.sendOTP(email.toLowerCase(), purpose, userData);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email: email.toLowerCase(),
        purpose,
        expiryMinutes: result.expiryMinutes
      }
    });

  } catch (error) {
    console.error('❌ Error in OTP send route:', error);
    
    // Handle specific error cases
    if (error.message.includes('wait')) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: 'COOLDOWN_ACTIVE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      code: 'OTP_SEND_FAILED'
    });
  }
});

/**
 * @route POST /api/otp/verify
 * @desc Verify OTP
 * @access Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, otp, purpose = 'verification' } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate OTP format (should be digits only)
    if (!/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format',
        code: 'INVALID_OTP_FORMAT'
      });
    }

    // Verify OTP
    const result = otpService.verifyOTP(email.toLowerCase(), otp, purpose);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          email: email.toLowerCase(),
          purpose,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        code: result.code,
        data: result.remainingAttempts ? { remainingAttempts: result.remainingAttempts } : null
      });
    }

  } catch (error) {
    console.error('❌ Error in OTP verify route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      code: 'OTP_VERIFY_FAILED'
    });
  }
});

/**
 * @route POST /api/otp/resend
 * @desc Resend OTP
 * @access Public
 */
router.post('/resend', otpRateLimit, async (req, res) => {
  try {
    const { email, purpose = 'verification', userData = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    // Send new OTP (this will replace the old one)
    const result = await otpService.sendOTP(email.toLowerCase(), purpose, userData);
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        email: email.toLowerCase(),
        purpose,
        expiryMinutes: result.expiryMinutes
      }
    });

  } catch (error) {
    console.error('❌ Error in OTP resend route:', error);
    
    if (error.message.includes('wait')) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: 'COOLDOWN_ACTIVE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      code: 'OTP_RESEND_FAILED'
    });
  }
});

/**
 * @route GET /api/otp/stats
 * @desc Get OTP statistics (for debugging)
 * @access Private (should be protected in production)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = otpService.getOTPStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting OTP stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP statistics'
    });
  }
});

export default router;
