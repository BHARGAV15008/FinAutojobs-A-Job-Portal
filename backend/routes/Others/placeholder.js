import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Jobs endpoints
router.get('/jobs', (req, res) => {
  res.json({
    success: true,
    data: {
      jobs: [],
      total: 0,
      page: 1,
      limit: parseInt(req.query.limit) || 10
    }
  });
});

// Applications endpoints  
router.get('/applications', (req, res) => {
  res.json({
    success: true,
    data: {
      applications: [],
      total: 0,
      page: 1,
      limit: parseInt(req.query.limit) || 10
    }
  });
});

// Notifications endpoints
router.get('/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [],
      total: 0,
      page: 1,
      limit: parseInt(req.query.limit) || 5
    }
  });
});

// Companies endpoints
router.get('/companies', (req, res) => {
  res.json({
    success: true,
    data: {
      companies: [],
      total: 0,
      page: 1,
      limit: parseInt(req.query.limit) || 10
    }
  });
});

// Profile endpoints
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Import User model
    const User = (await import('../models/UserMongoose.js')).default;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: user
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    // Import User model
    const User = (await import('../models/UserMongoose.js')).default;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email changes should go through separate verification
    delete updateData._id;
    delete updateData.id;
    delete updateData.role;
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

export default router;
