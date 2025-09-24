import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getApplicantDashboard,
  getRecruiterDashboard,
  getAdminDashboard,
  updateUserPreferences,
  getUserPreferences
} from '../controllers/dashboardController.js';

const router = express.Router();

// Applicant dashboard routes
router.get('/applicant', authenticateToken, requireRole(['jobseeker']), getApplicantDashboard);

// Recruiter dashboard routes
router.get('/recruiter', authenticateToken, requireRole(['employer']), getRecruiterDashboard);

// Admin dashboard routes
router.get('/admin', authenticateToken, requireRole(['admin']), getAdminDashboard);

// User preferences routes
router.get('/preferences', authenticateToken, getUserPreferences);
router.put('/preferences', authenticateToken, updateUserPreferences);

export default router;
