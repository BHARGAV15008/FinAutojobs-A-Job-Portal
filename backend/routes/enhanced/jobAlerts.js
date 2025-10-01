import express from 'express';
import { body, validationResult } from 'express-validator';
import JobAlert from '../../models/enhanced/JobAlert.js';
import Job from '../../models/Job.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Helper function to build job query from alert criteria
const buildJobQueryFromAlert = (alert) => {
  const query = {};
  
  // Keywords search
  if (alert.keywords && alert.keywords.length > 0) {
    const keywordRegex = alert.keywords.map(keyword => new RegExp(keyword, 'i'));
    query.$or = [
      { jobTitle: { $in: keywordRegex } },
      { description: { $in: keywordRegex } },
      { requiredSkills: { $in: alert.keywords } }
    ];
  }
  
  // Location
  if (alert.location) {
    if (typeof alert.location === 'string') {
      query.$or = query.$or || [];
      query.$or.push({ 'location.city': new RegExp(alert.location, 'i') });
    } else if (alert.location.city) {
      query.$or = query.$or || [];
      query.$or.push({ 'location.city': new RegExp(alert.location.city, 'i') });
    }
  }
  
  // Only active jobs
  query.status = 'active';
  query.applicationDeadline = { $gte: new Date() };
  
  return query;
};

// Helper functions
const formatLocation = (location) => {
  if (!location) return 'Not specified';
  if (typeof location === 'string') return location;
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  return parts.join(', ') || 'Not specified';
};

const formatSalary = (salary) => {
  if (!salary || !salary.amount) return 'Not specified';
  const amount = salary.amount;
  const currency = salary.currency || 'INR';
  const period = salary.period || 'yearly';
  
  if (currency === 'INR') {
    return `₹${(amount / 100000).toFixed(1)}L ${period}`;
  }
  return `${currency} ${amount} ${period}`;
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = (now - new Date(date)) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

// @route   GET /api/v2/job-alerts
// @desc    Get all job alerts for user
// @access  Private (Applicant only)
router.get('/', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { userId };
    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Fetching job alerts for user:', userId);

    // Execute query
    const [alerts, totalAlerts] = await Promise.all([
      JobAlert.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      JobAlert.countDocuments(query)
    ]);

    console.log('📋 Found job alerts:', alerts.length);

    // Enrich alerts with matching jobs count
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        // Build job query based on alert criteria
        const jobQuery = buildJobQueryFromAlert(alert);
        const matchingJobsCount = await Job.countDocuments(jobQuery);

        return {
          ...alert,
          id: alert._id,
          title: alert.name,
          matchingJobs: matchingJobsCount,
          lastNotified: alert.lastTriggered || alert.createdAt
        };
      })
    );

    // Calculate stats
    const activeAlerts = enrichedAlerts.filter(alert => alert.isActive).length;
    const totalMatchingJobs = enrichedAlerts.reduce((sum, alert) => 
      sum + (alert.isActive ? alert.matchingJobs : 0), 0
    );

    res.json({
      success: true,
      data: {
        alerts: enrichedAlerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAlerts / parseInt(limit)),
          totalAlerts,
          hasNext: skip + alerts.length < totalAlerts,
          hasPrev: parseInt(page) > 1
        },
        stats: {
          activeAlerts,
          totalAlerts: alerts.length,
          totalMatchingJobs,
          thisWeekNotifications: enrichedAlerts.filter(alert => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return alert.lastTriggered && new Date(alert.lastTriggered) > weekAgo;
          }).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/v2/job-alerts
// @desc    Create new job alert
// @access  Private (Applicant only)
router.post('/', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const alertData = {
      ...req.body,
      userId,
      isActive: true,
      totalMatches: 0,
      totalNotifications: 0
    };

    console.log('📝 Creating job alert:', alertData.name);

    const jobAlert = new JobAlert(alertData);
    await jobAlert.save();

    // Get matching jobs count
    const jobQuery = buildJobQueryFromAlert(jobAlert);
    const matchingJobsCount = await Job.countDocuments(jobQuery);

    const enrichedAlert = {
      ...jobAlert.toObject(),
      id: jobAlert._id,
      title: jobAlert.name,
      matchingJobs: matchingJobsCount,
      lastNotified: jobAlert.createdAt
    };

    console.log('✅ Job alert created successfully');

    res.status(201).json({
      success: true,
      message: 'Job alert created successfully',
      data: { alert: enrichedAlert }
    });

  } catch (error) {
    console.error('Error creating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/v2/job-alerts/:id
// @desc    Update job alert
// @access  Private (Applicant only)
router.put('/:id', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    console.log('📝 Updating job alert:', id);

    const jobAlert = await JobAlert.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!jobAlert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    // Get matching jobs count
    const jobQuery = buildJobQueryFromAlert(jobAlert);
    const matchingJobsCount = await Job.countDocuments(jobQuery);

    const enrichedAlert = {
      ...jobAlert.toObject(),
      id: jobAlert._id,
      title: jobAlert.name,
      matchingJobs: matchingJobsCount,
      lastNotified: jobAlert.lastTriggered || jobAlert.createdAt
    };

    console.log('✅ Job alert updated successfully');

    res.json({
      success: true,
      message: 'Job alert updated successfully',
      data: { alert: enrichedAlert }
    });

  } catch (error) {
    console.error('Error updating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/v2/job-alerts/:id
// @desc    Delete job alert
// @access  Private (Applicant only)
router.delete('/:id', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('🗑️ Deleting job alert:', id);

    const jobAlert = await JobAlert.findOneAndDelete({ _id: id, userId });

    if (!jobAlert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    console.log('✅ Job alert deleted successfully');

    res.json({
      success: true,
      message: 'Job alert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/v2/job-alerts/:id/toggle
// @desc    Toggle job alert active status
// @access  Private (Applicant only)
router.post('/:id/toggle', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('🔄 Toggling job alert status:', id);

    const jobAlert = await JobAlert.findOne({ _id: id, userId });

    if (!jobAlert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    jobAlert.isActive = !jobAlert.isActive;
    await jobAlert.save();

    console.log('✅ Job alert status toggled:', jobAlert.isActive ? 'Active' : 'Paused');

    res.json({
      success: true,
      message: `Job alert ${jobAlert.isActive ? 'activated' : 'paused'} successfully`,
      data: { 
        alert: {
          ...jobAlert.toObject(),
          id: jobAlert._id,
          title: jobAlert.name
        }
      }
    });

  } catch (error) {
    console.error('Error toggling job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
