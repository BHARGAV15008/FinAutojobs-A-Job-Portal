import { db } from '../config/database.js';
import { jobs, companies, applications, users } from '../schema.js';
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm';

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
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [eq(jobs.status, 'active')];

    if (search) {
      whereConditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`),
          like(jobs.requirements, `%${search}%`)
        )
      );
    }

    if (location) {
      whereConditions.push(like(jobs.location, `%${location}%`));
    }

    if (job_type) {
      whereConditions.push(eq(jobs.job_type, job_type));
    }

    if (work_mode) {
      whereConditions.push(eq(jobs.work_mode, work_mode));
    }

    if (salary_min) {
      whereConditions.push(sql`${jobs.salary_min} >= ${parseInt(salary_min)}`);
    }

    if (salary_max) {
      whereConditions.push(sql`${jobs.salary_max} <= ${parseInt(salary_max)}`);
    }

    if (experience_min) {
      whereConditions.push(sql`${jobs.experience_min} >= ${parseInt(experience_min)}`);
    }

    if (experience_max) {
      whereConditions.push(sql`${jobs.experience_max} <= ${parseInt(experience_max)}`);
    }

    if (company_id) {
      whereConditions.push(eq(jobs.company_id, parseInt(company_id)));
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(jobs[sort_by]) : desc(jobs[sort_by]);

    // Get jobs with company information
    const jobsResult = await db.select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      location: jobs.location,
      salary_min: jobs.salary_min,
      salary_max: jobs.salary_max,
      salary_currency: jobs.salary_currency,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      experience_min: jobs.experience_min,
      experience_max: jobs.experience_max,
      english_level: jobs.english_level,
      skills_required: jobs.skills_required,
      benefits: jobs.benefits,
      application_deadline: jobs.application_deadline,
      status: jobs.status,
      created_at: jobs.created_at,
      updated_at: jobs.updated_at,
      company_name: companies.name,
      company_logo: companies.logo_url,
      company_website: companies.website,
      company_location: companies.location,
      company_industry: companies.industry
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .leftJoin(companies, eq(jobs.company_id, companies.id))
      .where(and(...whereConditions));
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      jobs: jobsResult,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1
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

    const jobResult = await db.select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      location: jobs.location,
      salary_min: jobs.salary_min,
      salary_max: jobs.salary_max,
      salary_currency: jobs.salary_currency,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      experience_min: jobs.experience_min,
      experience_max: jobs.experience_max,
      english_level: jobs.english_level,
      skills_required: jobs.skills_required,
      benefits: jobs.benefits,
      application_deadline: jobs.application_deadline,
      status: jobs.status,
      created_at: jobs.created_at,
      updated_at: jobs.updated_at,
      company_id: jobs.company_id,
      company_name: companies.name,
      company_description: companies.description,
      company_logo: companies.logo_url,
      company_website: companies.website,
      company_location: companies.location,
      company_industry: companies.industry,
      company_size: companies.size
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(eq(jobs.id, parseInt(id)))
    .limit(1);

    if (jobResult.length === 0) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    const job = jobResult[0];

    // Get application count for this job
    const applicationCountResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(eq(applications.job_id, parseInt(id)));
    
    const applicationCount = applicationCountResult[0].count;

    res.json({
      job: {
        ...job,
        application_count: applicationCount
      }
    });

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
    const {
      title,
      description,
      requirements,
      location,
      salary_min,
      salary_max,
      salary_currency = 'USD',
      job_type,
      work_mode,
      experience_min,
      experience_max,
      english_level,
      skills_required,
      benefits,
      application_deadline,
      company_id
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !job_type || !company_id) {
      return res.status(400).json({ 
        message: 'Title, description, location, job_type, and company_id are required' 
      });
    }

    // Verify company exists
    const companyResult = await db.select()
      .from(companies)
      .where(eq(companies.id, company_id))
      .limit(1);

    if (companyResult.length === 0) {
      return res.status(404).json({ 
        message: 'Company not found' 
      });
    }

    // Create new job
    const newJob = await db.insert(jobs).values({
      title,
      description,
      requirements,
      location,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      salary_currency,
      job_type,
      work_mode,
      experience_min: experience_min ? parseInt(experience_min) : null,
      experience_max: experience_max ? parseInt(experience_max) : null,
      english_level,
      skills_required: Array.isArray(skills_required) ? JSON.stringify(skills_required) : skills_required,
      benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits,
      application_deadline,
      company_id,
      status: 'active',
      posted_by: req.user.userId
    }).returning();

    const job = newJob[0];

    res.status(201).json({
      message: 'Job created successfully',
      job
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
    const updateData = req.body;

    // Check if job exists
    const existingJob = await db.select()
      .from(jobs)
      .where(eq(jobs.id, parseInt(id)))
      .limit(1);

    if (existingJob.length === 0) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    // Process arrays for JSON storage
    if (updateData.skills_required && Array.isArray(updateData.skills_required)) {
      updateData.skills_required = JSON.stringify(updateData.skills_required);
    }
    if (updateData.benefits && Array.isArray(updateData.benefits)) {
      updateData.benefits = JSON.stringify(updateData.benefits);
    }

    // Update job
    const updatedJob = await db.update(jobs)
      .set({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .where(eq(jobs.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Job updated successfully',
      job: updatedJob[0]
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

    // Check if job exists
    const existingJob = await db.select()
      .from(jobs)
      .where(eq(jobs.id, parseInt(id)))
      .limit(1);

    if (existingJob.length === 0) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    // Soft delete by updating status
    await db.update(jobs)
      .set({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .where(eq(jobs.id, parseInt(id)));

    res.json({
      message: 'Job deleted successfully'
    });

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

    // Load user for skills and location
    const userResult = await db.select({
      id: users.id,
      skills: users.skills,
      location: users.location
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult[0];

    // Basic heuristic: match by skills keywords and/or location
    const whereConds = [eq(jobs.status, 'active')];

    if (user.location) {
      whereConds.push(like(jobs.location, `%${user.location}%`));
    }

    // skills is stored as JSON string or comma separated
    let skillsList = [];
    if (user.skills) {
      try {
        const parsed = JSON.parse(user.skills);
        if (Array.isArray(parsed)) skillsList = parsed;
      } catch (_) {
        skillsList = String(user.skills).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Build OR condition on title/requirements for skills
    let skillsOr = null;
    if (skillsList.length > 0) {
      const skillLikes = skillsList.slice(0, 8).map(skill => or(
        like(jobs.title, `%${skill}%`),
        like(jobs.requirements, `%${skill}%`),
        like(jobs.description, `%${skill}%`)
      ));
      // Combine multiple ORs into one OR by reducing
      if (skillLikes.length === 1) skillsOr = skillLikes[0];
      else skillsOr = or(...skillLikes);
    }

    const whereFinal = skillsOr ? and(...whereConds, skillsOr) : and(...whereConds);

    // Return top N recent matching jobs
    const result = await db.select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      location: jobs.location,
      salary_min: jobs.salary_min,
      salary_max: jobs.salary_max,
      salary_currency: jobs.salary_currency,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      company_name: companies.name,
      company_logo: companies.logo_url,
      company_location: companies.location
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(whereFinal)
    .orderBy(desc(jobs.created_at))
    .limit(20);

    res.json({ jobs: result });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching recommended jobs' });
  }
};

// Get job statistics
export const getJobStats = async (req, res) => {
  try {
    // Total active jobs
    const totalJobsResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(eq(jobs.status, 'active'));

    // Jobs by type
    const jobsByTypeResult = await db.select({
      job_type: jobs.job_type,
      count: sql`COUNT(*)`
    })
    .from(jobs)
    .where(eq(jobs.status, 'active'))
    .groupBy(jobs.job_type);

    // Jobs by work mode
    const jobsByWorkModeResult = await db.select({
      work_mode: jobs.work_mode,
      count: sql`COUNT(*)`
    })
    .from(jobs)
    .where(eq(jobs.status, 'active'))
    .groupBy(jobs.work_mode);

    // Recent jobs (last 7 days)
    const recentJobsResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(
        and(
          eq(jobs.status, 'active'),
          sql`${jobs.created_at} >= datetime('now', '-7 days')`
        )
      );

    res.json({
      total_jobs: totalJobsResult[0].count,
      recent_jobs: recentJobsResult[0].count,
      jobs_by_type: jobsByTypeResult,
      jobs_by_work_mode: jobsByWorkModeResult
    });

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching job statistics' 
    });
  }
};