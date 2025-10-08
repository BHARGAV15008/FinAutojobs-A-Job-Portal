import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import UserModels, { 
  createUserByRole, 
  authenticateUser, 
  findUserByIdAndRole,
  updateUserProfile,
  checkFieldAvailability,
  BaseUser,
  Applicant,
  Recruiter,
  Admin
} from '../models/UserModels.js';
import UsernameGenerator from '../utils/usernameGenerator.js';
import { 
  sanitizeSocialLinks, 
  sanitizeBio, 
  isValidBio 
} from '../utils/urlValidator.js';

const router = express.Router();

// JWT Secret - get it dynamically to ensure env vars are loaded
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
  return secret;
};

// Log JWT secret info
console.log('🔍 JWT_SECRET loaded:', getJWTSecret().substring(0, 10) + '... (length:', getJWTSecret().length + ')');

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 Auth middleware - Headers:', req.headers.authorization ? 'Token present' : 'No token');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Add more detailed token verification logging
    const JWT_SECRET = getJWTSecret();
    console.log('🔍 Verifying token with JWT_SECRET length:', JWT_SECRET.length);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully:', { userId: decoded.id || decoded.userId, role: decoded.role, exp: new Date(decoded.exp * 1000) });
    
    // Find user with role validation
    const user = await findUserByIdAndRole(decoded.id || decoded.userId, decoded.role);
    
    if (!user) {
      console.log('❌ User not found for decoded token:', { userId: decoded.id || decoded.userId, role: decoded.role });
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log('✅ User authenticated successfully:', { userId: user._id, role: user.role, email: user.email });
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    // Check if it's a token expiry issue
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        error: error.message
      });
    }
    
    // Check if it's a malformed token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT',
        error: error.message
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      error: error.message
    });
  }
};

// Validation rules for registration
const registerValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters if provided'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['applicant', 'recruiter']).withMessage('Role must be applicant or recruiter')
];

