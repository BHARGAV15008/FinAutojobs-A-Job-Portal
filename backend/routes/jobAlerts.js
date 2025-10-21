import express from 'express';
import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';
import jwt from 'jsonwebtoken';
import { BaseUser } from '../models/UserModels.js';

const router = express.Router();

// Simple authentication middleware for job alerts
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Use the same JWT secret as the main auth system
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    console.log('🔍 Job alerts JWT decoded:', JSON.stringify(decoded, null, 2));
    
    // Handle both userId and id for compatibility
    const userId = decoded.userId || decoded.id;
    console.log('🔍 Looking up user with ID:', userId);
    
    // Try multiple approaches to find the user
    let user = null;
    
    // Method 1: Try finding by _id using the userId from token
    if (decoded.userId) {
      try {
        user = await BaseUser.findById(decoded.userId);
        console.log('🔍 Method 1 - User found by decoded.userId as _id:', user ? 'Yes' : 'No');
      } catch (err) {
        console.log('🔍 Method 1 failed:', err.message);
      }
    }
    
    // Method 2: Try finding by _id using the id from token
    if (!user && decoded.id) {
      try {
        user = await BaseUser.findById(decoded.id);
        console.log('🔍 Method 2 - User found by decoded.id as _id:', user ? 'Yes' : 'No');
      } catch (err) {
        console.log('🔍 Method 2 failed:', err.message);
      }
    }
    
    // Method 3: Try finding by userId field
    if (!user && decoded.userId) {
      try {
        user = await BaseUser.findOne({ userId: decoded.userId });
        console.log('🔍 Method 3 - User found by userId field:', user ? 'Yes' : 'No');
      } catch (err) {
        console.log('🔍 Method 3 failed:', err.message);
      }
    }
    
    // Method 4: Try finding by email as fallback
    if (!user && decoded.email) {
      try {
        user = await BaseUser.findOne({ email: decoded.email, role: decoded.role });
        console.log('🔍 Method 4 - User found by email and role:', user ? 'Yes' : 'No');
      } catch (err) {
        console.log('🔍 Method 4 failed:', err.message);
      }
    }
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user._id, user.email, user.role);

    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Job alerts auth error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// GET /api/job-alerts - Get user's job alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Job alerts GET request - user:', req.user);
    
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can access job alerts'
      });
    }

    const userId = req.user.userId || req.user.id;
    const alerts = await JobAlert.find({ userId: userId })
      .sort({ createdAt: -1 });

    // Update matching jobs count for each alert
    for (let alert of alerts) {
      const matchingJobs = await findMatchingJobs(alert);
      alert.matchingJobsCount = matchingJobs.length;
      await alert.save();
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job alerts'
    });
  }
});

// POST /api/job-alerts - Create new job alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('🔍 Creating job alert for user:', userId, 'role:', req.user.role);
    console.log('🔍 Request body:', req.body);

    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can create job alerts'
      });
    }

    const { title, keywords, location, salaryRange, frequency } = req.body;

    // Enhanced validation with detailed logging
    if (!title) {
      console.log('❌ Validation failed: Missing title');
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      console.log('❌ Validation failed: Invalid keywords:', keywords);
      return res.status(400).json({
        success: false,
        message: 'Keywords must be a non-empty array'
      });
    }

    console.log('✅ Validation passed, creating alert...');

    const alert = new JobAlert({
      userId: userId,
      title,
      keywords,
      location: location || '',
      salaryRange: salaryRange || null,
      frequency: frequency || 'daily',
      isActive: true
    });

    console.log('🔍 Alert object before save:', alert);

    // Find matching jobs count (with error handling)
    try {
      const matchingJobs = await findMatchingJobs(alert);
      alert.matchingJobsCount = matchingJobs.length;
      console.log('🔍 Found matching jobs:', matchingJobs.length);
    } catch (matchError) {
      console.warn('⚠️ Error finding matching jobs, setting count to 0:', matchError);
      alert.matchingJobsCount = 0;
    }

    await alert.save();
    console.log('✅ Job alert saved successfully:', alert._id);

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Job alert created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating job alert:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create job alert: ' + error.message
    });
  }
});

// PUT /api/job-alerts/:id - Update job alert
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const alert = await JobAlert.findOne({ 
      _id: req.params.id, 
      userId: userId 
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    const { title, keywords, location, salaryRange, frequency, isActive } = req.body;

    if (title) alert.title = title;
    if (keywords) alert.keywords = keywords;
    if (location !== undefined) alert.location = location;
    if (salaryRange) alert.salaryRange = salaryRange;
    if (frequency) alert.frequency = frequency;
    if (isActive !== undefined) alert.isActive = isActive;

    // Update matching jobs count
    const matchingJobs = await findMatchingJobs(alert);
    alert.matchingJobsCount = matchingJobs.length;

    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Job alert updated successfully'
    });
  } catch (error) {
    console.error('Error updating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job alert'
    });
  }
});

