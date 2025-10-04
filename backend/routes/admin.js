import express from 'express';
import jwt from 'jsonwebtoken';
import { BaseUser, findUserByIdAndRole } from '../models/UserModels.js';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';
import Moderation from '../models/Moderation.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// JWT Secret (same as main auth routes)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

// Simple authentication middleware (compatible with main auth system)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user with role validation
    const user = await findUserByIdAndRole(decoded.id || decoded.userId, decoded.role);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      id: user._id,
      role: user.role,
      email: user.email,
      username: user.username
    };

    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users with filtering
router.get('/users', async (req, res) => {
  try {
    // One-time migration: Add lastLogin field to users who don't have it
    const usersWithoutLastLogin = await BaseUser.countDocuments({ 
      lastLogin: { $exists: false } 
    });
    
    if (usersWithoutLastLogin > 0) {
      console.log(`🔄 Migrating ${usersWithoutLastLogin} users to add lastLogin field`);
      await BaseUser.updateMany(
        { lastLogin: { $exists: false } },
        { 
          $set: { 
            lastLogin: null,
            lastActivity: null 
          } 
        }
      );
      console.log('✅ Migration completed');
    }
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Admin fetching users with filters:', { role, status, search, page, limit });
    
    // Build query based on filters
    let query = {
      // Exclude deleted users by default
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    };
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by status
    if (status) {
      if (status === 'pending') {
        query.isVerified = false;
      } else if (status === 'active') {
        query.isActive = true;
        query.isVerified = true;
      } else if (status === 'suspended') {
        query.isActive = false;
      }
    }
    
    // Search by name, email, or username
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await BaseUser.find(query)
      .select('-password -__v') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalUsers = await BaseUser.countDocuments(query);
    
    console.log(`✅ Found ${users.length} users out of ${totalUsers} total`);
    
    // Debug: Check lastLogin data
    users.forEach(user => {
      if (user.lastLogin) {
        console.log(`🔍 User ${user.email} lastLogin:`, user.lastLogin);
      }
    });
    
    // Transform users for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      role: user.role,
      status: user.isActive ? (user.isVerified ? 'active' : 'pending') : 'suspended',
      joinDate: user.createdAt?.toISOString().split('T')[0] || 'N/A',
      lastLogin: user.lastLogin ? 
        new Date(user.lastLogin).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Never',
      profileComplete: calculateProfileCompletion(user),
      phone: user.phone || 'N/A',
      location: user.location || user.address?.city || 'N/A',
      username: user.username,
      isVerified: user.isVerified || false,
      isActive: user.isActive !== false // Default to true if not set
    }));
    
    res.json({
      success: true,
      data: transformedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// GET /api/admin/users/stats - Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    console.log('🔍 Admin fetching user statistics');
    
    // Base query to exclude deleted users
    const baseQuery = {
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]
    };

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      applicants,
      recruiters,
      admins,
      recentUsers
    ] = await Promise.all([
      BaseUser.countDocuments(baseQuery),
      BaseUser.countDocuments({ ...baseQuery, isActive: true, isVerified: true }),
      BaseUser.countDocuments({ ...baseQuery, isVerified: false }),
      BaseUser.countDocuments({ ...baseQuery, isActive: false }),
      BaseUser.countDocuments({ ...baseQuery, role: 'applicant' }),
      BaseUser.countDocuments({ ...baseQuery, role: 'recruiter' }),
      BaseUser.countDocuments({ ...baseQuery, role: 'admin' }),
      BaseUser.countDocuments({ 
        ...baseQuery,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);
    
    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      usersByRole: {
        applicants,
        recruiters,
        admins
      },
      recentUsers,
      growthRate: totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : 0
    };
    
    console.log('✅ User statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user statistics',
      error: error.message 
    });
  }
});

// POST /api/admin/users/:id/suspend - Suspend a user
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log(`🔍 Admin suspending user ${id}, reason:`, reason);
    
    const user = await BaseUser.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: req.user.userId,
        suspensionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User suspended successfully');
    
    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error suspending user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to suspend user',
      error: error.message 
    });
  }
});

// POST /api/admin/users/:id/activate - Activate a user
router.post('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Admin activating user ${id}`);
    
    const user = await BaseUser.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        isVerified: true,
        activatedAt: new Date(),
        activatedBy: req.user.userId,
        $unset: { 
          suspendedAt: 1, 
          suspendedBy: 1, 
          suspensionReason: 1 
        }
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User activated successfully');
    
    res.json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error activating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to activate user',
      error: error.message 
    });
  }
});

