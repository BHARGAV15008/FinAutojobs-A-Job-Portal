import nodemailer from 'nodemailer';

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Mock email service for production
const mockEmailService = {
  async sendOTP(email, otp, purpose = 'verification') {
    console.log('📧 Mock Email Service - OTP would be sent:');
    console.log(`   Email: ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Purpose: ${purpose}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      message: 'OTP sent via mock service (production mode)'
    };
  }
};

// Helper function to generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email
export const sendEmail = async (to, subject, body) => {
  try {
    // Use environment variables for email configuration
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // If no email credentials are provided, use Ethereal for testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  No email credentials found. Using Ethereal test service.');
      let testAccount = await nodemailer.createTestAccount();
      emailConfig.host = 'smtp.ethereal.email';
      emailConfig.auth = {
        user: testAccount.user,
        pass: testAccount.pass,
      };
    }

    // Create a transporter object
    let transporter = nodemailer.createTransport(emailConfig);

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FinAutoJobs" <no-reply@finautojobs.com>',
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    console.log('✅ Email sent successfully:', info.messageId);
    
    // Show preview URL only for Ethereal
    if (emailConfig.host === 'smtp.ethereal.email') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Helper function to send SMS
export const sendSMS = async (to, message) => {
  try {
    // Check if Twilio credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      // Import Twilio dynamically to avoid errors if not installed
      let twilio;
      try {
        const twilioModule = await import('twilio');
        twilio = twilioModule.default;
      } catch (importError) {
        console.warn('⚠️  Twilio not installed. Install with: npm install twilio');
        throw new Error('Twilio package not installed');
      }

      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      
      console.log('✅ SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } else {
      // Mock SMS for development/testing
      console.warn('⚠️  No Twilio credentials found. Using mock SMS service.');
      console.log(`📱 [MOCK] SMS sent to ${to}`);
      console.log(`📄 Message: ${message}`);
      console.log('💡 To enable real SMS, configure Twilio credentials in .env file');
      return { success: true, mock: true };
    }
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Store OTP with expiration
export const storeOTP = (key, otp, expirationMinutes = 5) => {
  otpStorage.set(key, {
    otp,
    expiresAt: Date.now() + expirationMinutes * 60 * 1000,
    attempts: 0
  });
};

// Verify OTP
export const verifyOTP = (key, providedOtp) => {
  const storedOtpData = otpStorage.get(key);

  if (!storedOtpData) {
    return { success: false, message: 'OTP not found or expired' };
  }

  // Check if OTP is expired
  if (Date.now() > storedOtpData.expiresAt) {
    otpStorage.delete(key);
    return { success: false, message: 'OTP has expired' };
  }

  // Check attempts limit
  if (storedOtpData.attempts >= 3) {
    otpStorage.delete(key);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  // Verify OTP
  if (storedOtpData.otp !== providedOtp) {
    storedOtpData.attempts += 1;
    otpStorage.set(key, storedOtpData);
    
    return { 
      success: false, 
      message: 'Invalid OTP',
      attemptsLeft: 3 - storedOtpData.attempts
    };
  }

  // OTP is valid, remove from storage
  otpStorage.delete(key);
  return { success: true, message: 'OTP verified successfully' };
};

// Clean expired OTPs (run periodically)
export const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(key);
    }
  }
};

// Set up periodic cleanup (every 10 minutes)
setInterval(cleanExpiredOTPs, 10 * 60 * 1000);