// DELETE /api/job-alerts/:id - Delete job alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const alert = await JobAlert.findOneAndDelete({ 
      _id: req.params.id, 
      userId: userId 
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Job alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job alert'
    });
  }
});

// GET /api/job-alerts/matches - Get recent job matches for user's alerts
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can access job matches'
      });
    }

    const { limit = 10 } = req.query;
    const userId = req.user.userId || req.user.id;
    const alerts = await JobAlert.find({ 
      userId: userId, 
      isActive: true 
    });

    let allMatches = [];

    for (let alert of alerts) {
      const matchingJobs = await findMatchingJobs(alert);
      
      const jobsWithAlertInfo = matchingJobs.slice(0, 5).map(job => ({
        ...job.toObject(),
        matchedAlert: alert.title,
        alertId: alert._id,
        matchReasons: generateMatchReasons(job, alert)
      }));

      allMatches = allMatches.concat(jobsWithAlertInfo);
    }

    // Sort by creation date and limit results
    allMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    allMatches = allMatches.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: allMatches
    });
  } catch (error) {
    console.error('Error fetching job matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job matches'
    });
  }
});

// GET /api/job-alerts/stats - Get job alerts statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can access job alert stats'
      });
    }

    const userId = req.user.userId || req.user.id;
    const alerts = await JobAlert.find({ userId: userId });
    const activeAlerts = alerts.filter(alert => alert.isActive);
    
    const totalMatchingJobs = activeAlerts.reduce((sum, alert) => sum + alert.matchingJobsCount, 0);
    const totalNotifications = alerts.reduce((sum, alert) => sum + alert.notificationsSent, 0);
    
    // Calculate success rate (simplified - could be more sophisticated)
    const successRate = alerts.length > 0 ? Math.round((activeAlerts.length / alerts.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        activeAlerts: activeAlerts.length,
        totalAlerts: alerts.length,
        matchingJobs: totalMatchingJobs,
        weeklyNotifications: Math.floor(totalNotifications / 4), // Approximate weekly
        successRate: successRate
      }
    });
  } catch (error) {
    console.error('Error fetching job alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job alert statistics'
    });
  }
});

// Helper function to find matching jobs for an alert
async function findMatchingJobs(alert) {
  try {
    let query = { status: 'active' };

    // Keyword matching in job title, description, or required skills
    if (alert.keywords && alert.keywords.length > 0) {
      const keywordRegex = alert.keywords.map(keyword => new RegExp(keyword, 'i'));
      query.$or = [
        { jobTitle: { $in: keywordRegex } },
        { description: { $in: keywordRegex } },
        { requiredSkills: { $in: alert.keywords } }
      ];
    }

    // Location matching
    if (alert.location && alert.location.toLowerCase() !== 'remote') {
      query.location = new RegExp(alert.location, 'i');
    }

    // Salary range matching
    if (alert.salaryRange && alert.salaryRange.min) {
      query['salaryRange.max'] = { $gte: alert.salaryRange.min };
    }
    if (alert.salaryRange && alert.salaryRange.max) {
      query['salaryRange.min'] = { $lte: alert.salaryRange.max };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName companyInfo.companyName')
      .sort({ createdAt: -1 })
      .limit(50);

    return jobs;
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    return [];
  }
}

// Helper function to generate match reasons
function generateMatchReasons(job, alert) {
  const reasons = [];

  // Check keyword matches
  const matchedKeywords = alert.keywords.filter(keyword => 
    job.jobTitle?.toLowerCase().includes(keyword.toLowerCase()) ||
    job.description?.toLowerCase().includes(keyword.toLowerCase()) ||
    job.requiredSkills?.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
  );

  if (matchedKeywords.length > 0) {
    reasons.push(`Matched keywords: ${matchedKeywords.join(', ')}`);
  }

  // Check location match
  if (alert.location && job.location?.toLowerCase().includes(alert.location.toLowerCase())) {
    reasons.push(`Location match: ${alert.location}`);
  }

  // Check salary match
  if (alert.salaryRange && job.salaryRange) {
    if (job.salaryRange.min >= alert.salaryRange.min && job.salaryRange.max <= alert.salaryRange.max) {
      reasons.push('Salary within range');
    }
  }

  return reasons;
}

export default router;