// Role-based registration endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let { firstName, lastName, username, email, phone, password, role, ...additionalData } = req.body;
    
    console.log('🔍 ===== REGISTRATION REQUEST =====');
    console.log('🔍 Role:', role);
    console.log('🔍 Additional Data Keys:', Object.keys(additionalData));
    console.log('🔍 Additional Data:', JSON.stringify(additionalData, null, 2));
    console.log('🔍 =====================================');

    // Check if email is already taken for this role
    const emailAvailable = await checkFieldAvailability('email', email, role);
    if (!emailAvailable) {
      return res.status(409).json({
        success: false,
        message: `An ${role} account with this email already exists`
      });
    }

    // Auto-generate username if not provided or validate if provided
    if (!username || username.trim() === '') {
      console.log('🔄 Auto-generating username for:', firstName, lastName, 'Role:', role);
      
      const usernameResult = await UsernameGenerator.generateUniqueUsername(
        firstName, 
        lastName, 
        { 
          role: role,
          returnSuggestions: true 
        }
      );
      
      if (usernameResult.success) {
        username = usernameResult.username;
        console.log('✅ Generated username:', username, 'Pattern:', usernameResult.pattern);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate username',
          error: usernameResult.error
        });
      }
    } else {
      // Validate provided username
      const validation = UsernameGenerator.validateUsername(username);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid username format',
          errors: validation.errors
        });
      }
      
      // Check if provided username is available
      const usernameAvailable = await checkFieldAvailability('username', username);
      if (!usernameAvailable) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Prepare user data based on role with proper field transformation
    const userData = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      role
    };

    // Transform role-specific data
    if (role === 'recruiter') {
      // Transform flat recruiter fields to nested structure
      if (additionalData.company || additionalData.position || additionalData.department) {
        userData.companyInfo = {
          companyName: additionalData.company || additionalData.companyName || '',
          designation: additionalData.position || additionalData.jobTitle || additionalData.job_title || '',
          department: additionalData.department || ''
        };
      }
      
      // Handle location for recruiters
      if (additionalData.location) {
        userData.officeLocation = {
          city: additionalData.location,
          state: additionalData.state || '',
          country: additionalData.country || 'India'
        };
      }
      
      // Handle years of experience
      if (additionalData.experience_years || additionalData.yearsOfExperience) {
        userData.yearsOfExperience = parseInt(additionalData.experience_years || additionalData.yearsOfExperience) || 0;
      }
      
      // Handle social links
      if (additionalData.linkedin_url || additionalData.github_url || additionalData.portfolio_url) {
        userData.professionalLinks = {
          linkedin: additionalData.linkedin_url || '',
          github: additionalData.github_url || '',
          personalWebsite: additionalData.portfolio_url || ''
        };
        
        // Also save to flat fields for compatibility
        userData.linkedin_url = additionalData.linkedin_url || '';
        userData.github_url = additionalData.github_url || '';
        userData.portfolio_url = additionalData.portfolio_url || '';
      }
      
      // Add other recruiter-specific fields
      Object.keys(additionalData).forEach(key => {
        if (!['company', 'position', 'department', 'location', 'experience_years', 'linkedin_url', 'github_url', 'portfolio_url'].includes(key)) {
          userData[key] = additionalData[key];
        }
      });
      
    } else if (role === 'applicant') {
      // Transform flat applicant fields to nested structure
      if (additionalData.skills || additionalData.primary_skills) {
        userData.skills = {
          primary: additionalData.primary_skills || additionalData.skills || [],
          technical: additionalData.technical_skills || [],
          soft: additionalData.soft_skills || []
        };
      }
      
      // Handle career info for applicants
      if (additionalData.current_job_title || additionalData.current_company || additionalData.expected_salary) {
        userData.careerInfo = {
          currentJobTitle: additionalData.current_job_title || '',
          currentCompany: additionalData.current_company || '',
          expectedSalary: parseInt(additionalData.expected_salary) || 0,
          experienceLevel: additionalData.experience_level || ''
        };
      }
      
      // Handle location for applicants
      if (additionalData.location || additionalData.current_location) {
        userData.currentLocation = {
          city: additionalData.location || additionalData.current_location || '',
          state: additionalData.state || '',
          country: additionalData.country || 'India'
        };
      }
      
      // Handle years of experience
      if (additionalData.experience_years || additionalData.yearsOfExperience) {
        userData.yearsOfExperience = parseInt(additionalData.experience_years || additionalData.yearsOfExperience) || 0;
      }
      
      // Handle qualification -> education conversion
      if (additionalData.qualification) {
        userData.education = [{
          institution: 'Not specified',
          degree: additionalData.qualification,
          fieldOfStudy: 'Not specified',
          startDate: null,
          endDate: null,
          grade: '',
          isCurrentlyStudying: false
        }];
      }
      
      // Handle job preferences
      if (additionalData.willing_to_relocate !== undefined || additionalData.remote_work_preference !== undefined) {
        userData.jobPreferences = {
          willingToRelocate: additionalData.willing_to_relocate || false,
          remoteWorkPreference: additionalData.remote_work_preference || false,
          preferredJobTypes: additionalData.preferred_job_types ? [additionalData.preferred_job_types] : [],
          preferredLocations: additionalData.preferred_locations ? [additionalData.preferred_locations] : []
        };
      }
      
      // Handle documents
      if (additionalData.resume_url || additionalData.cover_letter_url) {
        userData.documents = {
          resumeUrl: additionalData.resume_url || '',
          coverLetterUrl: additionalData.cover_letter_url || '',
          portfolioUrl: additionalData.portfolio_url || '',
          certificates: []
        };
      }
      
      // Handle social links for applicants too
      if (additionalData.linkedin_url || additionalData.github_url || additionalData.portfolio_url) {
        userData.linkedin_url = additionalData.linkedin_url || '';
        userData.github_url = additionalData.github_url || '';
        userData.portfolio_url = additionalData.portfolio_url || '';
      }
      
      // Add other applicant-specific fields
      Object.keys(additionalData).forEach(key => {
        if (!['skills', 'primary_skills', 'technical_skills', 'soft_skills', 'current_job_title', 'current_company', 'expected_salary', 'experience_level', 'location', 'current_location', 'experience_years', 'qualification', 'willing_to_relocate', 'remote_work_preference', 'preferred_job_types', 'preferred_locations', 'resume_url', 'cover_letter_url', 'portfolio_url', 'linkedin_url', 'github_url'].includes(key)) {
          userData[key] = additionalData[key];
        }
      });
    } else {
      // For other roles, just add additional data as-is
      Object.assign(userData, additionalData);
    }

    console.log('🔍 ===== TRANSFORMED USER DATA =====');
    console.log('🔍 Final userData Keys:', Object.keys(userData));
    console.log('🔍 Final userData:', JSON.stringify(userData, null, 2));
    console.log('🔍 =====================================');

    // Create user with role-specific schema
    const user = await createUserByRole(userData);

    // Generate JWT token
    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      { 
        id: user._id, 
        userId: user.userId,
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Validation rules for login
const loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Email, username, or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['applicant', 'recruiter', 'admin']).withMessage('Role must be applicant, recruiter, or admin')
];

