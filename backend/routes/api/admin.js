import express from 'express';
import mongoDataService from '../../services/mongoDataService.js';
import { authenticateToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      search 
    } = req.query;

    // Build filters
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await mongoDataService.getAllUsers(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get all companies (admin only)
router.get('/companies', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      industry,
      search 
    } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (industry) filters.industry = industry;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await mongoDataService.getAllCompanies(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.companies,
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

// Get all jobs (admin only)
router.get('/jobs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      jobType,
      search 
    } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (jobType) filters.jobType = jobType;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await mongoDataService.getAllJobs(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get moderation items
router.get('/moderation', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type,
      priority 
    } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.contentType = type;
    if (priority) filters.priority = priority;

    const result = await mongoDataService.getModerationItems(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate stats
    const stats = {
      pending: 0,
      under_review: 0,
      resolved: 0,
      total: result.pagination.total
    };

    result.items.forEach(item => {
      if (item.status === 'pending') stats.pending++;
      else if (item.status === 'under_review') stats.under_review++;
      else if (item.status === 'resolved') stats.resolved++;
    });

    res.json({
      success: true,
      data: {
        items: result.items,
        stats
      },
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching moderation items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation items',
      error: error.message
    });
  }
});

// Approve moderation item
router.post('/moderation/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const reviewerId = req.user.id;

    const item = await mongoDataService.approveModerationItem(id, reviewerId, reason);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Moderation item not found'
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Item approved successfully'
    });
  } catch (error) {
    console.error('Error approving moderation item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve item',
      error: error.message
    });
  }
});

// Reject moderation item
router.post('/moderation/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const reviewerId = req.user.id;

    const item = await mongoDataService.rejectModerationItem(id, reviewerId, reason);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Moderation item not found'
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Item rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting moderation item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject item',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const analytics = await mongoDataService.getPlatformAnalytics('30d');
    
    res.json({
      success: true,
      data: {
        totalUsers: analytics.totalUsers,
        newUsers: analytics.newUsers,
        activeUsers: analytics.totalUsers, // Would need separate tracking
        totalJobs: analytics.totalJobs,
        totalApplications: analytics.totalApplications,
        totalCompanies: analytics.totalCompanies
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

export default router;
