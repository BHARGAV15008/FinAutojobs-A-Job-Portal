import { db } from '../config/database.js';
import { savedJobs, jobs, companies } from '../schema.js';
import { eq, and, sql } from 'drizzle-orm';

// Get current user's saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db
      .select({
        id: savedJobs.id,
        created_at: savedJobs.created_at,
        job_id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        location: jobs.location,
        salary_min: jobs.salary_min,
        salary_max: jobs.salary_max,
        salary_currency: jobs.salary_currency,
        job_type: jobs.job_type,
        work_mode: jobs.work_mode,
        company_name: companies.name,
        company_logo: companies.logo_url,
        company_location: companies.location,
      })
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.job_id, jobs.id))
      .leftJoin(companies, eq(jobs.company_id, companies.id))
      .where(eq(savedJobs.user_id, userId))
      .orderBy(sql`${savedJobs.created_at} DESC`);

    res.json({ saved: result });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching saved jobs' });
  }
};

// Save a job for current user
export const addSavedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ message: 'job_id is required' });
    }

    // Prevent duplicates
    const existing = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.user_id, userId), eq(savedJobs.job_id, parseInt(job_id))))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Job already saved' });
    }

    const inserted = await db
      .insert(savedJobs)
      .values({ user_id: userId, job_id: parseInt(job_id) })
      .returning();

    res.status(201).json({ message: 'Job saved', saved: inserted[0] });
  } catch (error) {
    console.error('Add saved job error:', error);
    res.status(500).json({ message: 'Internal server error while saving job' });
  }
};

// Remove a saved job (only by owner)
export const removeSavedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Ensure record belongs to user
    const existing = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.id, parseInt(id)), eq(savedJobs.user_id, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    await db.delete(savedJobs).where(eq(savedJobs.id, parseInt(id)));

    res.json({ message: 'Removed from saved jobs' });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ message: 'Internal server error while removing saved job' });
  }
};