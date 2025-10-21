import express from 'express';
import mongoDataService from '../../services/mongoDataService.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Get user analytics (for applicants)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    const analytics = await mongoDataService.getUserAnalytics(userId, timeRange);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

// Get applicant analytics (alias for user analytics)
router.get('/applicant', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    const analytics = await mongoDataService.getUserAnalytics(userId, timeRange);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching applicant analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applicant analytics',
      error: error.message
    });
  }
});

// Get company analytics (for recruiters)
router.get('/company', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // Get user's company ID (assuming recruiter has company association)
    const user = await mongoDataService.getUserById(userId);
    if (!user || !user.companyId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a company'
      });
    }

    const analytics = await mongoDataService.getCompanyAnalytics(user.companyId, timeRange);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company analytics',
      error: error.message
    });
  }
});

// Get platform analytics (for admins)
router.get('/platform', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeRange = '30d' } = req.query;
    const analytics = await mongoDataService.getPlatformAnalytics(timeRange);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform analytics',
      error: error.message
    });
  }
});

// Get job analytics (for specific job)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { timeRange = '30d' } = req.query;

    // Verify user has access to this job's analytics
    const job = await mongoDataService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the recruiter for this job or admin
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // For now, return basic job analytics
    // This would need to be expanded with actual job-specific analytics
    const analytics = {
      jobId,
      timeRange,
      views: 0, // Would be tracked separately
      applications: 0, // Would be counted from applications
      bookmarks: 0 // Would be tracked separately
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching job analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job analytics',
      error: error.message
    });
  }
});

export default router;
