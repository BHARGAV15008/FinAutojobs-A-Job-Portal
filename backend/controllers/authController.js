import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, userSessions } from '../schema.js';
import { eq, or } from 'drizzle-orm';

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email (mock implementation)
const sendEmail = async (to, subject, body) => {
  // In production, integrate with email service like SendGrid, AWS SES, etc.
  console.log(`📧 Email sent to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  return true;
};

// Helper function to send SMS (mock implementation)
const sendSMS = async (to, message) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  console.log(`📱 SMS sent to ${to}`);
  console.log(`Message: ${message}`);
  return true;
};

// Helper function to generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Helper function to generate refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role = 'jobseeker' } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      full_name,
      phone,
      role,
      status: 'active',
      email_verified: false,
      phone_verified: false
    }).returning();

    const user = newUser[0];

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await db.insert(userSessions).values({
      user_id: user.id,
      token: token,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration' 
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email or username
    const userResult = await db.select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, email)))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const user = userResult[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        message: 'Account is inactive. Please contact support.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await db.insert(userSessions).values({
      user_id: user.id,
      token: token,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during login' 
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (refreshToken) {
      // Remove refresh token from database
      await db.delete(userSessions)
        .where(eq(userSessions.refresh_token, refreshToken));
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Internal server error during logout' 
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if refresh token exists in database
    const sessionResult = await db.select()
      .from(userSessions)
      .where(eq(userSessions.refresh_token, refreshToken))
      .limit(1);

    if (sessionResult.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid refresh token' 
      });
    }

    const session = sessionResult[0];

    // Check if refresh token is expired
    if (new Date(session.expires_at) < new Date()) {
      // Remove expired token
      await db.delete(userSessions)
        .where(eq(userSessions.refresh_token, refreshToken));
      
      return res.status(401).json({ 
        message: 'Refresh token expired' 
      });
    }

    // Get user data
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult[0];

    // Generate new access token
    const newToken = generateToken(user);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      message: 'Invalid refresh token' 
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    // Get user from database
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId));

    res.json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Send Email OTP
export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    const otpKey = `email_${email}`;
    otpStorage.set(otpKey, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Send email
    const subject = 'FinAutoJobs - Email Verification Code';
    const body = `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;
    
    await sendEmail(email, subject, body);

    res.json({
      message: 'OTP sent successfully to your email',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to send email OTP' 
    });
  }
};

// Verify Email OTP
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Email and OTP are required' 
      });
    }

    const otpKey = `email_${email}`;
    const storedOtpData = otpStorage.get(otpKey);

    if (!storedOtpData) {
      return res.status(400).json({ 
        message: 'OTP not found or expired' 
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStorage.delete(otpKey);
      return res.status(400).json({ 
        message: 'OTP has expired' 
      });
    }

    // Check attempts limit
    if (storedOtpData.attempts >= 3) {
      otpStorage.delete(otpKey);
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      otpStorage.set(otpKey, storedOtpData);
      
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedOtpData.attempts
      });
    }

    // OTP is valid, remove from storage
    otpStorage.delete(otpKey);

    // Update user's email verification status if user exists
    try {
      await db.update(users)
        .set({ email_verified: true })
        .where(eq(users.email, email));
    } catch (dbError) {
      // User might not exist yet (during registration), that's okay
      console.log('User not found for email verification update:', email);
    }

    res.json({
      message: 'Email verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify email OTP' 
    });
  }
};

// Send SMS OTP
export const sendSMSOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        message: 'Phone number is required' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    const otpKey = `sms_${phone}`;
    otpStorage.set(otpKey, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Send SMS
    const message = `Your FinAutoJobs verification code is: ${otp}. This code will expire in 5 minutes.`;
    
    await sendSMS(phone, message);

    res.json({
      message: 'OTP sent successfully to your phone',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Send SMS OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to send SMS OTP' 
    });
  }
};

// Verify SMS OTP
export const verifySMSOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        message: 'Phone number and OTP are required' 
      });
    }

    const otpKey = `sms_${phone}`;
    const storedOtpData = otpStorage.get(otpKey);

    if (!storedOtpData) {
      return res.status(400).json({ 
        message: 'OTP not found or expired' 
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStorage.delete(otpKey);
      return res.status(400).json({ 
        message: 'OTP has expired' 
      });
    }

    // Check attempts limit
    if (storedOtpData.attempts >= 3) {
      otpStorage.delete(otpKey);
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      otpStorage.set(otpKey, storedOtpData);
      
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedOtpData.attempts
      });
    }

    // OTP is valid, remove from storage
    otpStorage.delete(otpKey);

    // Update user's phone verification status if user exists
    try {
      await db.update(users)
        .set({ phone_verified: true })
        .where(eq(users.phone, phone));
    } catch (dbError) {
      // User might not exist yet (during registration), that's okay
      console.log('User not found for phone verification update:', phone);
    }

    res.json({
      message: 'Phone number verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify SMS OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify SMS OTP' 
    });
  }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      // Don't reveal that user doesn't exist
      return res.json({
        message: 'If an account with that email exists, you will receive a password reset email.'
      });
    }

    const user = userResult[0];

    // Generate reset token
    const resetToken = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Update user with reset token
    await db.update(users)
      .set({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires
      })
      .where(eq(users.id, user.id));

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'FinAutoJobs - Password Reset Request';
    const body = `You have requested a password reset for your FinAutoJobs account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this reset, please ignore this email.`;
    
    await sendEmail(email, subject, body);

    res.json({
      message: 'If an account with that email exists, you will receive a password reset email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Reset Password - Reset with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Reset token and new password are required'
      });
    }

    // Find user by reset token
    const userResult = await db.select()
      .from(users)
      .where(eq(users.reset_token, token))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    const user = userResult[0];

    // Check if token is expired
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await db.update(users)
      .set({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      })
      .where(eq(users.id, user.id));

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};