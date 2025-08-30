import express from 'express';
import { db } from '../config/database.js';
import { companies, jobs } from '../schema.js';
import { eq, like, and, or, sql } from 'drizzle-orm';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
    try {
        const { search, industry, location, page = 1, limit = 10 } = req.query;

        // Build where conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(companies.name, `%${search}%`),
                    like(companies.description, `%${search}%`)
                )
            );
        }

        if (industry) {
            conditions.push(eq(companies.industry, industry));
        }

        if (location) {
            conditions.push(like(companies.location, `%${location}%`));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(companies)
            .where(whereClause);

        const total = Number(totalResult[0].count);

        // Get companies with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const companiesResult = await db
            .select()
            .from(companies)
            .where(whereClause)
            .orderBy(companies.name)
            .limit(parseInt(limit))
            .offset(offset);

        res.json({
            companies: companiesResult,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Get company by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const companyResult = await db
            .select()
            .from(companies)
            .where(eq(companies.id, parseInt(id)))
            .limit(1);

        if (companyResult.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ company: companyResult[0] });
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Get jobs by company
router.get('/:id/jobs', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Get total count
        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(jobs)
            .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')));

        const total = Number(totalResult[0].count);

        // Get jobs with company info
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const jobsResult = await db
            .select({
                id: jobs.id,
                title: jobs.title,
                location: jobs.location,
                salary_min: jobs.salary_min,
                salary_max: jobs.salary_max,
                job_type: jobs.job_type,
                work_mode: jobs.work_mode,
                experience_min: jobs.experience_min,
                experience_max: jobs.experience_max,
                english_level: jobs.english_level,
                description: jobs.description,
                created_at: jobs.created_at,
                company_name: companies.name,
                company_logo: companies.logo_url
            })
            .from(jobs)
            .innerJoin(companies, eq(jobs.company_id, companies.id))
            .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')))
            .orderBy(jobs.created_at)
            .limit(parseInt(limit))
            .offset(offset);

        // Format jobs data
        const formattedJobs = jobsResult.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            location: job.location,
            salary: job.salary_min === job.salary_max
                ? `₹${job.salary_min?.toLocaleString() || 0} monthly`
                : `₹${job.salary_min?.toLocaleString() || 0} - ₹${job.salary_max?.toLocaleString() || 0} monthly`,
            type: job.job_type,
            mode: job.work_mode,
            experience: job.experience_min === job.experience_max
                ? `Min. ${job.experience_min} years`
                : `Min. ${job.experience_min} years`,
            english: job.english_level,
            logo: job.company_logo,
            description: job.description,
            created_at: job.created_at
        }));

        res.json({
            jobs: formattedJobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Create new company (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

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

        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const result = await db.insert(companies).values({
            name,
            description,
            logo_url,
            website,
            location,
            industry,
            size,
            founded_year: founded_year ? parseInt(founded_year) : null
        }).returning({ id: companies.id });

        res.status(201).json({
            message: 'Company created successfully',
            companyId: result[0].id
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ message: 'Error creating company', error: error.message });
    }
});

// Update company (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const updateFields = { ...req.body };

        // Remove fields that shouldn't be updated
        delete updateFields.id;
        delete updateFields.created_at;
        delete updateFields.updated_at;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Convert numeric fields
        if (updateFields.founded_year) {
            updateFields.founded_year = parseInt(updateFields.founded_year);
        }

        // Add updated_at timestamp
        updateFields.updated_at = sql`CURRENT_TIMESTAMP`;

        const result = await db
            .update(companies)
            .set(updateFields)
            .where(eq(companies.id, parseInt(id)));

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company updated successfully' });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Error updating company', error: error.message });
    }
});

// Delete company (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;

        // Check if company has active jobs
        const activeJobsResult = await db
            .select({ count: sql`count(*)` })
            .from(jobs)
            .where(and(eq(jobs.company_id, parseInt(id)), eq(jobs.status, 'active')));

        const activeJobsCount = Number(activeJobsResult[0].count);

        if (activeJobsCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete company with active jobs. Please deactivate all jobs first.'
            });
        }

        const result = await db
            .delete(companies)
            .where(eq(companies.id, parseInt(id)));

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Error deleting company', error: error.message });
    }
});

// Get company statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = parseInt(id);

        // Get total jobs count
        const totalJobsResult = await db
            .select({ count: sql`count(*)` })
            .from(jobs)
            .where(eq(jobs.company_id, companyId));

        // Get active jobs count
        const activeJobsResult = await db
            .select({ count: sql`count(*)` })
            .from(jobs)
            .where(and(eq(jobs.company_id, companyId), eq(jobs.status, 'active')));

        // Get total applications count
        const totalApplicationsResult = await db
            .select({ count: sql`count(*)` })
            .from(jobs)
            .innerJoin(companies, eq(jobs.company_id, companies.id))
            .where(eq(jobs.company_id, companyId));

        const stats = {
            totalJobs: Number(totalJobsResult[0].count),
            activeJobs: Number(activeJobsResult[0].count),
            totalApplications: Number(totalApplicationsResult[0].count)
        };

        res.json({ stats });
    } catch (error) {
        console.error('Error fetching company stats:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

export default router;
