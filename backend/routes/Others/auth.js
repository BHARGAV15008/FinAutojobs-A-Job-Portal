import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';

import UsernameGenerator from '../../utils/usernameGenerator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  generateToken, 
  generateRefreshToken, 
  generateTokenPair,
  verifyRefreshToken, 
  refreshAccessToken,
  authenticateToken,
  authRateLimit,
  deviceFingerprint,
  createUserSession,
  invalidateUserSession,
  checkUserSession
} from '../../middleware/Others/auth.js';
import { sendEmailOTP, sendSMSOTP, verifyOTPCode } from '../../Controllers/Others/otpController.js';

const router = express.Router();

// Simple registration endpoint for testing
router.post('/register-simple', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'applicant' } = req.body;
    
    // Import User model
    const User = (await import('../../models/UserMongoose.js')).default;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    
    // Generate username
    const username = `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    
    // Create new user
    const user = new User({
      username,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role
    });
    
    await user.save();
    
    // Generate token
    const tokenPair = generateTokenPair({ 
      userId: user._id, 
      email: user.email, 
      role: user.role
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token: tokenPair.accessToken
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

// Profile endpoint with fallback support
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Profile endpoint called with user:', req.user);
    
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.userRole || req.user.role || 'applicant';
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    let user = null;
    let role = userRole;
    
    // Try to find user in main User collection first
    try {
      const User = (await import('../../models/UserMongoose.js')).default;
      user = await User.findById(userId);
      if (user) {
        role = user.role || userRole;
      }
    } catch (error) {
      console.error('Error finding user in main collection:', error);
    }
    
    // Skip UserFactory for now - using MongoDB only
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format user data for frontend
    const userData = {
      id: user._id,
      username: user.username,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      fullName: user.fullName || user.full_name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim(),
      email: user.email,
      phone: user.phone,
      role: role,
      status: user.status || 'active',
      emailVerified: user.emailVerified || user.email_verified || false,
      phoneVerified: user.phoneVerified || user.phone_verified || false,
      profileCompleted: user.profileCompleted || user.profile_completed || false,
      
      // Professional fields for applicants
      ...(role === 'applicant' && {
        currentJobTitle: user.currentJobTitle,
        experienceLevel: user.experienceLevel,
        totalExperience: user.totalExperience,
        skills: user.skills,
        qualification: user.qualification,
        bio: user.bio,
        location: user.location,
        resumeUrl: user.resumeUrl,
        linkedinUrl: user.linkedinUrl || user.linkedin_url,
        githubUrl: user.githubUrl || user.github_url,
        portfolioUrl: user.portfolioUrl || user.portfolio_url
      }),
      
      // Company fields for recruiters
      ...(role === 'recruiter' && {
        companyName: user.companyName || user.company_name,
        position: user.position,
        companyId: user.companyId || user.company_id,
        bio: user.bio,
        location: user.location
      }),
      
      // Common fields
      preferences: user.preferences,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: { user: userData }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// OAuth Routes (temporarily disabled to fix server startup)
// Google Auth Routes
/*
router.get('/google', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        display: 'popup'
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: true }),
    (req, res) => {
        const token = generateToken(req.user);
        const refreshToken = generateRefreshToken(req.user);
        
        // Send response that will be handled by the popup window
        res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ 
                            type: 'AUTH_SUCCESS',
                            token: '${token}',
                            refreshToken: '${refreshToken}',
                            user: ${JSON.stringify(req.user)}
                        }, '${process.env.FRONTEND_URL}');
                        window.close();
                    </script>
                </body>
            </html>
        `);
    }
);

// Microsoft Auth Routes
router.get('/microsoft', (req, res, next) => {
    passport.authenticate('microsoft', {
        prompt: 'select_account',
        display: 'popup'
    })(req, res, next);
});

