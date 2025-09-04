import { db } from '../config/database.js';
import { applications, jobs, companies, users } from '../schema.js';
import { eq, and, desc, asc, sql, or, like } from 'drizzle-orm';

// Apply to a job
export const applyToJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { job_id, cover_letter, resume_url } = req.body;

    // Validate required fields
    if (!job_id) {
      return res.status(400).json({ 
        message: 'Job ID is required' 
      });
    }

    // Check if job exists and is active
    const jobResult = await db.select()
      .from(jobs)
      .where(and(eq(jobs.id, job_id), eq(jobs.status, 'active')))
      .limit(1);

    if (jobResult.length === 0) {
      return res.status(404).json({ 
        message: 'Job not found or no longer active' 
      });
    }

    const job = jobResult[0];

    // Check if application deadline has passed
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({ 
          message: 'Application deadline has passed' 
        });
      }
    }

    // Check if user has already applied to this job
    const existingApplication = await db.select()
      .from(applications)
      .where(and(eq(applications.user_id, userId), eq(applications.job_id, job_id)))
      .limit(1);

    if (existingApplication.length > 0) {
      return res.status(409).json({ 
        message: 'You have already applied to this job' 
      });
    }

    // Create new application
    const newApplication = await db.insert(applications).values({
      user_id: userId,
      job_id,
      cover_letter,
      resume_url,
      status: 'pending',
      applied_at: new Date().toISOString()
    }).returning();

    const application = newApplication[0];

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ 
      message: 'Internal server error while submitting application' 
    });
  }
};

// Get all applications (for recruiters/employers)
export const getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      job_id,
      status,
      search,
      sort_by = 'applied_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [];

    if (job_id) {
      whereConditions.push(eq(applications.job_id, parseInt(job_id)));
    }

    if (status) {
      whereConditions.push(eq(applications.status, status));
    }

    if (search) {
      whereConditions.push(
        or(
          like(users.full_name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(jobs.title, `%${search}%`)
        )
      );
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(applications[sort_by]) : desc(applications[sort_by]);

    // Get applications with user and job information
    const applicationsResult = await db.select({
      id: applications.id,
      status: applications.status,
      applied_at: applications.applied_at,
      cover_letter: applications.cover_letter,
      resume_url: applications.resume_url,
      notes: applications.notes,
      interview_date: applications.interview_date,
      user_id: users.id,
      user_name: users.full_name,
      user_email: users.email,
      user_phone: users.phone,
      user_skills: users.skills,
      user_experience: users.experience_years,
      user_qualification: users.qualification,
      job_id: jobs.id,
      job_title: jobs.title,
      job_location: jobs.location,
      company_name: companies.name,
      company_logo: companies.logo_url
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .leftJoin(jobs, eq(applications.job_id, jobs.id))
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .leftJoin(users, eq(applications.user_id, users.id))
      .leftJoin(jobs, eq(applications.job_id, jobs.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      applications: applicationsResult,
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
    console.error('Get all applications error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching applications' 
    });
  }
};

// Get single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const applicationResult = await db.select({
      id: applications.id,
      status: applications.status,
      applied_at: applications.applied_at,
      cover_letter: applications.cover_letter,
      resume_url: applications.resume_url,
      notes: applications.notes,
      interview_date: applications.interview_date,
      user_id: users.id,
      user_name: users.full_name,
      user_email: users.email,
      user_phone: users.phone,
      user_bio: users.bio,
      user_location: users.location,
      user_skills: users.skills,
      user_experience: users.experience_years,
      user_qualification: users.qualification,
      user_linkedin: users.linkedin_url,
      user_github: users.github_url,
      user_portfolio: users.portfolio_url,
      job_id: jobs.id,
      job_title: jobs.title,
      job_description: jobs.description,
      job_requirements: jobs.requirements,
      job_location: jobs.location,
      job_salary_min: jobs.salary_min,
      job_salary_max: jobs.salary_max,
      job_salary_currency: jobs.salary_currency,
      company_name: companies.name,
      company_logo: companies.logo_url,
      company_website: companies.website
    })
    .from(applications)
    .leftJoin(users, eq(applications.user_id, users.id))
    .leftJoin(jobs, eq(applications.job_id, jobs.id))
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(eq(applications.id, parseInt(id)))
    .limit(1);

    if (applicationResult.length === 0) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    const application = applicationResult[0];

    res.json({
      application
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching application' 
    });
  }
};

