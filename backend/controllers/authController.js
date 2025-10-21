import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { generateOTP, verifyOTP } from '../utils/otpUtils.js';
import { createUserProfile } from '../services/profileService.js';
import { logActivity } from '../services/activityLogger.js';
import { NotificationService } from '../services/notifications.js';

// Enhanced error handling utility
const handleError = (res, error, statusCode = 500) => {
  console.error('Auth Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      field
    });
  }
  
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role = 'applicant',
      companyName,
      companySize,
      industry 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered',
        field: existingUser.email === email ? 'email' : 'phone'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
      isEmailVerified: false,
      isPhoneVerified: false,
      profile: {
        completionPercentage: 20
      }
    };

    // Add role-specific data
    if (role === 'recruiter') {
      userData.company = {
        name: companyName,
        size: companySize,
        industry,
        isVerified: false
      };
      userData.profile.completionPercentage = 30;
    }

    const user = new User(userData);
    await user.save();

    // Generate email verification OTP
    const emailOTP = generateOTP();
    user.emailVerification = {
      otp: emailOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0
    };
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your FinAutoJobs account',
        template: 'email-verification',
        data: {
          firstName,
          otp: emailOTP,
          expiresIn: '10 minutes'
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Create user profile
    await createUserProfile(user._id, role);

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'USER_REGISTERED',
      details: { role, email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification to admins about new user registration
    try {
      await NotificationService.notifyNewUserRegistration(user._id, role);
    } catch (notificationError) {
      console.error('Error sending new user registration notification:', notificationError);
      // Don't fail registration if notification fails
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileCompletion: user.profile.completionPercentage
        },
        accessToken,
        requiresEmailVerification: true
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, rememberMe = false } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'email'
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
        lockTimeRemaining
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        
        return res.status(423).json({
          success: false,
          message: 'Too many failed login attempts. Account locked for 30 minutes.',
          accountLocked: true
        });
      }
      
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        attemptsRemaining: 5 - user.loginAttempts
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = undefined;
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'USER_LOGIN',
      details: { email, rememberMe },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate tokens
    const tokenExpiry = rememberMe ? '30d' : '15m';
    const refreshTokenExpiry = rememberMe ? '90d' : '7d';
    
    const accessToken = jwt.sign(
      { userId: user._id, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // Set refresh token cookie
    const cookieMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileCompletion: user.profile?.completionPercentage || 0,
          avatar: user.profile?.avatar,
          company: user.company
        },
        accessToken,
        expiresIn: tokenExpiry
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Private
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    handleError(res, error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Log activity
    if (req.user) {
      await logActivity({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { otp } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Check OTP attempts
    if (user.emailVerification.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    const isValidOTP = verifyOTP(otp, user.emailVerification.otp, user.emailVerification.expiresAt);
    
    if (!isValidOTP) {
      user.emailVerification.attempts += 1;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        attemptsRemaining: 5 - user.emailVerification.attempts
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerification = undefined;
    user.profile.completionPercentage += 10;
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'EMAIL_VERIFIED',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        isEmailVerified: true,
        profileCompletion: user.profile.completionPercentage
      }
    });


    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Rate limiting - allow reset only after 5 minutes
    if (user.passwordReset?.lastSent && 
        Date.now() - user.passwordReset.lastSent < 5 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 5 minutes before requesting another reset'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token info
    user.passwordReset = {
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      lastSent: Date.now()
    };
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset your FinAutoJobs password',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        expiresIn: '1 hour'
      }
    });

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.passwordReset?.token || user.passwordReset.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordReset = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');
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
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'PASSWORD_CHANGED',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    handleError(res, error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
};
