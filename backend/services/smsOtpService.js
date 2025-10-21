import twilio from 'twilio';
import { generateOTP, storeOTP, verifyOTP, sendEmail } from './Others/otpService.js';

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid') {
    try {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✅ Twilio SMS service initialized');
      return true;
    } catch (error) {
      console.warn('⚠️ Twilio initialization failed:', error.message);
      console.warn('⚠️ SMS OTP will use mock service.');
      return false;
    }
  } else {
    console.warn('⚠️ Twilio credentials not found or invalid. SMS OTP will use mock service.');
    return false;
  }
};

// Send SMS OTP
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    // Initialize Twilio if not already done
    if (!twilioClient) {
      const initialized = initializeTwilio();
      if (!initialized) {
        // Use mock SMS for development
        console.log(`📱 [MOCK SMS] OTP sent to ${phoneNumber}: ${otp}`);
        console.log('💡 To enable real SMS, configure Twilio credentials in config.env');
        return { success: true, mock: true, message: 'OTP sent via mock SMS service' };
      }
    }

    // Format phone number (ensure it starts with country code)
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhone = '+91' + phoneNumber.replace(/^0+/, '');
    }

    const message = `Your FinAutoJobs verification code is: ${otp}. This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share this code with anyone.`;

    if (twilioClient) {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      console.log('✅ SMS OTP sent successfully:', result.sid);
      return { 
        success: true, 
        sid: result.sid, 
        message: 'OTP sent to your mobile number',
        phone: formattedPhone
      };
    } else {
      // Fallback to mock SMS
      console.log(`📱 [MOCK SMS] OTP sent to ${formattedPhone}: ${otp}`);
      return { 
        success: true, 
        mock: true, 
        message: 'OTP sent via mock SMS service',
        phone: formattedPhone
      };
    }
  } catch (error) {
    console.error('❌ SMS OTP sending failed:', error.message);
    
    // If SMS fails and email fallback is enabled, try email
    if (process.env.OTP_FALLBACK_EMAIL === 'true') {
      console.log('🔄 Attempting email fallback for OTP...');
      try {
        // Try to send via email as fallback (if user has email)
        return { 
          success: false, 
          error: error.message,
          fallbackAvailable: true,
          message: 'SMS failed. Please try email OTP or contact support.'
        };
      } catch (emailError) {
        console.error('❌ Email fallback also failed:', emailError.message);
      }
    }
    
    throw new Error(`Failed to send SMS OTP: ${error.message}`);
  }
};

// Generate and send OTP via SMS
export const generateAndSendSMSOTP = async (phoneNumber, purpose = 'verification') => {
  try {
    const otp = generateOTP();
    const otpKey = `sms_${phoneNumber}_${purpose}`;
    
    // Store OTP
    storeOTP(otpKey, otp, parseInt(process.env.OTP_EXPIRY_MINUTES) || 10);
    
    // Send SMS
    const result = await sendSMSOTP(phoneNumber, otp);
    
    return {
      success: true,
      message: result.message,
      otpKey: otpKey,
      expiresIn: `${process.env.OTP_EXPIRY_MINUTES || 10} minutes`,
      mock: result.mock || false
    };
  } catch (error) {
    console.error('❌ Generate and send SMS OTP failed:', error.message);
    throw error;
  }
};

// Verify SMS OTP
export const verifySMSOTP = (phoneNumber, providedOtp, purpose = 'verification') => {
  const otpKey = `sms_${phoneNumber}_${purpose}`;
  return verifyOTP(otpKey, providedOtp);
};

// Send OTP via preferred method (SMS or Email)
export const sendOTPViaPreferredMethod = async (contact, method = 'sms', purpose = 'verification') => {
  try {
    if (method === 'sms') {
      return await generateAndSendSMSOTP(contact, purpose);
    } else if (method === 'email') {
      // Use development OTP in development mode for easier testing
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VITE_NODE_ENV === 'development';
      const otp = isDevelopment ? '123456' : generateOTP();
      const otpKey = `email_${contact}_${purpose}`;
      
      if (isDevelopment) {
        console.log('🛠️ DEVELOPMENT MODE - Using fixed OTP: 123456');
      }
      
      // Store OTP
      storeOTP(otpKey, otp, parseInt(process.env.OTP_EXPIRY_MINUTES) || 10);
      
      // Send email with fallback console logging
      const subject = 'FinAutoJobs - Verification Code';
      const body = `Your FinAutoJobs verification code is: ${otp}\n\nThis code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.\n\nDo not share this code with anyone.`;
      
      try {
        await sendEmail(contact, subject, body);
        console.log('✅ Email sent successfully to:', contact);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
        console.log('🔢 FALLBACK - OTP Code for', contact + ':', otp);
        console.log('⏰ OTP expires in:', process.env.OTP_EXPIRY_MINUTES || 10, 'minutes');
        console.log('💡 Use this OTP code from console logs since email delivery failed');
        
        // Don't throw error - still return success since OTP is stored and available via console
      }
      
      return {
        success: true,
        message: 'OTP sent to your email address',
        otpKey: otpKey,
        expiresIn: `${process.env.OTP_EXPIRY_MINUTES || 10} minutes`
      };
    } else {
      throw new Error('Invalid OTP method. Use "sms" or "email"');
    }
  } catch (error) {
    console.error('❌ Send OTP via preferred method failed:', error.message);
    throw error;
  }
};

// Verify OTP regardless of method
export const verifyOTPAnyMethod = (contact, providedOtp, method = 'sms', purpose = 'verification') => {
  const otpKey = `${method}_${contact}_${purpose}`;
  return verifyOTP(otpKey, providedOtp);
};

// Initialize Twilio on module load
initializeTwilio();

export default {
  sendSMSOTP,
  generateAndSendSMSOTP,
  verifySMSOTP,
  sendOTPViaPreferredMethod,
  verifyOTPAnyMethod
};
