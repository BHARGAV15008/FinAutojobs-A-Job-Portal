import express from 'express';
import mongoDataService from '../../services/mongoDataService.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Get user's applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const result = await mongoDataService.getUserApplications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      applications: result.applications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Create new application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationData = {
      ...req.body,
      applicantId: userId,
      status: 'applied',
      appliedAt: new Date()
    };

    const application = await mongoDataService.createApplication(applicationData);

    res.status(201).json({
      success: true,
      application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// Get applications for a specific job (for recruiters)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const result = await mongoDataService.getJobApplications(jobId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      applications: result.applications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message
    });
  }
});

export default router;