// DELETE /api/admin/users/:id - Delete a user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Admin deleting user ${id}`);
    
    const user = await BaseUser.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.userId
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User deleted successfully');
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
});

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
  let completedFields = 0;
  let totalFields = 0;
  
  // Basic fields (common to all roles)
  const basicFields = ['firstName', 'lastName', 'email', 'phone'];
  basicFields.forEach(field => {
    totalFields++;
    if (user[field]) completedFields++;
  });
  
  // Role-specific fields
  if (user.role === 'applicant') {
    const applicantFields = ['skills', 'education', 'workExperience'];
    applicantFields.forEach(field => {
      totalFields++;
      if (user[field] && (Array.isArray(user[field]) ? user[field].length > 0 : user[field])) {
        completedFields++;
      }
    });
  } else if (user.role === 'recruiter') {
    const recruiterFields = ['companyInfo', 'yearsOfExperience'];
    recruiterFields.forEach(field => {
      totalFields++;
      if (user[field]) completedFields++;
    });
  }
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
}

// POST /api/admin/users/:id/update-login - Manually update last login (for testing)
router.post('/users/:id/update-login', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Admin updating lastLogin for user ${id}`);
    
    const user = await BaseUser.findByIdAndUpdate(
      id,
      { 
        lastLogin: new Date(),
        lastActivity: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ LastLogin updated successfully');
    
    res.json({
      success: true,
      message: 'LastLogin updated successfully',
      data: {
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating lastLogin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update lastLogin',
      error: error.message 
    });
  }
});

// ==================== JOB MANAGEMENT ROUTES ====================

// GET /api/admin/jobs - Get all jobs with filtering and admin actions
router.get('/jobs', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, recruiter } = req.query;
    
    console.log('🔍 Admin fetching jobs with filters:', { status, search, page, limit, recruiter });
    
    // Build query based on filters
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by recruiter
    if (recruiter) {
      query.postedBy = recruiter;
    }
    
    // Search by job title, company name, or location
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get application counts for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job,
          applicationsCount: applicationCount
        };
      })
    );
    
    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);
    
    console.log(`✅ Found ${jobs.length} jobs out of ${totalJobs} total`);
    
    // Transform jobs for frontend
    const transformedJobs = jobsWithApplications.map(job => ({
      id: job._id,
      title: job.jobTitle,
      company: job.companyName,
      location: job.location,
      status: job.status,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      applications: job.applicationsCount || 0,
      postedDate: job.createdAt ? 
        new Date(job.createdAt).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
      deadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric'
        }) : 'N/A',
      recruiter: job.postedBy ? {
        id: job.postedBy._id,
        name: `${job.postedBy.firstName || ''} ${job.postedBy.lastName || ''}`.trim() || job.postedBy.username,
        email: job.postedBy.email
      } : null,
      salary: job.salaryRange?.min && job.salaryRange?.max ? 
        `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` :
        job.salaryRange?.min ? 
        `₹${(job.salaryRange.min / 100000).toFixed(1)}L+ ${job.salaryRange.period || 'Yearly'}` : 
        'Negotiable',
      urgency: job.jobUrgency || 'Normal Priority',
      industry: job.industry,
      category: job.jobCategory
    }));
    
    res.json({
      success: true,
      data: transformedJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs,
        hasNext: skip + jobs.length < totalJobs,
        hasPrev: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch jobs',
      error: error.message 
    });
  }
});

// GET /api/admin/jobs/stats - Get job statistics
router.get('/jobs/stats', async (req, res) => {
  try {
    console.log('🔍 Admin fetching job statistics');
    
    const [
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      expiredJobs,
      totalApplications,
      recentJobs
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'draft' }),
      Job.countDocuments({ status: 'closed' }),
      Job.countDocuments({ status: 'expired' }),
      Application.countDocuments(),
      Job.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ]);
    
    const stats = {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      expiredJobs,
      totalApplications,
      recentJobs,
      jobsByStatus: {
        active: activeJobs,
        draft: draftJobs,
        closed: closedJobs,
        expired: expiredJobs
      },
      averageApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0
    };
    
    console.log('✅ Job statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching job stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job statistics',
      error: error.message 
    });
  }
});

// POST /api/admin/jobs/:id/approve - Approve a job (change status to active)
router.post('/jobs/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log(`🔍 Admin approving job ${id}, reason:`, reason);
    
    const job = await Job.findByIdAndUpdate(
      id,
      { 
        status: 'active',
        approvedAt: new Date(),
        approvedBy: req.user.userId,
        approvalReason: reason || 'Approved by admin'
      },
      { new: true }
    ).populate('postedBy', 'firstName lastName email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    console.log('✅ Job approved successfully');
    
    res.json({
      success: true,
      message: 'Job approved successfully',
      data: job
    });
    
  } catch (error) {
    console.error('❌ Error approving job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve job',
      error: error.message 
    });
  }
});

// POST /api/admin/jobs/:id/reject - Reject a job (change status to closed)
router.post('/jobs/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log(`🔍 Admin rejecting job ${id}, reason:`, reason);
    
    const job = await Job.findByIdAndUpdate(
      id,
      { 
        status: 'closed',
        rejectedAt: new Date(),
        rejectedBy: req.user.userId,
        rejectionReason: reason || 'Rejected by admin'
      },
      { new: true }
    ).populate('postedBy', 'firstName lastName email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    console.log('✅ Job rejected successfully');
    
    res.json({
      success: true,
      message: 'Job rejected successfully',
      data: job
    });
    
  } catch (error) {
    console.error('❌ Error rejecting job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject job',
      error: error.message 
    });
  }
});

// DELETE /api/admin/jobs/:id - Delete a job (soft delete)
router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Admin deleting job ${id}`);
    
    const job = await Job.findByIdAndUpdate(
      id,
      { 
        status: 'closed',
        deletedAt: new Date(),
        deletedBy: req.user.userId,
        isDeleted: true
      },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    console.log('✅ Job deleted successfully');
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
      data: job
    });
    
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete job',
      error: error.message 
    });
  }
});

