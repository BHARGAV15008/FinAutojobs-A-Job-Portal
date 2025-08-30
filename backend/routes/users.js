import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users, applications, jobs, companies } from '../schema.js';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile (authenticated user only)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userResult = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            full_name: users.full_name,
            phone: users.phone,
            role: users.role,
            created_at: users.created_at
        })
        .from(users)
        .where(eq(users.id, req.user.userId));
        const user = userResult[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update user profile (authenticated user only)
router.put('/profile', authenticateToken, async (req, res) => {
    const { full_name, phone, email } = req.body;
    const updateFields = {};

    if (full_name !== undefined) updateFields.full_name = full_name;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    try {
        // Check if email is already taken by another user
        if (email) {
            const existingUserResult = await db.select({ id: users.id })
                .from(users)
                .where(and(
                    eq(users.email, email),
                    sql`${users.id} != ${req.user.userId}`
                ));
            const existingUser = existingUserResult[0];

            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Update user profile
        updateFields.updated_at = new Date().toISOString();
        const result = await db.update(users)
            .set(updateFields)
            .where(eq(users.id, req.user.userId));

        // Note: Drizzle doesn't return rowsAffected, so we'll assume success if no error

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password (authenticated user only)
router.put('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    try {
        // Get current user with password
        const userResult = await db.select({ password: users.password })
            .from(users)
            .where(eq(users.id, req.user.userId));
        const user = userResult[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.update(users)
            .set({
                password: hashedNewPassword,
                updated_at: new Date().toISOString()
            })
            .where(eq(users.id, req.user.userId));

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Database error' });
     }
});

// Get user applications (authenticated user only)
router.get('/applications', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Get total count
        const countResult = await db.select({ count: sql`COUNT(*)` })
            .from(applications)
            .where(eq(applications.user_id, req.user.userId));
        const totalCount = countResult[0]?.count || 0;

        // Get applications with job and company details
        const userApplications = await db.select({
            // Application fields
            id: applications.id,
            job_id: applications.job_id,
            user_id: applications.user_id,
            resume_url: applications.resume_url,
            cover_letter: applications.cover_letter,
            status: applications.status,
            applied_at: applications.applied_at,
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
            company_logo: companies.logo_url
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.job_id, jobs.id))
        .innerJoin(companies, eq(jobs.company_id, companies.id))
        .where(eq(applications.user_id, req.user.userId))
        .orderBy(sql`${applications.applied_at} DESC`)
        .limit(parseInt(limit))
        .offset(offset);
        
        if (userApplications.length === 0) {
            return res.json({
                applications: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit))
                }
            });
        }

        // Format applications data
        const formattedApplications = userApplications.map(app => ({
            id: app.id,
            job_title: app.job_title,
            company_name: app.company_name,
            company_logo: app.company_logo,
            location: app.job_location,
            salary: app.salary_min === app.salary_max
                ? `₹${app.salary_min?.toLocaleString() || 0} monthly`
                : `₹${app.salary_min?.toLocaleString() || 0} - ₹${app.salary_max?.toLocaleString() || 0} monthly`,
            job_type: app.job_type,
            work_mode: app.work_mode,
            status: app.status,
            applied_at: app.applied_at,
            cover_letter: app.cover_letter
        }));

        res.json({
            applications: formattedApplications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error retrieving user applications:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get all users (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Build base query
        let query = db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            full_name: users.full_name,
            phone: users.phone,
            role: users.role,
            created_at: users.created_at
        })
        .from(users);

        // Build count query
        let countQuery = db.select({ count: sql`COUNT(*)` })
            .from(users);

        // Add filters
        if (search) {
            const searchCondition = or(
                like(users.username, `%${search}%`),
                like(users.email, `%${search}%`),
                like(users.full_name, `%${search}%`)
            );
            query = query.where(searchCondition);
            countQuery = countQuery.where(searchCondition);
        }

        if (role) {
            query = query.where(eq(users.role, role));
            countQuery = countQuery.where(eq(users.role, role));
        }

        // Get total count
        const countResult = await countQuery;
        const totalCount = countResult[0]?.count || 0;
        
        // Get users with pagination
        const usersList = await query
            .orderBy(sql`${users.created_at} DESC`)
            .limit(parseInt(limit))
            .offset(offset);
            
        // Return empty array if no users found
        if (usersList.length === 0) {
            return res.json({
                users: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit))
                }
            });
        }

        res.json({
            users: usersList,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update user role (Admin only)
router.put('/:id/role', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['jobseeker', 'employer', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Valid role is required' });
    }

    try {
        await db.update(users)
            .set({
                role,
                updated_at: new Date().toISOString()
            })
            .where(eq(users.id, id));

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role' });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    try {
        // Check if user has applications
        const countQuery = await db.select({ count: sql`COUNT(*)` })
            .from(applications)
            .where(eq(applications.user_id, id));
        
        const applicationCount = countQuery[0]?.count || 0;

        if (applicationCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete user with applications. Please delete applications first.'
            });
        }

        // Delete the user
        await db.delete(users)
            .where(eq(users.id, id));

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

export default router;
