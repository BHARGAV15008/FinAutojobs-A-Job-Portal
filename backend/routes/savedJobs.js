import express from 'express';
import jwt from 'jsonwebtoken';
import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { BaseUser } from '../models/UserModels.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    const user = await BaseUser.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = {
      id: user._id,
      userId: user._id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// POST /api/saved-jobs - Save a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({
      userId: userId,
      jobId: jobId
    });

    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    // Create saved job
    const savedJob = new SavedJob({
      userId: userId,
      jobId: jobId
    });

    await savedJob.save();

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: { savedJob }
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message
    });
  }
});

// GET /api/saved-jobs - Get all saved jobs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, totalCount] = await Promise.all([
      SavedJob.find({ userId: userId })
        .populate('jobId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SavedJob.countDocuments({ userId: userId })
    ]);

    // Filter out saved jobs where job no longer exists
    const validSavedJobs = savedJobs.filter(saved => saved.jobId);

    // Transform jobs
    const jobs = validSavedJobs.map(saved => ({
      id: saved.jobId._id,
      jobTitle: saved.jobId.jobTitle,
      companyName: saved.jobId.companyName,
      location: saved.jobId.location,
      jobType: saved.jobId.jobType,
      workArrangement: saved.jobId.workArrangement,
      salary: saved.jobId.formattedSalary,
      savedAt: saved.createdAt,
      jobStatus: saved.jobId.status
    }));

    res.json({
      success: true,
      data: {
        jobs: jobs,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: error.message
    });
  }
});

// DELETE /api/saved-jobs/:jobId - Remove saved job
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const savedJob = await SavedJob.findOneAndDelete({
      userId: userId,
      jobId: jobId
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job removed from saved list'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved job',
      error: error.message
    });
  }
});

// GET /api/saved-jobs/check/:jobId - Check if job is saved
router.get('/check/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const savedJob = await SavedJob.findOne({
      userId: userId,
      jobId: jobId
    });

    res.json({
      success: true,
      data: {
        isSaved: !!savedJob
      }
    });
  } catch (error) {
    console.error('Error checking saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check saved job status',
      error: error.message
    });
  }
});

export default router;