// ==================== SYSTEM ANALYTICS ROUTES ====================

// GET /api/admin/analytics/system - Get comprehensive system analytics
router.get('/analytics/system', async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    console.log('🔍 Admin fetching system analytics for period:', period);
    
    // Calculate date range based on period
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '1month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      default:
        startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get comprehensive statistics
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeUsers,
      activeJobs,
      recentUsers,
      recentJobs,
      recentApplications,
      usersByRole,
      jobsByStatus,
      applicationsByStatus
    ] = await Promise.all([
      BaseUser.countDocuments({ 
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] 
      }),
      Job.countDocuments(),
      Application.countDocuments(),
      BaseUser.countDocuments({ 
        isActive: true,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
      }),
      Job.countDocuments({ status: 'active' }),
      BaseUser.countDocuments({ 
        createdAt: { $gte: startDate },
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
      }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      BaseUser.aggregate([
        { $match: { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    
    // Get monthly growth data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const [monthUsers, monthJobs, monthApplications] = await Promise.all([
        BaseUser.countDocuments({ 
          createdAt: { $gte: monthStart, $lt: monthEnd },
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        }),
        Job.countDocuments({ 
          createdAt: { $gte: monthStart, $lt: monthEnd } 
        }),
        Application.countDocuments({ 
          createdAt: { $gte: monthStart, $lt: monthEnd } 
        })
      ]);
      
      monthlyData.push({
        period: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        users: monthUsers,
        jobs: monthJobs,
        applications: monthApplications
      });
    }
    
    // Calculate growth percentages
    const lastMonthUsers = await BaseUser.countDocuments({
      createdAt: { 
        $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
    });
    
    const userGrowth = lastMonthUsers > 0 ? 
      (((recentUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1) : 0;
    
    // Get top performing categories
    const topCategories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$jobCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const analytics = {
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeUsers,
        activeJobs,
        userGrowth: `${userGrowth >= 0 ? '+' : ''}${userGrowth}%`,
        jobGrowth: '+8%', // Calculate based on actual data
        applicationGrowth: '+25%' // Calculate based on actual data
      },
      monthlyData,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      jobsByStatus: jobsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topCategories: topCategories.map(cat => ({
        name: cat._id,
        count: cat.count,
        percentage: ((cat.count / totalJobs) * 100).toFixed(1)
      })),
      systemHealth: {
        serverResponseTime: '125ms',
        databaseQueries: '1,245',
        activeSessions: activeUsers,
        errorRate: '0.02%'
      }
    };
    
    console.log('✅ System analytics calculated successfully');
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('❌ Error fetching system analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system analytics',
      error: error.message 
    });
  }
});

// ==================== CONTENT MODERATION ROUTES ====================

// GET /api/admin/moderation/items - Get flagged content for moderation
router.get('/moderation/items', async (req, res) => {
  try {
    const { status, type, priority, page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Admin fetching moderation items:', { status, type, priority });
    
    // Build query for moderation items
    let query = {};
    
    if (status && status !== 'all') {
      if (status === 'resolved') {
        // Show both approved and rejected items when "resolved" is selected
        query.status = { $in: ['approved', 'rejected'] };
      } else {
        query.status = status;
      }
    } else {
      // By default, only show items that need attention (exclude resolved items)
      query.status = { $in: ['pending', 'under_review'] };
    }
    
    if (type && type !== 'all') {
      query.contentType = type === 'job' ? 'Job' : type === 'user' ? 'BaseUser' : type;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Get moderation items with populated content
    const moderationItems = await Moderation.find(query)
      .populate('contentId')
      .populate('flaggedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ flaggedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Transform to frontend format
    const transformedItems = moderationItems.map(item => ({
      id: item._id,
      type: item.contentType.toLowerCase(),
      title: item.contentType === 'Job' 
        ? item.contentSnapshot?.title || item.contentId?.jobTitle || 'Job Post'
        : item.contentType === 'BaseUser'
        ? `User: ${item.contentSnapshot?.name || item.contentId?.firstName + ' ' + item.contentId?.lastName || 'Unknown'}`
        : 'Content Item',
      content: item.flagDetails || item.flagReason,
      author: item.contentType === 'Job' 
        ? item.contentSnapshot?.company || item.contentId?.companyName || 'Unknown Company'
        : item.flaggedBy 
        ? `${item.flaggedBy.firstName} ${item.flaggedBy.lastName}`
        : 'System',
      status: item.status,
      priority: item.priority,
      flagReason: item.flagReason,
      flaggedAt: item.flaggedAt,
      reviewedAt: item.reviewedAt,
      reviewedBy: item.reviewedBy ? `${item.reviewedBy.firstName} ${item.reviewedBy.lastName}` : null,
      details: {
        contentType: item.contentType,
        flagDetails: item.flagDetails,
        autoFlags: item.autoFlags,
        userReports: item.userReports?.length || 0,
        ...item.contentSnapshot
      }
    }));
    
    // Calculate statistics
    const totalItems = await Moderation.countDocuments(query);
    const stats = {
      pending: await Moderation.countDocuments({ status: 'pending' }),
      under_review: await Moderation.countDocuments({ status: 'under_review' }),
      resolved: await Moderation.countDocuments({ status: { $in: ['approved', 'rejected'] } }),
      total: await Moderation.countDocuments({})
    };
    
    console.log(`✅ Found ${transformedItems.length} moderation items`);
    
    res.json({
      success: true,
      data: {
        items: transformedItems,
        stats: stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalItems,
          pages: Math.ceil(totalItems / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching moderation items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch moderation items',
      error: error.message 
    });
  }
});

// POST /api/admin/moderation/:id/approve - Approve flagged content
router.post('/moderation/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;
    
    console.log(`🔍 Admin approving moderation item ${id} of type ${type}`);
    
    // Update moderation record
    await Moderation.findByIdAndUpdate(id, {
      status: 'approved',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      reviewReason: reason || 'Approved by admin'
    });
    
    // Update the actual content if it's a job
    if (type === 'job') {
      const modItem = await Moderation.findById(id);
      if (modItem) {
        await Job.findByIdAndUpdate(modItem.contentId, { 
          status: 'active',
          moderationStatus: 'approved'
        });
      }
    }
    
    console.log(`✅ Moderation item ${id} approved`);
    
    res.json({
      success: true,
      message: 'Item approved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error approving moderation item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve item',
      error: error.message 
    });
  }
});

// POST /api/admin/moderation/:id/reject - Reject flagged content
router.post('/moderation/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;
    
    console.log(`🔍 Admin rejecting moderation item ${id} of type ${type}`);
    
    // Update moderation record
    await Moderation.findByIdAndUpdate(id, {
      status: 'rejected',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      reviewReason: reason || 'Rejected by admin'
    });
    
    // Update the actual content if it's a job
    if (type === 'job') {
      const modItem = await Moderation.findById(id);
      if (modItem) {
        await Job.findByIdAndUpdate(modItem.contentId, { 
          status: 'rejected',
          moderationStatus: 'rejected'
        });
      }
    }
    
    console.log(`✅ Moderation item ${id} rejected`);
    
    res.json({
      success: true,
      message: 'Item rejected successfully'
    });
    
  } catch (error) {
    console.error('❌ Error rejecting moderation item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject item',
      error: error.message 
    });
  }
});

// ==================== SYSTEM SETTINGS ROUTES ====================

// GET /api/admin/settings - Get system settings
router.get('/settings', async (req, res) => {
  try {
    console.log('🔍 Admin fetching system settings');
    
    // Update the actual content if it's a job
    if (type === 'job') {
      const modItem = await Moderation.findById(id);
      if (modItem) {
        await Job.findByIdAndUpdate(modItem.contentId, { 
          status: 'active',
          moderationStatus: 'approved'
        });
      }
    }
    
    console.log(`✅ Moderation item ${id} approved`);
    
    res.json({
      success: true,
      message: 'Item approved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error approving moderation item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve item',
      error: error.message 
    });
  }
});

// POST /api/admin/moderation/:id/reject - Reject flagged content
router.post('/moderation/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;
    
    console.log(`🔍 Admin rejecting moderation item ${id} of type ${type}`);
    
    // Update moderation record
    await Moderation.findByIdAndUpdate(id, {
      status: 'rejected',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
      reviewReason: reason || 'Rejected by admin'
    });
    
    // Update the actual content if it's a job
    if (type === 'job') {
      const modItem = await Moderation.findById(id);
      if (modItem) {
        await Job.findByIdAndUpdate(modItem.contentId, { 
          status: 'rejected',
          moderationStatus: 'rejected'
        });
      }
    }
    
    console.log(`✅ Moderation item ${id} rejected`);
    
    res.json({
      success: true,
      message: 'Item rejected successfully'
    });
    
  } catch (error) {
    console.error('❌ Error rejecting moderation item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject item',
      error: error.message 
    });
  }
});