router.get('/microsoft/callback',
    passport.authenticate('microsoft', { session: true }),
    (req, res) => {
        const token = generateToken(req.user);
        const refreshToken = generateRefreshToken(req.user);
        
        // Send response that will be handled by the popup window
        res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ 
                            type: 'AUTH_SUCCESS',
                            token: '${token}',
                            refreshToken: '${refreshToken}',
                            user: ${JSON.stringify(req.user)}
                        }, '${process.env.FRONTEND_URL}');
                        window.close();
                    </script>
                </body>
            </html>
        `);
    }
);

// Apple Auth Routes
router.get('/apple', passport.authenticate('apple'));

router.get('/apple/callback',
    passport.authenticate('apple', {
        failureRedirect: '/login',
        session: true
    }),
    (req, res) => {
        // Generate JWT token here if needed
        res.redirect('/dashboard');
    }
);
*/

// Register new user
// Import email validation middleware (temporarily disabled)
// import emailValidationRouter from './email-validation.js';

// Use email validation routes (temporarily disabled)
// router.use(emailValidationRouter);

// Registration endpoint with username generation and improved error handling
router.post('/register', [
  body('firstName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
], async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      email: req.body.email,
      role: req.body.role,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email, password, role = 'applicant', ...additionalData } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Validate role
    if (!['applicant', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be applicant, recruiter, or admin'
      });
    }

    // Import User model and check if user already exists
    const User = (await import('../../models/UserMongoose.js')).default;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
        field: 'email'
      });
    }
    
    // Check phone number if provided
    if (additionalData.phone) {
      const existingPhone = await User.findOne({ phone: additionalData.phone });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number is already registered',
          field: 'phone'
        });
      }
    }

    // Generate unique username
    const usernameResult = await UsernameGenerator.generateUniqueUsername(firstName, lastName);

    // Prepare user data (password will be hashed by the User model's pre-save hook)
    const userData = {
      firstName,
      lastName,
      username: usernameResult.username,
      email: email.toLowerCase(),
      password, // Raw password - will be hashed by pre-save hook
      role,
      status: 'active',
      emailVerified: false,
      ...additionalData
    };

    // Create user using MongoDB model
    const user = new User(userData);
    await user.save();

    console.log('✅ User created successfully:', {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Create new session for the registered user
    const deviceInfo = req.get('User-Agent') || 'Unknown Device';
    const ipAddress = req.ip || 'Unknown IP';
    const sessionId = await createUserSession(user._id, deviceInfo, ipAddress);

    // Generate tokens using the proper auth middleware function with session
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`
    };
    const token = generateToken(tokenPayload, '24h', sessionId);

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      fullName: `${user.firstName} ${user.lastName}`,
      displayName: `${user.firstName} ${user.lastName}`,
      // Include role-specific fields
      ...(role === 'applicant' && {
        skills: user.skills,
        qualification: user.qualification,
        experience: user.experience
      }),
      ...(role === 'recruiter' && {
        companyName: user.companyName,
        position: user.position,
        companySize: user.companySize,
        industry: user.industry
      })
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        usernameGeneration: {
          method: usernameResult.method,
          alternatives: usernameResult.alternatives || []
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      
      if (duplicateField === 'email') {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered',
          field: 'email'
        });
      }
      
      if (duplicateField === 'phone') {
        return res.status(409).json({
          success: false,
          message: 'Mobile number is already registered',
          field: 'phone'
        });
      }
      
      if (duplicateField === 'username') {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken',
          field: 'username'
        });
      }
    }
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => ({
        path: e.path,
        message: e.message,
        value: e.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed during user creation',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
})

// Enhanced login user with rate limiting
router.post('/login', 
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  deviceFingerprint,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ], 
  async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Login attempt for user
    
    // Import the User model
    const User = (await import('../../models/UserMongoose.js')).default;
    
    // Find user in the main User collection
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'AUTHENTICATION_FAILED'
      });
    }
    
    const role = user.role || 'applicant';

    // Verify password using the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'AUTHENTICATION_FAILED'
      });
    }

    // Check if user already has an active session (single session enforcement)
    if (user.active_sessions && user.active_sessions.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User is already logged in from another device. Please logout first.',
        error: 'ALREADY_LOGGED_IN',
        code: 'SINGLE_SESSION_VIOLATION'
      });
    }

    // Create new session
    const deviceInfo = req.get('User-Agent') || 'Unknown Device';
    const ipAddress = req.ip || 'Unknown IP';
    const sessionId = await createUserSession(user._id, deviceInfo, ipAddress);

    // Generate enhanced token pair with session ID
    const tokenPair = generateTokenPair({ 
      userId: user._id, 
      email: user.email, 
      role: role  // Use role from UserFactory result
    }, sessionId);

    // Use toJSON to get clean user object
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        ...tokenPair
      }
    });
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'LOGIN_ERROR'
    })
  }
})

