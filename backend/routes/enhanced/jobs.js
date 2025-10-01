import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Job from '../../models/Job.js';
import { JobAnalytics } from '../../models/enhanced/Analytics.js';
import Favorite from '../../models/enhanced/Favorite.js';
import Application from '../../models/unified/Application.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { trackJobView } from '../../middleware/enhanced/analytics.js';

const router = express.Router();

// Validation schemas
const jobValidation = [
  body('jobTitle')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('jobType')
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .withMessage('Invalid job type'),
  body('workType')
    .isIn(['on-site', 'remote', 'hybrid'])
    .withMessage('Invalid work type'),
  body('experienceLevel')
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('salary.amount')
    .optional()
    .isNumeric()
    .withMessage('Salary amount must be a number'),
  body('salary.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid application deadline format'),
];

const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'salary', 'applicationDeadline', 'relevance'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// @route   GET /api/jobs
// @desc    Get all jobs with filtering, search, and pagination
// @access  Public
router.get('/', searchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      location,
      jobType,
      workType,
      experienceLevel,
      salaryMin,
      salaryMax,
      company,
      industry,
      skills,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      remote
    } = req.query;

    // Build search query based on user role
    let query = {};
    
    // For public access, only show active jobs
    // For recruiters, show all their jobs regardless of status
    if (req.user && req.user.role === 'recruiter') {
      // Recruiter can see all their own jobs
      query.postedBy = req.user.userId;
      // Allow status filtering for recruiters
      if (req.query.status) {
        const statuses = Array.isArray(req.query.status) ? req.query.status : [req.query.status];
        query.status = { $in: statuses };
      }
      // If no status specified, show all statuses for recruiter
    } else {
      // Public users only see active jobs
      query.status = 'active';
      // Only show jobs with future deadlines for public
      query.applicationDeadline = { $gte: new Date() };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    // Remote work filter
    if (remote === 'true') {
      query.workType = { $in: ['remote', 'hybrid'] };
    }

    // Job type filter
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : [jobType];
      query.jobType = { $in: types };
    }

    // Work type filter
    if (workType) {
      const types = Array.isArray(workType) ? workType : [workType];
      query.workType = { $in: types };
    }

    // Experience level filter
    if (experienceLevel) {
      const levels = Array.isArray(experienceLevel) ? experienceLevel : [experienceLevel];
      query.experienceLevel = { $in: levels };
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query['salary.amount'] = {};
      if (salaryMin) query['salary.amount'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salary.amount'].$lte = parseInt(salaryMax);
    }

    // Company filter
    if (company) {
      query.companyName = new RegExp(company, 'i');
    }

    // Industry filter
    if (industry) {
      query.industry = new RegExp(industry, 'i');
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      query.requiredSkills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Featured jobs filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'relevance' && search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName companyName profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query)
    ]);

    // Add additional computed fields
    const enrichedJobs = jobs.map(job => ({
      ...job,
      isNew: (Date.now() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000), // 7 days
      daysLeft: Math.ceil((new Date(job.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24)),
      applicationsCount: job.applicationsCount || 0
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        jobs: enrichedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        filters: {
          search,
          location,
          jobType,
          workType,
          experienceLevel,
          salaryRange: { min: salaryMin, max: salaryMax },
          company,
          industry,
          skills: skills ? (Array.isArray(skills) ? skills : skills.split(',')) : [],
          featured: featured === 'true',
          remote: remote === 'true'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', trackJobView, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(id)
      .populate('postedBy', 'firstName lastName companyName profilePicture email')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is active or if user is the poster
    const authHeader = req.headers.authorization;
    let isOwner = false;
    
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isOwner = job.postedBy._id.toString() === decoded.userId;
      } catch (error) {
        // Token invalid, continue as public user
      }
    }

    if (job.status !== 'active' && !isOwner) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer available'
      });
    }

    // Get additional data
    const [applicationsCount, isUserApplied, isFavorited, similarJobs] = await Promise.all([
      Application.countDocuments({ jobId: id }),
      authHeader ? checkUserApplied(id, authHeader) : false,
      authHeader ? checkUserFavorited(id, authHeader) : false,
      getSimilarJobs(job, 5)
    ]);

    // Enrich job data
    const enrichedJob = {
      ...job,
      applicationsCount,
      isUserApplied,
      isFavorited,
      isNew: (Date.now() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000),
      daysLeft: Math.ceil((new Date(job.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24)),
      similarJobs
    };

    res.json({
      success: true,
      data: { job: enrichedJob }
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Recruiter only)
router.post('/', authenticateToken, requireRole(['recruiter']), jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.userId,
      slug: generateJobSlug(req.body.jobTitle, req.body.companyName),
      status: req.body.status || 'active'
    };

    // Set application deadline if not provided
    if (!jobData.applicationDeadline) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30 days from now
      jobData.applicationDeadline = deadline;
    }

    const job = new Job(jobData);
    await job.save();

    // Create job analytics
    const jobAnalytics = new JobAnalytics({
      jobId: job._id,
      recruiterId: req.user.userId
    });
    await jobAnalytics.save();

    // Populate the response
    await job.populate('postedBy', 'firstName lastName companyName');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job posting
// @access  Private (Recruiter only - own jobs)
router.put('/:id', authenticateToken, requireRole(['recruiter']), jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Find job and verify ownership
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own job postings'
      });
    }

    // Update job
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // If changing to active status, validate required fields
    if (updateData.status === 'active') {
      if (!job.applicationDeadline || job.applicationDeadline < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate job with past application deadline'
        });
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName companyName');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting
// @access  Private (Recruiter only - own jobs)
router.delete('/:id', authenticateToken, requireRole(['recruiter']), async (req, res) => {
  try {
    const { id } = req.params;

    // Find job and verify ownership
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own job postings'
      });
    }

    // Check if job has applications
    const applicationsCount = await Application.countDocuments({ jobId: id });
    if (applicationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job with existing applications. Please close the job instead.'
      });
    }

    // Delete job and related data
    await Promise.all([
      Job.findByIdAndDelete(id),
      JobAnalytics.findOneAndDelete({ jobId: id }),
      Favorite.deleteMany({ jobId: id })
    ]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/recommended/:userId
// @desc    Get recommended jobs for a user
// @access  Private (Applicant only)
router.get('/recommended/:userId', authenticateToken, requireRole(['applicant']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify user can access these recommendations
    if (userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own recommendations'
      });
    }

    // Get user profile for recommendations
    const user = await Applicant.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build recommendation query based on user profile
    const query = {
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    };

    // Skills matching
    if (user.profile?.skills?.length > 0) {
      query.requiredSkills = { $in: user.profile.skills.map(skill => new RegExp(skill, 'i')) };
    }

    // Location preferences
    if (user.profile?.preferences?.locations?.length > 0) {
      query.$or = user.profile.preferences.locations.map(location => ({
        $or: [
          { 'location.city': new RegExp(location, 'i') },
          { 'location.state': new RegExp(location, 'i') },
          { workType: 'remote' }
        ]
      }));
    }

    // Job type preferences
    if (user.profile?.preferences?.jobTypes?.length > 0) {
      query.jobType = { $in: user.profile.preferences.jobTypes };
    }

    // Salary preferences
    if (user.profile?.preferences?.salaryRange?.min) {
      query['salary.amount'] = { $gte: user.profile.preferences.salaryRange.min };
    }

    // Exclude already applied jobs
    const appliedJobs = await Application.find({ applicantId: userId }).distinct('jobId');
    if (appliedJobs.length > 0) {
      query._id = { $nin: appliedJobs };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get recommended jobs
    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName companyName')
        .sort({ createdAt: -1, isFeatured: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query)
    ]);

    // Calculate match scores
    const jobsWithScores = jobs.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job, user.profile),
      isNew: (Date.now() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
    }));

    // Sort by match score
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: {
        jobs: jobsWithScores,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / parseInt(limit)),
          totalJobs,
          limit: parseInt(limit)
        },
        userProfile: {
          skills: user.profile?.skills || [],
          preferences: user.profile?.preferences || {}
        }
      }
    });

  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/similar/:id