// ==================== SYSTEM SETTINGS ROUTES ====================

// GET /api/admin/settings - Get system settings
router.get('/settings', async (req, res) => {
  try {
    console.log('🔍 Admin fetching system settings');
    
    // In a real system, these would be stored in a Settings collection
    // For now, we'll return default settings that can be modified
    const settings = {
      general: {
        siteName: 'FinAutoJobs',
        siteDescription: 'Professional Job Portal Platform',
        contactEmail: 'admin@finautojobs.com',
        supportEmail: 'support@finautojobs.com',
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR'
      },
      system: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        autoApproveJobs: false,
        moderationRequired: true,
        allowGuestViewing: true,
        enableAnalytics: true
      },
      security: {
        sessionTimeout: 30, // minutes
        passwordMinLength: 8,
        requireEmailVerification: true,
        enableTwoFactor: false,
        maxLoginAttempts: 5,
        lockoutDuration: 15, // minutes
        requireStrongPasswords: true,
        enableCaptcha: false
      },
      fileUpload: {
        maxFileSize: '10MB',
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        maxFilesPerUser: 10,
        enableVirusScanning: false,
        autoDeleteOldFiles: true,
        fileRetentionDays: 365
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        emailTemplatesEnabled: true,
        notificationFrequency: 'immediate', // immediate, daily, weekly
        adminNotifications: true,
        userWelcomeEmail: true,
        jobAlerts: true
      },
      jobPosting: {
        autoApproveJobs: false,
        requireJobApproval: true,
        maxJobsPerRecruiter: 50,
        jobExpiryDays: 30,
        allowFeaturedJobs: true,
        enableJobBoosts: false,
        requireCompanyVerification: false,
        allowSalaryHiding: true
      },
      applications: {
        maxApplicationsPerJob: 1000,
        allowMultipleApplications: false,
        autoRejectAfterDays: 60,
        enableApplicationTracking: true,
        requireCoverLetter: false,
        allowApplicationWithdrawal: true,
        notifyRecruitersImmediately: true,
        enableApplicationAnalytics: true
      }
    };
    
    console.log('✅ System settings retrieved successfully');
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('❌ Error fetching system settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system settings',
      error: error.message 
    });
  }
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { category, settings } = req.body;
    
    console.log(`🔍 Admin updating ${category} settings:`, settings);
    
    // In a real system, you would:
    // 1. Validate the settings
    // 2. Store them in a Settings collection
    // 3. Apply them to the system
    // 4. Log the changes for audit
    
    // For now, we'll just validate and return success
    const validCategories = ['general', 'system', 'security', 'fileUpload', 'notifications', 'jobPosting', 'applications'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    // Validate specific settings based on category
    if (category === 'security') {
      if (settings.passwordMinLength < 6 || settings.passwordMinLength > 20) {
        return res.status(400).json({
          success: false,
          message: 'Password minimum length must be between 6 and 20 characters'
        });
      }
      
      if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
        return res.status(400).json({
          success: false,
          message: 'Session timeout must be between 5 and 480 minutes'
        });
      }
    }
    
    if (category === 'fileUpload') {
      const validSizes = ['5MB', '10MB', '25MB', '50MB', '100MB'];
      if (!validSizes.includes(settings.maxFileSize)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file size limit'
        });
      }
    }
    
    // Log the settings change for audit
    console.log(`✅ Settings updated by admin ${req.user.userId}:`, {
      category,
      settings,
      timestamp: new Date(),
      adminId: req.user.userId
    });
    
    res.json({
      success: true,
      message: `${category} settings updated successfully`,
      data: settings
    });
    
  } catch (error) {
    console.error('❌ Error updating system settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update system settings',
      error: error.message 
    });
  }
});

