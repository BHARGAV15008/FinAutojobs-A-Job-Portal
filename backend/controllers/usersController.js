import { db } from '../config/database.js';
import { users, applications, jobs, companies } from '../schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Process skills array if provided
    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = JSON.stringify(updateData.skills);
    }

    // Update user profile
    const updatedUser = await db.update(users)
      .set({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = updatedUser[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating profile' 
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    // Get user with password
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.update(users)
      .set({
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Internal server error while changing password' 
    });
  }
};

// Get user applications
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      status,
      sort_by = 'applied_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [eq(applications.user_id, userId)];

    if (status) {
      whereConditions.push(eq(applications.status, status));
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(applications[sort_by]) : desc(applications[sort_by]);

    // Get applications with job and company information
    const applicationsResult = await db.select({
      id: applications.id,
      status: applications.status,
      applied_at: applications.applied_at,
      cover_letter: applications.cover_letter,
      resume_url: applications.resume_url,
      job_id: jobs.id,
      job_title: jobs.title,
      job_location: jobs.location,
      job_salary_min: jobs.salary_min,
      job_salary_max: jobs.salary_max,
      job_salary_currency: jobs.salary_currency,
      job_type: jobs.job_type,
      work_mode: jobs.work_mode,
      company_name: companies.name,
      company_logo: companies.logo_url,
      company_location: companies.location
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.job_id, jobs.id))
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(and(...whereConditions));
    
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
    console.error('Get user applications error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching applications' 
    });
  }
};

// Get user dashboard statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total applications
    const totalApplicationsResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(eq(applications.user_id, userId));

    // Applications by status
    const applicationsByStatusResult = await db.select({
      status: applications.status,
      count: sql`COUNT(*)`
    })
    .from(applications)
    .where(eq(applications.user_id, userId))
    .groupBy(applications.status);

    // Recent applications (last 30 days)
    const recentApplicationsResult = await db.select({ count: sql`COUNT(*)` })
      .from(applications)
      .where(
        and(
          eq(applications.user_id, userId),
          sql`${applications.applied_at} >= datetime('now', '-30 days')`
        )
      );

    // Profile completion percentage
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let profileCompletion = 0;
    if (userResult.length > 0) {
      const user = userResult[0];
      const fields = [
        'full_name', 'phone', 'bio', 'location', 'skills', 
        'qualification', 'experience_years', 'resume_url'
      ];
      const completedFields = fields.filter(field => user[field] && user[field].trim() !== '');
      profileCompletion = Math.round((completedFields.length / fields.length) * 100);
    }

    res.json({
      total_applications: totalApplicationsResult[0].count,
      recent_applications: recentApplicationsResult[0].count,
      applications_by_status: applicationsByStatusResult,
      profile_completion: profileCompletion
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching user statistics' 
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [];

    if (role) {
      whereConditions.push(eq(users.role, role));
    }

    if (status) {
      whereConditions.push(eq(users.status, status));
    }

    if (search) {
      whereConditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.full_name, `%${search}%`)
        )
      );
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(users[sort_by]) : desc(users[sort_by]);

    // Get users without passwords
    const usersResult = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      full_name: users.full_name,
      phone: users.phone,
      role: users.role,
      status: users.status,
      email_verified: users.email_verified,
      phone_verified: users.phone_verified,
      created_at: users.created_at,
      updated_at: users.updated_at
    })
    .from(users)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users: usersResult,
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
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching users' 
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: active, inactive, suspended' 
      });
    }

    // Update user status
    const updatedUser = await db.update(users)
      .set({
        status,
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = updatedUser[0];
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'User status updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating user status' 
    });
  }
};

// Export aliases for route compatibility
export const getUserProfile = getProfile;
export const updateUserProfile = updateProfile;
export const updateUserRole = updateUserStatus;
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by updating status
    await db.update(users)
      .set({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .where(eq(users.id, parseInt(id)));

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting user' 
    });
  }
};