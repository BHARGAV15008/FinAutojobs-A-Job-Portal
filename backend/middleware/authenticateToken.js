
import jwt from 'jsonwebtoken';
import { BaseUser } from '../models/UserModels.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');

    // Handle both userId and id from token payload
    const userId = decoded.userId || decoded.id;
    const user = await BaseUser.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token Verification Error:', error.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};
