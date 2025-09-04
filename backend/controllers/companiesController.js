import { db } from '../config/database.js';
import { companies, jobs, users } from '../schema.js';
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm';

// Get all companies with filtering and pagination
export const getCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      size,
      location,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [eq(companies.status, 'active')];

    if (search) {
      whereConditions.push(
        or(
          like(companies.name, `%${search}%`),
          like(companies.description, `%${search}%`)
        )
      );
    }

    if (industry) {
      whereConditions.push(eq(companies.industry, industry));
    }

    if (size) {
      whereConditions.push(eq(companies.size, size));
    }

    if (location) {
      whereConditions.push(like(companies.location, `%${location}%`));
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(companies[sort_by]) : desc(companies[sort_by]);

    // Get companies with job count
    const companiesResult = await db.select({
      id: companies.id,
      name: companies.name,
      description: companies.description,
      logo_url: companies.logo_url,
      website: companies.website,
      location: companies.location,
      industry: companies.industry,
      size: companies.size,
      founded_year: companies.founded_year,
      status: companies.status,
      created_at: companies.created_at,
      updated_at: companies.updated_at,
      job_count: sql`(
        SELECT COUNT(*) 
        FROM ${jobs} 
        WHERE ${jobs.company_id} = ${companies.id} 
        AND ${jobs.status} = 'active'
      )`
    })
    .from(companies)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(companies)
      .where(and(...whereConditions));
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      companies: companiesResult,
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
    console.error('Get companies error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching companies' 
    });
  }
};

// Get single company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const companyResult = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (companyResult.length === 0) {
      return res.status(404).json({ 
        message: 'Company not found' 
      });
    }

    const company = companyResult[0];

    // Get active jobs count for this company
    const jobCountResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')));
    
    const jobCount = jobCountResult[0].count;

    // Get recent jobs for this company
    const recentJobsResult = await db.select({
      id: jobs.id,
      title: jobs.title,
      location: jobs.location,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      salary_min: jobs.salary_min,
      salary_max: jobs.salary_max,
      salary_currency: jobs.salary_currency,
      created_at: jobs.created_at
    })
    .from(jobs)
    .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')))
    .orderBy(desc(jobs.created_at))
    .limit(5);

    res.json({
      company: {
        ...company,
        job_count: jobCount,
        recent_jobs: recentJobsResult
      }
    });

  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching company' 
    });
  }
};

// Create new company
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      logo_url,
      website,
      location,
      industry,
      size,
      founded_year
    } = req.body;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ 
        message: 'Company name and location are required' 
      });
    }

    // Check if company with same name already exists
    const existingCompany = await db.select()
      .from(companies)
      .where(eq(companies.name, name))
      .limit(1);

    if (existingCompany.length > 0) {
      return res.status(409).json({ 
        message: 'Company with this name already exists' 
      });
    }

    // Create new company
    const newCompany = await db.insert(companies).values({
      name,
      description,
      logo_url,
      website,
      location,
      industry,
      size,
      founded_year: founded_year ? parseInt(founded_year) : null,
      status: 'active'
    }).returning();

    const company = newCompany[0];

    res.status(201).json({
      message: 'Company created successfully',
      company
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while creating company' 
    });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Check if company exists
    const existingCompany = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existingCompany.length === 0) {
      return res.status(404).json({ 
        message: 'Company not found' 
      });
    }

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const duplicateCompany = await db.select()
        .from(companies)
        .where(and(
          eq(companies.name, updateData.name),
          sql`${companies.id} != ${parseInt(id)}`
        ))
        .limit(1);

      if (duplicateCompany.length > 0) {
        return res.status(409).json({ 
          message: 'Company with this name already exists' 
        });
      }
    }

    // Update company
    const updatedCompany = await db.update(companies)
      .set({
        ...updateData,
        founded_year: updateData.founded_year ? parseInt(updateData.founded_year) : undefined,
        updated_at: new Date().toISOString()
      })
      .where(eq(companies.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany[0]
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating company' 
    });
  }
};

// Delete company (soft delete)
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const existingCompany = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existingCompany.length === 0) {
      return res.status(404).json({ 
        message: 'Company not found' 
      });
    }

    // Check if company has active jobs
    const activeJobsResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')));
    
    const activeJobsCount = activeJobsResult[0].count;

    if (activeJobsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete company with ${activeJobsCount} active job(s). Please deactivate all jobs first.` 
      });
    }

    // Soft delete by updating status
    await db.update(companies)
      .set({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .where(eq(companies.id, parseInt(id)));

    res.json({
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting company' 
    });
  }
};

// Get company jobs
export const getCompanyJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = 'active',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Check if company exists
    const companyResult = await db.select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (companyResult.length === 0) {
      return res.status(404).json({ 
        message: 'Company not found' 
      });
    }

    // Build where conditions
    let whereConditions = [eq(jobs.company_id, parseInt(id))];

    if (status) {
      whereConditions.push(eq(jobs.status, status));
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(jobs[sort_by]) : desc(jobs[sort_by]);

    // Get jobs for this company
    const jobsResult = await db.select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      location: jobs.location,
      salary_min: jobs.salary_min,
      salary_max: jobs.salary_max,
      salary_currency: jobs.salary_currency,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      experience_min: jobs.experience_min,
      experience_max: jobs.experience_max,
      status: jobs.status,
      created_at: jobs.created_at,
      application_count: sql`(
        SELECT COUNT(*) 
        FROM applications 
        WHERE job_id = ${jobs.id}
      )`
    })
    .from(jobs)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(and(...whereConditions));
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      company: companyResult[0],
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
    console.error('Get company jobs error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching company jobs' 
    });
  }
};

// Get company statistics
export const getCompanyStats = async (req, res) => {
  try {
    // Total active companies
    const totalCompaniesResult = await db.select({ count: sql`COUNT(*)` })
      .from(companies)
      .where(eq(companies.status, 'active'));

    // Companies by industry
    const companiesByIndustryResult = await db.select({
      industry: companies.industry,
      count: sql`COUNT(*)`
    })
    .from(companies)
    .where(eq(companies.status, 'active'))
    .groupBy(companies.industry);

    // Companies by size
    const companiesBySizeResult = await db.select({
      size: companies.size,
      count: sql`COUNT(*)`
    })
    .from(companies)
    .where(eq(companies.status, 'active'))
    .groupBy(companies.size);

    // Recent companies (last 30 days)
    const recentCompaniesResult = await db.select({ count: sql`COUNT(*)` })
      .from(companies)
      .where(
        and(
          eq(companies.status, 'active'),
          sql`${companies.created_at} >= datetime('now', '-30 days')`
        )
      );

    // Top companies by job count
    const topCompaniesByJobsResult = await db.select({
      id: companies.id,
      name: companies.name,
      logo_url: companies.logo_url,
      job_count: sql`COUNT(${jobs.id})`
    })
    .from(companies)
    .leftJoin(jobs, and(eq(jobs.company_id, companies.id), eq(jobs.status, 'active')))
    .where(eq(companies.status, 'active'))
    .groupBy(companies.id, companies.name, companies.logo_url)
    .orderBy(desc(sql`COUNT(${jobs.id})`))
    .limit(10);

    res.json({
      total_companies: totalCompaniesResult[0].count,
      recent_companies: recentCompaniesResult[0].count,
      companies_by_industry: companiesByIndustryResult,
      companies_by_size: companiesBySizeResult,
      top_companies_by_jobs: topCompaniesByJobsResult
    });

  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching company statistics' 
    });
  }
};

// Export aliases for route compatibility
export const getAllCompanies = getCompanies;