// Role-based login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, password, role } = req.body;

    // Authenticate user with role validation
    const user = await authenticateUser(identifier, password, role);

    // Generate JWT token
    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      { 
        id: user._id, 
        userId: user.userId,
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        id: user._id, 
        userId: user.userId,
        role: user.role 
      }, 
      JWT_SECRET + '_refresh', 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error messages
    if (error.message.includes('No ') || error.message.includes('Invalid password')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('locked')) {
      return res.status(423).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout user (client-side token invalidation)
router.post('/logout', (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing token
  res.json({ message: 'Logout successful' });
});

// Token validation endpoint for debugging
router.get('/validate-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      userId: req.user._id,
      role: req.user.role,
      email: req.user.email,
      tokenValid: true
    }
  });
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    console.log(`🔍 Password reset requested for email: ${email}`);

    // Find user by email (works with discriminator pattern)
    const user = await BaseUser.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Create password reset record
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    
    // Remove any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });
    
    // Create new reset token
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    console.log(`🔍 Reset token created: ${resetToken.substring(0, 8)}... for user ${user.email}`);

    // Send password reset email using EmailService
    try {
      const emailService = (await import('../services/emailService.js')).default;
      
      await emailService.sendPasswordResetEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        resetToken
      );
      
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;
    console.log(`🔍 Password reset attempt with token: ${token.substring(0, 8)}...`);

    // Find password reset record
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    const resetRecord = await PasswordReset.findOne({
      token: token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find the user
    const user = await BaseUser.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update only the password field to avoid validation issues with other fields
    await BaseUser.findByIdAndUpdate(user._id, { 
      password: hashedPassword 
    }, { 
      validateBeforeSave: false,
      runValidators: false 
    });

    // Mark reset token as used
    resetRecord.used = true;
    await resetRecord.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

// Test endpoint to generate a reset link (for development only)
router.get('/test-reset-link/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find user
    const user = await BaseUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Delete any existing reset tokens for this user
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    await PasswordReset.deleteMany({ userId: user._id });
    
    // Create new reset token
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    res.json({
      success: true,
      message: 'Test reset link generated',
      resetLink: resetLink,
      token: resetToken
    });

  } catch (error) {
    console.error('❌ Test reset link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test reset link'
    });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    // Implement email verification logic here
    res.json({ message: 'Email verified' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token: accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
});

// Get user profile with role-specific data
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Enhanced profile data with role-specific fields
    const profileData = {
      success: true,
      data: {
        _id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        location: user.location,
        profileImage: user.profileImage,
        
        // Social links (dual mapping for compatibility)
        linkedin_url: user.linkedin_url || user.socialLinks?.linkedinUrl || user.professionalLinks?.linkedin || '',
        github_url: user.github_url || user.socialLinks?.githubUrl || user.professionalLinks?.github || '',
        portfolio_url: user.portfolio_url || user.socialLinks?.portfolioUrl || user.professionalLinks?.personalWebsite || '',
        
        // Experience
        yearsOfExperience: user.yearsOfExperience || 0,
        
        // Status fields
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        
        // Role-specific fields for recruiters
        ...(user.role === 'recruiter' && {
          companyInfo: user.companyInfo || {},
          officeLocation: user.officeLocation || {},
          professionalLinks: user.professionalLinks || {},
          specializations: user.specializations || [],
          industryExpertise: user.industryExpertise || [],
          recruitingStats: user.recruitingStats || {},
          subscription: user.subscription || {},
          preferences: user.preferences || {},
          
          // Flat fields for form compatibility - map from database structure
          company: user.companyInfo?.companyName || '',
          job_title: user.companyInfo?.designation || user.companyInfo?.jobTitle || '',
          department: user.companyInfo?.department || '',
          location: user.officeLocation?.city || user.companyInfo?.workLocation?.city || '',
          linkedin_url: user.professionalLinks?.linkedin || '',
          github_url: user.professionalLinks?.github || '',
          portfolio_url: user.professionalLinks?.personalWebsite || '',
          experience_years: user.yearsOfExperience || 0
        }),
        
        // Role-specific fields for applicants
        ...(user.role === 'applicant' && {
          currentLocation: user.currentLocation || {},
          careerInfo: user.careerInfo || {},
          skills: user.skills || { technical: [], soft: [], primary: [], languages: [] },
          languages: user.languages || [],
          education: user.education || [],
          workExperience: user.workExperience || [],
          documents: user.documents || { resumeUrl: '', coverLetterUrl: '', portfolioUrl: '', certificates: [] },
          jobPreferences: user.jobPreferences || {},
          profileCompletion: user.profileCompletion || { basicInfo: true, completionPercentage: 10 },
          
          // Flat fields for form compatibility
          current_job_title: user.careerInfo?.currentJobTitle || '',
          current_company: user.careerInfo?.currentCompany || '',
          expected_salary: user.careerInfo?.expectedSalary || 0,
          
          // Resume field mapping (multiple possible sources)
          resume_url: user.documents?.resumeUrl || user.resumeUrl || user.resume_url || '',
          
          // Additional applicant fields for registration compatibility
          primary_skills: user.skills?.primary || user.primarySkills || [],
          experience_level: user.careerInfo?.experienceLevel || user.experienceLevel || '',
          current_location: user.currentLocation?.city || user.location || '',
          willing_to_relocate: user.jobPreferences?.willingToRelocate || false,
          remote_work_preference: user.jobPreferences?.remoteWorkPreference || false,
          
          // Experience and qualification fields for form compatibility
          experience_years: user.yearsOfExperience || user.experience_years || 0,
          qualification: user.education?.[0]?.degree || user.qualification || '',
          
          // Handle skills array for form display
          skills_array: user.skills?.primary || user.skills?.technical || user.primarySkills || []
        })
      }
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile with role-specific field mapping
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const userRole = req.user.role;
    const updateData = req.body;
    
    console.log('🔍 ===== PROFILE UPDATE REQUEST =====');
    console.log('🔍 User ID:', userId);
    console.log('🔍 User Role:', userRole);
    console.log('🔍 Update Data Keys:', Object.keys(updateData));
    console.log('🔍 Full Update Data:', JSON.stringify(updateData, null, 2));
    console.log('🔍 =====================================');
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;
    delete updateData.role;
    delete updateData.userId;
    
    // Transform data based on role
    const transformedData = {};
    
    // Common fields
    if (updateData.firstName) transformedData.firstName = updateData.firstName;
    if (updateData.lastName) transformedData.lastName = updateData.lastName;
    if (updateData.phone) transformedData.phone = updateData.phone;
    if (updateData.bio) {
      // Validate and sanitize bio to prevent URLs
      if (!isValidBio(updateData.bio)) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot contain URLs. Please enter a proper bio description.',
          field: 'bio'
        });
      }
      transformedData.bio = sanitizeBio(updateData.bio);
    }
    if (updateData.location) transformedData.location = updateData.location;
    if (updateData.profileImage) transformedData.profileImage = updateData.profileImage;
    
    // Social links - validate and sanitize URLs
    const socialLinksToValidate = {
      linkedin_url: updateData.linkedin_url,
      github_url: updateData.github_url,
      portfolio_url: updateData.portfolio_url
    };
    
    const sanitizedSocialLinks = sanitizeSocialLinks(socialLinksToValidate);
    
    // Apply sanitized social links
    if (updateData.linkedin_url !== undefined) {
      transformedData.linkedin_url = sanitizedSocialLinks.linkedin_url || '';
      transformedData['socialLinks.linkedinUrl'] = sanitizedSocialLinks.linkedin_url || '';
    }
    if (updateData.github_url !== undefined) {
      transformedData.github_url = sanitizedSocialLinks.github_url || '';
      transformedData['socialLinks.githubUrl'] = sanitizedSocialLinks.github_url || '';
    }
    if (updateData.portfolio_url !== undefined) {
      transformedData.portfolio_url = sanitizedSocialLinks.portfolio_url || '';
      transformedData['socialLinks.portfolioUrl'] = sanitizedSocialLinks.portfolio_url || '';
    }
    
    // Years of experience
    if (updateData.yearsOfExperience !== undefined) {
      console.log('🔍 Backend: Setting yearsOfExperience from yearsOfExperience field:', updateData.yearsOfExperience);
      transformedData.yearsOfExperience = parseInt(updateData.yearsOfExperience) || 0;
    }
    if (updateData.experience_years !== undefined) {
      console.log('🔍 Backend: Setting yearsOfExperience from experience_years field:', updateData.experience_years);
      transformedData.yearsOfExperience = parseInt(updateData.experience_years) || 0;
    }
    
    // Role-specific transformations
    if (userRole === 'recruiter') {
      // Company info for recruiters - match database structure
      if (updateData.companyInfo) {
        transformedData.companyInfo = {
          ...transformedData.companyInfo, // Preserve existing fields
          companyName: updateData.companyInfo.companyName,
          department: updateData.companyInfo.department, // Add department field
          designation: updateData.companyInfo.designation, // Note: designation, not department
          workLocation: updateData.companyInfo.workLocation
        };
      } else {
        // Handle flat form fields - map to correct database fields
        const companyInfoUpdate = {};
        if (updateData.company) companyInfoUpdate.companyName = updateData.company;
        if (updateData.department) companyInfoUpdate.department = updateData.department; // Add department field
        if (updateData.job_title) companyInfoUpdate.designation = updateData.job_title; // job_title -> designation
        if (updateData.location) {
          companyInfoUpdate.workLocation = { 
            city: updateData.location,
            country: "India" // Default country
          };
        }
        
        if (Object.keys(companyInfoUpdate).length > 0) {
          transformedData.companyInfo = companyInfoUpdate;
        }
      }
      
      // Office location for recruiters - match database structure
      if (updateData.officeLocation) {
        transformedData.officeLocation = updateData.officeLocation;
      } else if (updateData.location) {
        transformedData.officeLocation = { 
          city: updateData.location,
          country: "India" // Default country
        };
      }
      
      // Professional links for recruiters - match database structure
      if (updateData.professionalLinks) {
        transformedData.professionalLinks = updateData.professionalLinks;
      } else {
        // Build professional links object matching database structure
        const professionalLinksUpdate = {};
        if (updateData.linkedin_url) professionalLinksUpdate.linkedin = updateData.linkedin_url;
        if (updateData.github_url) professionalLinksUpdate.github = updateData.github_url;
        if (updateData.portfolio_url) professionalLinksUpdate.personalWebsite = updateData.portfolio_url;
        
        if (Object.keys(professionalLinksUpdate).length > 0) {
          transformedData.professionalLinks = {
            ...professionalLinksUpdate,
            otherUrls: [] // Maintain database structure
          };
        }
      }
      
      // Years of experience - direct mapping
      if (updateData.experience_years !== undefined) {
        transformedData.yearsOfExperience = parseInt(updateData.experience_years) || 0;
      }
    }
    
    if (userRole === 'applicant') {
      // Current location for applicants
      if (updateData.currentLocation) {
        transformedData.currentLocation = updateData.currentLocation;
      } else if (updateData.location || updateData.current_location) {
        transformedData.currentLocation = { city: updateData.location || updateData.current_location };
      }
      
      // Skills for applicants
      if (updateData.skills) {
        transformedData.skills = updateData.skills;
      } else if (updateData.primary_skills) {
        transformedData.skills = {
          primary: updateData.primary_skills,
          technical: updateData.technical_skills || [],
          soft: updateData.soft_skills || []
        };
      }
      
      // Languages for applicants
      if (updateData.languages) {
        transformedData.languages = updateData.languages;
      }
      
      // Career info for applicants
      if (updateData.careerInfo) {
        transformedData.careerInfo = updateData.careerInfo;
      } else {
        // Handle flat form fields for career info
        const careerInfo = {};
        if (updateData.current_job_title) careerInfo.currentJobTitle = updateData.current_job_title;
        if (updateData.current_company) careerInfo.currentCompany = updateData.current_company;
        if (updateData.expected_salary) careerInfo.expectedSalary = updateData.expected_salary;
        if (updateData.experience_level) careerInfo.experienceLevel = updateData.experience_level;
        
        if (Object.keys(careerInfo).length > 0) {
          transformedData.careerInfo = careerInfo;
        }
      }
      
      // Education for applicants
      if (updateData.education) {
        console.log('🔍 Backend: Using existing education array:', updateData.education);
        transformedData.education = updateData.education;
      } else if (updateData.qualification) {
        // Handle simple qualification field by converting to education array
        console.log('🔍 Backend: Converting qualification to education:', updateData.qualification);
        transformedData.education = [{
          institution: 'Not specified',
          degree: updateData.qualification,
          fieldOfStudy: 'Not specified',
          startDate: null,
          endDate: null,
          grade: '',
          isCurrentlyStudying: false
        }];
        console.log('🔍 Backend: Created education array:', transformedData.education);
        
        // Also save qualification as a flat field for backward compatibility
        transformedData.qualification = updateData.qualification;
      }
      
      // Work experience for applicants
      if (updateData.workExperience) {
        transformedData.workExperience = updateData.workExperience;
      } else if (updateData.experience_years || updateData.current_job_title || updateData.current_company) {
        // Handle flat experience fields by converting to workExperience array
        const experienceYears = parseInt(updateData.experience_years) || 1;
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - experienceYears);
        
        const experienceEntry = {
          company: updateData.current_company || 'Not specified',
          position: updateData.current_job_title || 'Not specified',
          startDate: startDate,
          endDate: null,
          isCurrentJob: true,
          description: updateData.experience_years ? `${updateData.experience_years} years of experience` : 'Experience details'
        };
        transformedData.workExperience = [experienceEntry];
      }
      
      // Documents for applicants
      if (updateData.documents) {
        transformedData.documents = updateData.documents;
      } else if (updateData.resume_url !== undefined || updateData.cover_letter_url !== undefined || updateData.portfolio_url !== undefined) {
        // Handle flat document fields - always create documents object if any field is provided
        transformedData.documents = {
          resumeUrl: updateData.resume_url || '',
          coverLetterUrl: updateData.cover_letter_url || '',
          portfolioUrl: updateData.portfolio_url || '',
          certificates: []
        };
        
        // Also save to flat fields for backward compatibility
        if (updateData.resume_url !== undefined) transformedData.resume_url = updateData.resume_url;
        if (updateData.cover_letter_url !== undefined) transformedData.cover_letter_url = updateData.cover_letter_url;
        if (updateData.portfolio_url !== undefined) transformedData.portfolio_url = updateData.portfolio_url;
        
        console.log('🔍 Backend created documents object:', transformedData.documents);
      }
      
      // Job preferences for applicants
      if (updateData.jobPreferences) {
        transformedData.jobPreferences = updateData.jobPreferences;
      } else {
        // Handle flat preference fields
        const jobPreferences = {};
        if (updateData.willing_to_relocate !== undefined) jobPreferences.willingToRelocate = updateData.willing_to_relocate;
        if (updateData.remote_work_preference !== undefined) jobPreferences.remoteWorkPreference = updateData.remote_work_preference;
        if (updateData.preferred_job_types) jobPreferences.preferredJobTypes = updateData.preferred_job_types;
        if (updateData.preferred_locations) jobPreferences.preferredLocations = updateData.preferred_locations;
        
        if (Object.keys(jobPreferences).length > 0) {
          transformedData.jobPreferences = jobPreferences;
        }
      }
    }
    
    // Update user profile
    console.log('🔍 Calling updateUserProfile with:', {
      userId,
      transformedData: JSON.stringify(transformedData, null, 2),
      userRole
    });
    
    const updatedUser = await updateUserProfile(userId, transformedData, userRole);
    
    console.log('✅ Profile update successful!');
    console.log('✅ Updated user keys:', Object.keys(updatedUser));
    
    // Return the same comprehensive data structure as GET /profile
    const profileData = {
      _id: updatedUser._id,
      userId: updatedUser.userId,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      bio: updatedUser.bio,
      location: updatedUser.location,
      profileImage: updatedUser.profileImage,
      
      // Social links (dual mapping for compatibility)
      linkedin_url: updatedUser.linkedin_url || updatedUser.socialLinks?.linkedinUrl || updatedUser.professionalLinks?.linkedin || '',
      github_url: updatedUser.github_url || updatedUser.socialLinks?.githubUrl || updatedUser.professionalLinks?.github || '',
      portfolio_url: updatedUser.portfolio_url || updatedUser.socialLinks?.portfolioUrl || updatedUser.professionalLinks?.personalWebsite || '',
      
      // Experience
      yearsOfExperience: updatedUser.yearsOfExperience || 0,
      
      // Status fields
      status: updatedUser.status,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      
      // Role-specific fields for recruiters
      ...(updatedUser.role === 'recruiter' && {
        companyInfo: updatedUser.companyInfo || {},
        officeLocation: updatedUser.officeLocation || {},
        professionalLinks: updatedUser.professionalLinks || {},
        specializations: updatedUser.specializations || [],
        industryExpertise: updatedUser.industryExpertise || [],
        recruitingStats: updatedUser.recruitingStats || {},
        subscription: updatedUser.subscription || {},
        preferences: updatedUser.preferences || {},
        
        // Flat fields for form compatibility - map from database structure
        company: updatedUser.companyInfo?.companyName || '',
        job_title: updatedUser.companyInfo?.designation || updatedUser.companyInfo?.jobTitle || '',
        department: updatedUser.companyInfo?.department || '',
        location: updatedUser.officeLocation?.city || updatedUser.companyInfo?.workLocation?.city || '',
        linkedin_url: updatedUser.professionalLinks?.linkedin || '',
        github_url: updatedUser.professionalLinks?.github || '',
        portfolio_url: updatedUser.professionalLinks?.personalWebsite || '',
        experience_years: updatedUser.yearsOfExperience || 0
      }),
      
      // Role-specific fields for applicants
      ...(updatedUser.role === 'applicant' && {
        currentLocation: updatedUser.currentLocation || {},
        careerInfo: updatedUser.careerInfo || {},
        skills: updatedUser.skills || { technical: [], soft: [], primary: [], languages: [] },
        languages: updatedUser.languages || [],
        education: updatedUser.education || [],
        workExperience: updatedUser.workExperience || [],
        documents: updatedUser.documents || { resumeUrl: '', coverLetterUrl: '', portfolioUrl: '', certificates: [] },
        jobPreferences: updatedUser.jobPreferences || {},
        profileCompletion: updatedUser.profileCompletion || { basicInfo: true, completionPercentage: 10 },
        
        // Flat fields for form compatibility
        current_job_title: updatedUser.careerInfo?.currentJobTitle || '',
        current_company: updatedUser.careerInfo?.currentCompany || '',
        expected_salary: updatedUser.careerInfo?.expectedSalary || 0,
        
        // Resume field mapping (multiple possible sources)
        resume_url: updatedUser.documents?.resumeUrl || updatedUser.resumeUrl || updatedUser.resume_url || '',
        
        // Additional applicant fields for registration compatibility
        primary_skills: updatedUser.skills?.primary || updatedUser.primarySkills || [],
        experience_level: updatedUser.careerInfo?.experienceLevel || updatedUser.experienceLevel || '',
        current_location: updatedUser.currentLocation?.city || updatedUser.location || '',
        willing_to_relocate: updatedUser.jobPreferences?.willingToRelocate || false,
        remote_work_preference: updatedUser.jobPreferences?.remoteWorkPreference || false,
        
        // Experience and qualification fields for form compatibility
        experience_years: updatedUser.yearsOfExperience || updatedUser.experience_years || 0,
        qualification: updatedUser.education?.[0]?.degree || updatedUser.qualification || '',
        
        // Handle skills array for form display
        skills_array: updatedUser.skills?.primary || updatedUser.skills?.technical || updatedUser.primarySkills || []
      })
    };
    
    console.log('✅ Returning comprehensive profile data with keys:', Object.keys(profileData));
    console.log('✅ Applicant-specific fields:', {
      skills_array: profileData.skills_array,
      primary_skills: profileData.primary_skills,
      resume_url: profileData.resume_url
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Check field availability endpoint
router.post('/check-availability', async (req, res) => {
  try {
    const { field, value, role } = req.body;
    
    if (!['email', 'username', 'phone'].includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field. Must be email, username, or phone'
      });
    }
    
    const available = await checkFieldAvailability(field, value, role);
    
    res.json({
      success: true,
      available,
      message: available ? `${field} is available` : `${field} is already taken`
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

// Generate username suggestions endpoint
router.post('/generate-username', async (req, res) => {
  try {
    const { firstName, lastName, role = 'applicant' } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }
    
    const result = await UsernameGenerator.generateUniqueUsername(
      firstName, 
      lastName, 
      { 
        role: role,
        returnSuggestions: true 
      }
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          recommended: result.username,
          pattern: result.pattern,
          method: result.method,
          suggestions: result.suggestions || [],
          message: `Generated username using ${result.pattern} pattern`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate username suggestions',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Username generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate username suggestions',
      error: error.message
    });
  }
});

// Validate username format endpoint
router.post('/validate-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }
    
    const validation = UsernameGenerator.validateUsername(username);
    const available = validation.valid ? await checkFieldAvailability('username', username) : false;
    
    res.json({
      success: true,
      data: {
        valid: validation.valid,
        available: available,
        errors: validation.errors,
        message: validation.valid 
          ? (available ? 'Username is valid and available' : 'Username is valid but already taken')
          : 'Username format is invalid'
      }
    });
  } catch (error) {
    console.error('Username validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate username',
      error: error.message
    });
  }
});

