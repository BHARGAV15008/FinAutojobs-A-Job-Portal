/**
 * Job Factory
 * 
 * Factory pattern implementation for creating and managing job-related models.
 * Provides unified interface for job, application, and interview management.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import JobSchema from './JobSchema.js';
import JobApplicationSchema from './JobApplicationSchema.js';
import JobBookmarkSchema from './JobBookmarkSchema.js';
import InterviewSchema from './InterviewSchema.js';

// Model cache to avoid re-compilation
const modelCache = new Map();

/**
 * Get job-related model based on type
 * @param {string} type - Model type (job, application, bookmark, interview)
 * @returns {mongoose.Model} Mongoose model for the specified type
 */
export const getJobModel = (type) => {
  if (!type) {
    throw new Error('Type is required to get job model');
  }
  
  const normalizedType = type.toLowerCase();
  
  // Check cache first
  if (modelCache.has(normalizedType)) {
    return modelCache.get(normalizedType);
  }
  
  let model;
  
  switch (normalizedType) {
    case 'job':
    case 'jobs':
      model = mongoose.model('Job', JobSchema);
      break;
      
    case 'application':
    case 'applications':
      model = mongoose.model('JobApplication', JobApplicationSchema);
      break;
      
    case 'bookmark':
    case 'bookmarks':
    case 'saved':
      model = mongoose.model('JobBookmark', JobBookmarkSchema);
      break;
      
    case 'interview':
    case 'interviews':
      model = mongoose.model('Interview', InterviewSchema);
      break;
      
    default:
      throw new Error(`Invalid job model type: ${type}. Supported types: job, application, bookmark, interview`);
  }
  
  // Cache the model
  modelCache.set(normalizedType, model);
  
  return model;
};

/**
 * Create a new job-related model instance
 * @param {string} type - Model type
 * @param {Object} data - Model data
 * @returns {mongoose.Document} New model document
 */
export const createJobModel = (type, data = {}) => {
  const Model = getJobModel(type);
  return new Model(data);
};

/**
 * Get all available job models
 * @returns {Object} Object containing all job models
 */
export const getAllJobModels = () => {
  return {
    Job: getJobModel('job'),
    JobApplication: getJobModel('application'),
    JobBookmark: getJobModel('bookmark'),
    Interview: getJobModel('interview')
  };
};

/**
 * Job search with advanced filtering
 * @param {Object} filters - Search filters
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Promise<Array>} Search results
 */
export const searchJobs = async (filters = {}, options = {}) => {
  const JobModel = getJobModel('job');
  
  // Build query
  const query = {};
  
  // Text search
  if (filters.keywords) {
    query.$text = { $search: filters.keywords };
  }
  
  // Location filter
  if (filters.location) {
    if (filters.location.city) {
      query['location.primary.city'] = new RegExp(filters.location.city, 'i');
    }
    if (filters.location.state) {
      query['location.primary.state'] = new RegExp(filters.location.state, 'i');
    }
    if (filters.location.country) {
      query['location.primary.country'] = new RegExp(filters.location.country, 'i');
    }
  }
  
  // Employment type filter
  if (filters.employmentType && filters.employmentType.length > 0) {
    query.employmentType = { $in: filters.employmentType };
  }
  
  // Experience level filter
  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    query.experienceLevel = { $in: filters.experienceLevel };
  }
  
  // Salary range filter
  if (filters.salary) {
    if (filters.salary.min) {
      query['salary.minimum'] = { $gte: filters.salary.min };
    }
    if (filters.salary.max) {
      query['salary.maximum'] = { $lte: filters.salary.max };
    }
  }
  
  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    query['skills.required.name'] = { $in: filters.skills };
  }
  
  // Company filter
  if (filters.company) {
    query['company.name'] = new RegExp(filters.company, 'i');
  }
  
  // Industry filter
  if (filters.industry) {
    query.industry = new RegExp(filters.industry, 'i');
  }
  
  // Status filter (default to active)
  query.status = filters.status || 'active';
  
  // Date filters
  if (filters.postedAfter) {
    query.publishedAt = { $gte: new Date(filters.postedAfter) };
  }
  
  if (filters.expiresAfter) {
    query.expiresAt = { $gte: new Date(filters.expiresAfter) };
  }
  
  // Build options
  const queryOptions = {
    sort: options.sort || { publishedAt: -1 },
    limit: options.limit || 20,
    skip: options.skip || 0
  };
  
  // Execute query
  const jobs = await JobModel.find(query, null, queryOptions)
    .populate('company.companyId', 'name logo website')
    .populate('postedBy.recruiterId', 'firstName lastName');
  
  // Get total count for pagination
  const totalCount = await JobModel.countDocuments(query);
  
  return {
    jobs,
    totalCount,
    hasMore: (options.skip || 0) + jobs.length < totalCount,
    filters: filters,
    options: queryOptions
  };
};

