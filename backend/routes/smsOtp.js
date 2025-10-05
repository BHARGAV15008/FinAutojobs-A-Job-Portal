import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  generateAndSendSMSOTP, 
  verifySMSOTP, 
  sendOTPViaPreferredMethod,
  verifyOTPAnyMethod 
} from '../services/smsOtpService.js';

const router = express.Router();

// Validation middleware
const validatePhoneNumber = [
  body('phoneNumber')
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number')
];

const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

// Send SMS OTP
router.post('/send-sms', validatePhoneNumber, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, purpose = 'verification' } = req.body;

    const result = await generateAndSendSMSOTP(phoneNumber, purpose);

    res.json({
      success: true,
      message: result.message,
      data: {
        expiresIn: result.expiresIn,
        mock: result.mock || false
      }
    });

  } catch (error) {
    console.error('❌ Send SMS OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS OTP',
      error: error.message
    });
  }
});

// Verify SMS OTP
router.post('/verify-sms', [...validatePhoneNumber, ...validateOTP], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, otp, purpose = 'verification' } = req.body;

    const result = verifySMSOTP(phoneNumber, otp, purpose);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    }

  } catch (error) {
    console.error('❌ Verify SMS OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify SMS OTP',
      error: error.message
    });
  }
});

// Send OTP via preferred method (SMS or Email)
router.post('/send', [
  body('contact')
    .notEmpty()
    .withMessage('Contact (phone number or email) is required'),
  body('method')
    .isIn(['sms', 'email'])
    .withMessage('Method must be either "sms" or "email"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contact, method = 'sms', purpose = 'verification' } = req.body;

    // Additional validation for SMS
    if (method === 'sms' && !/^(\+91|91)?[6-9]\d{9}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian mobile number for SMS'
      });
    }

    // Additional validation for email
    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const result = await sendOTPViaPreferredMethod(contact, method, purpose);

    res.json({
      success: true,
      message: result.message,
      data: {
        method: method,
        contact: method === 'sms' ? contact.replace(/(\d{6})\d{4}/, '$1****') : contact.replace(/(.{2}).*@/, '$1***@'),
        expiresIn: result.expiresIn,
        mock: result.mock || false
      }
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP (any method)
router.post('/verify', [
  body('contact')
    .notEmpty()
    .withMessage('Contact (phone number or email) is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('method')
    .isIn(['sms', 'email'])
    .withMessage('Method must be either "sms" or "email"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contact, otp, method = 'sms', purpose = 'verification' } = req.body;

    const result = verifyOTPAnyMethod(contact, otp, method, purpose);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    }

  } catch (error) {
    console.error('❌ Verify OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// Get OTP configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      otpEnabled: process.env.OTP_ENABLED === 'true',
      otpLength: parseInt(process.env.OTP_LENGTH) || 6,
      expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
      preferredMethod: process.env.OTP_METHOD || 'sms',
      smsEnabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      emailEnabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      fallbackEmail: process.env.OTP_FALLBACK_EMAIL === 'true'
    }
  });
});

export default router;