// Email OTP endpoint
router.post('/send-otp-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory (in production, use Redis or database)
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    
    // Store OTP with 5-minute expiry
    global.otpStore.set(email, {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      type: 'email'
    });

    // Check if email configuration is available and valid
    const hasEmailConfig = (process.env.SMTP_USER || process.env.EMAIL_USER) && 
                          (process.env.SMTP_PASS || process.env.EMAIL_PASS);
    
    if (!hasEmailConfig) {
      // For development, log the OTP instead of sending email
      console.log(`📧 Email OTP for ${email}: ${otp} (Email not configured - check console)`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        data: {
          email: email,
          expiresIn: 300, // 5 minutes in seconds
          // In development mode, include OTP for testing
          ...(process.env.NODE_ENV === 'development' && { otp: otp, note: 'Email not configured - OTP shown for development' })
        }
      });
      return;
    }

    // Try to send email, but fall back to console logging if it fails
    try {

    // Configure email transporter only if credentials are available
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    });

    // Send OTP email
    const mailOptions = {
      from: `"FinAutoJobs" <${process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your FinAutoJobs Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2196F3; color: white; padding: 20px; text-align: center;">
            <h1>Email Verification</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Your Verification Code</h2>
            <p>Use the following code to verify your email address:</p>
            <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #666;">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Add timeout to email sending to prevent hanging
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000) // 10 second timeout
      )
    ]);
    
      console.log(`✅ Email OTP sent to ${email}: ${otp}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        data: {
          email: email,
          expiresIn: 300 // 5 minutes in seconds
        }
      });

    } catch (emailError) {
      // If email sending fails, fall back to console logging
      console.warn('⚠️ Email sending failed, falling back to console logging:', emailError.message);
      console.log(`📧 Email OTP for ${email}: ${otp} (Email sending failed - check console)`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully to your email',
        data: {
          email: email,
          expiresIn: 300, // 5 minutes in seconds
          // In development mode, include OTP for testing when email fails
          ...(process.env.NODE_ENV === 'development' && { otp: otp, note: 'Email sending failed - OTP shown for development' })
        }
      });
    }

  } catch (error) {
    console.error('❌ Email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email OTP',
      error: error.message
    });
  }
});

