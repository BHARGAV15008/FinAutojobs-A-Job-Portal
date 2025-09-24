import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateOTP, sendEmail, sendSMS, storeOTP, verifyOTP } from './services/otpService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Send Email OTP
app.post('/api/auth/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    const otpKey = `email_${email}`;
    storeOTP(otpKey, otp, 5);

    // Send email
    const subject = 'FinAutoJobs - Email Verification Code';
    const body = `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;
    
    const result = await sendEmail(email, subject, body);

    res.json({
      message: 'OTP sent successfully to your email',
      expiresIn: 300, // 5 minutes in seconds
      success: true
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to send email OTP',
      error: error.message
    });
  }
});

// Verify Email OTP
app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Email and OTP are required' 
      });
    }

    const otpKey = `email_${email}`;
    const verificationResult = verifyOTP(otpKey, otp);

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    res.json({
      message: 'Email verified successfully',
      verified: true,
      success: true
    });

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify email OTP',
      error: error.message
    });
  }
});

// Send SMS OTP
app.post('/api/auth/send-sms-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        message: 'Phone number is required' 
      });
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return res.status(400).json({
        message: 'Please enter a valid phone number with country code (e.g., +1234567890)'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    const otpKey = `sms_${phone}`;
    storeOTP(otpKey, otp, 5);

    // Send SMS
    const message = `Your FinAutoJobs verification code is: ${otp}. This code will expire in 5 minutes.`;
    
    const result = await sendSMS(phone, message);

    res.json({
      message: 'OTP sent successfully to your phone',
      expiresIn: 300, // 5 minutes in seconds
      success: true,
      mock: result.mock || false
    });

  } catch (error) {
    console.error('Send SMS OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to send SMS OTP',
      error: error.message
    });
  }
});

// Verify SMS OTP
app.post('/api/auth/verify-sms-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        message: 'Phone number and OTP are required' 
      });
    }

    const otpKey = `sms_${phone}`;
    const verificationResult = verifyOTP(otpKey, otp);

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    res.json({
      message: 'Phone number verified successfully',
      verified: true,
      success: true
    });

  } catch (error) {
    console.error('Verify SMS OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify SMS OTP',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email OTP: POST http://localhost:${PORT}/api/auth/send-email-otp`);
  console.log(`📱 SMS OTP: POST http://localhost:${PORT}/api/auth/send-sms-otp`);
  console.log(`✅ Health: GET http://localhost:${PORT}/api/health`);
});