/**
 * Get job recommendations for a user
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Recommended jobs
 */
export const getJobRecommendations = async (userId, userRole = 'applicant', limit = 10) => {
  if (userRole !== 'applicant') {
    return [];
  }
  
  const { getUserModel } = await import('../users/UserFactory.js');
  const UserModel = getUserModel('applicant');
  const JobModel = getJobModel('job');
  
  // Get user profile
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Build recommendation query based on user profile
  const query = {
    status: 'active',
    expiresAt: { $gt: new Date() }
  };
  
  // Skills-based matching
  if (user.skills && user.skills.technical && user.skills.technical.length > 0) {
    const userSkills = user.skills.technical.map(skill => skill.name);
    query['skills.required.name'] = { $in: userSkills };
  }
  
  // Experience level matching
  if (user.experienceLevel) {
    query.experienceLevel = user.experienceLevel;
  }
  
  // Location preference matching
  if (user.jobPreferences && user.jobPreferences.preferredLocations) {
    const preferredCities = user.jobPreferences.preferredLocations.map(loc => loc.city);
    if (preferredCities.length > 0) {
      query['location.primary.city'] = { $in: preferredCities };
    }
  }
  
  // Industry preference matching
  if (user.jobPreferences && user.jobPreferences.preferredIndustries) {
    query.industry = { $in: user.jobPreferences.preferredIndustries };
  }
  
  // Employment type preference
  if (user.jobPreferences && user.jobPreferences.employmentTypes) {
    query.employmentType = { $in: user.jobPreferences.employmentTypes };
  }
  
  // Salary expectation matching
  if (user.jobPreferences && user.jobPreferences.salaryExpectations) {
    const salaryMin = user.jobPreferences.salaryExpectations.minimum?.amount;
    const salaryMax = user.jobPreferences.salaryExpectations.maximum?.amount;
    
    if (salaryMin) {
      query['salary.maximum'] = { $gte: salaryMin };
    }
    if (salaryMax) {
      query['salary.minimum'] = { $lte: salaryMax };
    }
  }
  
  // Execute recommendation query
  const recommendations = await JobModel.find(query)
    .sort({ publishedAt: -1, 'analytics.views': -1 })
    .limit(limit)
    .populate('company.companyId', 'name logo')
    .populate('postedBy.recruiterId', 'firstName lastName');
  
  return recommendations;
};

/**
 * Get application statistics for a job or user
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Application statistics
 */
export const getApplicationStats = async (filters = {}) => {
  const ApplicationModel = getJobModel('application');
  
  const matchCondition = {};
  
  if (filters.jobId) {
    matchCondition['job.jobId'] = new mongoose.Types.ObjectId(filters.jobId);
  }
  
  if (filters.applicantId) {
    matchCondition['applicant.applicantId'] = new mongoose.Types.ObjectId(filters.applicantId);
  }
  
  if (filters.recruiterId) {
    matchCondition['recruiter.recruiterId'] = new mongoose.Types.ObjectId(filters.recruiterId);
  }
  
  if (filters.dateRange) {
    matchCondition.submittedAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }
  
  const stats = await ApplicationModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        byStatus: {
          $push: '$status'
        },
        avgTimeToReview: { $avg: '$metrics.timeToReview' },
        avgTimeToHire: { $avg: '$metrics.timeToHire' },
        totalInterviews: { $sum: '$metrics.totalInterviews' }
      }
    },
    {
      $addFields: {
        statusBreakdown: {
          $reduce: {
            input: '$byStatus',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                  }]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalApplications: 0,
    statusBreakdown: {},
    avgTimeToReview: 0,
    avgTimeToHire: 0,
    totalInterviews: 0
  };
};

