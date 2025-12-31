import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { BaseUser, Applicant, Recruiter } from '../models/UserModels.js';

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users with filtering (Candidate Search)
 * @access Public (limited fields) / Private (full fields)
 */
router.get('/', async (req, res) => {
  try {
    const { role, search, skills, location, page = 1, limit = 10 } = req.query;
    
    let query = {
      isActive: true, // Only show active users
      isDeleted: { $ne: true }
    };
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Search by name
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by location
    if (location) {
      query.$or = [
        { 'location': { $regex: location, $options: 'i' } },
        { 'currentLocation.city': { $regex: location, $options: 'i' } }
      ];
    }

    // Filter by skills (if applicant)
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      // Matches if any of the skills are present in primary, technical or soft skills
      query.$or = [
        { 'skills.primary': { $in: skillsArray } },
        { 'skills.technical': { $in: skillsArray } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Select fields based on auth status (todo: checking req.headers.authorization manually since this route is public)
    const publicFields = 'firstName lastName username role profileImage location currentJobTitle skills education experience_years';
    
    const users = await BaseUser.find(query)
      .select(publicFields)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await BaseUser.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await BaseUser.findById(id)
      .select('-password -__v -loginAttempts -lockUntil -refresh_token');
      
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is active
    if (!user.isActive || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not available'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

/**
 * @route GET /api/users/:id/profile
 * @desc Get user profile by ID (Alias)
 * @access Public
 */
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Reuse the same logic
    const user = await BaseUser.findById(id)
      .select('-password -__v -loginAttempts -lockUntil -refresh_token');
      
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update user profile
 * @access Private (Self or Admin)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check authorization
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    // Prevent updating sensitive fields directly
    const restrictedFields = ['password', 'email', 'role', '_id', 'userId', 'createdAt', 'updatedAt'];
    restrictedFields.forEach(field => delete updateData[field]);
    
    const updatedUser = await BaseUser.findByIdAndUpdate(
      id,
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
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/users/:id/status
 * @desc Update user status (Admin only)
 * @access Private (Admin)
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    const isActive = status === 'active';
    
    const updatedUser = await BaseUser.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User status updated',
      data: {
          id: updatedUser._id,
          isActive: updatedUser.isActive,
          status: status
      }
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

export default router;