import express from 'express';
import jwt from 'jsonwebtoken';
import { getSavedJobs, addSavedJob, removeSavedJob, removeSavedJobByJobId } from '../../controllers/Applicants/savedJobsController.js';

const router = express.Router();

// Simple authentication middleware (compatible with existing tokens)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      userId: decoded.id || decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// List current user's saved jobs
router.get('/', authenticateToken, getSavedJobs);

// Save a job
router.post('/', authenticateToken, addSavedJob);

// Remove a saved job by job ID (more convenient for frontend)
router.delete('/by-job/:jobId', authenticateToken, removeSavedJobByJobId);

// Remove a saved job by saved record ID
router.delete('/:id', authenticateToken, removeSavedJob);

export default router;