/**
 * Bulk operations for job management
 */
export const bulkJobOperations = {
  /**
   * Update multiple jobs
   * @param {Array} updates - Array of {jobId, updateData}
   * @returns {Promise<Array>} Results array
   */
  updateJobs: async (updates) => {
    const JobModel = getJobModel('job');
    const results = [];
    
    for (const update of updates) {
      try {
        const { jobId, updateData } = update;
        const result = await JobModel.findByIdAndUpdate(jobId, updateData, { new: true });
        results.push({ success: true, jobId, result });
      } catch (error) {
        results.push({ success: false, jobId: update.jobId, error: error.message });
      }
    }
    
    return results;
  },
  
  /**
   * Expire multiple jobs
   * @param {Array} jobIds - Array of job IDs
   * @returns {Promise<Object>} Operation result
   */
  expireJobs: async (jobIds) => {
    const JobModel = getJobModel('job');
    
    const result = await JobModel.updateMany(
      { _id: { $in: jobIds } },
      { 
        status: 'expired',
        lastModifiedAt: new Date()
      }
    );
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    };
  },
  
  /**
   * Archive old applications
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<Object>} Operation result
   */
  archiveOldApplications: async (daysOld = 365) => {
    const ApplicationModel = getJobModel('application');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await ApplicationModel.updateMany(
      { 
        submittedAt: { $lt: cutoffDate },
        status: { $in: ['rejected', 'withdrawn', 'expired'] }
      },
      { 
        $set: { 
          isArchived: true,
          archivedAt: new Date()
        }
      }
    );
    
    return {
      success: true,
      archivedCount: result.modifiedCount
    };
  }
};

/**
 * Job analytics and insights
 */
export const jobAnalytics = {
  /**
   * Get trending jobs
   * @param {number} days - Days to look back
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Trending jobs
   */
  getTrendingJobs: async (days = 7, limit = 10) => {
    const JobModel = getJobModel('job');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return JobModel.find({
      status: 'active',
      publishedAt: { $gte: startDate }
    })
    .sort({ 'analytics.views': -1, 'applicationStats.totalApplications': -1 })
    .limit(limit)
    .populate('company.companyId', 'name logo');
  },
  
  /**
   * Get job market insights
   * @param {Object} filters - Market filters
   * @returns {Promise<Object>} Market insights
   */
  getMarketInsights: async (filters = {}) => {
    const JobModel = getJobModel('job');
    
    const matchCondition = {
      status: 'active',
      publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    };
    
    if (filters.location) {
      matchCondition['location.primary.city'] = filters.location;
    }
    
    const insights = await JobModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          avgSalaryMin: { $avg: '$salary.minimum' },
          avgSalaryMax: { $avg: '$salary.maximum' },
          topSkills: { $push: '$skills.required.name' },
          topIndustries: { $push: '$industry' },
          topCompanies: { $push: '$company.name' },
          employmentTypes: { $push: '$employmentType' }
        }
      },
      {
        $addFields: {
          topSkillsFlattened: {
            $reduce: {
              input: '$topSkills',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      }
    ]);
    
    return insights.length > 0 ? insights[0] : {};
  }
};

export default {
  getJobModel,
  createJobModel,
  getAllJobModels,
  searchJobs,
  getJobRecommendations,
  getApplicationStats,
  bulkJobOperations,
  jobAnalytics
};
