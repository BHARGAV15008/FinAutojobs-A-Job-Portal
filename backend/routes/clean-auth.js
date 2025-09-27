import express from 'express';
import jwt from 'jsonwebtoken';
import CleanUser from '../models/CleanUser.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, 'your-jwt-secret-key-change-this-in-production', (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, companyName, position } = req.body;

    const userData = { firstName, lastName, email: email.toLowerCase(), password, phone, role };

    if (role === 'recruiter') {
      userData.companyInfo = { companyName, jobTitle: position };
      userData.recruitingStats = { totalJobsPosted: 0, activeJobs: 0, totalHires: 0 };
    }

    const user = new CleanUser(userData);
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'your-jwt-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: { user: { ...user.toObject(), password: undefined }, token }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const user = await CleanUser.findOne({ email: email.toLowerCase(), role, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'your-jwt-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { user: { ...user.toObject(), password: undefined }, token }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET PROFILE
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await CleanUser.findById(req.user.userId).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE PROFILE
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await CleanUser.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send OTP Email endpoint
router.post('/send-otp-email', async (req, res) => {
  try {
    console.log('📧 Clean server - Send OTP request received:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ Email missing in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`✅ Clean server - OTP generated for ${email}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp // Only for development/testing
    });
    
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP', 
      error: error.message 
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('🔍 Clean server - Verify OTP request received:', req.body);
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      console.log('❌ Missing email or OTP:', { email: !!email, otp: !!otp });
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    console.log(`✅ Clean server - OTP verification successful for ${email}`);
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
    
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP', 
      error: error.message 
    });
  }
});

export default router;
