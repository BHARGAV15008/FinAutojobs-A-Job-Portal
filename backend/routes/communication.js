import express from 'express';
import nodemailer from 'nodemailer';
import { authenticateToken } from '../middleware/auth.js';

// Twilio will be loaded dynamically to handle missing package gracefully
let twilioClient = null;

// Initialize Twilio client if available
const initializeTwilio = async () => {
  try {
    const { default: twilio } = await import('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID || 'your-twilio-sid',
      process.env.TWILIO_AUTH_TOKEN || 'your-twilio-token'
    );
    console.log('✅ Twilio SMS service initialized');
  } catch (error) {
    console.log('⚠️ Twilio not available - SMS functionality disabled');
  }
};

// Initialize Twilio asynchronously
initializeTwilio();

const router = express.Router();

// Simple test endpoint that doesn't require authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Communication routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Email configuration (using Gmail SMTP as example)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Twilio configuration handled above with dynamic import

// POST /api/communication/send-email - Send email to applicant
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, message, attachments, scheduleSend, scheduleDate } = req.body;
    const senderRole = req.user.role;
    const senderId = req.user.userId;

    console.log('📧 Email sending request:', {
      to,
      subject,
      from: req.user.email,
      role: senderRole,
      scheduleSend
    });

    // Validate required fields
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    // Only recruiters can send emails to applicants
    if (senderRole !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can send emails to applicants'
      });
    }

    // Create email transporter
    const transporter = createEmailTransporter();

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'FinAutoJobs - Recruiter Communication',
        address: process.env.EMAIL_USER || 'noreply@finautojobs.com'
      },
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2563eb; margin: 0;">FinAutoJobs</h2>
            <p style="color: #666; margin: 5px 0;">Professional Communication Platform</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message from Recruiter</h3>
            <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This email was sent through FinAutoJobs recruitment platform.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
              Please do not reply directly to this email. Use the platform for communication.
            </p>
          </div>
        </div>
      `,
      text: message // Fallback plain text version
    };

    // Handle scheduled sending
    if (scheduleSend && scheduleDate) {
      const scheduleTime = new Date(scheduleDate);
      const now = new Date();
      
      if (scheduleTime <= now) {
        return res.status(400).json({
          success: false,
          message: 'Schedule date must be in the future'
        });
      }

      // For now, we'll send immediately and log the schedule intent
      // In production, you'd use a job queue like Bull or Agenda
      console.log(`📅 Email scheduled for: ${scheduleTime.toISOString()}`);
      console.log('⚠️ Note: Scheduled sending not implemented, sending immediately');
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });

    // Log the communication in database (optional)
    // You could create a Communication model to track all sent emails
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: info.messageId,
        to: to,
        subject: subject,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Handle specific email errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email authentication failed. Please check email configuration.'
      });
    }
    
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to email server. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/communication/send-sms - Send SMS to applicant
router.post('/send-sms', authenticateToken, async (req, res) => {
  try {
    const { to, message, candidateName } = req.body;
    const senderRole = req.user.role;
    const senderId = req.user.userId;

    console.log('📱 SMS sending request:', {
      to,
      from: req.user.email,
      role: senderRole,
      messageLength: message?.length
    });

    // Check if Twilio is available
    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        message: 'SMS service is not configured. Please install Twilio package and configure credentials.'
      });
    }

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, message'
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Only recruiters can send SMS to applicants
    if (senderRole !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can send SMS to applicants'
      });
    }

    // Format the message with professional header
    const formattedMessage = `FinAutoJobs Recruitment Update:

${message}

---
This message was sent by a recruiter through FinAutoJobs platform. Please check your email for detailed communication.`;

    // Send SMS using Twilio
    const smsResult = await twilioClient.messages.create({
      body: formattedMessage,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Your Twilio phone number
      to: to
    });

    console.log('✅ SMS sent successfully:', {
      sid: smsResult.sid,
      to: to,
      status: smsResult.status
    });

    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: {
        sid: smsResult.sid,
        to: to,
        status: smsResult.status,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    if (error.code === 21608) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is not reachable'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send SMS. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/communication/test-email - Test email configuration
router.get('/test-email', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const transporter = createEmailTransporter();
    
    // Verify email configuration
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'Email configuration is working correctly',
      config: {
        service: 'gmail',
        user: process.env.EMAIL_USER || 'Not configured',
        passwordSet: !!(process.env.EMAIL_PASSWORD)
      }
    });
    
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    });
  }
});

// GET /api/communication/test-sms - Test SMS configuration
router.get('/test-sms', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if Twilio is available
    if (!twilioClient) {
      return res.json({
        success: false,
        message: 'SMS service is not configured',
        config: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || 'Not configured',
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured',
          status: 'Twilio package not installed'
        }
      });
    }

    // Test Twilio configuration
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    res.json({
      success: true,
      message: 'SMS configuration is working correctly',
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || 'Not configured',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured',
        accountStatus: account.status
      }
    });
    
  } catch (error) {
    console.error('❌ SMS configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'SMS configuration test failed',
      error: error.message
    });
  }
});

export default router;
