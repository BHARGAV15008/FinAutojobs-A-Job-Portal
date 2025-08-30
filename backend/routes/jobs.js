import express from 'express';
import { db } from '../config/database.js';
import { jobs, companies } from '../schema.js';
import { eq, like, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all jobs with optional filters
router.get('/', async (req, res) => {
    try {
        const {
            location,
            job_type,
            work_mode,
            experience_min,
            experience_max,
            salary_min,
            salary_max,
            search,
            company,
            industry,
            date_posted, // values: '1','3','7','30' (days)
            sort,        // values: 'recent' (default), 'salary_desc', 'salary_asc'
            page = 1,
            limit = 10
        } = req.query;

        // Build where conditions
        const conditions = [eq(jobs.status, 'active')];

        if (location) {
            conditions.push(like(jobs.location, `%${location}%`));
        }

        if (job_type) {
            conditions.push(eq(jobs.job_type, job_type));
        }

        if (work_mode) {
            conditions.push(eq(jobs.work_mode, work_mode));
        }

        if (experience_min) {
            conditions.push(gte(jobs.experience_min, parseInt(experience_min)));
        }

        if (experience_max) {
            conditions.push(lte(jobs.experience_max, parseInt(experience_max)));
        }

        if (salary_min) {
            conditions.push(gte(jobs.salary_min, parseInt(salary_min)));
        }

        if (salary_max) {
            conditions.push(lte(jobs.salary_max, parseInt(salary_max)));
        }

        if (search) {
            conditions.push(
                sql`(${jobs.title} LIKE ${'%' + search + '%'} OR ${jobs.description} LIKE ${'%' + search + '%'} OR ${companies.name} LIKE ${'%' + search + '%'})`
            );
        }

        if (company) {
            conditions.push(like(companies.name, `%${company}%`));
        }

        if (industry) {
            conditions.push(eq(companies.industry, industry));
        }

        if (date_posted) {
            const allowed = ['1', '3', '7', '30'];
            const days = allowed.includes(String(date_posted)) ? String(date_posted) : null;
            if (days) {
                 conditions.push(
                     sql`datetime(${jobs.created_at}) >= datetime('now', '-' || ${days} || ' days')`
                 );
             }
         }

         // Build order by
         let orderBy;
         if (sort === 'salary_desc') {
             orderBy = [desc(jobs.salary_max)];
         } else if (sort === 'salary_asc') {
             orderBy = [asc(jobs.salary_min)];
         } else {
             orderBy = [desc(jobs.created_at)];
         }

         // Get total count
         const totalResult = await db
             .select({ count: sql`count(*)` })
             .from(jobs)
             .innerJoin(companies, eq(jobs.company_id, companies.id))
             .where(and(...conditions));

        const total = Number(totalResult[0].count);

        // Get jobs with pagination
         const offset = (parseInt(page) - 1) * parseInt(limit);
         const jobsResult = await db
             .select({
                 id: jobs.id,
                 title: jobs.title,
                 company_name: companies.name,
                 location: jobs.location,
                 salary_min: jobs.salary_min,
                 salary_max: jobs.salary_max,
                 job_type: jobs.job_type,
                 work_mode: jobs.work_mode,
                 experience_min: jobs.experience_min,
                 experience_max: jobs.experience_max,
                 english_level: jobs.english_level,
                 company_logo: companies.logo_url,
                 description: jobs.description,
                 requirements: jobs.requirements,
                 benefits: jobs.benefits,
                 created_at: jobs.created_at
             })
             .from(jobs)
             .innerJoin(companies, eq(jobs.company_id, companies.id))
             .where(and(...conditions))
             .orderBy(...orderBy)
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
            requirements: job.requirements ? job.requirements.split('\n') : [],
            benefits: job.benefits ? job.benefits.split('\n') : [],
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
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const jobResult = await db
             .select({
                 id: jobs.id,
                 title: jobs.title,
                 description: jobs.description,
                 requirements: jobs.requirements,
                 benefits: jobs.benefits,
                 location: jobs.location,
                 salary_min: jobs.salary_min,
                 salary_max: jobs.salary_max,
                 job_type: jobs.job_type,
                 work_mode: jobs.work_mode,
                 experience_min: jobs.experience_min,
                 experience_max: jobs.experience_max,
                 english_level: jobs.english_level,
                 created_at: jobs.created_at,
                 company_name: companies.name,
                 company_logo: companies.logo_url,
                 company_location: companies.location,
                 company_description: companies.description,
                 company_website: companies.website,
                 company_industry: companies.industry,
                 company_size: companies.size
             })
             .from(jobs)
             .innerJoin(companies, eq(jobs.company_id, companies.id))
             .where(and(eq(jobs.id, parseInt(id)), eq(jobs.status, 'active')))
             .limit(1);

        if (jobResult.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = jobResult[0];

        const formattedJob = {
            id: job.id,
            title: job.title,
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
            description: job.description,
            requirements: job.requirements ? job.requirements.split('\n') : [],
            benefits: job.benefits ? job.benefits.split('\n') : [],
            company: {
                name: job.company_name,
                logo: job.company_logo,
                location: job.company_location,
                description: job.company_description,
                website: job.company_website,
                industry: job.company_industry,
                size: job.company_size
            },
            created_at: job.created_at
        };

        res.json({ job: formattedJob });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Create new job (Employer/Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'employer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const {
            title,
            company_id,
            location,
            salary_min,
            salary_max,
            salary_currency = 'INR',
            job_type,
            work_mode,
            experience_min,
            experience_max,
            english_level,
            description,
            requirements,
            benefits
        } = req.body;

        if (!title || !company_id || !location || !job_type || !work_mode || !description) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const result = await db.insert(jobs).values({
            title,
            company_id: parseInt(company_id),
            location,
            salary_min: salary_min ? parseInt(salary_min) : null,
            salary_max: salary_max ? parseInt(salary_max) : null,
            salary_currency,
            job_type,
            work_mode,
            experience_min: experience_min ? parseInt(experience_min) : null,
            experience_max: experience_max ? parseInt(experience_max) : null,
            english_level,
            description,
            requirements,
            benefits,
            status: 'active'
        }).returning({ id: jobs.id });

        res.status(201).json({
            message: 'Job created successfully',
            jobId: result[0].id
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
});

// Update job (Employer/Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'employer' && req.user.role !== 'admin') {
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
        if (updateFields.company_id) updateFields.company_id = parseInt(updateFields.company_id);
        if (updateFields.salary_min) updateFields.salary_min = parseInt(updateFields.salary_min);
        if (updateFields.salary_max) updateFields.salary_max = parseInt(updateFields.salary_max);
        if (updateFields.experience_min) updateFields.experience_min = parseInt(updateFields.experience_min);
        if (updateFields.experience_max) updateFields.experience_max = parseInt(updateFields.experience_max);

        // Add updated_at timestamp
        updateFields.updated_at = sql`CURRENT_TIMESTAMP`;

        const result = await db
            .update(jobs)
            .set(updateFields)
            .where(eq(jobs.id, parseInt(id)));

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ message: 'Job updated successfully' });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
});

// Delete job (Employer/Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'employer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;

        const result = await db
            .update(jobs)
            .set({ 
                status: 'inactive',
                updated_at: sql`CURRENT_TIMESTAMP`
            })
            .where(eq(jobs.id, parseInt(id)));

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
});

export default router;
