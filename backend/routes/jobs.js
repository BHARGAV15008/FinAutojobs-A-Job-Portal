import express from 'express';
import { authenticateToken } from './auth.js';
import { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  getJobStats, 
  getRecommendedJobs
} from '../controllers/jobsController.js';

const router = express.Router();

// Get all jobs with optional filters
router.get('/', getJobs);

// Recommended jobs for current user
router.get('/recommended', authenticateToken, getRecommendedJobs);

// Get job by ID
router.get('/:id', getJobById);

// Create new job (Employer/Admin only)
router.post('/', authenticateToken, createJob);

// Update job (Employer/Admin only)
router.put('/:id', authenticateToken, updateJob);

// Delete job (Employer/Admin only)
router.delete('/:id', authenticateToken, deleteJob);

// Get job statistics (Admin only)
router.get('/stats/overview', authenticateToken, getJobStats);

export default router;
