/**
 * Companies Routes
 * 
 * Defines API endpoints for company management, verification, and ratings
 * using Mongoose controllers and middleware.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import { authenticateToken, requireRecruiter, requireAdmin } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import companiesController from '../../controllers/mongoose/companiesController.js';

const router = express.Router();

// Validation schemas
const createCompanySchema = {
  body: {
    name: {
      notEmpty: true,
      isLength: { options: { min: 2, max: 100 } },
      errorMessage: 'Company name must be between 2 and 100 characters'
    },
    description: {
      notEmpty: true,
      isLength: { options: { min: 50, max: 2000 } },
      errorMessage: 'Company description must be between 50 and 2000 characters'
    },
    industry: {
      notEmpty: true,
      errorMessage: 'Industry is required'
    },
    'location.country': {
      notEmpty: true,
      errorMessage: 'Country is required'
    },
    'location.city': {
      notEmpty: true,
      errorMessage: 'City is required'
    },
    size: {
      isIn: {
        options: [['startup', 'small', 'medium', 'large', 'enterprise']],
        errorMessage: 'Invalid company size'
      }
    }
  }
};

const updateCompanySchema = {
  body: {
    name: {
      optional: true,
      isLength: { options: { min: 2, max: 100 } },
      errorMessage: 'Company name must be between 2 and 100 characters'
    },
    description: {
      optional: true,
      isLength: { options: { min: 50, max: 2000 } },
      errorMessage: 'Company description must be between 50 and 2000 characters'
    }
  }
};

const verifyCompanySchema = {
  body: {
    verified: {
      isBoolean: true,
      errorMessage: 'Verified must be a boolean value'
    },
    verificationNotes: {
      optional: true,
      isLength: { options: { max: 500 } },
      errorMessage: 'Verification notes cannot exceed 500 characters'
    }
  }
};

const rateCompanySchema = {
  body: {
    rating: {
      isFloat: { options: { min: 1, max: 5 } },
      errorMessage: 'Rating must be between 1 and 5'
    },
    review: {
      optional: true,
      isLength: { options: { max: 1000 } },
      errorMessage: 'Review cannot exceed 1000 characters'
    },
    anonymous: {
      optional: true,
      isBoolean: true,
      errorMessage: 'Anonymous must be a boolean value'
    }
  }
};

// Public routes (no authentication required)

/**
 * @route   GET /api/companies
 * @desc    Get all companies with filtering and pagination
 * @access  Public
 * @query   { page?, limit?, name?, industry?, location?, size?, verified?, sortBy?, sortOrder? }
 */
router.get('/', companiesController.getCompanies);

/**
 * @route   GET /api/companies/:companyId
 * @desc    Get company by ID
 * @access  Public
 * @param   companyId - Company ID
 */
router.get('/:companyId', companiesController.getCompanyById);

/**
 * @route   GET /api/companies/:companyId/jobs
 * @desc    Get jobs posted by company
 * @access  Public
 * @param   companyId - Company ID
 * @query   { page?, limit?, status?, sortBy?, sortOrder? }
 */
router.get('/:companyId/jobs', companiesController.getCompanyJobs);

// Protected routes (authentication required)

/**
 * @route   POST /api/companies
 * @desc    Create new company
 * @access  Private (Recruiter/Admin only)
 * @body    { name, description, industry, location, size, website?, ...additionalData }
 */
router.post('/', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(createCompanySchema), 
  companiesController.createCompany
);

/**
 * @route   PUT /api/companies/:companyId
 * @desc    Update company
 * @access  Private (Recruiter/Admin only - own companies)
 * @param   companyId - Company ID
 * @body    { ...companyData }
 */
router.put('/:companyId', 
  authenticateToken, 
  requireRecruiter, 
  validateRequest(updateCompanySchema), 
  companiesController.updateCompany
);

/**
 * @route   DELETE /api/companies/:companyId
 * @desc    Delete company (soft delete)
 * @access  Private (Admin only)
 * @param   companyId - Company ID
 */
router.delete('/:companyId', 
  authenticateToken, 
  requireAdmin, 
  companiesController.deleteCompany
);

/**
 * @route   PUT /api/companies/:companyId/verify
 * @desc    Verify company
 * @access  Private (Admin only)
 * @param   companyId - Company ID
 * @body    { verified, verificationNotes? }
 */
router.put('/:companyId/verify', 
  authenticateToken, 
  requireAdmin, 
  validateRequest(verifyCompanySchema), 
  companiesController.verifyCompanyProfile
);

/**
 * @route   POST /api/companies/:companyId/rate
 * @desc    Rate company
 * @access  Private
 * @param   companyId - Company ID
 * @body    { rating, review?, anonymous? }
 */
router.post('/:companyId/rate', 
  authenticateToken, 
  validateRequest(rateCompanySchema), 
  companiesController.rateCompanyProfile
);

/**
 * @route   GET /api/companies/recommendations/me
 * @desc    Get company recommendations for current user
 * @access  Private (Applicant only)
 * @query   { limit? }
 */
router.get('/recommendations/me', 
  authenticateToken, 
  companiesController.getRecommendations
);

/**
 * @route   GET /api/companies/:companyId/analytics
 * @desc    Get company analytics
 * @access  Private (Admin/Company owner only)
 * @param   companyId - Company ID
 * @query   { period? }
 */
router.get('/:companyId/analytics', 
  authenticateToken, 
  companiesController.getCompanyAnalyticsData
);

export default router;
