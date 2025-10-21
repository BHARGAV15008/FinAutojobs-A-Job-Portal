import crypto from 'crypto';
import { EmailService } from './emailService.js';

class OTPService {
  constructor() {
    this.emailService = new EmailService();
    this.otpStorage = new Map(); // In production, use Redis or database
    this.otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    this.otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    this.resendCooldownMinutes = parseInt(process.env.OTP_RESEND_COOLDOWN_MINUTES) || 2;
  }

  /**
   * Generate a random OTP
   */
  generateOTP() {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
  }

  /**
   * Store OTP with expiry and metadata
   */
  storeOTP(email, otp, purpose = 'verification') {
    const expiryTime = Date.now() + (this.otpExpiryMinutes * 60 * 1000);
    const otpData = {
      otp,
      purpose,
      expiryTime,
      attempts: 0,
      maxAttempts: 3,
      createdAt: Date.now()
    };
    
    this.otpStorage.set(email, otpData);
    
    // Auto-cleanup expired OTPs
    setTimeout(() => {
      this.otpStorage.delete(email);
    }, this.otpExpiryMinutes * 60 * 1000);
    
    console.log(`🔐 OTP stored for ${email}: ${otp} (expires in ${this.otpExpiryMinutes} minutes)`);
  }

  /**
   * Send OTP via email
   */
  async sendOTP(email, purpose = 'verification', userData = {}) {
    try {
      // Check if there's a recent OTP request (rate limiting)
      const existingOTP = this.otpStorage.get(email);
      if (existingOTP) {
        const timeSinceLastOTP = Date.now() - existingOTP.createdAt;
        const cooldownMs = this.resendCooldownMinutes * 60 * 1000;
        
        if (timeSinceLastOTP < cooldownMs) {
          const remainingTime = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
          throw new Error(`Please wait ${remainingTime} seconds before requesting a new OTP`);
        }
      }

      // Generate new OTP
      const otp = this.generateOTP();
      this.storeOTP(email, otp, purpose);

      // Send OTP email
      const emailSent = await this.sendOTPEmail(email, otp, purpose, userData);
      
      if (emailSent) {
        console.log(`✅ OTP sent successfully to ${email}`);
        return {
          success: true,
          message: 'OTP sent successfully',
          expiryMinutes: this.otpExpiryMinutes
        };
      } else {
        throw new Error('Failed to send OTP email');
      }

    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  verifyOTP(email, providedOTP, purpose = 'verification') {
    try {
      const otpData = this.otpStorage.get(email);
      
      if (!otpData) {
        return {
          success: false,
          message: 'No OTP found. Please request a new one.',
          code: 'OTP_NOT_FOUND'
        };
      }

      // Check if OTP has expired
      if (Date.now() > otpData.expiryTime) {
        this.otpStorage.delete(email);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
          code: 'OTP_EXPIRED'
        };
      }

      // Check purpose match
      if (otpData.purpose !== purpose) {
        return {
          success: false,
          message: 'Invalid OTP purpose.',
          code: 'INVALID_PURPOSE'
        };
      }

      // Check attempts
      if (otpData.attempts >= otpData.maxAttempts) {
        this.otpStorage.delete(email);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
          code: 'MAX_ATTEMPTS_EXCEEDED'
        };
      }

      // Verify OTP
      if (otpData.otp === providedOTP) {
        this.otpStorage.delete(email); // Remove OTP after successful verification
        console.log(`✅ OTP verified successfully for ${email}`);
        return {
          success: true,
          message: 'OTP verified successfully',
          code: 'OTP_VERIFIED'
        };
      } else {
        // Increment attempts
        otpData.attempts++;
        this.otpStorage.set(email, otpData);
        
        const remainingAttempts = otpData.maxAttempts - otpData.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          code: 'INVALID_OTP',
          remainingAttempts
        };
      }

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Send OTP email with template
   */
  async sendOTPEmail(email, otp, purpose, userData = {}) {
    try {
      const { firstName = 'User', lastName = '' } = userData;
      const fullName = `${firstName} ${lastName}`.trim();
      
      const purposeMessages = {
        verification: 'verify your email address',
        registration: 'complete your registration',
        login: 'log into your account',
        password_reset: 'reset your password',
        profile_update: 'update your profile'
      };

      const subject = `Your FinAutoJobs Verification Code: ${otp}`;
      const html = this.getOTPEmailTemplate(fullName, otp, purpose, purposeMessages[purpose] || 'verify your account');

      const result = await this.emailService.sendEmail(email, subject, html, { priority: 'high' });
      console.log(`✅ OTP email sent to ${email} (Message ID: ${result.messageId})`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      return false;
    }
  }

  /**
   * Get OTP email template
   */
  getOTPEmailTemplate(userName, otp, purpose, purposeText) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Verification Code</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
          }
          .content { 
            padding: 40px 30px; 
            text-align: center; 
          }
          .otp-container { 
            background: #f8f9fa; 
            border: 2px dashed #667eea; 
            border-radius: 10px; 
            padding: 20px; 
            margin: 30px 0; 
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #667eea; 
            letter-spacing: 8px; 
            margin: 10px 0; 
            font-family: 'Courier New', monospace; 
          }
          .otp-label { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 10px; 
          }
          .expiry-info { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 5px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #856404; 
          }
          .security-note { 
            background: #d1ecf1; 
            border: 1px solid #bee5eb; 
            border-radius: 5px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #0c5460; 
            font-size: 14px; 
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
          }
          .footer a { 
            color: #667eea; 
            text-decoration: none; 
          }
          .icon { 
            font-size: 48px; 
            margin-bottom: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🔐</div>
            <h1>Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'User'}!</h2>
            <p>You requested to ${purposeText}. Please use the verification code below:</p>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>

            <div class="expiry-info">
              ⏰ <strong>This code will expire in ${this.otpExpiryMinutes} minutes</strong>
            </div>

            <div class="security-note">
              🛡️ <strong>Security Note:</strong><br>
              • Never share this code with anyone<br>
              • FinAutoJobs will never ask for your verification code<br>
              • If you didn't request this code, please ignore this email
            </div>

            <p>If you're having trouble, contact our support team at <a href="mailto:support@finautojobs.com">support@finautojobs.com</a></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
            <p><a href="${this.emailService.baseUrl}">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Clean up expired OTPs (call this periodically)
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiryTime) {
        this.otpStorage.delete(email);
        console.log(`🧹 Cleaned up expired OTP for ${email}`);
      }
    }
  }

  /**
   * Get OTP statistics
   */
  getOTPStats() {
    const now = Date.now();
    const stats = {
      total: this.otpStorage.size,
      active: 0,
      expired: 0
    };

    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiryTime) {
        stats.expired++;
      } else {
        stats.active++;
      }
    }

    return stats;
  }
}

export default OTPService;
