/**
 * Authentication Controller
 * 
 * Handles user authentication, registration, and session management
 * using Mongoose models and our comprehensive user schemas.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserModel, createUserModel } from '../../models/schemas/users/UserFactory.js';
import { trackActivity } from '../../models/schemas/activities/ActivityFactory.js';
import { notificationManager } from '../../models/schemas/system/SystemFactory.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      userRole: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    },
    process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
    { expiresIn: '24h' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production',
    { expiresIn: '7d' }
  );
};

// Helper function to send welcome notification
const sendWelcomeNotification = async (user) => {
  try {
    await notificationManager.send({
      recipient: {
        userId: user._id,
        role: user.role,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      content: {
        type: 'welcome',
        category: 'system',
        priority: 'medium',
        title: 'Welcome to FinAutoJobs!',
        message: `Hi ${user.firstName}, welcome to FinAutoJobs! Complete your profile to get better job recommendations.`,
        actionText: 'Complete Profile',
        actionUrl: '/profile'
      },
      delivery: {
        channels: [
          { type: 'in_app', status: 'pending' },
          { type: 'email', status: 'pending' }
        ]
      }
    });
  } catch (error) {
    console.error('Failed to send welcome notification:', error);
  }
};

// Register new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, ...additionalData } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, password, and role are required'
      });
    }

    // Validate role
    if (!['applicant', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be applicant, recruiter, or admin'
      });
    }

    // Check if user already exists
    const UserModel = getUserModel(role);
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user data
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active',
      emailVerified: false,
      ...additionalData
    };

    // Create user using factory
    const user = createUserModel(role, userData);
    await user.save();

    // Track registration activity
    await trackActivity({
      user: {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      activity: {
        type: 'register',
        category: 'authentication',
        action: 'User registered',
        description: `New ${role} account created`
      },
      conversion: {
        isConversion: true,
        conversionType: 'registration'
      },
      session: {
        sessionId: req.sessionID || `sess_${Date.now()}`,
        device: {
          type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
          userAgent: req.headers['user-agent']
        },
        location: {
          ip: req.ip || req.connection.remoteAddress
        }
      }
    });

    // Send welcome notification
    await sendWelcomeNotification(user);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // If role is provided, use specific model, otherwise try all roles
    let user = null;
    let userRole = null;

    if (role) {
      const UserModel = getUserModel(role);
      user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
      userRole = role;
    } else {
      // Try all user roles
      const roles = ['applicant', 'recruiter', 'admin'];
      for (const r of roles) {
        const UserModel = getUserModel(r);
        const foundUser = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (foundUser) {
          user = foundUser;
          userRole = r;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Track login activity
    await trackActivity({
      user: {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      activity: {
        type: 'login',
        category: 'authentication',
        action: 'User logged in',
        description: 'Successful login'
      },
      session: {
        sessionId: req.sessionID || `sess_${Date.now()}`,
        device: {
          type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
          userAgent: req.headers['user-agent']
        },
        location: {
          ip: req.ip || req.connection.remoteAddress
        }
      }
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user (try all roles)
    let user = null;
    const roles = ['applicant', 'recruiter', 'admin'];
    for (const role of roles) {
      const UserModel = getUserModel(role);
      const foundUser = await UserModel.findById(decoded.userId);
      if (foundUser) {
        user = foundUser;
        break;
      }
    }

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const { userId, userRole } = req.user;

    // Track logout activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'logout',
        category: 'authentication',
        action: 'User logged out',
        description: 'User session ended'
      },
      session: {
        sessionId: req.sessionID || `sess_${Date.now()}`,
        device: {
          type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
          userAgent: req.headers['user-agent']
        },
        location: {
          ip: req.ip || req.connection.remoteAddress
        }
      }
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const { userId, userRole } = req.user;

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
      data: {
        user: user.toObject()
      }
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
    const { userId, userRole } = req.user;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData._id;

    const UserModel = getUserModel(userRole);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { ...updateData, lastModifiedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Track profile update activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: user.email
      },
      activity: {
        type: 'profile_update',
        category: 'profile',
        action: 'Profile updated',
        description: 'User profile information updated'
      },
      context: {
        changes: {
          fields: Object.keys(updateData)
        }
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toObject()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { currentPassword, newPassword } = req.body;

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
    const user = await UserModel.findById(userId).select('+password');

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
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Track password change activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: user.email
      },
      activity: {
        type: 'password_reset',
        category: 'authentication',
        action: 'Password changed',
        description: 'User changed their password'
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
