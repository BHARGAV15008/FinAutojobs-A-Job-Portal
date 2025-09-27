import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    });

    this.fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@finautojobs.com';
    this.fromName = process.env.FROM_NAME || 'FinAutoJobs Team';
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
   * Send email verification email
   */
  async sendEmailVerification(userEmail, userName, verificationToken) {
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      const subject = 'Verify Your Email Address - FinAutoJobs';
      const html = this.getEmailVerificationTemplate(userName, verificationLink);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: userEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Email verification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email verification:', error);
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
}

export default new EmailService();
