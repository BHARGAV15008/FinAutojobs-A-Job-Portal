import express from 'express';
import { db } from '../config/database.js';
import { applications, jobs, users } from '../schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Apply for a job (authenticated user only)
router.post('/', authenticateToken, async (req, res) => {
    const { job_id, cover_letter, resume_url } = req.body;

    if (!job_id) {
        return res.status(400).json({ message: 'Job ID is required' });
    }

    try {
        // Check if job exists and is active
        const jobResult = await db.select()
            .from(jobs)
            .where(and(
                eq(jobs.id, job_id),
                eq(jobs.status, 'active')
            ));
        const job = jobResult[0];

        if (!job) {
            return res.status(404).json({ message: 'Job not found or inactive' });
        }

        // Check if user has already applied for this job
        const existingApplicationResult = await db.select()
            .from(applications)
            .where(and(
                eq(applications.user_id, req.user.userId),
                eq(applications.job_id, job_id)
            ));
        const existingApplication = existingApplicationResult[0];

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create application
        const newApplicationResult = await db.insert(applications)
            .values({
                job_id,
                user_id: req.user.userId,
                cover_letter,
                resume_url,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .returning();
        const newApplication = newApplicationResult[0];

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: newApplication.id,
            jobTitle: job.title
        });
    } catch (error) {
        console.error('Error in application submission:', error);
        res.status(500).json({ message: 'Error creating application' });
    }
});

// Get application by ID (authenticated user or HR/Admin)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Use SQL for complex join query with Drizzle
        const applicationResult = await db.select({
            // Application fields
            id: applications.id,
            job_id: applications.job_id,
            user_id: applications.user_id,
            status: applications.status,
            cover_letter: applications.cover_letter,
            resume_url: applications.resume_url,
            created_at: applications.created_at,
            updated_at: applications.updated_at,
            // Job fields
            job_title: jobs.title,
            job_location: jobs.location,
            salary_min: jobs.salary_min,
            salary_max: jobs.salary_max,
            job_type: jobs.job_type,
            work_mode: jobs.work_mode,
            // Company fields
            company_name: companies.name,
            company_logo: companies.logo_url,
            // User fields
            applicant_username: users.username,
            applicant_email: users.email,
            applicant_name: users.full_name,
            applicant_phone: users.phone
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.job_id, jobs.id))
        .innerJoin(companies, eq(jobs.company_id, companies.id))
        .innerJoin(users, eq(applications.user_id, users.id))
        .where(eq(applications.id, id));
        const application = applicationResult[0];

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user has permission to view this application
        if (req.user.role === 'jobseeker' && application.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const formattedApplication = {
            id: application.id,
            job_title: application.job_title,
            company_name: application.company_name,
            company_logo: application.company_logo,
            location: application.job_location,
            salary: application.salary_min === application.salary_max
                ? `₹${application.salary_min.toLocaleString()} monthly`
                : `₹${application.salary_min.toLocaleString()} - ₹${application.salary_max.toLocaleString()} monthly`,
            job_type: application.job_type,
            work_mode: application.work_mode,
            status: application.status,
            applied_at: application.created_at,
            cover_letter: application.cover_letter,
            resume_url: application.resume_url,
            applicant: {
                username: application.applicant_username,
                email: application.applicant_email,
                full_name: application.applicant_name,
                phone: application.applicant_phone
            }
        };

        res.json({ application: formattedApplication });
    } catch (error) {
        console.error('Error retrieving application:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update application status (HR/Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
        return res.status(400).json({ message: 'Valid status is required' });
    }

    try {
        const result = await db.update(applications)
            .set({
                status,
                updated_at: new Date().toISOString()
            })
            .where(eq(applications.id, id))
            .run();

        // Check if any rows were affected
        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Error updating application status' });
    }
});

