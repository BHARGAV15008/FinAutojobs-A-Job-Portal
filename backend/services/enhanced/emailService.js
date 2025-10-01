import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES, etc.)
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
};

// Email templates
const emailTemplates = {
  'email-verification': {
    subject: 'Verify Your Email - FinAutoJobs',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to FinAutoJobs!</h2>
        <p>Hi {{firstName}},</p>
        <p>Thank you for signing up for FinAutoJobs. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationLink}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'password-reset': {
    subject: 'Password Reset - FinAutoJobs',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi {{firstName}},</p>
        <p>You requested to reset your password for your FinAutoJobs account. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>This link will expire in {{expiresIn}}.</strong></p>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'application-confirmation': {
    subject: 'Application Submitted - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Application Submitted Successfully!</h2>
        <p>Hi {{applicantName}},</p>
        <p>Your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been successfully submitted.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Position:</strong> {{jobTitle}}</p>
          <p><strong>Company:</strong> {{companyName}}</p>
          <p><strong>Application ID:</strong> {{applicationId}}</p>
          <p><strong>Submitted:</strong> {{submissionDate}}</p>
        </div>
        <p>We'll notify you as soon as there are updates on your application status.</p>
        <p>You can track your application status in your dashboard.</p>
        <p>Best of luck!<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'new-application': {
    subject: 'New Application for {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Application Received</h2>
        <p>Hi {{recruiterName}},</p>
        <p>You have received a new application for your job posting:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Position:</strong> {{jobTitle}}</p>
          <p><strong>Applicant:</strong> {{applicantName}}</p>
          <p><strong>Applied:</strong> {{applicationDate}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{applicationLink}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </div>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'application-status-update': {
    subject: 'Application Update - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Hi {{applicantName}},</p>
        <p>There's an update on your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Status Update:</h3>
          <p><strong>New Status:</strong> <span style="color: #16a34a; font-weight: bold;">{{status}}</span></p>
          {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          {{#if feedback}}<p><strong>Feedback:</strong> {{feedback}}</p>{{/if}}
        </div>
        <p>You can view more details in your dashboard.</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'interview-scheduled': {
    subject: 'Interview Scheduled - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Interview Scheduled</h2>
        <p>Hi {{candidateName}},</p>
        <p>Great news! An interview has been scheduled for your application to <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Interview Details:</h3>
          <p><strong>Date:</strong> {{interviewDate}}</p>
          <p><strong>Time:</strong> {{interviewTime}}</p>
          <p><strong>Duration:</strong> {{duration}}</p>
          <p><strong>Type:</strong> {{interviewType}}</p>
          <p><strong>Location:</strong> {{location}}</p>
          {{#if meetingLink}}<p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>{{/if}}
          <p><strong>Interviewer:</strong> {{interviewerName}}</p>
        </div>
        <p>Please confirm your attendance and prepare accordingly. Good luck!</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'interview-rescheduled': {
    subject: 'Interview Rescheduled - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Interview Rescheduled</h2>
        <p>Hi {{candidateName}},</p>
        <p>Your interview for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been rescheduled.</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Previous Schedule:</h3>
          <p><strong>Date:</strong> {{oldDate}} at {{oldTime}}</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">New Schedule:</h3>
          <p><strong>Date:</strong> {{newDate}}</p>
          <p><strong>Time:</strong> {{newTime}}</p>
          <p><strong>Duration:</strong> {{duration}}</p>
          <p><strong>Location:</strong> {{location}}</p>
          {{#if meetingLink}}<p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>{{/if}}
          {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
        </div>
        <p>Please update your calendar accordingly. We apologize for any inconvenience.</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'interview-status-update': {
    subject: 'Interview {{status}} - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Status Update</h2>
        <p>Hi {{recipientName}},</p>
        <p>The interview for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been <strong>{{status}}</strong>.</p>
        {{#if notes}}
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Additional Information:</h3>
          <p>{{notes}}</p>
        </div>
        {{/if}}
        <p>{{#if senderName}}This update was provided by {{senderName}}.{{/if}}</p>
        <p>Best regards,<br>The FinAutoJobs Team</p>
      </div>
    `
  },

  'job-alert': {
    subject: 'New Job Matches Your Preferences',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">New Job Opportunities</h2>
        <p>Hi {{userName}},</p>
        <p>We found {{jobCount}} new job(s) that match your preferences:</p>
        <div style="margin: 20px 0;">
          {{#each jobs}}
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">{{title}}</h3>
            <p><strong>Company:</strong> {{company}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>Salary:</strong> {{salary}}</p>
            <a href="{{jobLink}}" style="color: #2563eb; text-decoration: none;">View Job Details →</a>
          </div>
          {{/each}}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardLink}}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Jobs
          </a>
        </div>
        <p>Happy job hunting!<br>The FinAutoJobs Team</p>
      </div>
    `
  }
};

// Main email sending function
export const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    // Get email template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    // Compile template with data
    let htmlContent = emailTemplate.template;
    let emailSubject = subject || emailTemplate.subject;

    // Simple template replacement (in production, use a proper template engine like Handlebars)
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, data[key] || '');
      emailSubject = emailSubject.replace(regex, data[key] || '');
    });

    // Handle conditional blocks (simplified)
    htmlContent = htmlContent.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
      return data[condition] ? content : '';
    });

    // Handle each blocks (simplified)
    htmlContent = htmlContent.replace(/{{#each\s+(\w+)}}(.*?){{\/each}}/gs, (match, arrayName, itemTemplate) => {
      const array = data[arrayName];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemHtml = itemTemplate;
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemHtml = itemHtml.replace(regex, item[key] || '');
        });
        return itemHtml;
      }).join('');
    });

    // Create email options
    const mailOptions = {
      from: `"FinAutoJobs" <${process.env.EMAIL_FROM || 'noreply@finautojobs.com'}>`,
      to,
      subject: emailSubject,
      html: htmlContent,
      attachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject: emailSubject,
      template
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };

  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails (for job alerts, newsletters, etc.)
export const sendBulkEmails = async (emails) => {
  const results = [];
  const batchSize = 10; // Send emails in batches to avoid rate limiting

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchPromises = batch.map(async (emailData) => {
      try {
        const result = await sendEmail(emailData);
        return { ...emailData, success: true, result };
      } catch (error) {
        console.error(`Failed to send email to ${emailData.to}:`, error);
        return { ...emailData, success: false, error: error.message };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

// Send email with file attachment
export const sendEmailWithAttachment = async ({ to, subject, template, data, filePath, fileName }) => {
  try {
    const attachment = {
      filename: fileName || path.basename(filePath),
      path: filePath
    };

    return await sendEmail({
      to,
      subject,
      template,
      data,
      attachments: [attachment]
    });
  } catch (error) {
    console.error('Failed to send email with attachment:', error);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

// Get email template preview
export const getEmailPreview = (template, data) => {
  const emailTemplate = emailTemplates[template];
  if (!emailTemplate) {
    throw new Error(`Email template '${template}' not found`);
  }

  let htmlContent = emailTemplate.template;
  let emailSubject = emailTemplate.subject;

  // Replace template variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, data[key] || '');
    emailSubject = emailSubject.replace(regex, data[key] || '');
  });

  return {
    subject: emailSubject,
    html: htmlContent
  };
};

export default {
  sendEmail,
  sendBulkEmails,
  sendEmailWithAttachment,
  verifyEmailConfig,
  getEmailPreview
};
