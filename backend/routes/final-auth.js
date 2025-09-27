import express from 'express';
import jwt from 'jsonwebtoken';
import UnifiedUser from '../models/final/UnifiedUser.js';
import RecruiterProfile from '../models/final/RecruiterProfile.js';
import { uploadProfileData, getFileUrl } from '../middleware/upload.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production', (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// REGISTER with image upload
router.post('/register', uploadProfileData, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, companyName, jobTitle } = req.body;

    const userData = {
      firstName, lastName, email: email.toLowerCase(), password, phone, role
    };

    // Handle profile image
    if (req.files?.profileImage) {
      const img = req.files.profileImage[0];
      userData.profileImage = {
        url: getFileUrl(img.filename, 'profiles'),
        filename: img.filename,
        uploadedAt: new Date()
      };
    }

    // Create user by role
    let user;
    if (role === 'recruiter') {
      userData.companyInfo = { companyName, jobTitle };
      user = new RecruiterProfile(userData);
    } else {
      user = new UnifiedUser(userData);
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
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
    
    const user = await UnifiedUser.findOne({ 
      email: email.toLowerCase(), 
      role, 
      'accountStatus.isActive': true 
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
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
    const user = await UnifiedUser.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE PROFILE with image upload
router.put('/profile', auth, uploadProfileData, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle new profile image
    if (req.files?.profileImage) {
      const img = req.files.profileImage[0];
      updateData.profileImage = {
        url: getFileUrl(img.filename, 'profiles'),
        filename: img.filename,
        uploadedAt: new Date()
      };
    }

    const user = await UnifiedUser.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
