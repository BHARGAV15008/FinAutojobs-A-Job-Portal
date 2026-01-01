import { Job, User } from '../models/index.js';
import { jobCreationSchema, jobUpdateSchema } from '../models/Job.js';
import { NotificationService } from '../../services/notifications.js';

// Get all jobs with filtering and pagination
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      job_type,
      work_mode,
      salary_min,
      salary_max,
      experience_min,
      experience_max,
      company_id,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }

    if (location) {
      query['location.primary.city'] = { $regex: new RegExp(location, 'i') };
    }

    if (job_type) {
      query.employmentType = job_type;
    }

    if (work_mode) {
      query.workArrangement = work_mode;
    }

    if (salary_min) {
      query['salary.minimum'] = { $gte: parseInt(salary_min, 10) };
    }

    if (salary_max) {
      query['salary.maximum'] = { $lte: parseInt(salary_max, 10) };
    }

    if (experience_min) {
      query['experience.minimum.years'] = { $gte: parseInt(experience_min, 10) };
    }

    if (experience_max) {
      query['experience.maximum.years'] = { $lte: parseInt(experience_max, 10) };
    }

    if (company_id) {
      query['company.companyId'] = company_id;
    }

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    // Get jobs with company information
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('company.companyId', 'name logo website');

    // Get total count for pagination
    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      jobs,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching jobs' 
    });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('company.companyId', 'name logo website description');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });

  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching job' 
    });
  }
};

// Create new job (for employers/recruiters)
export const createJob = async (req, res) => {
  try {
    const validationResult = jobCreationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }

    const newJob = new Job(validationResult.data);
    await newJob.save();

    // Send notifications to matching applicants about new job
    try {
      await NotificationService.notifyJobPosted(newJob._id, req.user.userId);
    } catch (notificationError) {
      console.error('Error sending job posted notification:', notificationError);
      // Don't fail the job creation if notification fails
    }

    res.status(201).json({
      message: 'Job created successfully',
      job: newJob
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ 
      message: 'Internal server error while creating job' 
    });
  }
};

// Update job (for employers/recruiters)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const validationResult = jobUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, validationResult.data, { new: true, runValidators: true });

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating job' 
    });
  }
};

// Delete job (for employers/recruiters)
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting job' 
    });
  }
};

// Get recommended jobs for current user
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = [...user.skills.technical.map(s => s.name), ...user.skills.soft.map(s => s.name)];

    const query = {
      status: 'active',
      $or: [
        { 'skills.required.name': { $in: userSkills } },
        { 'location.primary.city': { $regex: new RegExp(user.location.city, 'i') } }
      ]
    };

    const recommendedJobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('company.companyId', 'name logo website');

    res.json({ jobs: recommendedJobs });

  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching recommended jobs' });
  }
};

// Get job statistics
export const getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: null,
          total_jobs: { $sum: 1 },
          active_jobs: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          jobs_by_type: {
            $push: {
              k: '$employmentType',
              v: 1
            }
          },
          jobs_by_work_mode: {
            $push: {
              k: '$workArrangement',
              v: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total_jobs: 1,
          active_jobs: 1,
          jobs_by_type: { $arrayToObject: { $map: { input: "$jobs_by_type", as: "t", in: { k: "$t.k", v: { $sum: "$t.v" } } } } },
          jobs_by_work_mode: { $arrayToObject: { $map: { input: "$jobs_by_work_mode", as: "wm", in: { k: "$wm.k", v: { $sum: "$wm.v" } } } } }
        }
      }
    ]);

    res.json(stats[0]);

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching job statistics' 
    });
  }
};