// SMS OTP endpoint
router.post('/send-otp-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory (in production, use Redis or database)
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    
    // Store OTP with 5-minute expiry
    global.otpStore.set(phone, {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      type: 'sms'
    });

    // For development, we'll just log the OTP instead of sending SMS
    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'OTP sent successfully to your phone',
      data: {
        phone: phone,
        expiresIn: 300, // 5 minutes in seconds
        // In development, include OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp: otp })
      }
    });

  } catch (error) {
    console.error('❌ SMS OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS OTP',
      error: error.message
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp, type } = req.body; // identifier can be email or phone
    
    if (!identifier || !otp || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, OTP, and type are required'
      });
    }

    if (!global.otpStore) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    const storedOtpData = global.otpStore.get(identifier);
    
    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expires) {
      global.otpStore.delete(identifier);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Check if type matches
    if (storedOtpData.type !== type) {
      return res.status(400).json({
        success: false,
        message: 'OTP type mismatch.'
      });
    }

    // OTP is valid, remove it from store
    global.otpStore.delete(identifier);
    
    console.log(`✅ OTP verified successfully for ${identifier}`);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        identifier: identifier,
        type: type,
        verified: true
      }
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// Change password endpoint (temporarily without auth for testing)
router.put('/change-password-test', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    console.log('🔍 Test change password endpoint hit (no auth)');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Extract user ID from JWT token (even though we're bypassing full auth)
    let userId;
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
        console.log('🔍 Extracted user ID from token:', userId);
      } else {
        // Fallback to hardcoded ID if no token (for testing)
        userId = '68dd0ee2c795122ec2e79479';
        console.log('🔍 Using fallback user ID (no token provided)');
      }
    } catch (error) {
      // Fallback to hardcoded ID if token is invalid
      userId = '68dd0ee2c795122ec2e79479';
      console.log('🔍 Using fallback user ID (invalid token)');
    }
    
    // Find user and verify current password
    const user = await BaseUser.findById(userId);
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

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await BaseUser.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    }, { 
      validateBeforeSave: false,
      runValidators: false 
    });

    console.log(`✅ Password updated successfully for user: ${userId} (TEST MODE)`);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully (TEST MODE)'
    });

  } catch (error) {
    console.error('❌ Error changing password (TEST):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Change password endpoint
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    console.log('🔍 Change password endpoint hit with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user._id;

    // Find user and verify current password
    const user = await BaseUser.findById(userId);
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

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await BaseUser.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    console.log(`✅ Password updated successfully for user: ${userId}`);

    const response = {
      success: true,
      message: 'Password updated successfully'
    };
    console.log('🔍 Sending response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Change username endpoint (test version without auth)
router.put('/change-username-test', [
  body('newUsername')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password').notEmpty().withMessage('Password is required for username change')
], async (req, res) => {
  try {
    console.log('🔍 Test change username endpoint hit (no auth)');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newUsername, password } = req.body;
    
    // Extract user ID from JWT token (even though we're bypassing full auth)
    let userId;
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
        console.log('🔍 Extracted user ID from token:', userId);
      } else {
        // Fallback to hardcoded ID if no token (for testing)
        userId = '68dd0ee2c795122ec2e79479';
        console.log('🔍 Using fallback user ID (no token provided)');
      }
    } catch (error) {
      // Fallback to hardcoded ID if token is invalid
      userId = '68dd0ee2c795122ec2e79479';
      console.log('🔍 Using fallback user ID (invalid token)');
    }
    
    // Find user and verify password
    const user = await BaseUser.findById(userId);
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
        message: 'Password is incorrect'
      });
    }

    // Check if username is already taken
    const existingUser = await BaseUser.findOne({ 
      username: newUsername.toLowerCase(),
      _id: { $ne: userId } // Exclude current user
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Update username
    await BaseUser.findByIdAndUpdate(userId, {
      username: newUsername.toLowerCase(),
      updatedAt: new Date()
    }, { 
      validateBeforeSave: false,
      runValidators: false 
    });

    console.log(`✅ Username updated successfully for user: ${userId} to: ${newUsername} (TEST MODE)`);

    res.json({
      success: true,
      message: 'Username updated successfully (TEST MODE)',
      data: {
        username: newUsername.toLowerCase()
      }
    });

  } catch (error) {
    console.error('❌ Error changing username (TEST):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change username'
    });
  }
});

