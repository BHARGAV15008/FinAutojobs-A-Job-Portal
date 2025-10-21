import express from 'express';
import mongoDataService from '../../services/mongoDataService.js';

// Import API route modules
import applicationsRouter from './applications.js';
import jobsRouter from './jobs.js';
import notificationsRouter from './notifications.js';
import analyticsRouter from './analytics.js';
import adminRouter from './admin.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await mongoDataService.checkHealth();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Mount API routes
router.use('/applications', applicationsRouter);
router.use('/jobs', jobsRouter);
router.use('/notifications', notificationsRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

// Additional endpoints that might be needed
router.get('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await mongoDataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Companies endpoint
router.get('/companies', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, industry } = req.query;

    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (industry) filters.industry = industry;

    const result = await mongoDataService.getAllCompanies(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      companies: result.companies,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q: query, type = 'jobs', page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let results;
    switch (type) {
      case 'jobs':
        results = await mongoDataService.searchJobs(query, {}, {
          page: parseInt(page),
          limit: parseInt(limit)
        });
        break;
      case 'companies':
        results = await mongoDataService.searchCompanies(query, {}, {
          page: parseInt(page),
          limit: parseInt(limit)
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid search type. Use "jobs" or "companies"'
        });
    }

    res.json({
      success: true,
      type,
      query,
      ...results
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

export default router;
