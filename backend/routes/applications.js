import express from 'express';
import { authenticateToken } from './auth.js';
import { 
  applyToJob, 
  getAllApplications, 
  getApplicationById, 
  updateApplicationStatus, 
  deleteApplication, 
  getApplicationsByJob
} from '../controllers/applicationsController.js';

const router = express.Router();

// Apply for a job (authenticated user only)
router.post('/', authenticateToken, applyToJob);

// Get application by ID (authenticated user or HR/Admin)
router.get('/:id', authenticateToken, getApplicationById);

// Update application status (Employer/Admin only)
router.put('/:id/status', authenticateToken, updateApplicationStatus);

// Get applications for a job (Employer/Admin only)
router.get('/job/:jobId', authenticateToken, getApplicationsByJob);

// Get all applications (Employer/Admin only)
router.get('/', authenticateToken, getAllApplications);

// Delete application (Employer/Admin only)
router.delete('/:id', authenticateToken, deleteApplication);

export default router;
