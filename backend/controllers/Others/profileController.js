import { Applicant, Recruiter, Admin, getUserModel } from '../models/mongodb/UserSchemas.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schemas for profile updates
const applicantProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string().max(50)).max(20).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  qualification: z.string().max(200).optional(),
  preferred_job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance']).optional(),
  preferred_work_mode: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
  expected_salary_min: z.number().min(0).optional(),
  expected_salary_max: z.number().min(0).optional(),
  salary_currency: z.string().max(3).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    jobAlerts: z.boolean().optional(),
    messages: z.boolean().optional()
  }).optional()
});

const recruiterProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  company: z.string().min(1).max(200).optional(),
  department: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  industry: z.string().max(100).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    newApplications: z.boolean().optional(),
    messages: z.boolean().optional()
  }).optional()
});

const adminProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  department: z.string().max(100).optional(),
  access_level: z.enum(['Super Admin', 'Admin', 'Moderator']).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
    userReports: z.boolean().optional()
  }).optional()
});

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const { userId, userRole } = req.user; // Assuming this comes from auth middleware
    
    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId).select('-password');
    
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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, userRole } = req.user; // Assuming this comes from auth middleware
    const updateData = req.body;
    
    // Validate based on user role
    let validationSchema;
    switch (userRole) {
      case 'applicant':
        validationSchema = applicantProfileSchema;
        break;
      case 'recruiter':
        validationSchema = recruiterProfileSchema;
        break;
      case 'admin':
        validationSchema = adminProfileSchema;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user role'
        });
    }
    
    const validation = validationSchema.safeParse(updateData);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors
      });
    }
    
    const UserModel = getUserModel(userRole);
    
    // Clean up empty string URLs
    const cleanedData = { ...validation.data };
    ['linkedin_url', 'github_url', 'portfolio_url'].forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      }
    });
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      cleanedData,
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
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // In a real application, you would upload to a cloud service like AWS S3, Cloudinary, etc.
    // For now, we'll just store the file path
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    
    const UserModel = getUserModel(userRole);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profile_picture: profilePictureUrl },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture: updatedUser.profile_picture
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    const UserModel = getUserModel(userRole);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }
    
    // Soft delete - update status instead of actually deleting
    await UserModel.findByIdAndUpdate(userId, {
      status: 'deleted',
      email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
    });
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
