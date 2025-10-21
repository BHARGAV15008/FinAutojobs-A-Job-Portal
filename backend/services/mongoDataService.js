import mongoose from 'mongoose';

// Import all MongoDB models
import BaseUser from '../models/unified/BaseUser.js';
import Applicant from '../models/unified/Applicant.js';
import Recruiter from '../models/unified/Recruiter.js';
import Admin from '../models/unified/Admin.js';
import Job from '../models/unified/Job.js';
import Application from '../models/unified/Application.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import Interview from '../models/Interview.js';
import JobAlert from '../models/JobAlert.js';
import Moderation from '../models/Moderation.js';
import EnhancedApplication from '../models/EnhancedApplication.js';

class MongoDataService {
  constructor() {
    this.models = {
      BaseUser,
      Applicant,
      Recruiter,
      Admin,
      Job,
      Application,
      Company,
      Notification,
      Message,
      Interview,
      JobAlert,
      Moderation,
      EnhancedApplication
    };
  }

  // User Operations
  async createUser(userData) {
    try {
      const user = new BaseUser(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await BaseUser.findById(userId).populate('profile');
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await BaseUser.findOne({ email }).populate('profile');
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      return await BaseUser.findByIdAndUpdate(userId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      return await BaseUser.findByIdAndDelete(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllUsers(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const query = BaseUser.find(filters)
        .populate('profile')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const users = await query.exec();
      const total = await BaseUser.countDocuments(filters);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Job Operations
  async createJob(jobData) {
    try {
      const job = new Job(jobData);
      return await job.save();
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJobById(jobId) {
    try {
      return await Job.findById(jobId)
        .populate('companyId')
        .populate('recruiterId', 'firstName lastName email');
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  }

  async getAllJobs(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const query = Job.find(filters)
        .populate('companyId', 'name logo location')
        .populate('recruiterId', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const jobs = await query.exec();
      const total = await Job.countDocuments(filters);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all jobs:', error);
      throw error;
    }
  }

  async searchJobs(searchQuery, filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      // Build search criteria
      const searchCriteria = {
        ...filters,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { skills: { $in: [new RegExp(searchQuery, 'i')] } },
          { location: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      const jobs = await Job.find(searchCriteria)
        .populate('companyId', 'name logo location')
        .populate('recruiterId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(searchCriteria);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  async getRecommendedJobs(userId, limit = 10) {
    try {
      // Get user profile to understand preferences
      const user = await BaseUser.findById(userId).populate('profile');
      if (!user) throw new Error('User not found');

      // Build recommendation criteria based on user profile
      const criteria = {};
      
      if (user.profile?.skills?.length > 0) {
        criteria.skills = { $in: user.profile.skills };
      }
      
      if (user.profile?.location) {
        criteria.location = { $regex: user.profile.location, $options: 'i' };
      }

      const jobs = await Job.find(criteria)
        .populate('companyId', 'name logo location')
        .populate('recruiterId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);

      return jobs;
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      throw error;
    }
  }

  // Application Operations
  async createApplication(applicationData) {
    try {
      const application = new EnhancedApplication(applicationData);
      return await application.save();
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async getUserApplications(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const filters = { applicantId: userId };
      if (status) filters.status = status;

      const applications = await EnhancedApplication.find(filters)
        .populate('jobId', 'title company location salary')
        .populate('recruiterId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EnhancedApplication.countDocuments(filters);

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw error;
    }
  }

  async getJobApplications(jobId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const filters = { jobId };
      if (status) filters.status = status;

      const applications = await EnhancedApplication.find(filters)
        .populate('applicantId', 'firstName lastName email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EnhancedApplication.countDocuments(filters);

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting job applications:', error);
      throw error;
    }
  }

  // Company Operations
  async createCompany(companyData) {
    try {
      const company = new Company(companyData);
      return await company.save();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async getAllCompanies(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const companies = await Company.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Company.countDocuments(filters);

      return {
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all companies:', error);
      throw error;
    }
  }

  // Notification Operations
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      return await notification.save();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const filters = { userId };
      if (unreadOnly) filters.isRead = false;

      const notifications = await Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(filters);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      return {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Analytics Operations
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      const [
        applicationCount,
        interviewCount,
        jobViewCount,
        profileViews
      ] = await Promise.all([
        EnhancedApplication.countDocuments({ 
          applicantId: userId, 
          createdAt: { $gte: startDate } 
        }),
        Interview.countDocuments({ 
          applicantId: userId, 
          scheduledDate: { $gte: startDate } 
        }),
        // This would need to be tracked separately in a user activity collection
        0, // Placeholder for job views
        0  // Placeholder for profile views
      ]);

      return {
        applications: applicationCount,
        interviews: interviewCount,
        jobViews: jobViewCount,
        profileViews,
        timeRange
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  async getCompanyAnalytics(companyId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      const [
        jobCount,
        applicationCount,
        interviewCount
      ] = await Promise.all([
        Job.countDocuments({ 
          company: companyId, 
          createdAt: { $gte: startDate } 
        }),
        EnhancedApplication.countDocuments({ 
          createdAt: { $gte: startDate },
          jobId: { $in: await Job.find({ company: companyId }).select('_id') }
        }),
        Interview.countDocuments({ 
          scheduledDate: { $gte: startDate },
          jobId: { $in: await Job.find({ company: companyId }).select('_id') }
        })
      ]);

      return {
        jobs: jobCount,
        applications: applicationCount,
        interviews: interviewCount,
        timeRange
      };
    } catch (error) {
      console.error('Error getting company analytics:', error);
      throw error;
    }
  }

  async getPlatformAnalytics(timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      const [
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        newUsers,
        newJobs,
        newApplications
      ] = await Promise.all([
        BaseUser.countDocuments(),
        Job.countDocuments(),
        EnhancedApplication.countDocuments(),
        Company.countDocuments(),
        BaseUser.countDocuments({ createdAt: { $gte: startDate } }),
        Job.countDocuments({ createdAt: { $gte: startDate } }),
        EnhancedApplication.countDocuments({ createdAt: { $gte: startDate } })
      ]);

      return {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        newUsers,
        newJobs,
        newApplications,
        timeRange
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  // Moderation Operations
  async getModerationItems(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const items = await Moderation.find(filters)
        .populate('flaggedBy', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Moderation.countDocuments(filters);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting moderation items:', error);
      throw error;
    }
  }

  async approveModerationItem(itemId, reviewerId, reason = '') {
    try {
      return await Moderation.findByIdAndUpdate(
        itemId,
        {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: reason
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error approving moderation item:', error);
      throw error;
    }
  }

  async rejectModerationItem(itemId, reviewerId, reason = '') {
    try {
      return await Moderation.findByIdAndUpdate(
        itemId,
        {
          status: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: reason
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error rejecting moderation item:', error);
      throw error;
    }
  }

  // Utility Methods
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }

  // Database Health Check
  async checkHealth() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      return {
        status: state === 1 ? 'healthy' : 'unhealthy',
        state: states[state],
        database: 'MongoDB'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        database: 'MongoDB'
      };
    }
  }
}

// Export singleton instance
const mongoDataService = new MongoDataService();
export default mongoDataService;
