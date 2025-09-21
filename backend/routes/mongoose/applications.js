/**
 * Applications Routes
 * 
 * Defines API endpoints for job application management and status updates
 * using Mongoose controllers and middleware.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import { authenticateToken, requireRecruiter, requireApplicant, requireAdmin } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import applicationsController from '../../controllers/mongoose/applicationsController.js';

const router = express.Router();

// Validation schemas
const updateStatusSchema = {
  body: {
    status: {
      isIn: {
        options: [['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn']],
        errorMessage: 'Invalid application status'
      }
    },
    feedback: {
      optional: true,
      isLength: { options: { max: 1000 } },
      errorMessage: 'Feedback cannot exceed 1000 characters'
    },
    notes: {
      optional: true,
      isLength: { options: { max: 500 } },
      errorMessage: 'Notes cannot exceed 500 characters'
    }
  }
};

const withdrawSchema = {
  body: {
    reason: {
      optional: true,
      isLength: { options: { max: 500 } },
      errorMessage: 'Reason cannot exceed 500 characters'
    }
  }
};

const bulkUpdateSchema = {
  body: {
    applicationIds: {
      isArray: { options: { min: 1 } },
      errorMessage: 'At least one application ID is required'
    },
    status: {
      isIn: {
        options: [['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected']],
        errorMessage: 'Invalid application status'
      }
    }
  }
};

// Protected routes (authentication required)

/**
 * @route   GET /api/applications
 * @desc    Get applications (role-based filtering)
 * @access  Private
 * @query   { page?, limit?, status?, jobId?, sortBy?, sortOrder? }
 */
router.get('/', authenticateToken, applicationsController.getApplications);

/**
 * @route   GET /api/applications/stats
 * @desc    Get application statistics
 * @access  Private
 * @query   { jobId?, period? }
 */
router.get('/stats', authenticateToken, applicationsController.getApplicationStats);

/**
 * @route   GET /api/applications/:applicationId
 * @desc    Get application by ID
 * @access  Private (Applicant: own applications, Recruiter: applications for their jobs, Admin: all)
 * @param   applicationId - Application ID
 */
router.get('/:applicationId', authenticateToken, applicationsController.getApplicationById);

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Update application status
 * @access  Private (Recruiter/Admin only)
 * @param   applicationId - Application ID
 * @body    { status, feedback?, notes? }
 */
router.put('/:applicationId/status', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(updateStatusSchema), 
  applicationsController.updateApplicationStatus
);

/**
 * @route   PUT /api/applications/:applicationId/withdraw
 * @desc    Withdraw application
 * @access  Private (Applicant only - own applications)
 * @param   applicationId - Application ID
 * @body    { reason? }
 */
router.put('/:applicationId/withdraw', 
  authenticateToken, 
  requireApplicant, 
  validateRequest(withdrawSchema), 
  applicationsController.withdrawApplication
);

/**
 * @route   PUT /api/applications/bulk/status
 * @desc    Bulk update application statuses
 * @access  Private (Recruiter/Admin only)
 * @body    { applicationIds, status, feedback?, notes? }
 */
router.put('/bulk/status', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(bulkUpdateSchema), 
  applicationsController.bulkUpdateApplications
);

export default router;
