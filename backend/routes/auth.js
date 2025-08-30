import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users, userSessions } from '../schema.js';
import { eq, or } from 'drizzle-orm';

const router = express.Router();

// JWT Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
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
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      confirmPassword,
      phone,
      role = 'jobseeker',
      // Applicant specific fields
      skills = [],
      qualification,
      // Recruiter specific fields
      companyName,
      position
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Passwords do not match' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Create username from email (before @ symbol)
    const username = email.split('@')[0];
    const full_name = `${firstName} ${lastName}`;

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(or(
        eq(users.username, username),
        eq(users.email, email)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      username,
      email,
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role,
      status: 'active',
      email_verified: false,
      phone_verified: false
    };

    // Add role-specific fields
    if (role === 'jobseeker') {
      userData.skills = JSON.stringify(skills);
      userData.qualification = qualification || null;
    } else if (role === 'employer') {
      userData.company_name = companyName || null;
      userData.position = position || null;
    }

    // Insert new user
    const newUser = await db.insert(users).values(userData).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      full_name: users.full_name,
      phone: users.phone,
      role: users.role,
      status: users.status,
      created_at: users.created_at
    });

    const user = newUser[0];

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    await db.insert(userSessions).values({
      user_id: user.id,
      token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username/email and password are required' 
      });
    }

    // Find user by username or email
    const userResult = await db.select()
      .from(users)
      .where(or(
        eq(users.username, username),
        eq(users.email, username)
      ))
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
        message: 'Account is suspended or inactive' 
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

    // Store session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    await db.insert(userSessions).values({
      user_id: user.id,
      token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null
    });

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during login' 
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      full_name: users.full_name,
      phone: users.phone,
      role: users.role,
      status: users.status,
      bio: users.bio,
      location: users.location,
      profile_picture: users.profile_picture,
      linkedin_url: users.linkedin_url,
      github_url: users.github_url,
      portfolio_url: users.portfolio_url,
      skills: users.skills,
      qualification: users.qualification,
      experience_years: users.experience_years,
      company_name: users.company_name,
      position: users.position,
      email_verified: users.email_verified,
      phone_verified: users.phone_verified,
      created_at: users.created_at
    })
    .from(users)
    .where(eq(users.id, req.user.userId))
    .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult[0];
    
    // Parse JSON fields
    if (user.skills) {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Find user
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userResult[0];

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.insert(userSessions).values({
      user_id: user.id,
      token: newToken,
      refresh_token: newRefreshToken,
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.get('User-Agent') || null
    });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Mark session as revoked
      await db.update(userSessions)
        .set({ status: 'revoked' })
        .where(eq(userSessions.token, token));
    }

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Current password, new password, and confirmation are required' 
      });
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'New passwords do not match' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
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
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.update(users)
      .set({ 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, req.user.userId));

    // Revoke all existing sessions for security
    await db.update(userSessions)
      .set({ status: 'revoked' })
      .where(eq(userSessions.user_id, req.user.userId));

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

export default router;