// @desc    Get similar jobs
// @access  Public
router.get('/similar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const similarJobs = await getSimilarJobs(job, parseInt(limit));

    res.json({
      success: true,
      data: { jobs: similarJobs }
    });

  } catch (error) {
    console.error('Error fetching similar jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
const generateJobSlug = (title, company) => {
  const slug = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  return `${slug}-${Date.now()}`;
};

const checkUserApplied = async (jobId, authHeader) => {
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const application = await Application.findOne({
      jobId,
      applicantId: decoded.userId
    });
    return !!application;
  } catch (error) {
    return false;
  }
};

const checkUserFavorited = async (jobId, authHeader) => {
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const favorite = await Favorite.findOne({
      jobId,
      userId: decoded.userId,
      status: 'active'
    });
    return !!favorite;
  } catch (error) {
    return false;
  }
};

const getSimilarJobs = async (job, limit) => {
  const query = {
    _id: { $ne: job._id },
    status: 'active',
    applicationDeadline: { $gte: new Date() },
    $or: [
      { jobType: job.jobType },
      { experienceLevel: job.experienceLevel },
      { industry: job.industry },
      { requiredSkills: { $in: job.requiredSkills } }
    ]
  };

  return await Job.find(query)
    .populate('postedBy', 'firstName lastName companyName')
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};

