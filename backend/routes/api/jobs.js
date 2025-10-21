import express from 'express';
import mongoDataService from '../../services/mongoDataService.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      jobType, 
      salaryMin, 
      salaryMax,
      skills,
      company 
    } = req.query;

    // Build filters
    const filters = {};
    if (location) filters.location = { $regex: location, $options: 'i' };
    if (jobType) filters.jobType = jobType;
    if (company) filters.company = company;
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filters.skills = { $in: skillsArray };
    }
    if (salaryMin || salaryMax) {
      filters.salary = {};
      if (salaryMin) filters.salary.$gte = parseInt(salaryMin);
      if (salaryMax) filters.salary.$lte = parseInt(salaryMax);
    }

    const result = await mongoDataService.getAllJobs(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      jobs: result.jobs,
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

// Get recommended jobs for authenticated user
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const jobs = await mongoDataService.getRecommendedJobs(userId, parseInt(limit));

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended jobs',
      error: error.message
    });
  }
});

// Search jobs
router.get('/search', async (req, res) => {
  try {
    const { 
      q: query, 
      page = 1, 
      limit = 10,
      location,
      jobType,
      salaryMin,
      salaryMax 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build filters
    const filters = {};
    if (location) filters.location = { $regex: location, $options: 'i' };
    if (jobType) filters.jobType = jobType;
    if (salaryMin || salaryMax) {
      filters.salary = {};
      if (salaryMin) filters.salary.$gte = parseInt(salaryMin);
      if (salaryMax) filters.salary.$lte = parseInt(salaryMax);
    }

    const result = await mongoDataService.searchJobs(query, filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      jobs: result.jobs,
      pagination: result.pagination
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

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await mongoDataService.getJobById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
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

// Create new job (for recruiters)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobData = {
      ...req.body,
      recruiter: recruiterId,
      status: 'active',
      createdAt: new Date()
    };

    const job = await mongoDataService.createJob(jobData);

    res.status(201).json({
      success: true,
      job,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

export default router;
