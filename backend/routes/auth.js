import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import User from '../models/UserMongoose.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('🔍 User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    console.log('🔍 Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.active_sessions?.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User is already logged in from another device. Please logout first.',
        error: 'ALREADY_LOGGED_IN',
        code: 'SINGLE_SESSION_VIOLATION'
      });
    }

    // Create session
    const sessionId = randomUUID();
    user.active_sessions.push({
      session_id: sessionId,
      device_info: req.get('User-Agent') || 'Unknown',
      ip_address: req.ip || '::1',
      created_at: new Date(),
      last_activity: new Date()
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, sessionId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Login successful', data: { user: userResponse, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role = 'applicant' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase() ? 'Email is already registered' : 'Mobile number is already registered',
        field: existingUser.email === email.toLowerCase() ? 'email' : 'phone'
      });
    }

    // Generate username
    let username = firstName.toLowerCase();
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${firstName.toLowerCase()}${counter}`;
      counter++;
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      phone,
      role,
      status: 'active',
      emailVerified: false,
      phoneVerified: false
    });

    await user.save();

    // Create session
    const sessionId = randomUUID();
    user.active_sessions.push({
      session_id: sessionId,
      device_info: req.get('User-Agent') || 'Unknown',
      ip_address: req.ip || '::1',
      created_at: new Date(),
      last_activity: new Date()
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, sessionId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        usernameGeneration: { method: 'direct', alternatives: [] }
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

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);
    
    if (user && decoded.sessionId) {
      // Remove the specific session
      user.active_sessions = user.active_sessions.filter(
        session => session.session_id !== decoded.sessionId
      );
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;