const calculateMatchScore = (job, userProfile) => {
  let score = 0;
  let maxScore = 0;

  // Skills matching (40% weight)
  if (job.requiredSkills?.length > 0 && userProfile.skills?.length > 0) {
    const matchingSkills = job.requiredSkills.filter(skill =>
      userProfile.skills.some(userSkill =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    score += (matchingSkills.length / job.requiredSkills.length) * 40;
  }
  maxScore += 40;

  // Job type matching (20% weight)
  if (userProfile.preferences?.jobTypes?.includes(job.jobType)) {
    score += 20;
  }
  maxScore += 20;

  // Location matching (20% weight)
  if (job.workType === 'remote' || 
      userProfile.preferences?.locations?.some(location =>
        job.location?.city?.toLowerCase().includes(location.toLowerCase()) ||
        job.location?.state?.toLowerCase().includes(location.toLowerCase())
      )) {
    score += 20;
  }
  maxScore += 20;

  // Salary matching (20% weight)
  if (userProfile.preferences?.salaryRange?.min &&
      job.salary?.amount >= userProfile.preferences.salaryRange.min) {
    score += 20;
  }
  maxScore += 20;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

// @route   GET /api/v2/jobs/my-jobs
// @desc    Get recruiter's jobs with all statuses (active, draft, closed)
// @access  Private (Recruiter only)
router.get('/my-jobs', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const recruiterId = req.user.userId;

    // Build query for recruiter's jobs
    const query = { postedBy: recruiterId };

    // Status filtering for recruiter dashboard tabs
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      query.status = { $in: statuses };
    }

    // Search within recruiter's jobs
    if (search) {
      query.$or = [
        { jobTitle: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Recruiter jobs query:', JSON.stringify(query, null, 2));

    // Execute query
    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName companyName profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query)
    ]);

    console.log('📊 Found jobs for recruiter:', jobs.length);

    // Get applications count for each job
    console.log('📊 Calculating applications count for', jobs.length, 'jobs');
    
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        console.log(`🔢 Calculating for job: ${job.jobTitle} (${job._id})`);
        
        // Try multiple approaches to get applications count
        const [
          applicationsCount, 
          activeApplicationsCount,
          applicationsCountString,
          applicationsCountFromJobModel
        ] = await Promise.all([
          Application.countDocuments({ jobId: job._id }),
          Application.countDocuments({ jobId: job._id, status: { $nin: ['withdrawn', 'rejected'] } }),
          Application.countDocuments({ jobId: job._id.toString() }),
          Job.findById(job._id).select('applicationsCount').then(j => j?.applicationsCount || 0)
        ]);

        // Use the highest count found (in case of data type issues)
        const finalApplicationsCount = Math.max(
          applicationsCount || 0, 
          applicationsCountString || 0, 
          applicationsCountFromJobModel || 0
        );

        console.log(`📈 Job ${job.jobTitle}: ObjectId=${applicationsCount}, String=${applicationsCountString}, JobModel=${applicationsCountFromJobModel}, Final=${finalApplicationsCount}`);

        return {
          ...job,
          id: job._id,
          applicationsCount: finalApplicationsCount,
          activeApplicationsCount: activeApplicationsCount || 0,
          isExpired: job.applicationDeadline && new Date(job.applicationDeadline) < new Date(),
          daysLeft: job.applicationDeadline ? 
            Math.ceil((new Date(job.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24)) : null,
          isNew: (Date.now() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000),
          canEdit: ['draft', 'active'].includes(job.status),
          canDelete: ['draft'].includes(job.status),
          canClose: job.status === 'active',
          canReopen: job.status === 'closed'
        };
      })
    );

    console.log('✅ Applications count calculation completed');

    // Get status summary
    const statusSummary = await Job.aggregate([
      { $match: { postedBy: recruiterId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: totalJobs,
      active: 0,
      draft: 0,
      closed: 0,
      expired: 0
    };

    statusSummary.forEach(item => {
      summary[item._id] = item.count;
    });

    // Count expired jobs
    summary.expired = await Job.countDocuments({
      postedBy: recruiterId,
      status: 'active',
      applicationDeadline: { $lt: new Date() }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: jobsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        summary,
        filters: {
          status: status ? (Array.isArray(status) ? status : [status]) : [],
          search
        }
      }
    });

  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/v2/jobs/:id/status
// @desc    Update job status (draft -> active, active -> closed, etc.)
// @access  Private (Recruiter only)
router.put('/:id/status', authenticateToken, requireRole('recruiter'), [
  body('status').isIn(['draft', 'active', 'closed']).withMessage('Invalid job status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.userId;

    // Find job and verify ownership
    const job = await Job.findOne({ _id: id, postedBy: recruiterId });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Validate status transition
    const validTransitions = {
      'draft': ['active', 'closed'],
      'active': ['closed'],
      'closed': ['active']
    };

    if (!validTransitions[job.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${job.status} to ${status}`
      });
    }

    // Update job status
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date(),
        ...(status === 'active' && { publishedAt: new Date() }),
        ...(status === 'closed' && { closedAt: new Date() })
      },
      { new: true }
    ).populate('postedBy', 'firstName lastName companyName');

    // Track analytics
    try {
      await JobAnalytics.findOneAndUpdate(
        { jobId: id },
        {
          $push: {
            statusHistory: {
              status,
              changedAt: new Date(),
              changedBy: recruiterId
            }
          }
        },
        { upsert: true }
      );
    } catch (analyticsError) {
      console.error('Error updating job analytics:', analyticsError);
    }

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      data: { job: updatedJob }
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/v2/jobs/:id/applications-debug
// @desc    Debug applications count for a specific job
// @access  Private (Recruiter only)
router.get('/:id/applications-debug', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const recruiterId = req.user.userId;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Get all applications for this job with detailed info
    const applications = await Application.find({ jobId: jobId });
    
    // Get applications with string jobId (in case of type mismatch)
    const applicationsString = await Application.find({ jobId: jobId.toString() });
    
    // Get all applications for debugging
    const allApplications = await Application.find({}).select('jobId applicantId status createdAt');
    
    // Count applications
    const totalCount = await Application.countDocuments({ jobId: jobId });
    const totalCountString = await Application.countDocuments({ jobId: jobId.toString() });

    console.log('🔍 Debug info for job:', jobId);
    console.log('📊 Job details:', { _id: job._id, jobTitle: job.jobTitle });
    console.log('📋 Applications found (ObjectId):', applications.length);
    console.log('📋 Applications found (String):', applicationsString.length);
    console.log('📊 Total count (ObjectId):', totalCount);
    console.log('📊 Total count (String):', totalCountString);
    console.log('🗂️ All applications in DB:', allApplications.length);

    res.json({
      success: true,
      debug: {
        jobId: jobId,
        jobTitle: job.jobTitle,
        applicationsWithObjectId: applications.length,
        applicationsWithString: applicationsString.length,
        totalCountObjectId: totalCount,
        totalCountString: totalCountString,
        allApplicationsInDB: allApplications.length,
        sampleApplications: applications.slice(0, 3).map(app => ({
          _id: app._id,
          jobId: app.jobId,
          jobIdType: typeof app.jobId,
          applicantId: app.applicantId,
          status: app.status,
          createdAt: app.createdAt
        })),
        allApplicationsJobIds: allApplications.map(app => ({
          jobId: app.jobId,
          jobIdType: typeof app.jobId,
          status: app.status
        }))
      }
    });

  } catch (error) {
    console.error('Error in applications debug:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// @route   GET /api/v2/jobs/:id/complete-details
// @desc    Get complete job details with applications for modal display
// @access  Private (Recruiter only)
router.get('/:id/complete-details', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const recruiterId = req.user.userId;

    console.log('🔍 Fetching complete job details for:', jobId);

    // Get job with complete details
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId })
      .populate('postedBy', 'firstName lastName companyName email')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Get applications count and details
    const [applicationsCount, activeApplicationsCount, applications] = await Promise.all([
      Application.countDocuments({ jobId: jobId }),
      Application.countDocuments({ jobId: jobId, status: { $nin: ['withdrawn', 'rejected'] } }),
      Application.find({ jobId: jobId })
        .populate('applicantId', 'firstName lastName email phone profilePicture')
        .populate('resumeId', 'fileName filePath title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    console.log(`📊 Job details: ${job.jobTitle}, Applications: ${applicationsCount}`);

    // Format complete job data for frontend
    const completeJobData = {
      // Basic job info
      _id: job._id,
      id: job._id,
      jobTitle: job.jobTitle || 'Untitled Position',
      companyName: job.companyName || job.postedBy?.companyName || 'Company Name',
      description: job.description || 'No description available',
      
      // Location details
      location: {
        city: job.location?.city || '',
        state: job.location?.state || '',
        country: job.location?.country || 'India',
        formatted: formatLocationString(job.location)
      },
      
      // Job specifications
      jobType: job.jobType || 'Not specified',
      workType: job.workType || 'Not specified',
      experienceLevel: job.experienceLevel || 'Not specified',
      industry: job.industry || 'Not specified',
      
      // Salary information
      salary: {
        amount: job.salary?.amount || null,
        currency: job.salary?.currency || 'INR',
        period: job.salary?.period || 'yearly',
        formatted: formatSalaryString(job.salary)
      },
      
      // Requirements
      skills: job.skills || [],
      qualifications: job.qualifications || [],
      responsibilities: job.responsibilities || [],
      
      // Dates and status
      status: job.status || 'draft',
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      applicationDeadline: job.applicationDeadline,
      
      // Applications data
      applicationsCount: applicationsCount || 0,
      activeApplicationsCount: activeApplicationsCount || 0,
      
      // Recruiter info
      recruiter: {
        id: job.postedBy?._id,
        name: job.postedBy ? `${job.postedBy.firstName} ${job.postedBy.lastName}` : 'Recruiter',
        company: job.postedBy?.companyName || job.companyName,
        email: job.postedBy?.email
      },
      
      // Meta information
      isExpired: job.applicationDeadline && new Date(job.applicationDeadline) < new Date(),
      daysLeft: job.applicationDeadline ? 
        Math.ceil((new Date(job.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24)) : null,
      isNew: (Date.now() - new Date(job.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000),
      
      // Action permissions
      canEdit: ['draft', 'active'].includes(job.status),
      canDelete: ['draft'].includes(job.status),
      canClose: job.status === 'active',
      canReopen: job.status === 'closed'
    };

    // Format applications for display
    const formattedApplications = applications.map((app, index) => ({
      _id: app._id,
      id: app._id,
      applicantName: app.applicantId ? 
        `${app.applicantId.firstName} ${app.applicantId.lastName}` : 
        `Applicant ${index + 1}`,
      applicantEmail: app.applicantId?.email || 'N/A',
      status: app.status,
      appliedAt: app.appliedAt,
      appliedDate: new Date(app.appliedAt).toLocaleDateString(),
      timeAgo: getTimeAgo(app.appliedAt),
      hasResume: !!(app.resumeId || app.applicantId),
      resumeFileName: app.resumeId?.fileName || 'Resume',
      applicant: {
        id: app.applicantId?._id,
        name: app.applicantId ? 
          `${app.applicantId.firstName} ${app.applicantId.lastName}` : 'Unknown',
        email: app.applicantId?.email || 'N/A',
        phone: app.applicantId?.phone || 'N/A',
        avatar: app.applicantId?.profilePicture || '👤'
      }
    }));

    res.json({
      success: true,
      data: {
        job: completeJobData,
        applications: formattedApplications,
        summary: {
          totalApplications: applicationsCount,
          activeApplications: activeApplicationsCount,
          pendingReview: applications.filter(app => app.status === 'pending').length,
          shortlisted: applications.filter(app => app.status === 'shortlisted').length,
          interviewed: applications.filter(app => app.status === 'interviewed').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching complete job details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function formatLocationString(location) {
  if (!location) return 'Location not specified';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && location.country !== 'India') parts.push(location.country);
  
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
}

function formatSalaryString(salary) {
  if (!salary || !salary.amount) return 'Negotiable';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: salary.currency || 'INR',
    maximumFractionDigits: 0
  });
  
  const amount = formatter.format(salary.amount);
  const period = salary.period ? ` / ${salary.period}` : '';
  
  return `${amount}${period}`;
}

function getTimeAgo(date) {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default router;