// Get applications for a job (HR/Admin only)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Build the query
        let query = db.select({
            // Application fields
            id: applications.id,
            job_id: applications.job_id,
            user_id: applications.user_id,
            status: applications.status,
            cover_letter: applications.cover_letter,
            resume_url: applications.resume_url,
            created_at: applications.created_at,
            updated_at: applications.updated_at,
            // User fields
            applicant_username: users.username,
            applicant_email: users.email,
            applicant_name: users.full_name,
            applicant_phone: users.phone
        })
        .from(applications)
        .innerJoin(users, eq(applications.user_id, users.id))
        .where(eq(applications.job_id, jobId));

        // Add status filter if provided
        if (status) {
            query = query.where(eq(applications.status, status));
        }

        // Get total count for pagination
        const countQuery = db.select({ count: sql`count(*)` })
            .from(applications)
            .where(eq(applications.job_id, jobId));
            
        // Add status filter to count query if provided
        const countResult = status 
            ? await countQuery.where(eq(applications.status, status)).get()
            : await countQuery.get();
            
        // Get the applications with pagination
        const applicationsList = await query
            .orderBy(desc(applications.created_at))
            .limit(parseInt(limit))
            .offset(offset)
            .all();

        // Format the applications for response
        const formattedApplications = applicationsList.map(app => ({
            id: app.id,
            status: app.status,
            applied_at: app.created_at,
            cover_letter: app.cover_letter,
            resume_url: app.resume_url,
            applicant: {
                username: app.applicant_username,
                email: app.applicant_email,
                full_name: app.applicant_name,
                phone: app.applicant_phone
            }
        }));

        // Send the response with pagination
        res.json({
            applications: formattedApplications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.count,
                pages: Math.ceil(countResult.count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error retrieving applications for job:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get all applications (HR/Admin only)
router.get('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { status, job_id, user_id, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Build the base query
        let query = db.select({
            // Application fields
            id: applications.id,
            job_id: applications.job_id,
            user_id: applications.user_id,
            status: applications.status,
            cover_letter: applications.cover_letter,
            resume_url: applications.resume_url,
            created_at: applications.created_at,
            updated_at: applications.updated_at,
            // Job fields
            job_title: jobs.title,
            job_location: jobs.location,
            salary_min: jobs.salary_min,
            salary_max: jobs.salary_max,
            job_type: jobs.job_type,
            work_mode: jobs.work_mode,
            // Company fields
            company_name: companies.name,
            company_logo: companies.logo_url,
            // User fields
            applicant_username: users.username,
            applicant_email: users.email,
            applicant_name: users.full_name
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.job_id, jobs.id))
        .innerJoin(companies, eq(jobs.company_id, companies.id))
        .innerJoin(users, eq(applications.user_id, users.id));
        
        // Build the count query
        let countQuery = db.select({ count: sql`count(*)` })
            .from(applications)
            .innerJoin(jobs, eq(applications.job_id, jobs.id))
            .innerJoin(companies, eq(jobs.company_id, companies.id))
            .innerJoin(users, eq(applications.user_id, users.id));

        // Add filters
        if (status) {
            query = query.where(eq(applications.status, status));
            countQuery = countQuery.where(eq(applications.status, status));
        }

        if (job_id) {
            query = query.where(eq(applications.job_id, job_id));
            countQuery = countQuery.where(eq(applications.job_id, job_id));
        }

        if (user_id) {
            query = query.where(eq(applications.user_id, user_id));
            countQuery = countQuery.where(eq(applications.user_id, user_id));
    }

        // Get the total count
        const countResult = await countQuery.get();
        
        // Get the applications with pagination
        const applicationsList = await query
            .orderBy(desc(applications.created_at))
            .limit(parseInt(limit))
            .offset(offset)
            .all();
            
        // Format the applications for response
        const formattedApplications = applicationsList.map(app => ({
            id: app.id,
            job_title: app.job_title,
            company_name: app.company_name,
            company_logo: app.company_logo,
            location: app.job_location,
            salary: app.salary_min === app.salary_max
                ? `₹${app.salary_min.toLocaleString()} monthly`
                : `₹${app.salary_min.toLocaleString()} - ₹${app.salary_max.toLocaleString()} monthly`,
            job_type: app.job_type,
            work_mode: app.work_mode,
            status: app.status,
                applied_at: app.created_at,
                applicant: {
                    username: app.applicant_username,
                    email: app.applicant_email,
                    name: app.applicant_name
                }
            }));

            res.json({
                applications: formattedApplications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.count,
                    pages: Math.ceil(countResult.count / parseInt(limit))
                }
            });
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Delete application (HR/Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    try {
        const result = await db.delete(applications)
            .where(eq(applications.id, id))
            .run();

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Error deleting application' });
    }
});

export default router;
