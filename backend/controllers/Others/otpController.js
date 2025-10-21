import crypto from 'crypto';

// In-memory OTP storage
const otpStorage = new Map();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const otp = generateOTP();
    otpStorage.set(email, { otp, expiryTime: Date.now() + 300000, attempts: 0 });
    
    console.log(`📧 Email OTP for ${email}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent to email successfully',
      data: { identifier: email, type: 'email', expiresIn: 300 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const sendSMSOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }
    
    const otp = generateOTP();
    otpStorage.set(phone, { otp, expiryTime: Date.now() + 300000, attempts: 0 });
    
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent to phone successfully',
      data: { identifier: phone, type: 'sms', expiresIn: 300 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTPCode = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Identifier and OTP required' });
    }
    
    const otpData = otpStorage.get(identifier);
    if (!otpData || Date.now() > otpData.expiryTime) {
      otpStorage.delete(identifier);
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }
    
    if (otpData.otp === otp) {
      otpStorage.delete(identifier);
      return res.json({ success: true, message: 'OTP verified successfully' });
    }
    
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};
