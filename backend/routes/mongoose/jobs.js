/**
 * Jobs Routes
 * 
 * Defines API endpoints for job management, searching, and applications
 * using Mongoose controllers and middleware.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import { authenticateToken, requireRecruiter, requireApplicant } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import jobsController from '../../controllers/mongoose/jobsController.js';

const router = express.Router();

// Validation schemas
const createJobSchema = {
  body: {
    title: {
      notEmpty: true,
      isLength: { options: { min: 3, max: 100 } },
      errorMessage: 'Job title must be between 3 and 100 characters'
    },
    description: {
      notEmpty: true,
      isLength: { options: { min: 50, max: 5000 } },
      errorMessage: 'Job description must be between 50 and 5000 characters'
    },
    'requirements.skills': {
      isArray: { options: { min: 1 } },
      errorMessage: 'At least one skill is required'
    },
    'location.type': {
      isIn: {
        options: [['on_site', 'remote', 'hybrid']],
        errorMessage: 'Location type must be on_site, remote, or hybrid'
      }
    },
    employmentType: {
      isIn: {
        options: [['full_time', 'part_time', 'contract', 'temporary', 'internship']],
        errorMessage: 'Invalid employment type'
      }
    },
    experienceLevel: {
      isIn: {
        options: [['entry', 'junior', 'mid', 'senior', 'lead', 'executive']],
        errorMessage: 'Invalid experience level'
      }
    }
  }
};

const updateJobSchema = {
  body: {
    title: {
      optional: true,
      isLength: { options: { min: 3, max: 100 } },
      errorMessage: 'Job title must be between 3 and 100 characters'
    },
    description: {
      optional: true,
      isLength: { options: { min: 50, max: 5000 } },
      errorMessage: 'Job description must be between 50 and 5000 characters'
    }
  }
};

const applyJobSchema = {
  body: {
    coverLetter: {
      optional: true,
      isLength: { options: { max: 2000 } },
      errorMessage: 'Cover letter cannot exceed 2000 characters'
    }
  }
};

// Public routes (no authentication required)

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with filtering and pagination
 * @access  Public
 * @query   { page?, limit?, keywords?, location?, employmentType?, experienceLevel?, salaryMin?, salaryMax?, skills?, company?, industry?, sortBy?, sortOrder? }
 */
router.get('/', jobsController.getJobs);

/**
 * @route   GET /api/jobs/trending
 * @desc    Get trending jobs
 * @access  Public
 * @query   { days?, limit? }
 */
router.get('/trending', jobsController.getTrendingJobs);

/**
 * @route   GET /api/jobs/:jobId
 * @desc    Get job by ID
 * @access  Public
 * @param   jobId - Job ID
 */
router.get('/:jobId', jobsController.getJobById);

// Protected routes (authentication required)

/**
 * @route   POST /api/jobs
 * @desc    Create new job
 * @access  Private (Recruiter/Admin only)
 * @body    { title, description, requirements, location, employmentType, experienceLevel, salary?, benefits?, company }
 */
router.post('/', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(createJobSchema), 
  jobsController.createJob
);

/**
 * @route   PUT /api/jobs/:jobId
 * @desc    Update job
 * @access  Private (Recruiter/Admin only - own jobs)
 * @param   jobId - Job ID
 * @body    { ...jobData }
 */
router.put('/:jobId', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(updateJobSchema), 
  jobsController.updateJob
);

/**
 * @route   DELETE /api/jobs/:jobId
 * @desc    Delete job (soft delete)
 * @access  Private (Recruiter/Admin only - own jobs)
 * @param   jobId - Job ID
 */
router.delete('/:jobId', 
  authenticateToken, 
  requireRecruiter, 
  jobsController.deleteJob
);

/**
 * @route   POST /api/jobs/:jobId/apply
 * @desc    Apply to job
 * @access  Private (Applicant only)
 * @param   jobId - Job ID
 * @body    { coverLetter?, resume?, additionalDocuments? }
 */
router.post('/:jobId/apply', 
  authenticateToken, 
  requireApplicant, 
  validateRequest(applyJobSchema), 
  jobsController.applyToJob
);

/**
 * @route   GET /api/jobs/recommendations/me
 * @desc    Get job recommendations for current user
 * @access  Private (Applicant only)
 * @query   { limit? }
 */
router.get('/recommendations/me', 
  authenticateToken, 
  requireApplicant, 
  jobsController.getRecommendations
);

/**
 * @route   GET /api/jobs/:jobId/analytics
 * @desc    Get job analytics
 * @access  Private (Recruiter/Admin only - own jobs)
 * @param   jobId - Job ID
 */
router.get('/:jobId/analytics', 
  authenticateToken, 
  requireRecruiter, 
  jobsController.getJobAnalytics
);

export default router;