// Update application status (for recruiters/employers)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interview_date } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Check if application exists
    const existingApplication = await db.select()
      .from(applications)
      .where(eq(applications.id, parseInt(id)))
      .limit(1);

    if (existingApplication.length === 0) {
      return res.status(404).json({ 
        message: 'Application not found' 
      });
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (interview_date) updateData.interview_date = interview_date;

    // Update application
    const updatedApplication = await db.update(applications)
      .set(updateData)
      .where(eq(applications.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Application updated successfully',
      application: updatedApplication[0]
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating application' 
    });
  }
};

// Delete application (for job seekers)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if application exists and belongs to the user
    const existingApplication = await db.select()
      .from(applications)
      .where(and(eq(applications.id, parseInt(id)), eq(applications.user_id, userId)))
      .limit(1);

    if (existingApplication.length === 0) {
      return res.status(404).json({ 
        message: 'Application not found or you do not have permission to delete it' 
      });
    }

    const application = existingApplication[0];

    // Check if application can be deleted (only pending applications)
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot delete application that has already been processed' 
      });
    }

    // Delete application
    await db.delete(applications)
      .where(eq(applications.id, parseInt(id)));

    res.json({
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting application' 
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const { job_id } = req.query;

    let whereConditions = [];
    if (job_id) {
      whereConditions.push(eq(applications.job_id, parseInt(job_id)));
    }

    // Total applications
    const totalApplicationsResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Applications by status
    const applicationsByStatusResult = await db.select({
      status: applications.status,
      count: sql`COUNT(*)`
    })
    .from(applications)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .groupBy(applications.status);

    // Recent applications (last 7 days)
    const recentApplicationsResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(
        whereConditions.length > 0 
          ? and(
              ...whereConditions,
              sql`${applications.applied_at} >= datetime('now', '-7 days')`
            )
          : sql`${applications.applied_at} >= datetime('now', '-7 days')`
      );

    // Applications by month (last 6 months)
    const applicationsByMonthResult = await db.select({
      month: sql`strftime('%Y-%m', ${applications.applied_at})`,
      count: sql`COUNT(*)`
    })
    .from(applications)
    .where(
      whereConditions.length > 0 
        ? and(
            ...whereConditions,
            sql`${applications.applied_at} >= datetime('now', '-6 months')`
          )
        : sql`${applications.applied_at} >= datetime('now', '-6 months')`
    )
    .groupBy(sql`strftime('%Y-%m', ${applications.applied_at})`);

    res.json({
      total_applications: totalApplicationsResult[0].count,
      recent_applications: recentApplicationsResult[0].count,
      applications_by_status: applicationsByStatusResult,
      applications_by_month: applicationsByMonthResult
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching application statistics' 
    });
  }
};

// Bulk update applications (for recruiters/employers)
export const bulkUpdateApplications = async (req, res) => {
  try {
    const { application_ids, status, notes } = req.body;

    // Validate required fields
    if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({ 
        message: 'Application IDs array is required' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        message: 'Status is required' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;

    // Update applications
    const updatedApplications = await db.update(applications)
      .set(updateData)
      .where(sql`${applications.id} IN (${application_ids.map(id => parseInt(id)).join(',')})`)
      .returning();

    res.json({
      message: `${updatedApplications.length} applications updated successfully`,
      updated_count: updatedApplications.length
    });

  } catch (error) {
    console.error('Bulk update applications error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating applications' 
    });
  }
};

// Export aliases for route compatibility
export const getApplicationsByJob = getAllApplications;