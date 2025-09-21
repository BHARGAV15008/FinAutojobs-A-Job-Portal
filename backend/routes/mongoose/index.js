/**
 * Mongoose Routes Index
 * 
 * Central router that combines all Mongoose-based API routes
 * for the FinAutoJobs application.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import express from 'express';
import authRoutes from './auth.js';
import jobsRoutes from './jobs.js';
import applicationsRoutes from './applications.js';
import companiesRoutes from './companies.js';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/jobs', jobsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/companies', companiesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinAutoJobs API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'FinAutoJobs API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - Login user',
          'POST /refresh - Refresh token',
          'POST /logout - Logout user',
          'GET /profile - Get user profile',
          'PUT /profile - Update user profile',
          'PUT /change-password - Change password'
        ]
      },
      jobs: {
        base: '/api/jobs',
        endpoints: [
          'GET / - Get all jobs',
          'GET /trending - Get trending jobs',
          'GET /:jobId - Get job by ID',
          'POST / - Create job (Recruiter/Admin)',
          'PUT /:jobId - Update job (Recruiter/Admin)',
          'DELETE /:jobId - Delete job (Recruiter/Admin)',
          'POST /:jobId/apply - Apply to job (Applicant)',
          'GET /recommendations/me - Get job recommendations (Applicant)',
          'GET /:jobId/analytics - Get job analytics (Recruiter/Admin)'
        ]
      },
      applications: {
        base: '/api/applications',
        endpoints: [
          'GET / - Get applications (role-based)',
          'GET /stats - Get application statistics',
          'GET /:applicationId - Get application by ID',
          'PUT /:applicationId/status - Update application status (Recruiter/Admin)',
          'PUT /:applicationId/withdraw - Withdraw application (Applicant)',
          'PUT /bulk/status - Bulk update applications (Recruiter/Admin)'
        ]
      },
      companies: {
        base: '/api/companies',
        endpoints: [
          'GET / - Get all companies',
          'GET /:companyId - Get company by ID',
          'GET /:companyId/jobs - Get company jobs',
          'POST / - Create company (Recruiter/Admin)',
          'PUT /:companyId - Update company (Recruiter/Admin)',
          'DELETE /:companyId - Delete company (Admin)',
          'PUT /:companyId/verify - Verify company (Admin)',
          'POST /:companyId/rate - Rate company',
          'GET /recommendations/me - Get company recommendations (Applicant)',
          'GET /:companyId/analytics - Get company analytics'
        ]
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      roles: ['applicant', 'recruiter', 'admin']
    }
  });
});

export default router;
