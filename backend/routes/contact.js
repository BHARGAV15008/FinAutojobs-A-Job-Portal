import express from 'express';
import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import { BaseUser } from '../models/UserModels.js';
import mongoose from 'mongoose';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await BaseUser.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your email service
    auth: {
      user: process.env.EMAIL_USER || 'noreply@finautojobs.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// POST /api/contact/send-message - Send internal message through platform
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { 
      receiverId, 
      subject, 
      message, 
      messageType = 'contact',
      priority = 'normal',
      relatedJobId,
      relatedApplicationId 
    } = req.body;

    // Validate required fields
    if (!receiverId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, subject, and message are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
    }

    // Check if receiver exists
    const receiver = await BaseUser.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      subject: subject.trim(),
      content: message.trim(),
      messageType,
      priority,
      relatedJobId: relatedJobId || null,
      relatedApplicationId: relatedApplicationId || null
    });

    await newMessage.save();

    // Populate sender and receiver info
    await newMessage.populate('senderId', 'firstName lastName email role companyInfo');
    await newMessage.populate('receiverId', 'firstName lastName email role');

    console.log(`✅ Internal message sent from ${req.user.firstName} ${req.user.lastName} to ${receiver.firstName} ${receiver.lastName}`);

    res.status(201).json({
      success: true,
      data: {
        messageId: newMessage._id,
        timestamp: newMessage.createdAt
      },
      message: 'Message sent successfully through FinAutoJobs platform'
    });

  } catch (error) {
    console.error('❌ Error sending internal message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// POST /api/contact/send-email - Send email through platform (recruiter to applicant)
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { 
      receiverId, 
      subject, 
      message, 
      emailType = 'general',
      relatedJobId,
      relatedApplicationId 
    } = req.body;

    // Validate required fields
    if (!receiverId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, subject, and message are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
    }

    // Get sender and receiver details
    const [sender, receiver] = await Promise.all([
      BaseUser.findById(senderId),
      BaseUser.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'Sender or receiver not found'
      });
    }

    // Create email transporter
    const transporter = createEmailTransporter();

    // Email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .message-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .sender-info { background-color: #e5e7eb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FinAutoJobs</h1>
          <p>India's Premier Finance & Automotive Job Portal</p>
        </div>
        
        <div class="content">
          <h2>You have received a message</h2>
          
          <div class="sender-info">
            <strong>From:</strong> ${sender.firstName} ${sender.lastName}<br>
            <strong>Role:</strong> ${sender.role === 'recruiter' ? 'Recruiter' : 'Professional'}<br>
            ${sender.companyInfo?.companyName ? `<strong>Company:</strong> ${sender.companyInfo.companyName}<br>` : ''}
            <strong>Contact:</strong> ${sender.email}
          </div>
          
          <div class="message-box">
            <h3>${subject}</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p><strong>Note:</strong> This email was sent through FinAutoJobs platform. To reply, please log into your FinAutoJobs account or contact the sender directly.</p>
        </div>
        
        <div class="footer">
          <p>© 2025 FinAutoJobs. All rights reserved.</p>
          <p>This email was sent via FinAutoJobs platform | <a href="mailto:support@finautojobs.com" style="color: #60a5fa;">support@finautojobs.com</a></p>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"${sender.firstName} ${sender.lastName} via FinAutoJobs" <noreply@finautojobs.com>`,
      to: receiver.email,
      cc: sender.email, // CC the sender
      subject: `[FinAutoJobs] ${subject}`,
      html: emailHTML,
      replyTo: sender.email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Also save as internal message for record keeping
    const newMessage = new Message({
      senderId,
      receiverId,
      subject: `[EMAIL] ${subject}`,
      content: message,
      messageType: 'email',
      priority: 'normal',
      relatedJobId: relatedJobId || null,
      relatedApplicationId: relatedApplicationId || null
    });

    await newMessage.save();

    console.log(`✅ Email sent from ${sender.firstName} ${sender.lastName} (${sender.email}) to ${receiver.firstName} ${receiver.lastName} (${receiver.email})`);

    res.status(200).json({
      success: true,
      data: {
        messageId: newMessage._id,
        timestamp: new Date(),
        emailSent: true
      },
      message: 'Email sent successfully through FinAutoJobs platform'
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// POST /api/contact/bulk-message - Send message to multiple recipients
router.post('/bulk-message', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { 
      receiverIds, 
      subject, 
      message, 
      messageType = 'bulk',
      priority = 'normal' 
    } = req.body;

    // Validate required fields
    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Receiver IDs array is required'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Validate all receiver IDs
    const validReceiverIds = receiverIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validReceiverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid receiver IDs provided'
      });
    }

    // Check if receivers exist
    const receivers = await BaseUser.find({ _id: { $in: validReceiverIds } });
    if (receivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid receivers found'
      });
    }

    // Create messages for all receivers
    const messages = receivers.map(receiver => ({
      senderId,
      receiverId: receiver._id,
      subject: subject.trim(),
      content: message.trim(),
      messageType,
      priority
    }));

    const savedMessages = await Message.insertMany(messages);

    console.log(`✅ Bulk message sent to ${receivers.length} recipients by ${req.user.firstName} ${req.user.lastName}`);

    res.status(201).json({
      success: true,
      data: {
        messagesSent: savedMessages.length,
        recipients: receivers.map(r => ({
          id: r._id,
          name: `${r.firstName} ${r.lastName}`,
          email: r.email
        })),
        timestamp: new Date()
      },
      message: `Bulk message sent to ${savedMessages.length} recipients`
    });

  } catch (error) {
    console.error('❌ Error sending bulk message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk message',
      error: error.message
    });
  }
});

// GET /api/contact/templates - Get email templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'interview_invitation',
        name: 'Interview Invitation',
        subject: 'Interview Invitation - {jobTitle} at {companyName}',
        content: `Dear {candidateName},

We are pleased to invite you for an interview for the {jobTitle} position at {companyName}.

Interview Details:
- Date: {interviewDate}
- Time: {interviewTime}
- Location: {interviewLocation}
- Duration: Approximately {duration}

Please confirm your availability by replying to this email.

We look forward to meeting you.

Best regards,
{recruiterName}
{companyName}`
      },
      {
        id: 'application_received',
        name: 'Application Received',
        subject: 'Application Received - {jobTitle}',
        content: `Dear {candidateName},

Thank you for your interest in the {jobTitle} position at {companyName}.

We have successfully received your application and our hiring team will review it carefully. We will contact you within {timeframe} regarding the next steps.

If you have any questions, please feel free to reach out.

Best regards,
{recruiterName}
{companyName}`
      },
      {
        id: 'job_offer',
        name: 'Job Offer',
        subject: 'Job Offer - {jobTitle} at {companyName}',
        content: `Dear {candidateName},

We are delighted to offer you the position of {jobTitle} at {companyName}.

Offer Details:
- Position: {jobTitle}
- Department: {department}
- Start Date: {startDate}
- Salary: {salary}
- Benefits: {benefits}

Please review the attached offer letter and let us know your decision by {responseDeadline}.

We are excited about the possibility of you joining our team.

Best regards,
{recruiterName}
{companyName}`
      },
      {
        id: 'application_status',
        name: 'Application Status Update',
        subject: 'Update on your application - {jobTitle}',
        content: `Dear {candidateName},

Thank you for your application for the {jobTitle} position at {companyName}.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We appreciate your interest in {companyName} and encourage you to apply for future opportunities that match your skills and experience.

Best regards,
{recruiterName}
{companyName}`
      },
      {
        id: 'follow_up',
        name: 'Follow-up Message',
        subject: 'Following up on your application - {jobTitle}',
        content: `Dear {candidateName},

I hope this message finds you well.

I wanted to follow up on your application for the {jobTitle} position at {companyName}. We are currently in the process of reviewing applications and will be in touch soon with next steps.

Thank you for your patience and continued interest in our company.

Best regards,
{recruiterName}
{companyName}`
      }
    ];

    res.json({
      success: true,
      data: { templates },
      message: 'Email templates retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email templates',
      error: error.message
    });
  }
});

export default router;