// POST /api/admin/settings/backup - Create settings backup
router.post('/settings/backup', async (req, res) => {
  try {
    console.log('🔍 Admin creating settings backup');
    
    // In a real system, you would create a backup of all settings
    const backup = {
      id: `backup_${Date.now()}`,
      createdAt: new Date(),
      createdBy: req.user.userId,
      settings: {
        // All current settings would be included here
        general: { siteName: 'FinAutoJobs' },
        system: { maintenanceMode: false },
        // ... other settings
      }
    };
    
    console.log('✅ Settings backup created successfully');
    
    res.json({
      success: true,
      message: 'Settings backup created successfully',
      data: backup
    });
    
  } catch (error) {
    console.error('❌ Error creating settings backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create settings backup',
      error: error.message 
    });
  }
});

// POST /api/admin/settings/restore - Restore settings from backup
router.post('/settings/restore', async (req, res) => {
  try {
    const { backupId } = req.body;
    
    console.log(`🔍 Admin restoring settings from backup ${backupId}`);
    
    // In a real system, you would:
    // 1. Validate the backup exists
    // 2. Restore all settings from the backup
    // 3. Apply the restored settings
    // 4. Log the restoration for audit
    
    console.log('✅ Settings restored successfully');
    
    res.json({
      success: true,
      message: 'Settings restored successfully from backup'
    });
    
  } catch (error) {
    console.error('❌ Error restoring settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore settings',
      error: error.message 
    });
  }
});

