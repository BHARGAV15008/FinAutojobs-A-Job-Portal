import { BaseUser } from '../../models/UserModels.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await BaseUser.findById(userId).select('-password'); // Select everything but the password

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      user: user
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
    let updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData._id;

    // Use findByIdAndUpdate to update user profile
    const updatedUser = await BaseUser.findByIdAndUpdate(
      userId,
      { 
          $set: updateData,
          $currentDate: { updatedAt: true } // Update updatedAt timestamp
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select('-password'); // Exclude password from the returned document


    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
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
    const user = await BaseUser.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save(); // Mongoose pre-save hook will update updatedAt

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
      sort_by = 'appliedAt', // Changed to Mongoose field name
      sort_order = 'desc'
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let query = { applicant: userId }; // Mongoose uses 'applicant' for userId

    if (status) {
      query.status = status;
    }

    let sortOptions = {};
    if (sort_by) {
      sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1;
    }

    const applicationsQuery = Application.find(query)
      .populate({
        path: 'job',
        select: 'title location salaryMin salaryMax salaryCurrency jobType workMode companyId', // Select necessary fields from job
        populate: {
          path: 'companyId', // Populate company details through companyId
          model: 'Company',
          select: 'name logoUrl location' // Select necessary fields from company
        }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const applicationsResult = await applicationsQuery.exec();

    // Transform results to match the desired output structure
    const transformedApplications = applicationsResult.map(app => ({
      id: app._id,
      status: app.status,
      applied_at: app.appliedAt, // Mongoose field name
      cover_letter: app.coverLetter,
      resume_url: app.resume, // Mongoose field name
      job_id: app.job?._id,
      job_title: app.job?.title,
      job_location: app.job?.location,
      job_salary_min: app.job?.salaryMin,
      job_salary_max: app.job?.salaryMax,
      job_salary_currency: app.job?.salaryCurrency,
      job_type: app.job?.jobType,
      work_mode: app.job?.workMode,
      company_name: app.job?.companyId?.name,
      company_logo: app.job?.companyId?.logoUrl,
      company_location: app.job?.companyId?.location?.city // Assuming city is the relevant location part
    }));

    // Get total count for pagination
    const total = await Application.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      applications: transformedApplications,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNumber,
        has_next: pageNumber < totalPages,
        has_prev: pageNumber > 1
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
    const totalApplications = await Application.countDocuments({ applicant: userId });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: { applicant: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApplications = await Application.countDocuments({
      applicant: userId,
      appliedAt: { $gte: thirtyDaysAgo }
    });

    // Profile completion percentage
    const user = await BaseUser.findById(userId);

    let profileCompletion = 0;
    if (user) {
      const fields = [
        user.firstName, user.lastName, user.phone, user.bio, user.location,
        user.skills, user.education, user.documents?.resumeUrl
      ];
      const completedFields = fields.filter(field => field !== null && field !== undefined && (typeof field === 'string' ? field.trim() !== '' : true));
      profileCompletion = Math.round((completedFields.length / fields.length) * 100);
    }

    res.json({
      total_applications: totalApplications,
      recent_applications: recentApplications,
      applications_by_status: applicationsByStatus.map(item => ({ status: item._id, count: item.count })),
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
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    if (sort_by) {
      sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1;
    }

    const usersResult = await BaseUser.find(query)
      .select('-password') // Exclude password
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const total = await BaseUser.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      users: usersResult,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNumber,
        has_next: pageNumber < totalPages,
        has_prev: pageNumber > 1
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
    const updatedUser = await BaseUser.findByIdAndUpdate(
      id,
      { 
          $set: { status },
          $currentDate: { updatedAt: true }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      message: 'User status updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating user status' 
    });
  }
};

// Get profile analytics
export const getProfileAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user applications count
    const applicationsSent = await Application.countDocuments({ applicant: userId });

    // Get shortlisted applications count
    const shortlisted = await Application.countDocuments({
      applicant: userId,
      status: 'shortlisted'
    });

    // Mock data for profile views and other analytics
    const analytics = {
      profileViews: Math.floor(Math.random() * 300) + 50,
      applicationsSent: applicationsSent,
      shortlisted: shortlisted,
      profileCompleteness: 85,
      skillMatchRate: Math.floor(Math.random() * 30) + 70
    };

    res.json(analytics);

  } catch (error) {
    console.error('Get profile analytics error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching profile analytics' 
    });
  }
};

// Get profile activity
export const getProfileActivity = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get recent applications with job and company details
    const recentApplications = await Application.find({ applicant: userId })
      .populate({
        path: 'job',
        select: 'title companyId',
        populate: {
          path: 'companyId',
          model: 'Company',
          select: 'name'
        }
      })
      .sort({ appliedAt: -1 })
      .limit(10);

    // Transform to activity format
    const activities = recentApplications.map(app => ({
      id: app._id,
      type: 'application_sent',
      message: `Applied to ${app.job?.title} at ${app.job?.companyId?.name || 'N/A'}`,
      time: app.appliedAt,
      status: app.status
    }));

    // Add some mock profile view activities
    const mockActivities = [
      {
        id: 'pv1',
        type: 'profile_view',
        message: 'Profile viewed by TechCorp Recruiter',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pv2',
        type: 'profile_view',
        message: 'Profile viewed by StartupXYZ HR',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    const allActivities = [...activities, ...mockActivities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15);

    res.json(allActivities);

  } catch (error) {
    console.error('Get profile activity error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching profile activity' 
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
    const deletedUser = await BaseUser.findByIdAndUpdate(
      id,
      {
        $set: { status: 'deleted' },
        $currentDate: { updatedAt: true }
      },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

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