// Change username endpoint
router.put('/change-username', [
  authenticateToken,
  body('newUsername')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password').notEmpty().withMessage('Password is required for username change')
], async (req, res) => {
  try {
    console.log('🔍 Change username endpoint hit with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newUsername, password } = req.body;
    const userId = req.user.userId || req.user._id;

    // Find user and verify password
    const user = await BaseUser.findById(userId);
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
        message: 'Password is incorrect'
      });
    }

    // Check if username is already taken
    const existingUser = await BaseUser.findOne({ 
      username: newUsername.toLowerCase(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Update username
    await BaseUser.findByIdAndUpdate(userId, {
      username: newUsername.toLowerCase(),
      updatedAt: new Date()
    });

    console.log(`✅ Username updated successfully for user: ${userId} to: ${newUsername}`);

    res.json({
      success: true,
      message: 'Username updated successfully',
      data: {
        username: newUsername.toLowerCase()
      }
    });

  } catch (error) {
    console.error('❌ Error changing username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change username'
    });
  }
});

// Get OTP status endpoint (for debugging)
router.get('/otp-status/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!global.otpStore) {
      return res.json({
        success: true,
        data: {
          exists: false,
          message: 'No OTP store initialized'
        }
      });
    }

    const storedOtpData = global.otpStore.get(identifier);
    
    if (!storedOtpData) {
      return res.json({
        success: true,
        data: {
          exists: false,
          message: 'No OTP found for this identifier'
        }
      });
    }

    const isExpired = Date.now() > storedOtpData.expires;
    const timeRemaining = Math.max(0, Math.floor((storedOtpData.expires - Date.now()) / 1000));

    res.json({
      success: true,
      data: {
        exists: true,
        expired: isExpired,
        type: storedOtpData.type,
        timeRemaining: timeRemaining,
        // In development, show OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp: storedOtpData.otp })
      }
    });

  } catch (error) {
    console.error('❌ OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
      error: error.message
    });
  }
});