// Enhanced refresh token endpoint
router.post('/refresh', authRateLimit(10, 15 * 60 * 1000), deviceFingerprint, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Use enhanced refresh token logic
    const tokenPair = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokenPair
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: 'INVALID_REFRESH_TOKEN'
    })
  }
})

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Since we're using the factory pattern, we need to check both user types
    const ApplicantModel = getUserModel('applicant');
    const RecruiterModel = getUserModel('recruiter');
    
    let user = null;
    
    // Try to find user in applicant collection first
    user = await ApplicantModel.findById(req.user.userId);
    
    // If not found, try recruiter collection
    if (!user) {
      user = await RecruiterModel.findById(req.user.userId);
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      })
    }

    // Return user profile without sensitive data
    const userProfile = {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName}`,
      displayName: `${user.firstName} ${user.lastName}`,
      // Include role-specific fields
      ...(user.role === 'applicant' && {
        skills: user.skills,
        qualification: user.qualification,
        experience: user.experience
      }),
      ...(user.role === 'recruiter' && {
        companyName: user.companyName,
        position: user.position,
        companySize: user.companySize,
        industry: user.industry
      })
    }

    res.json({
      success: true,
      data: {
        user: userProfile
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: 'PROFILE_FETCH_ERROR'
    })
  }
})

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('currentJobTitle').optional().trim().isLength({ max: 100 }),
  body('currentCompany').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
      'currentJobTitle', 'currentCompany', 'experience', 'skills',
      'industries', 'expectedSalary', 'location', 'socialLinks',
      'preferences', 'privacy'
    ]

    const updates = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Map frontend field names to database field names
        const dbField = field === 'firstName' ? 'first_name' : 
                       field === 'lastName' ? 'last_name' : 
                       field === 'dateOfBirth' ? 'date_of_birth' : 
                       field === 'currentJobTitle' ? 'current_job_title' : 
                       field === 'currentCompany' ? 'current_company' : 
                       field === 'expectedSalary' ? 'expected_salary' : field
        
        updates[dbField] = req.body[field]
      }
    })

    const updatedUser = await User.updateProfile(req.user.userId, updates)

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: 'PROFILE_UPDATE_ERROR'
    })
  }
})

// Change password
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body

    // Get user
    const user = await User.findById(req.user.userId)
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      })
    }

    // Update password
    await User.updatePassword(user._id, newPassword)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: 'PASSWORD_CHANGE_ERROR'
    })
  }
})

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more sophisticated setup, you might want to maintain a blacklist of tokens
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user
      const token = generateToken({ userId: user._id, email: user.email })
      const refreshToken = generateRefreshToken({ userId: user._id })

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`)
    } catch (error) {
      console.error('Google callback error:', error)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/auth/callback?error=oauth_error`)
    }
  }
)

// Microsoft OAuth routes
router.get('/microsoft', passport.authenticate('microsoft', {
  scope: ['openid', 'profile', 'email']
}))

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { session: false }),
  async (req, res) => {
    try {
      const user = req.user
      const token = generateToken({ userId: user._id, email: user.email })
      const refreshToken = generateRefreshToken({ userId: user._id })

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`)
    } catch (error) {
      console.error('Microsoft callback error:', error)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      res.redirect(`${frontendUrl}/auth/callback?error=oauth_error`)
    }
  }
)

// Signup endpoint (alias for register)
router.post('/signup', [
  // Name validations - accept either full_name OR firstName+lastName
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  // Custom validation to ensure either full_name or firstName+lastName is provided
  body().custom((value, { req }) => {
    const { full_name, firstName, lastName } = req.body;
    if (!full_name && (!firstName || !lastName)) {
      throw new Error('Either full_name or both firstName and lastName must be provided');
    }
    return true;
  }),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['job_seeker', 'jobseeker', 'employer', 'recruiter', 'admin'])
    .withMessage('Role must be either job_seeker, jobseeker, employer, recruiter, or admin'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { full_name, firstName, lastName, email, password, role = 'job_seeker', phone, username } = req.body

    // Handle name formats
    let finalFullName = full_name;
    if (!finalFullName && (firstName || lastName)) {
      finalFullName = `${firstName || ''} ${lastName || ''}`.trim();
    }
    if (!finalFullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
        field: 'full_name'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        ...(username ? [{ username }] : [])
      ]
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? 'User with this email already exists' 
          : 'Username already taken',
        field: existingUser.email === email.toLowerCase() ? 'email' : 'username'
      })
    }

    // Create new user
    const userData = {
      full_name: finalFullName,
      email: email.toLowerCase(),
      password,
      role: role === 'jobseeker' ? 'job_seeker' : role,
      username: username || email.split('@')[0],
      phone
    }

    const user = new User(userData)
    await user.save()

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user._id })

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified
      },
      token,
      refreshToken
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: 'REGISTRATION_ERROR'
    })
  }
});

// Profile update endpoint
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    // Import User model
    const User = (await import('../../models/UserMongoose.js')).default;
    
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

// Logout endpoint with session invalidation
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get sessionId from the decoded token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sessionId = decoded.sessionId;
    
    // Invalidate user session
    await invalidateUserSession(userId, sessionId);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
});

// Force logout endpoint (logout from all devices)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Invalidate all user sessions
    await invalidateUserSession(userId);
    
    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
    
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices',
      error: error.message
    });
  }
});

// OTP Routes
router.post('/send-otp-email', sendEmailOTP);
router.post('/send-otp-sms', sendSMSOTP);
router.post('/verify-otp', verifyOTPCode);

export default router;
