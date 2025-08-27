import express from 'express';
import { db } from '../config/database.js';
import { companies, jobs } from '../schema.js';
import { eq, like, and, or, sql } from 'drizzle-orm';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all companies
router.get('/', (req, res) => {
    const { search, industry, location, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
    const conditions = [];

    // Add filters
    if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    if (industry) {
        conditions.push('industry = ?');
        params.push(industry);
    }

    if (location) {
        conditions.push('location LIKE ?');
        params.push(`%${location}%`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM companies WHERE 1=1';
    if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
    }

    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        db.all(query, params, (err, companies) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            res.json({
                companies,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Get company by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM companies WHERE id = ?', [id], (err, company) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ company });
    });
});

// Get jobs by company
router.get('/:id/jobs', (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = `
    SELECT 
      j.*,
      c.name as company_name,
      c.logo_url as company_logo
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.company_id = ? AND j.status = 'active'
    ORDER BY j.created_at DESC
    LIMIT ? OFFSET ?
  `;

    const offset = (page - 1) * limit;
    const params = [id, parseInt(limit), offset];

    // Get total count
    db.get('SELECT COUNT(*) as total FROM jobs WHERE company_id = ? AND status = "active"', [id], (err, countResult) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        db.all(query, params, (err, jobs) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            // Format jobs data
            const formattedJobs = jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company_name,
                location: job.location,
                salary: job.salary_min === job.salary_max
                    ? `₹${job.salary_min.toLocaleString()} monthly`
                    : `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()} monthly`,
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
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Create new company (Admin only)
router.post('/', authenticateToken, (req, res) => {
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

    const query = `
    INSERT INTO companies (name, description, logo_url, website, location, industry, size, founded_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [name, description, logo_url, website, location, industry, size, founded_year];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error creating company' });
        }

        res.status(201).json({
            message: 'Company created successfully',
            companyId: this.lastID
        });
    });
});

// Update company (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const updateFields = req.body;

    // Remove fields that shouldn't be updated
    delete updateFields.id;
    delete updateFields.created_at;

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const query = `UPDATE companies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const params = [...Object.values(updateFields), id];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating company' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company updated successfully' });
    });
});

// Delete company (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Check if company has active jobs
    db.get('SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = "active"', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.count > 0) {
            return res.status(400).json({
                message: 'Cannot delete company with active jobs. Please deactivate all jobs first.'
            });
        }

        db.run('DELETE FROM companies WHERE id = ?', [id], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error deleting company' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Company not found' });
            }

            res.json({ message: 'Company deleted successfully' });
        });
    });
});

// Get company statistics
router.get('/:id/stats', (req, res) => {
    const { id } = req.params;

    const queries = {
        totalJobs: 'SELECT COUNT(*) as count FROM jobs WHERE company_id = ?',
        activeJobs: 'SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = "active"',
        totalApplications: `
      SELECT COUNT(*) as count 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE j.company_id = ?
    `
    };

    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], [id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            stats[key] = result.count;
            completedQueries++;

            if (completedQueries === totalQueries) {
                res.json({ stats });
            }
        });
    });
});

export default router;
