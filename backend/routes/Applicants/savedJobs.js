import express from 'express';
import { authenticateToken } from './auth.js';
import { getSavedJobs, addSavedJob, removeSavedJob } from '../controllers/savedJobsController.js';

const router = express.Router();

// List current user's saved jobs
router.get('/', authenticateToken, getSavedJobs);

// Save a job
router.post('/', authenticateToken, addSavedJob);

// Remove a saved job
router.delete('/:id', authenticateToken, removeSavedJob);

export default router;