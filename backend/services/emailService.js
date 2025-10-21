import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables from config.env
dotenv.config({ path: './config.env' });

class EmailService {
  constructor() {
    // Determine email service to use
    this.emailService = process.env.EMAIL_SERVICE || 'smtp';
    
    if (this.emailService === 'resend') {
      // Initialize Resend
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend email service initialized');
    } else {
      // Initialize SMTP (Gmail)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true' || true,
        auth: {
          user: process.env.EMAIL_USER || process.env.EMAIL_FROM_ADDRESS,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT) || 120000,
        socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT) || 120000,
        greetingTimeout: parseInt(process.env.EMAIL_GREETINGS_TIMEOUT) || 30000,
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        debug: process.env.NODE_ENV !== 'production'
      });
      console.log('✅ SMTP email service initialized');
    }

    this.fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@finautojobs.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'FinAutoJobs Team';
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Initialize email templates
    this.templates = this.loadEmailTemplates();
  }

  // Unified send email method
  async sendEmail(to, subject, html, options = {}) {
    try {
      if (this.emailService === 'resend') {
        // Use Resend API
        const result = await this.resend.emails.send({
          from: options.from || `${this.fromName} <${this.fromEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html,
          ...options
        });
        console.log(`✅ Email sent via Resend to ${to}`);
        return { success: true, messageId: result.data?.id };
      } else {
        // Use SMTP (Gmail)
        const result = await this.transporter.sendMail({
          from: options.from || `"${this.fromName}" <${this.fromEmail}>`,
          to: to,
          subject: subject,
          html: html,
          ...options
        });
        console.log(`✅ Email sent via SMTP to ${to}`);
        return { success: true, messageId: result.messageId };
      }
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }


  // Load email templates
  loadEmailTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    const templates = {};

    try {
      // Create templates directory if it doesn't exist
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
        this.createDefaultTemplates(templatesDir);
      }

      // Load existing templates
      const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.html'));
      templateFiles.forEach(file => {
        const templateName = path.basename(file, '.html');
        templates[templateName] = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      });

      console.log(`✅ Loaded ${Object.keys(templates).length} email templates`);
      return templates;
    } catch (error) {
      console.warn('⚠️ Could not load email templates, using defaults:', error.message);
      return this.getDefaultTemplates();
    }
  }

  // Create default email templates
  createDefaultTemplates(templatesDir) {
    const defaultTemplates = this.getDefaultTemplates();
    
    Object.keys(defaultTemplates).forEach(templateName => {
      const filePath = path.join(templatesDir, `${templateName}.html`);
      fs.writeFileSync(filePath, defaultTemplates[templateName]);
    });
    
    console.log('✅ Created default email templates');
  }

  // Get default email templates
  getDefaultTemplates() {
    return {
      applicationConfirmation: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Application Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
            .status-badge { display: inline-block; padding: 4px 12px; background: #4CAF50; color: white; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received!</h1>
            </div>
            <div class="content">
              <h2>Dear {{applicantName}},</h2>
              <p>Thank you for applying to the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
              
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3>Application Details:</h3>
                <p><strong>Application ID:</strong> {{applicationId}}</p>
                <p><strong>Position:</strong> {{jobTitle}}</p>
                <p><strong>Company:</strong> {{companyName}}</p>
                <p><strong>Applied Date:</strong> {{appliedDate}}</p>
                <p><strong>Status:</strong> <span class="status-badge">{{status}}</span></p>
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>Our HR team will review your application within 5-7 business days</li>
                <li>You'll receive an email update if your profile matches our requirements</li>
                <li>Track your application status in your dashboard</li>
                <li>We may contact you for additional information if needed</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" class="button">Track Application Status</a>
              </div>

              <p>If you have any questions, feel free to contact us at <a href="mailto:{{contactEmail}}">{{contactEmail}}</a></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
              <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{baseUrl}}">Visit Website</a></p>
            </div>
          </div>
        </body>
        </html>
      `,

      statusUpdate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Application Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
            .status-update { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #4CAF50; margin: 20px 0; }
            .timeline { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <h2>Dear {{applicantName}},</h2>
              <p>We have an update regarding your application for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
              
              <div class="status-update">
                <h3>🎉 Status Update</h3>
                <p><strong>New Status:</strong> {{newStatus}}</p>
                <p><strong>Updated On:</strong> {{updatedDate}}</p>
                {{#if note}}
                <p><strong>Note:</strong> {{note}}</p>
                {{/if}}
              </div>

              {{#if nextSteps}}
              <div class="timeline">
                <h3>Next Steps:</h3>
                <ul>
                  {{#each nextSteps}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
              </div>
              {{/if}}

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" class="button">View Full Details</a>
              </div>

              <p>Thank you for your interest in joining our team!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      newApplicationNotification: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Application Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #FF9800; color: white; text-decoration: none; border-radius: 4px; }
            .applicant-info { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .highlight { background: #FFF3E0; padding: 15px; border-radius: 6px; border-left: 4px solid #FF9800; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Application Received</h1>
            </div>
            <div class="content">
              <h2>Dear {{recruiterName}},</h2>
              <p>You have received a new application for your job posting.</p>
              
              <div class="highlight">
                <h3>Job Details:</h3>
                <p><strong>Position:</strong> {{jobTitle}}</p>
                <p><strong>Application ID:</strong> {{applicationId}}</p>
                <p><strong>Applied Date:</strong> {{appliedDate}}</p>
              </div>

              <div class="applicant-info">
                <h3>Applicant Information:</h3>
                <p><strong>Name:</strong> {{applicantName}}</p>
                <p><strong>Email:</strong> {{applicantEmail}}</p>
                <p><strong>Experience:</strong> {{experience}} years</p>
                <p><strong>Expected Salary:</strong> ₹{{expectedSalary}}</p>
                {{#if matchScore}}
                <p><strong>AI Match Score:</strong> {{matchScore}}%</p>
                {{/if}}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{applicationUrl}}" class="button">Review Application</a>
              </div>

              <p>Please review the application and update the status accordingly.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      interviewScheduled: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Scheduled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #9C27B0; color: white; text-decoration: none; border-radius: 4px; }
            .interview-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #9C27B0; }
            .calendar-link { background: #E1BEE7; padding: 10px; border-radius: 4px; text-align: center; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Scheduled!</h1>
            </div>
            <div class="content">
              <h2>Dear {{applicantName}},</h2>
              <p>Congratulations! We would like to invite you for an interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
              
              <div class="interview-details">
                <h3>📅 Interview Details:</h3>
                <p><strong>Date:</strong> {{interviewDate}}</p>
                <p><strong>Time:</strong> {{interviewTime}}</p>
                <p><strong>Duration:</strong> {{duration}} minutes</p>
                <p><strong>Type:</strong> {{interviewType}}</p>
                {{#if location}}
                <p><strong>Location:</strong> {{location}}</p>
                {{/if}}
                {{#if meetingLink}}
                <p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>
                {{/if}}
                <p><strong>Interviewer(s):</strong> {{interviewers}}</p>
              </div>

              <div class="calendar-link">
                <a href="{{calendarLink}}" class="button">Add to Calendar</a>
              </div>

              <h3>What to Prepare:</h3>
              <ul>
                <li>Review the job description and company information</li>
                <li>Prepare examples of your relevant experience</li>
                <li>Have questions ready about the role and company</li>
                <li>Test your technology setup (for virtual interviews)</li>
                <li>Bring copies of your resume and any relevant documents</li>
              </ul>

              <p>If you need to reschedule or have any questions, please contact us at <a href="mailto:{{contactEmail}}">{{contactEmail}}</a></p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" class="button">View Application Status</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      offerExtended: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Job Offer - Congratulations!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
            .offer-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <h2>Job Offer Extended</h2>
            </div>
            <div class="content">
              <div class="celebration">🎊 🎉 🎊</div>
              
              <h2>Dear {{applicantName}},</h2>
              <p>We are delighted to extend an offer for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>!</p>
              
              <div class="offer-details">
                <h3>Offer Details:</h3>
                <p><strong>Position:</strong> {{jobTitle}}</p>
                <p><strong>Department:</strong> {{department}}</p>
                <p><strong>Start Date:</strong> {{startDate}}</p>
                <p><strong>Salary:</strong> ₹{{salary}} {{salaryFrequency}}</p>
                <p><strong>Work Arrangement:</strong> {{workArrangement}}</p>
                {{#if probationPeriod}}
                <p><strong>Probation Period:</strong> {{probationPeriod}} months</p>
                {{/if}}
                <p><strong>Notice Period:</strong> {{noticePeriod}} days</p>
              </div>

              {{#if benefits}}
              <div class="offer-details">
                <h3>Benefits Package:</h3>
                <ul>
                  {{#each benefits}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
              </div>
              {{/if}}

              <p><strong>Offer Validity:</strong> This offer is valid until {{expiryDate}}.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{acceptUrl}}" class="button" style="background: #4CAF50;">Accept Offer</a>
                <a href="{{negotiateUrl}}" class="button" style="background: #FF9800;">Negotiate</a>
                <a href="{{declineUrl}}" class="button" style="background: #f44336;">Decline</a>
              </div>

              <p>We are excited about the possibility of you joining our team and look forward to your response!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Template rendering helper
  renderTemplate(templateName, data) {
    let template = this.templates[templateName];
    if (!template) {
      console.warn(`Template ${templateName} not found, using fallback`);
      return `<p>Email content for ${templateName}</p>`;
    }

    // Simple template replacement (you can use handlebars for more complex templating)
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key] || '');
    });

    // Handle conditional blocks (basic implementation)
    template = template.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      return data[condition] ? content : '';
    });

    // Handle each blocks (basic implementation)
    template = template.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
      const array = data[arrayName];
      if (Array.isArray(array)) {
        return array.map(item => content.replace(/{{this}}/g, item)).join('');
      }
      return '';
    });

    return template;
  }

  // Send application confirmation email
  async sendApplicationConfirmation(applicationData) {
    try {
      const {
        applicantEmail,
        applicantName,
        jobTitle,
        companyName,
        applicationId,
        appliedDate,
        status,
        contactEmail
      } = applicationData;

      const templateData = {
        applicantName,
        jobTitle,
        companyName,
        applicationId,
        appliedDate: new Date(appliedDate).toLocaleDateString(),
        status: status.charAt(0).toUpperCase() + status.slice(1),
        contactEmail,
        dashboardUrl: `${this.baseUrl}/applicant-dashboard`,
        unsubscribeUrl: `${this.baseUrl}/unsubscribe`,
        baseUrl: this.baseUrl
      };

      const html = this.renderTemplate('applicationConfirmation', templateData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: applicantEmail,
        subject: `Application Received - ${jobTitle} at ${companyName}`,
        html: html
      });

      console.log(`✅ Application confirmation email sent to ${applicantEmail}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending application confirmation email:', error);
      throw error;
    }
  }

  // Send status update email
  async sendStatusUpdateEmail(updateData) {
    try {
      const {
        applicantEmail,
        applicantName,
        jobTitle,
        companyName,
        newStatus,
        updatedDate,
        note,
        nextSteps
      } = updateData;

      const templateData = {
        applicantName,
        jobTitle,
        companyName,
        newStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' '),
        updatedDate: new Date(updatedDate).toLocaleDateString(),
        note,
        nextSteps,
        dashboardUrl: `${this.baseUrl}/applicant-dashboard`
      };

      const html = this.renderTemplate('statusUpdate', templateData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: applicantEmail,
        subject: `Application Update - ${jobTitle} at ${companyName}`,
        html: html
      });

      console.log(`✅ Status update email sent to ${applicantEmail}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending status update email:', error);
      throw error;
    }
  }

  // Send new application notification to recruiter
  async sendNewApplicationNotification(notificationData) {
    try {
      const {
        recruiterEmail,
        recruiterName,
        jobTitle,
        applicationId,
        appliedDate,
        applicantName,
        applicantEmail,
        experience,
        expectedSalary,
        matchScore,
        applicationUrl
      } = notificationData;

      const templateData = {
        recruiterName,
        jobTitle,
        applicationId,
        appliedDate: new Date(appliedDate).toLocaleDateString(),
        applicantName,
        applicantEmail,
        experience,
        expectedSalary,
        matchScore,
        applicationUrl: applicationUrl || `${this.baseUrl}/recruiter-dashboard`
      };

      const html = this.renderTemplate('newApplicationNotification', templateData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: recruiterEmail,
        subject: `New Application Received - ${jobTitle}`,
        html: html,
        priority: 'high'
      });

      console.log(`✅ New application notification sent to ${recruiterEmail}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending new application notification:', error);
      throw error;
    }
  }

  // Send interview scheduled email
  async sendInterviewScheduledEmail(interviewData) {
    try {
      const {
        applicantEmail,
        applicantName,
        jobTitle,
        companyName,
        interviewDate,
        interviewTime,
        duration,
        interviewType,
        location,
        meetingLink,
        interviewers,
        contactEmail,
        calendarLink
      } = interviewData;

      const templateData = {
        applicantName,
        jobTitle,
        companyName,
        interviewDate: new Date(interviewDate).toLocaleDateString(),
        interviewTime,
        duration,
        interviewType,
        location,
        meetingLink,
        interviewers: Array.isArray(interviewers) ? interviewers.join(', ') : interviewers,
        contactEmail,
        calendarLink,
        dashboardUrl: `${this.baseUrl}/applicant-dashboard`
      };

      const html = this.renderTemplate('interviewScheduled', templateData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: applicantEmail,
        subject: `Interview Scheduled - ${jobTitle} at ${companyName}`,
        html: html,
        priority: 'high'
      });

      console.log(`✅ Interview scheduled email sent to ${applicantEmail}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending interview scheduled email:', error);
      throw error;
    }
  }

  // Send job offer email
  async sendJobOfferEmail(offerData) {
    try {
      const {
        applicantEmail,
        applicantName,
        jobTitle,
        companyName,
        department,
        startDate,
        salary,
        salaryFrequency,
        workArrangement,
        probationPeriod,
        noticePeriod,
        benefits,
        expiryDate,
        acceptUrl,
        negotiateUrl,
        declineUrl
      } = offerData;

      const templateData = {
        applicantName,
        jobTitle,
        companyName,
        department,
        startDate: new Date(startDate).toLocaleDateString(),
        salary,
        salaryFrequency,
        workArrangement,
        probationPeriod,
        noticePeriod,
        benefits,
        expiryDate: new Date(expiryDate).toLocaleDateString(),
        acceptUrl: acceptUrl || `${this.baseUrl}/offer/accept`,
        negotiateUrl: negotiateUrl || `${this.baseUrl}/offer/negotiate`,
        declineUrl: declineUrl || `${this.baseUrl}/offer/decline`
      };

      const html = this.renderTemplate('offerExtended', templateData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: applicantEmail,
        subject: `🎉 Job Offer - ${jobTitle} at ${companyName}`,
        html: html,
        priority: 'high'
      });

      console.log(`✅ Job offer email sent to ${applicantEmail}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending job offer email:', error);
      throw error;
    }
  }

  // Send bulk emails (for notifications, newsletters, etc.)
  async sendBulkEmails(recipients, subject, templateName, templateData) {
    try {
      const emailPromises = recipients.map(async (recipient) => {
        const personalizedData = {
          ...templateData,
          ...recipient.data
        };

        const html = this.renderTemplate(templateName, personalizedData);

        return this.transporter.sendMail({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to: recipient.email,
          subject: subject,
          html: html
        });
      });

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`✅ Bulk email sent: ${successful} successful, ${failed} failed`);
      return { successful, failed, total: recipients.length };

    } catch (error) {
      console.error('❌ Error sending bulk emails:', error);
      throw error;
    }
  }


  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userEmail, userName, role) {
    try {
      const subject = `Welcome to FinAutoJobs - Your ${role} Account is Ready!`;
      const html = this.getWelcomeEmailTemplate(userName, role);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Welcome email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send account creation email with credentials (for admin-created users)
   */
  async sendAccountCreatedEmail(userEmail, userData) {
    try {
      const { firstName, lastName, role, password, contactNumber } = userData;
      const fullName = `${firstName} ${lastName}`;
      
      const subject = `Your FinAutoJobs Account Has Been Created - Login Details Inside`;
      const html = this.getAccountCreatedEmailTemplate(fullName, userEmail, password, role, contactNumber);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: subject,
        html: html,
        priority: 'high'
      });

      console.log(`✅ Account creation email with credentials sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send account creation email:', error);
      return false;
    }
  }


  /**
   * Send application received notification to recruiter
   */
  async sendApplicationReceivedEmail(recruiterEmail, recruiterName, applicantName, jobTitle, companyName) {
    try {
      const subject = `New Application Received for ${jobTitle} at ${companyName}`;
      const html = this.getApplicationReceivedTemplate(recruiterName, applicantName, jobTitle, companyName);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: recruiterEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Application notification sent to ${recruiterEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send application notification:', error);
      return false;
    }
  }

  /**
   * Send application status update notification to applicant
   */
  async sendApplicationStatusEmail(applicantEmail, applicantName, jobTitle, companyName, newStatus) {
    try {
      const subject = `Your Application Status Has Been Updated - ${jobTitle}`;
      const html = this.getApplicationStatusTemplate(applicantName, jobTitle, companyName, newStatus);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: applicantEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Application status update sent to ${applicantEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send application status update:', error);
      return false;
    }
  }

  /**
   * Send company verification notification to admin
   */
  async sendCompanyVerificationEmail(adminEmail, companyName, recruiterName) {
    try {
      const subject = `New Company Registration Pending Verification - ${companyName}`;
      const html = this.getCompanyVerificationTemplate(companyName, recruiterName);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: adminEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Company verification request sent to ${adminEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send company verification request:', error);
      return false;
    }
  }

  /**
   * Send company approved notification to recruiter
   */
  async sendCompanyApprovedEmail(recruiterEmail, recruiterName, companyName) {
    try {
      const subject = `Great News! Your Company ${companyName} Has Been Approved`;
      const html = this.getCompanyApprovedTemplate(recruiterName, companyName);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: recruiterEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Company approval notification sent to ${recruiterEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send company approval notification:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const subject = 'Reset Your Password - FinAutoJobs';
      const html = this.getPasswordResetTemplate(userName, resetLink);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Password reset email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  // Email Templates
  getAccountCreatedEmailTemplate(fullName, email, password, role, contactNumber) {
    const roleMessages = {
      applicant: 'You can now search for jobs, create your profile, and apply to positions that match your skills.',
      recruiter: 'You can now post job openings, manage applications, and find the best talent for your company.',
      admin: 'You have access to the admin dashboard where you can manage users, companies, and monitor platform activity.'
    };

    const dashboardUrls = {
      applicant: `${this.baseUrl}/applicant-dashboard`,
      recruiter: `${this.baseUrl}/recruiter-dashboard`,
      admin: `${this.baseUrl}/admin-dashboard`
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your FinAutoJobs Account is Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .credentials-box { background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .credential-item { margin: 10px 0; padding: 8px; background-color: white; border-radius: 4px; border-left: 4px solid #667eea; }
          .password-highlight { background-color: #fff3cd; border-color: #ffeaa7; font-weight: bold; font-size: 16px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .role-badge { background-color: #667eea; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to FinAutoJobs!</h1>
            <p>Your <span class="role-badge">${role}</span> account has been created</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName}!</h2>
            <p>Great news! An administrator has created your FinAutoJobs account. You can now access our platform and start ${roleMessages[role] || 'using our services'}.</p>
            
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <div class="credential-item">
                <strong>Email:</strong> ${email}
              </div>
              <div class="credential-item">
                <strong>Contact:</strong> ${contactNumber}
              </div>
              <div class="credential-item password-highlight">
                <strong>Password:</strong> ${password}
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong><br>
              • Please change your password after your first login<br>
              • Keep your login credentials secure and confidential<br>
              • Never share your password with anyone<br>
              • Contact support if you suspect any unauthorized access
            </div>

            <div style="text-align: center;">
              <a href="${dashboardUrls[role] || this.baseUrl}" class="cta-button">
                🚀 Access Your Dashboard
              </a>
            </div>

            <h3>What's Next?</h3>
            <ul>
              <li><strong>Login:</strong> Use the credentials above to access your account</li>
              <li><strong>Complete Profile:</strong> Add your details to get the most out of our platform</li>
              <li><strong>Change Password:</strong> Set a new password for security</li>
              <li><strong>Explore Features:</strong> ${roleMessages[role] || 'Discover what our platform has to offer'}</li>
            </ul>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome aboard!</p>
            <p><strong>The FinAutoJobs Team</strong></p>
          </div>
          <div class="footer">
            <p>This email was sent because an administrator created an account for you on FinAutoJobs.</p>
            <p>If you believe this was sent in error, please contact our support team immediately.</p>
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(userName, role) {
    const roleMessages = {
      applicant: 'You can now search for jobs, create your profile, and apply to positions that match your skills.',
      recruiter: 'You can now post job openings, manage applications, and find the best talent for your company.',
      admin: 'You have access to the admin dashboard where you can manage users, companies, and monitor platform activity.'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FinAutoJobs</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FinAutoJobs!</h1>
            <p>Your ${role} account has been successfully created</p>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Thank you for joining FinAutoJobs! We're excited to have you as part of our community.</p>
            <p>${roleMessages[role]}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(userName, verificationLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with FinAutoJobs, please ignore this email.</p>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApplicationReceivedTemplate(recruiterName, applicantName, jobTitle, companyName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Application Received!</h1>
          </div>
          <div class="content">
            <p>Dear ${recruiterName},</p>
            <p>Great news! You have received a new application for the position:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${jobTitle}</h3>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Applicant:</strong> ${applicantName}</p>
            </div>
            <p>Please log in to your dashboard to review the application and take appropriate action.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/recruiter/applications" class="button">Review Applications</a>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApplicationStatusTemplate(applicantName, jobTitle, companyName, newStatus) {
    const statusMessages = {
      'reviewing': 'Your application is currently being reviewed by the hiring team.',
      'shortlisted': 'Congratulations! You have been shortlisted for the position.',
      'interviewed': 'Thank you for attending the interview. The team is evaluating your candidacy.',
      'selected': 'Congratulations! You have been selected for the position.',
      'rejected': 'Thank you for your interest. Unfortunately, your application was not selected at this time.'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Updated</h1>
          </div>
          <div class="content">
            <p>Dear ${applicantName},</p>
            <p>The status of your application has been updated:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${jobTitle}</h3>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>New Status:</strong> <span style="text-transform: capitalize; color: #667eea;">${newStatus}</span></p>
            </div>
            <p>${statusMessages[newStatus]}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applicant/applications" class="button">View Application</a>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCompanyVerificationTemplate(companyName, recruiterName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Company Verification Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Company Verification Request</h1>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <p>A new company has registered and is awaiting verification:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${companyName}</h3>
              <p><strong>Registered by:</strong> ${recruiterName}</p>
            </div>
            <p>Please review the company information and verify the company if it meets our guidelines.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/companies" class="button">Review Companies</a>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCompanyApprovedTemplate(recruiterName, companyName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Company Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Company Approved!</h1>
          </div>
          <div class="content">
            <p>Dear ${recruiterName},</p>
            <p>Great news! Your company has been successfully verified and approved:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${companyName}</h3>
              <p><strong>Status:</strong> <span style="color: #28a745;">Verified</span></p>
            </div>
            <p>You can now post job openings and start receiving applications from qualified candidates.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/recruiter/dashboard" class="button">Go to Dashboard</a>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(userName, resetLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>We received a request to reset your password. To reset your password, click the button below:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>This password reset link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
            <p>Best regards,<br>The FinAutoJobs Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email connection
  async testConnection() {
    try {
      // Check if we have proper email configuration
      const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

      // Skip connection test in production if no proper email config
      if (process.env.NODE_ENV === 'production' && !hasEmailConfig) {
        console.log('📧 Skipping email connection test in production (using mock service)');
        return;
      }

      // Add timeout to connection test
      await Promise.race([
        this.transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000) // 5 second timeout
        )
      ]);
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      console.error('Please check your email configuration in environment variables');
      
      // Don't throw error in production, just log it
      if (process.env.NODE_ENV !== 'production') {
        throw error;
      }
    }
  }
}

// Export both the class and an instance
export { EmailService };
export default new EmailService();
