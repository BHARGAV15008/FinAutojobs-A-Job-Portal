import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, userSessions } from '../schema.js';
import { eq, or } from 'drizzle-orm';

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