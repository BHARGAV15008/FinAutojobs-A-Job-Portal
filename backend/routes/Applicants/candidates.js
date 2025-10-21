import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { 
  getCandidates,
  getCandidateById
} from '../../controllers/Applicants/candidatesController.js';

const router = express.Router();

// Get all candidates with filtering and search (Recruiter/Admin only)
router.get('/', authenticateToken, getCandidates);

// TODO: Add stats route

// Get single candidate by ID (Recruiter/Admin only)
router.get('/:id', authenticateToken, getCandidateById);

// TODO: Implement additional routes with MongoDB
// router.put('/:id/status', authenticateToken, updateCandidateStatus);
// router.post('/:id/send-email', authenticateToken, sendEmailToCandidate);
// router.get('/:id/resume/download', authenticateToken, downloadCandidateResume);
// router.put('/bulk-update', authenticateToken, bulkUpdateCandidates);

export default router;
