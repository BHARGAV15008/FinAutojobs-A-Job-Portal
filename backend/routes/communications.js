import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }
  req.user = { userId: 'user-id', role: 'recruiter' };
  next();
};

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'technogenius1500@gmail.com',
    pass: process.env.EMAIL_PASS || 'iTGBJ@#@#158008'
  }
});

// Send email endpoint
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, message, recruiterEmail, recruiterName } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@finautojobs.com',
      to: to, // Applicant's email
      cc: recruiterEmail, // CC the recruiter
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">FinAutoJobs</h1>
            <p style="color: #e8e8e8; margin: 5px 0 0 0; font-size: 14px;">Connecting Talent with Opportunity</p>
          </div>
          <div style="background-color: white; padding: 30px; margin: 0;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">Message from ${recruiterName || 'Recruiter'}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            ${recruiterEmail ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <p style="margin: 0; font-size: 14px; color: #333;">
                <strong>Recruiter Contact:</strong><br>
                ${recruiterName || 'Recruiter'}<br>
                <a href="mailto:${recruiterEmail}" style="color: #17a2b8; text-decoration: none;">${recruiterEmail}</a>
              </p>
            </div>
            ` : ''}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 12px;">
              <p style="margin: 0;">This email was sent through the FinAutoJobs recruitment platform.</p>
              <p style="margin: 5px 0 0 0;">You can reply directly to this email to contact the recruiter.</p>
            </div>
          </div>
        </div>
      `,
      text: message // Plain text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: { messageId: info.messageId }
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

// Send SMS endpoint
router.post('/send-sms', authenticateToken, async (req, res) => {
  try {
    const { to, message, recruiterPhone, recruiterName } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message required'
      });
    }

    // Mock SMS sending (replace with actual SMS service like Twilio)
    console.log(`📱 SMS to ${to}: ${message}`);
    
    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: { to, sentAt: new Date().toISOString() }
    });

  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS'
    });
  }
});

// Auto-notification for status changes
router.post('/notify-status-change', authenticateToken, async (req, res) => {
  try {
    const { applicantEmail, applicantPhone, applicantName, newStatus, jobTitle, recruiterName, recruiterEmail } = req.body;
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: applicantEmail,
      cc: recruiterEmail,
      subject: `Application Update - ${newStatus}`,
      html: `<h2>Status Update</h2><p>Dear ${applicantName}, your application for ${jobTitle} is now: <strong>${newStatus}</strong></p><p>- ${recruiterName}</p>`
    });
    
    console.log(`📱 SMS to ${applicantPhone}: Your application for ${jobTitle} status: ${newStatus} - ${recruiterName}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Notification failed' });
  }
});

export default router;
