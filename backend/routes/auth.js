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
  Recruiter
} from '../models/UserModels.js';
import UsernameGenerator from '../utils/usernameGenerator.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user with role validation
    const user = await findUserByIdAndRole(decoded.id || decoded.userId, decoded.role);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
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

    // Prepare user data based on role
    const userData = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      role,
      ...additionalData
    };

    // Create user with role-specific schema
    const user = await createUserByRole(userData);

    // Generate JWT token
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
  body('role').isIn(['applicant', 'recruiter']).withMessage('Role must be applicant or recruiter')
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

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: http://localhost:3000/reset-password/${resetToken}`
    });

    res.json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed' });
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
          companyInfo: user.companyInfo,
          officeLocation: user.officeLocation,
          professionalLinks: user.professionalLinks,
          recruitingStats: user.recruitingStats,
          subscription: user.subscription,
          preferences: user.preferences,
          
          // Flat fields for form compatibility
          company: user.companyInfo?.companyName || '',
          department: user.companyInfo?.department || '',
          job_title: user.companyInfo?.designation || user.companyInfo?.jobTitle || '',
          experience_years: user.yearsOfExperience || 0
        }),
        
        // Role-specific fields for applicants
        ...(user.role === 'applicant' && {
          currentLocation: user.currentLocation,
          careerInfo: user.careerInfo,
          skills: user.skills,
          languages: user.languages,
          education: user.education,
          workExperience: user.workExperience,
          documents: user.documents,
          jobPreferences: user.jobPreferences,
          profileCompletion: user.profileCompletion,
          
          // Flat fields for form compatibility
          current_job_title: user.careerInfo?.currentJobTitle || '',
          current_company: user.careerInfo?.currentCompany || '',
          expected_salary: user.careerInfo?.expectedSalary || 0
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
    const userId = req.userId;
    const userRole = req.userRole;
    let updateData = { ...req.body };
    
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
    if (updateData.bio) transformedData.bio = updateData.bio;
    if (updateData.location) transformedData.location = updateData.location;
    if (updateData.profileImage) transformedData.profileImage = updateData.profileImage;
    
    // Social links - save to both BaseUser fields and nested objects
    if (updateData.linkedin_url !== undefined) {
      transformedData.linkedin_url = updateData.linkedin_url;
      transformedData['socialLinks.linkedinUrl'] = updateData.linkedin_url;
    }
    if (updateData.github_url !== undefined) {
      transformedData.github_url = updateData.github_url;
      transformedData['socialLinks.githubUrl'] = updateData.github_url;
    }
    if (updateData.portfolio_url !== undefined) {
      transformedData.portfolio_url = updateData.portfolio_url;
      transformedData['socialLinks.portfolioUrl'] = updateData.portfolio_url;
    }
    
    // Years of experience
    if (updateData.yearsOfExperience !== undefined) {
      transformedData.yearsOfExperience = parseInt(updateData.yearsOfExperience) || 0;
    }
    if (updateData.experience_years !== undefined) {
      transformedData.yearsOfExperience = parseInt(updateData.experience_years) || 0;
    }
    
    // Role-specific transformations
    if (userRole === 'recruiter') {
      // Company info for recruiters
      if (updateData.companyInfo) {
        transformedData.companyInfo = {
          companyName: updateData.companyInfo.companyName,
          department: updateData.companyInfo.department,
          designation: updateData.companyInfo.designation
        };
      } else {
        // Handle flat form fields
        if (updateData.company || updateData.department || updateData.job_title) {
          transformedData.companyInfo = {
            companyName: updateData.company,
            department: updateData.department,
            designation: updateData.job_title
          };
        }
      }
      
      // Office location for recruiters
      if (updateData.officeLocation) {
        transformedData.officeLocation = updateData.officeLocation;
      } else if (updateData.location) {
        transformedData.officeLocation = { city: updateData.location };
      }
      
      // Professional links for recruiters
      if (updateData.professionalLinks) {
        transformedData.professionalLinks = updateData.professionalLinks;
      } else {
        transformedData.professionalLinks = {
          linkedin: updateData.linkedin_url,
          github: updateData.github_url,
          personalWebsite: updateData.portfolio_url
        };
      }
    }
    
    if (userRole === 'applicant') {
      // Current location for applicants
      if (updateData.currentLocation) {
        transformedData.currentLocation = updateData.currentLocation;
      } else if (updateData.location) {
        transformedData.currentLocation = { city: updateData.location };
      }
      
      // Skills for applicants
      if (updateData.skills) {
        transformedData.skills = updateData.skills;
      }
      
      // Languages for applicants
      if (updateData.languages) {
        transformedData.languages = updateData.languages;
      }
      
      // Career info for applicants
      if (updateData.careerInfo) {
        transformedData.careerInfo = updateData.careerInfo;
      }
    }
    
    // Update user profile
    const updatedUser = await updateUserProfile(userId, transformedData, userRole);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
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

export default router;
