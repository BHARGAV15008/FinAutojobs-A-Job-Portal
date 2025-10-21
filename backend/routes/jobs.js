import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';
import ApplicationInformation from '../models/ApplicationInformation.js';
import { BaseUser, Recruiter } from '../models/UserModels.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import { sendJobMatchEmail } from '../services/notifications.js';

const router = express.Router();

// Notify matching applicants
const notifyMatchingApplicants = async (job) => {
  try {
    const applicants = await BaseUser.find({ role: 'applicant' });
    for (const applicant of applicants) {
      const skills = [...(applicant.skills?.primary || [])];
      const matches = (job.requiredSkills || []).filter(skill => 
        skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      if (matches.length > 0) {
        await sendJobMatchEmail(applicant.email, job.title, job.companyName);
      }
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
};

// Removed duplicate empty route - using the full implementation below

// Helper function to determine job status based on application deadline
const determineJobStatus = (applicationDeadline) => {
  if (!applicationDeadline) {
    return 'active'; // No deadline means active
  }
  
  const deadline = new Date(applicationDeadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline < 0) {
    return 'closed'; // Past deadline
  } else if (daysUntilDeadline <= 7) {
    return 'active'; // Within 7 days - active
  } else {
    return 'active'; // Future deadline - active
  }
};

// Enhanced authentication middleware for jobs routes
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    // Find user using BaseUser model
    const user = await BaseUser.findById(decoded.id || decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Set user data for request
    req.user = {
      id: user._id,
      userId: user._id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      ...decoded
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// GET /api/jobs - Get all jobs with comprehensive filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      location, 
      jobType,
      industry,
      jobCategory,
      workArrangement,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      skills,
      company, 
      status,
      postedBy,
      companyName,
      recruiterAndCompany,
      page = 1, 
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query - if postedBy is provided, include all statuses for recruiter's dashboard
    const query = {};
    
    // Filter by recruiter ID AND company (for recruiter's own jobs + company jobs)
    if (recruiterAndCompany) {
      const [currentRecruiterId, currentCompanyName] = recruiterAndCompany.split('|');
      if (currentRecruiterId && currentCompanyName) {
        query.$or = [
          { postedBy: currentRecruiterId }, // Jobs posted by the recruiter themselves
          { 'companyInfo.companyName': currentCompanyName } // Jobs posted by anyone from the same company
        ];
        // For recruiter dashboard, include all statuses unless specifically filtered
        if (status) {
          query.status = status;
        }
      }
    } else if (postedBy) {
      // Filter by recruiter ID only (for recruiter's own jobs)
      query.postedBy = postedBy;
      // For recruiters viewing their own jobs, include all statuses unless specifically filtered
      if (status) {
        query.status = status;
      }
      // Don't filter by status if recruiter wants to see all their jobs
    } else if (companyName) {
      // Filter by company name only (for company-specific jobs)
      query.companyName = companyName;
      // For company-based filtering, include all statuses unless specifically filtered
      if (status) {
        query.status = status;
      }
    } else {
      // For public job listings, only show active jobs
      query.status = status || 'active';
    }

    // Text search across multiple fields
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by industry
    if (industry) {
      query.industry = industry;
    }

    // Filter by job category
    if (jobCategory) {
      query.jobCategory = jobCategory;
    }

    // Filter by work arrangement
    if (workArrangement) {
      query.workArrangement = workArrangement;
    }

    // Filter by company
    if (company) {
      query.companyName = { $regex: company, $options: 'i' };
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query.$and = query.$and || [];
      if (salaryMin) {
        query.$and.push({
          $or: [
            { 'salary.minimum': { $gte: parseInt(salaryMin) } },
            { 'salary.type': 'Negotiable' }
          ]
        });
      }
      if (salaryMax) {
        query.$and.push({
          $or: [
            { 'salary.maximum': { $lte: parseInt(salaryMax) } },
            { 'salary.type': 'Negotiable' }
          ]
        });
      }
    }

    // Experience range filter
    if (experienceMin || experienceMax) {
      if (experienceMin) {
        query['experience.minimum'] = { $gte: parseInt(experienceMin) };
      }
      if (experienceMax) {
        query['experience.maximum'] = { $lte: parseInt(experienceMax) };
      }
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.requiredSkills = { $in: skillsArray };
    }

    // Only show jobs with future deadlines for active jobs (not for draft jobs)
    if (!postedBy || (status && status !== 'draft')) {
      query.applicationDeadline = { $gt: new Date() };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with population
    const [jobs, totalCount] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName email companyInfo')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    // Transform jobs for frontend
    const transformedJobs = jobs.map(job => ({
      id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      industry: job.industry,
      jobCategory: job.jobCategory,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      salary: job.formattedSalary,
      salaryRange: {
        min: job.salary?.minimum,
        max: job.salary?.maximum,
        type: job.salary?.type,
        period: job.salary?.period,
        currency: job.salary?.currency
      },
      experience: {
        min: job.experience?.minimum,
        max: job.experience?.maximum
      },
      requiredSkills: job.requiredSkills,
      jobDescription: job.jobDescription.substring(0, 200) + '...', // Truncated for listing
      keyResponsibilities: job.keyResponsibilities,
      requirements: job.requirements,
      status: job.status,
      jobUrgency: job.jobUrgency,
      views: job.views,
      applicationsCount: job.applicationsCount,
      createdAt: job.createdAt,
      applicationDeadline: job.applicationDeadline,
      daysSincePosted: job.daysSincePosted,
      daysUntilDeadline: job.daysUntilDeadline,
      slug: job.slug,
      postedBy: job.postedBy,
      recruiterInfo: job.recruiterInfo,
      contactEmail: job.contactEmail
    }));

    res.json({
      success: true,
      data: {
        jobs: transformedJobs,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        filters: {
          industries: ['Finance & Banking', 'Automobile & Manufacturing'],
          jobTypes: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'],
          workArrangements: ['On-site', 'Remote', 'Hybrid'],
          urgencyLevels: ['Normal Priority', 'Urgent', 'High Priority']
        }
      }
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

// GET /api/jobs/search/advanced - Advanced job search
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      keywords,
      location,
      industry,
      jobCategory,
      jobType,
      workArrangement,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      skills,
      urgency,
      page = 1,
      limit = 20
    } = req.query;

    const searchFilters = {
      status: 'Active',
      applicationDeadline: { $gt: new Date() }
    };

    // Keyword search
    if (keywords) {
      searchFilters.$or = [
        { jobTitle: { $regex: keywords, $options: 'i' } },
        { jobDescription: { $regex: keywords, $options: 'i' } },
        { companyName: { $regex: keywords, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(keywords, 'i')] } }
      ];
    }

    // Apply other filters
    if (location) searchFilters.location = { $regex: location, $options: 'i' };
    if (industry) searchFilters.industry = industry;
    if (jobCategory) searchFilters.jobCategory = jobCategory;
    if (jobType) searchFilters.jobType = jobType;
    if (workArrangement) searchFilters.workArrangement = workArrangement;
    if (urgency) searchFilters.jobUrgency = urgency;

    // Salary and experience filters
    if (salaryMin || salaryMax) {
      if (salaryMin) searchFilters['salary.minimum'] = { $gte: parseInt(salaryMin) };
      if (salaryMax) searchFilters['salary.maximum'] = { $lte: parseInt(salaryMax) };
    }

    if (experienceMin || experienceMax) {
      if (experienceMin) searchFilters['experience.minimum'] = { $gte: parseInt(experienceMin) };
      if (experienceMax) searchFilters['experience.maximum'] = { $lte: parseInt(experienceMax) };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      searchFilters.requiredSkills = { $in: skillsArray };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalCount] = await Promise.all([
      Job.find(searchFilters)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(searchFilters)
    ]);

    const transformedJobs = jobs.map(job => ({
      id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      industry: job.industry,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      salary: job.formattedSalary,
      experience: job.experience,
      requiredSkills: job.requiredSkills,
      jobUrgency: job.jobUrgency,
      createdAt: job.createdAt,
      applicationDeadline: job.applicationDeadline,
      slug: job.slug
    }));

    res.json({
      success: true,
      data: {
        jobs: transformedJobs,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced search',
      error: error.message
    });
  }
});

// GET /api/jobs/filters/options - Get filter options for job search
router.get('/filters/options', async (req, res) => {
  try {
    const [
      industries,
      jobCategories,
      jobTypes,
      workArrangements,
      locations,
      companies,
      skills
    ] = await Promise.all([
      Job.distinct('industry'),
      Job.distinct('jobCategory'),
      Job.distinct('jobType'),
      Job.distinct('workArrangement'),
      Job.distinct('location'),
      Job.distinct('companyName'),
      Job.distinct('requiredSkills')
    ]);

    res.json({
      success: true,
      data: {
        industries: industries.filter(Boolean),
        jobCategories: jobCategories.filter(Boolean),
        jobTypes: jobTypes.filter(Boolean),
        workArrangements: workArrangements.filter(Boolean),
        locations: locations.filter(Boolean).slice(0, 50), // Limit locations
        companies: companies.filter(Boolean).slice(0, 100), // Limit companies
        skills: skills.filter(Boolean).slice(0, 200) // Limit skills
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

// GET /api/jobs/stats/overview - Get job statistics overview
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalCompanies,
      jobsByIndustry,
      jobsByType,
      recentJobs
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active', applicationDeadline: { $gt: new Date() } }),
      Job.distinct('companyName').then(companies => companies.length),
      Job.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Job.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Job.find({ status: 'Active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('jobTitle companyName location createdAt')
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          activeJobs,
          totalCompanies
        },
        distribution: {
          byIndustry: jobsByIndustry,
          byType: jobsByType
        },
        recentJobs: recentJobs.map(job => ({
          id: job._id,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          location: job.location,
          createdAt: job.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job statistics',
      error: error.message
    });
  }
});

// GET /api/jobs/search - Search jobs by query
router.get('/search', async (req, res) => {
  try {
    const { q, location, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      status: 'active',
      applicationDeadline: { $gt: new Date() },
      $or: [
        { jobTitle: { $regex: q, $options: 'i' } },
        { jobDescription: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalCount] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    const transformedJobs = jobs.map(job => ({
      id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      industry: job.industry,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      salary: job.formattedSalary,
      experience: job.experience,
      requiredSkills: job.requiredSkills,
      createdAt: job.createdAt,
      applicationDeadline: job.applicationDeadline,
      slug: job.slug
    }));

    res.json({
      success: true,
      data: {
        jobs: transformedJobs,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error.message
    });
  }
});

// GET /api/jobs/categories - Get job categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.distinct('jobCategory');
    
    res.json({
      success: true,
      data: categories.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job categories',
      error: error.message
    });
  }
});

// GET /api/jobs/locations - Get job locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Job.distinct('location');
    
    res.json({
      success: true,
      data: locations.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching job locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job locations',
      error: error.message
    });
  }
});

// GET /api/jobs/:id - Get job by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Validate MongoDB ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Find job by ID or slug
    let job = await Job.findById(jobId)
      .populate('postedBy', 'firstName lastName email')
      .lean();

    // If not found by ID, try finding by slug
    if (!job) {
      job = await Job.findOne({ slug: jobId })
        .populate('postedBy', 'firstName lastName email')
        .lean();
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count asynchronously
    Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } }).catch(console.error);

    // Transform job data with full details
    const transformedJob = {
      id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      industry: job.industry,
      jobCategory: job.jobCategory,
      jobType: job.jobType,
      workArrangement: job.workArrangement,
      applicationDeadline: job.applicationDeadline,
      experience: {
        minimum: job.experience?.minimum,
        maximum: job.experience?.maximum
      },
      requiredSkills: job.requiredSkills,
      salary: {
        type: job.salary?.type,
        minimum: job.salary?.minimum,
        maximum: job.salary?.maximum,
        period: job.salary?.period,
        currency: job.salary?.currency,
        formatted: job.formattedSalary
      },
      jobDescription: job.jobDescription,
      keyResponsibilities: job.keyResponsibilities,
      requirements: job.requirements,
      aiKeywords: job.aiKeywords,
      isAiEnhanced: job.isAiEnhanced,
      contactEmail: job.contactEmail,
      jobUrgency: job.jobUrgency,
      status: job.status,
      views: job.views + 1, // Include incremented view
      applicationsCount: job.applicationsCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      daysSincePosted: job.daysSincePosted,
      daysUntilDeadline: job.daysUntilDeadline,
      slug: job.slug,
      tags: job.tags,
      postedBy: job.postedBy,
      recruiterInfo: job.recruiterInfo,
      canApply: job.applicationDeadline > new Date() && job.status === 'Active',
      isExpired: job.applicationDeadline < new Date()
    };

    res.json({
      success: true,
      data: { job: transformedJob }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// Validation rules for job posting
const jobValidation = [
  body('jobTitle').trim().isLength({ min: 5, max: 200 }).withMessage('Job title must be between 5-200 characters'),
  body('companyName').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2-100 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('industry').isIn(['Finance & Banking', 'Automobile & Manufacturing']).withMessage('Invalid industry'),
  body('jobCategory').notEmpty().withMessage('Job category is required'),
  body('jobType').isIn(['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance']).withMessage('Invalid job type'),
  body('workArrangement').isIn(['On-site', 'Remote', 'Hybrid']).withMessage('Invalid work arrangement'),
  body('applicationDeadline').isISO8601().withMessage('Invalid application deadline'),
  body('experience.minimum').isInt({ min: 0, max: 50 }).withMessage('Invalid minimum experience'),
  body('experience.maximum').isInt({ min: 0, max: 50 }).withMessage('Invalid maximum experience'),
  body('jobDescription').isLength({ min: 50, max: 5000 }).withMessage('Job description must be between 50-5000 characters'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('jobUrgency').isIn(['Normal Priority', 'Urgent', 'High Priority']).withMessage('Invalid job urgency')
];

// POST /api/jobs - Create new job (Recruiters only)
router.post('/', jobValidation, authenticateToken, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can post jobs'
      });
    }

    // Get recruiter information
    const recruiter = await Recruiter.findOne({ _id: req.user.id });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const {
      jobTitle,
      companyName,
      location,
      industry,
      jobCategory,
      jobType,
      workArrangement,
      applicationDeadline,
      experience,
      requiredSkills,
      salary,
      salaryRange,
      jobDescription,
      keyResponsibilities,
      requirements,
      aiKeywords,
      isAiEnhanced,
      contactEmail,
      jobUrgency
    } = req.body;

    // Create job data with comprehensive schema
    const jobData = {
      jobTitle,
      companyName: companyName || recruiter.companyInfo?.companyName,
      location,
      industry,
      jobCategory,
      jobType,
      workArrangement,
      applicationDeadline: new Date(applicationDeadline),
      experience: {
        minimum: parseInt(experience.minimum),
        maximum: parseInt(experience.maximum)
      },
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      // Handle both old salary and new salaryRange formats
      salary: salaryRange ? {
        type: salaryRange.min && salaryRange.max ? 'Range' : 
              salaryRange.min ? 'Fixed' : 'Negotiable',
        minimum: salaryRange.min || null,
        maximum: salaryRange.max || null,
        period: salaryRange.period || 'Yearly',
        currency: salaryRange.currency || 'INR'
      } : {
        type: salary?.type || 'Negotiable',
        minimum: salary?.minimum ? parseInt(salary.minimum) : undefined,
        maximum: salary?.maximum ? parseInt(salary.maximum) : undefined,
        period: salary?.period || 'Yearly',
        currency: salary?.currency || 'INR'
      },
      
      // Also save to new salaryRange field if provided
      salaryRange: salaryRange || null,
      jobDescription,
      keyResponsibilities: Array.isArray(keyResponsibilities) ? keyResponsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      aiKeywords: Array.isArray(aiKeywords) ? aiKeywords : [],
      isAiEnhanced: isAiEnhanced || false,
      contactEmail,
      jobUrgency: jobUrgency || 'Normal Priority',
      postedBy: req.user.id,
      recruiterInfo: {
        recruiterId: req.user.id,
        companyInfo: {
          companyName: recruiter.companyInfo?.companyName,
          department: recruiter.companyInfo?.department,
          designation: recruiter.companyInfo?.designation
        }
      },
      status: 'active'
    };

    // Create and save job
    const newJob = new Job(jobData);
    const savedJob = await newJob.save();

    // Create notifications for relevant applicants
    console.log('🔔 Creating job alert notifications for applicants...');
    try {
      // Find applicants with matching skills or location
      const applicants = await BaseUser.find({ 
        role: 'applicant',
        $or: [
          { 'skills.primary': { $in: savedJob.requiredSkills } },
          { 'skills.technical': { $in: savedJob.requiredSkills } },
          { 'currentLocation.city': { $regex: savedJob.location, $options: 'i' } },
          { 'location': { $regex: savedJob.location, $options: 'i' } }
        ]
      }).limit(50); // Limit to prevent spam

      // Create notifications for matching applicants
      const notifications = applicants.map(applicant => ({
        userId: applicant._id,
        type: 'new_job_posted',
        title: 'New Job Opportunity Available!',
        message: `A new ${savedJob.jobTitle} position has been posted at ${savedJob.companyName}.`,
        data: {
          jobId: savedJob._id,
          jobTitle: savedJob.jobTitle,
          companyName: savedJob.companyName,
          location: savedJob.location,
          requiredSkills: savedJob.requiredSkills
        },
        priority: 'medium',
        actionUrl: `/jobs/${savedJob._id}`
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} job alert notifications`);

        // Emit real-time notifications
        const io = req.app.get('io');
        if (io) {
          applicants.forEach(applicant => {
            io.to(`user-${applicant._id}`).emit('new-job-posted', {
              message: `New ${savedJob.jobTitle} position available at ${savedJob.companyName}`,
              job: {
                id: savedJob._id,
                title: savedJob.jobTitle,
                company: savedJob.companyName,
                location: savedJob.location
              },
              timestamp: new Date()
            });
          });
          console.log('✅ Real-time job alerts sent');
        }
      }
    } catch (notificationError) {
      console.error('❌ Failed to create job notifications:', notificationError);
      // Don't fail the job creation if notifications fail
    }

    // Transform response
    const responseJob = {
      id: savedJob._id,
      jobTitle: savedJob.jobTitle,
      companyName: savedJob.companyName,
      location: savedJob.location,
      industry: savedJob.industry,
      jobCategory: savedJob.jobCategory,
      jobType: savedJob.jobType,
      workArrangement: savedJob.workArrangement,
      formattedSalary: savedJob.formattedSalary,
      jobDescription: savedJob.jobDescription,
      status: savedJob.status,
    };

    // Notify matching applicants about new job
    await notifyMatchingApplicants(savedJob);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: responseJob
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Job validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// PUT /api/jobs/:id - Update job (Recruiters only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update jobs'
      });
    }

    const jobId = req.params.id;

    // Validate MongoDB ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Find the job and verify ownership
    const existingJob = await Job.findById(jobId);
    
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if the recruiter owns this job
    const jobOwnerId = existingJob.postedBy.toString();
    const currentUserId = req.user.id; // Use req.user.id to match job creation
    
    if (jobOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own job postings'
      });
    }

    // Update job
    const updateData = { ...req.body };
    delete updateData.postedBy; // Prevent changing the owner
    delete updateData._id; // Prevent changing the ID

    // Transform experience field if provided
    if (updateData.experience) {
      updateData.experience = {
        minimum: updateData.experience.minimum ? parseInt(updateData.experience.minimum) : 0,
        maximum: updateData.experience.maximum ? parseInt(updateData.experience.maximum) : 0
      };
    }

    // Transform salaryRange to both new and old salary fields for compatibility
    if (updateData.salaryRange) {
      const { salaryRange } = updateData;
      
      // Save to new salaryRange field (as-is)
      updateData.salaryRange = salaryRange;
      
      // Also save to old salary field for backward compatibility
      updateData.salary = {
        type: salaryRange.min && salaryRange.max ? 'Range' : 
              salaryRange.min ? 'Fixed' : 'Negotiable',
        minimum: salaryRange.min || null,
        maximum: salaryRange.max || null,
        period: salaryRange.period || 'Yearly',
        currency: salaryRange.currency || 'INR'
      };
    }

    console.log('🔍 Job update data transformation:', {
      originalExperience: req.body.experience,
      transformedExperience: updateData.experience,
      originalSalaryRange: req.body.salaryRange,
      transformedSalary: updateData.salary,
      transformedSalaryRange: updateData.salaryRange
    });

    let updatedJob;
    try {
      updatedJob = await Job.findByIdAndUpdate(
        jobId,
        { ...updateData, updatedDate: new Date() },
        { new: true, runValidators: true }
      ).lean();
    } catch (validationError) {
      console.error('❌ Job update validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Job validation failed',
        error: validationError.message,
        details: validationError.errors
      });
    }

    // Transform for response
    const responseJob = {
      id: updatedJob._id,
      title: updatedJob.title,
      company: updatedJob.company,
      location: updatedJob.location,
      type: updatedJob.type,
      salary: updatedJob.salary,
      description: updatedJob.description,
      requirements: updatedJob.requirements,
      status: updatedJob.status,
      postedDate: updatedJob.postedDate,
      updatedDate: updatedJob.updatedDate,
      postedBy: updatedJob.postedBy
    };

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: responseJob }
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// DELETE /api/jobs/:id - Delete job (Recruiters only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can delete jobs'
      });
    }

    const jobId = req.params.id;

    // Validate MongoDB ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Find the job and verify ownership
    const existingJob = await Job.findById(jobId);
    
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if the recruiter owns this job
    if (existingJob.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own job postings'
      });
    }

    // Delete job
    await Job.findByIdAndDelete(jobId);

    res.json({
      success: true,
      message: 'Job deleted successfully',
      data: { job: { id: jobId } }
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

// GET /api/jobs/stats - Get job statistics (Recruiters only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can view job stats'
      });
    }

    const postedBy = req.user.userId;

    // Get stats for this recruiter's jobs
    const [totalJobs, activeJobs, draftJobs, closedJobs] = await Promise.all([
      Job.countDocuments({ postedBy: postedBy }),
      Job.countDocuments({ postedBy: postedBy, status: 'active' }),
      Job.countDocuments({ postedBy: postedBy, status: 'draft' }),
      Job.countDocuments({ postedBy: postedBy, status: 'closed' })
    ]);

    // Get recent jobs
    const recentJobs = await Job.find({ postedBy: postedBy })
      .sort({ postedDate: -1 })
      .limit(5)
      .lean();

    const stats = {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications: 0, // TODO: Implement when applications model is ready
      newApplications: 0, // TODO: Implement when applications model is ready
      scheduledInterviews: 0, // TODO: Implement when interviews model is ready
      recentJobs: recentJobs.map(job => ({
        id: job._id,
        title: job.title,
        company: job.company,
        status: job.status,
        postedDate: job.postedDate,
        applications: job.applications
      }))
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('❌ Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job stats',
      error: error.message
    });
  }
});

// GET /api/jobs/:jobId/applications -// Get applications for a specific job
router.get('/:jobId/applications', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    console.log('🔍 Getting applications for job:', jobId, 'by user:', userId);
    
    // Verify job exists and user has permission to view applications
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user is the recruiter who posted this job
    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for jobs you posted.'
      });
    }
    
    // Fetch real applications with populated data
    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'firstName lastName email phone profileImage')
      .populate('applicationInfo') // Populate the ApplicationInformation
      .sort({ appliedAt: -1 });
    
    console.log('🔍 Found applications:', applications.length);
    
    // Transform applications to include all necessary data
    const transformedApplications = applications.map(app => {
      const applicant = app.applicant || {};
      const appInfo = app.applicationInfo || {};
      
      return {
        id: app._id,
        applicantId: app.applicant?._id,
        applicantName: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown Applicant',
        email: applicant.email || 'No email provided',
        phone: applicant.phone || 'No phone provided',
        status: app.status,
        appliedDate: app.appliedAt,
        appliedAt: app.appliedAt,
        coverLetter: app.coverLetter || 'No cover letter provided',
        resume: app.resume,
        
        // Include full application info for detailed profile view
        applicationInfo: appInfo,
        applicationData: appInfo, // Alias for compatibility
        
        // Include applicant snapshot for easy access
        applicantSnapshot: {
          fullName: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim(),
          email: applicant.email,
          phone: applicant.phone,
          profileImage: applicant.profileImage
        },
        
        // Include applicant reference for compatibility
        applicant: applicant
      };
    });
    
    console.log('✅ Returning applications for job:', jobId, 'Count:', transformedApplications.length);
    console.log('🔍 Sample application data:', transformedApplications[0] ? {
      id: transformedApplications[0].id,
      applicantName: transformedApplications[0].applicantName,
      hasApplicationInfo: !!transformedApplications[0].applicationInfo,
      applicationInfoKeys: transformedApplications[0].applicationInfo ? Object.keys(transformedApplications[0].applicationInfo) : []
    } : 'No applications');

    res.json({ 
      success: true, 
      message: `Applications for job ${jobId}`, 
      data: {
        applications: transformedApplications,
        total: transformedApplications.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

export default router;
