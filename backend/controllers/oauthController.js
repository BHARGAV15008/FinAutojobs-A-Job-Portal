import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logActivity } from '../services/activityLogger.js';
import { createUserProfile } from '../services/profileService.js';
import { sendEmail } from '../services/emailService.js';

// Enhanced error handling utility
const handleError = (res, error, statusCode = 500) => {
  console.error('OAuth Error:', error);
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'OAuth authentication failed',
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

// Handle OAuth success callback
const handleOAuthSuccess = async (req, res, provider) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed&provider=${provider}`);
    }

    const user = req.user;
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'OAUTH_LOGIN',
      details: { provider, email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Redirect to frontend with success
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/oauth-success`);
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('provider', provider);
    redirectUrl.searchParams.set('isNewUser', req.isNewUser ? 'true' : 'false');
    
    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error(`${provider} OAuth success handler error:`, error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_error&provider=${provider}`);
  }
};

// Handle OAuth failure
const handleOAuthFailure = (req, res, provider, error) => {
  console.error(`${provider} OAuth failure:`, error);
  
  let errorCode = 'oauth_failed';
  if (error?.message?.includes('email')) {
    errorCode = 'email_required';
  } else if (error?.message?.includes('cancelled')) {
    errorCode = 'user_cancelled';
  }
  
  res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=${errorCode}&provider=${provider}`);
};

// @desc    Google OAuth initiation
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, user, info) => {
    if (error) {
      return handleOAuthFailure(req, res, 'google', error);
    }
    
    if (!user) {
      return handleOAuthFailure(req, res, 'google', new Error(info?.message || 'Authentication failed'));
    }
    
    req.user = user;
    req.isNewUser = info?.isNewUser || false;
    return handleOAuthSuccess(req, res, 'google');
  })(req, res, next);
};

// @desc    Microsoft OAuth initiation
// @route   GET /api/auth/microsoft
// @access  Public
export const microsoftAuth = passport.authenticate('microsoft', {
  scope: ['user.read'],
  prompt: 'select_account'
});

// @desc    Microsoft OAuth callback
// @route   GET /api/auth/microsoft/callback
// @access  Public
export const microsoftCallback = (req, res, next) => {
  passport.authenticate('microsoft', { session: false }, (error, user, info) => {
    if (error) {
      return handleOAuthFailure(req, res, 'microsoft', error);
    }
    
    if (!user) {
      return handleOAuthFailure(req, res, 'microsoft', new Error(info?.message || 'Authentication failed'));
    }
    
    req.user = user;
    req.isNewUser = info?.isNewUser || false;
    return handleOAuthSuccess(req, res, 'microsoft');
  })(req, res, next);
};

// @desc    Apple OAuth initiation
// @route   GET /api/auth/apple
// @access  Public
export const appleAuth = passport.authenticate('apple', {
  scope: ['name', 'email']
});

// @desc    Apple OAuth callback
// @route   POST /api/auth/apple/callback
// @access  Public
export const appleCallback = (req, res, next) => {
  passport.authenticate('apple', { session: false }, (error, user, info) => {
    if (error) {
      return handleOAuthFailure(req, res, 'apple', error);
    }
    
    if (!user) {
      return handleOAuthFailure(req, res, 'apple', new Error(info?.message || 'Authentication failed'));
    }
    
    req.user = user;
    req.isNewUser = info?.isNewUser || false;
    return handleOAuthSuccess(req, res, 'apple');
  })(req, res, next);
};

// @desc    Link OAuth account to existing user
// @route   POST /api/auth/link-oauth
// @access  Private
export const linkOAuthAccount = async (req, res) => {
  try {
    const { provider, providerId, email } = req.body;
    const userId = req.user.id;

    if (!provider || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider and provider ID are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if this OAuth account is already linked to another user
    const existingUser = await User.findOne({
      [`oauthProviders.${provider}.id`]: providerId,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `This ${provider} account is already linked to another user`
      });
    }

    // Link the OAuth account
    user.oauthProviders = user.oauthProviders || {};
    user.oauthProviders[provider] = {
      id: providerId,
      email: email || user.email,
      linkedAt: new Date()
    };

    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'OAUTH_ACCOUNT_LINKED',
      details: { provider, email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
      data: {
        linkedProviders: Object.keys(user.oauthProviders)
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Unlink OAuth account
// @route   DELETE /api/auth/unlink-oauth/:provider
// @access  Private
export const unlinkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password or other OAuth providers
    const hasPassword = user.password;
    const otherProviders = user.oauthProviders ? 
      Object.keys(user.oauthProviders).filter(p => p !== provider) : [];

    if (!hasPassword && otherProviders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink the only authentication method. Please set a password first.'
      });
    }

    // Check if the provider is actually linked
    if (!user.oauthProviders?.[provider]) {
      return res.status(400).json({
        success: false,
        message: `${provider} account is not linked`
      });
    }

    // Unlink the OAuth account
    delete user.oauthProviders[provider];
    if (Object.keys(user.oauthProviders).length === 0) {
      user.oauthProviders = undefined;
    }

    await user.save();

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'OAUTH_ACCOUNT_UNLINKED',
      details: { provider },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`,
      data: {
        linkedProviders: user.oauthProviders ? Object.keys(user.oauthProviders) : []
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get linked OAuth accounts
// @route   GET /api/auth/oauth-accounts
// @access  Private
export const getLinkedAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('oauthProviders email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const linkedAccounts = [];
    if (user.oauthProviders) {
      for (const [provider, data] of Object.entries(user.oauthProviders)) {
        linkedAccounts.push({
          provider,
          email: data.email,
          linkedAt: data.linkedAt
        });
      }
    }

    res.json({
      success: true,
      data: {
        linkedAccounts,
        primaryEmail: user.email
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Handle OAuth account selection for role
// @route   POST /api/auth/oauth-role-selection
// @access  Private (temporary token from OAuth)
export const handleRoleSelection = async (req, res) => {
  try {
    const { role, companyName, companySize, industry } = req.body;
    const userId = req.user.id;

    if (!['applicant', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role and profile
    user.role = role;
    user.profile = user.profile || {};
    user.profile.completionPercentage = role === 'recruiter' ? 40 : 30;

    // Add company information for recruiters
    if (role === 'recruiter') {
      user.company = {
        name: companyName,
        size: companySize,
        industry,
        isVerified: false
      };
    }

    await user.save();

    // Create user profile
    await createUserProfile(user._id, role);

    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to FinAutoJobs!',
        template: 'welcome',
        data: {
          firstName: user.firstName,
          role: role,
          loginUrl: `${process.env.FRONTEND_URL}/auth/login`
        }
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Log activity
    await logActivity({
      userId: user._id,
      action: 'OAUTH_ROLE_SELECTED',
      details: { role, companyName },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate new tokens with updated role
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Role selection completed successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompletion: user.profile.completionPercentage,
          company: user.company
        },
        accessToken
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

export default {
  googleAuth,
  googleCallback,
  microsoftAuth,
  microsoftCallback,
  appleAuth,
  appleCallback,
  linkOAuthAccount,
  unlinkOAuthAccount,
  getLinkedAccounts,
  handleRoleSelection
};