// Test endpoint to verify routes are working
router.get('/test-routes', (req, res) => {
  console.log('🔍 Test routes endpoint hit');
  res.json({
    success: true,
    message: 'Auth routes are working',
    availableRoutes: [
      'GET /test-routes',
      'PUT /change-password',
      'PUT /change-username',
      'GET /profile',
      'PUT /profile'
    ]
  });
});

// Test endpoint for frontend connectivity (no auth required)
router.post('/test-frontend', (req, res) => {
  console.log('🔍 Frontend test endpoint hit with body:', req.body);
  res.status(200).json({
    success: true,
    message: 'Frontend can reach backend successfully',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test PUT endpoint (no auth required)
router.put('/test-put', (req, res) => {
  console.log('🔍 PUT test endpoint hit with body:', req.body);
  res.status(200).json({
    success: true,
    message: 'PUT request successful',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Import SMS OTP functions for backward compatibility
import { 
  generateAndSendSMSOTP, 
  verifySMSOTP, 
  sendOTPViaPreferredMethod,
  verifyOTPAnyMethod 
} from '../services/smsOtpService.js';

// Send OTP endpoint (backward compatibility)
router.post('/send-otp', [
  body('phoneNumber')
    .optional()
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('method')
    .optional()
    .isIn(['sms', 'email'])
    .withMessage('Method must be either "sms" or "email"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, email, method = 'sms' } = req.body;
    const contact = phoneNumber || email;

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: 'Either phoneNumber or email is required'
      });
    }

    const result = await sendOTPViaPreferredMethod(contact, method, 'verification');

    res.json({
      success: true,
      message: result.message,
      data: {
        method: method,
        expiresIn: result.expiresIn,
        mock: result.mock || false
      }
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP endpoint (backward compatibility)
router.post('/verify-otp', [
  body('phoneNumber')
    .optional()
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('method')
    .optional()
    .isIn(['sms', 'email'])
    .withMessage('Method must be either "sms" or "email"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, email, otp, method = 'sms' } = req.body;
    const contact = phoneNumber || email;

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: 'Either phoneNumber or email is required'
      });
    }

    const result = verifyOTPAnyMethod(contact, otp, method, 'verification');

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        attemptsLeft: result.attemptsLeft
      });
    }

  } catch (error) {
    console.error('❌ Verify OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

export default router;
