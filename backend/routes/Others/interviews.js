import express from 'express';
import { authenticateToken } from './auth.js';
import { 
  getInterviews,
  getInterviewById,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  deleteInterview,
  addInterviewFeedback,
  getInterviewStats
} from '../controllers/interviewsController.js';

const router = express.Router();

// Get all interviews with filtering (Recruiter/Admin only)
router.get('/', authenticateToken, getInterviews);

// Get interview statistics (Recruiter/Admin only)
router.get('/stats', authenticateToken, getInterviewStats);

// Get single interview by ID (Recruiter/Admin only)
router.get('/:id', authenticateToken, getInterviewById);

// Schedule new interview (Recruiter/Admin only)
router.post('/', authenticateToken, scheduleInterview);

// Update interview (reschedule, update details) (Recruiter/Admin only)
router.put('/:id', authenticateToken, updateInterview);

// Cancel interview (Recruiter/Admin only)
router.put('/:id/cancel', authenticateToken, cancelInterview);

// Delete interview permanently (Recruiter/Admin only)
router.delete('/:id', authenticateToken, deleteInterview);

// Add interview feedback (Recruiter/Admin only)
router.post('/:id/feedback', authenticateToken, addInterviewFeedback);

export default router;