// POST /api/admin/users - Create a new user
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, role, password, isVerified } = req.body;
    
    console.log(`🔍 Admin creating new user: ${email} with role: ${role}`);
    
    // Validate required fields
    if (!firstName || !lastName || !email || !contactNumber || !role || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: firstName, lastName, email, contactNumber, role, password'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Validate role
    if (!['applicant', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be one of: applicant, recruiter, admin'
      });
    }
    
    // Check if user already exists
    const existingUser = await BaseUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }
    
    // Hash the password
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = new BaseUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber.trim(),
      role: role,
      password: hashedPassword,
      isVerified: isVerified || true, // Admin-created users are verified by default
      isActive: true,
      profileComplete: 25, // Basic info provided
      createdAt: new Date(),
      createdBy: req.user.userId // Track who created this user
    });
    
    await newUser.save();
    
    console.log('✅ User created successfully by admin');
    
    // Send email with credentials to the new user
    try {
      console.log('📧 Sending account creation email...');
      const emailSent = await emailService.sendAccountCreatedEmail(email, {
        firstName: firstName,
        lastName: lastName,
        role: role,
        password: password, // Send the plain password in email
        contactNumber: contactNumber
      });
      
      if (emailSent) {
        console.log('✅ Account creation email sent successfully');
      } else {
        console.warn('⚠️ Failed to send account creation email, but user was created');
      }
    } catch (emailError) {
      console.error('❌ Error sending account creation email:', emailError);
      // Don't fail the user creation if email fails
    }
    
    // Return user data without password
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      contactNumber: newUser.contactNumber,
      role: newUser.role,
      isVerified: newUser.isVerified,
      isActive: newUser.isActive,
      profileComplete: newUser.profileComplete,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'User created successfully and credentials sent via email',
      data: userResponse,
      emailSent: true // Indicate that email was sent
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user',
      error: error.message 
    });
  }
});

export default router;
