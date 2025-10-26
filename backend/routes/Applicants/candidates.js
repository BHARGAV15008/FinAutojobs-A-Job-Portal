import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { 
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  sendEmailToCandidate,
  downloadCandidateResume,
  getCandidateStats,
  bulkUpdateCandidates
} from '../../controllers/Applicants/candidatesController.js';

const router = express.Router();

// Get all candidates with filtering and search (Recruiter/Admin only)
router.get('/', authenticateToken, getCandidates);

// Get candidate statistics (Recruiter/Admin only)
router.get('/stats', authenticateToken, getCandidateStats);

// Get single candidate by ID (Recruiter/Admin only)
router.get('/:id', authenticateToken, getCandidateById);

// Update candidate status (Recruiter/Admin only)
router.put('/:id/status', authenticateToken, updateCandidateStatus);

// Send email to candidate (Recruiter/Admin only)
router.post('/:id/send-email', authenticateToken, sendEmailToCandidate);

// Download candidate resume (Recruiter/Admin only)
router.get('/:id/resume/download', authenticateToken, downloadCandidateResume);

// Bulk update candidates (Recruiter/Admin only)
router.put('/bulk-update', authenticateToken, bulkUpdateCandidates);

export default router;
