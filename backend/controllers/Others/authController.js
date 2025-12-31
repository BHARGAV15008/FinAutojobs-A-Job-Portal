
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseUser } from '../../models/UserModels.js';
import UserSession from '../models/UserSession.js';
import UsernameGenerator from '../utils/usernameGenerator.js';

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

