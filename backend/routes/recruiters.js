import express from 'express';
import { authenticateToken as authenticateJWT } from '../middleware/auth.js';
import { isRecruiter } from '../middleware/roles.js';
import * as recruiterController from '../controllers/recruiterController.js';

const router = express.Router();

// Protected routes - require authentication and recruiter role
router.use(authenticateJWT);
router.use(isRecruiter);

// Get recruiter profile
router.get('/profile', recruiterController.getProfile);

// Update recruiter profile
router.put('/profile', recruiterController.updateProfile);

// Get recruiter's posted jobs
router.get('/jobs', recruiterController.getPostedJobs);

// Get job applications for a specific job
router.get('/jobs/:jobId/applications', recruiterController.getJobApplications);

// Update application status
router.put('/applications/:applicationId/status', recruiterController.updateApplicationStatus);

// Get recruiter analytics
router.get('/analytics', recruiterController.getAnalytics);

export default router;
