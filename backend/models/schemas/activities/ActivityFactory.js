/**
 * Activity Factory
 * 
 * Factory pattern implementation for creating and managing activity-related models.
 * Provides unified interface for user activities, system logs, and audit trails.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import UserActivitySchema from './UserActivitySchema.js';

// Model cache to avoid re-compilation
const modelCache = new Map();

/**
 * Get activity-related model based on type
 * @param {string} type - Model type (user_activity, system_activity, audit_log)
 * @returns {mongoose.Model} Mongoose model for the specified type
 */
export const getActivityModel = (type) => {
  if (!type) {
    throw new Error('Type is required to get activity model');
  }
  
  const normalizedType = type.toLowerCase();
  
  // Check cache first
  if (modelCache.has(normalizedType)) {
    return modelCache.get(normalizedType);
  }
  
  let model;
  
  switch (normalizedType) {
    case 'user_activity':
    case 'user':
    case 'activity':
      model = mongoose.model('UserActivity', UserActivitySchema);
      break;
      
    default:
      throw new Error(`Invalid activity model type: ${type}. Supported types: user_activity`);
  }
  
  // Cache the model
  modelCache.set(normalizedType, model);
  
  return model;
};

/**
 * Create a new activity-related model instance
 * @param {string} type - Model type
 * @param {Object} data - Model data
 * @returns {mongoose.Document} New model document
 */
export const createActivityModel = (type, data = {}) => {
  const Model = getActivityModel(type);
  return new Model(data);
};

/**
 * Track user activity with automatic context detection
 * @param {Object} activityData - Activity data
 * @returns {Promise<mongoose.Document>} Created activity document
 */
export const trackActivity = async (activityData) => {
  const ActivityModel = getActivityModel('user_activity');
  
  // Enhance activity data with automatic context
  const enhancedData = {
    ...activityData,
    timing: {
      timestamp: new Date(),
      ...activityData.timing
    },
    session: {
      sessionId: activityData.session?.sessionId || generateSessionId(),
      ...activityData.session
    }
  };
  
  // Auto-detect engagement metrics
  if (!enhancedData.engagement) {
    enhancedData.engagement = {
      isFirstTime: false,
      isReturning: true,
      sessionNumber: 1,
      pageDepth: 1,
      scrollDepth: 0,
      clickCount: 0,
      interactionScore: 0
    };
  }
  
  const activity = new ActivityModel(enhancedData);
  return await activity.save();
};

/**
 * Get user activity analytics
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Activity analytics
 */
export const getUserActivityAnalytics = async (userId, options = {}) => {
  const ActivityModel = getActivityModel('user_activity');
  
  const {
    dateRange = 30,
    groupBy = 'day',
    categories = null
  } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  const matchCondition = {
    'user.userId': new mongoose.Types.ObjectId(userId),
    'timing.timestamp': { $gte: startDate }
  };
  
  if (categories && categories.length > 0) {
    matchCondition['activity.category'] = { $in: categories };
  }
  
  const groupByFormat = {
    hour: { $dateToString: { format: "%Y-%m-%d-%H", date: "$timing.timestamp" } },
    day: { $dateToString: { format: "%Y-%m-%d", date: "$timing.timestamp" } },
    week: { $dateToString: { format: "%Y-%U", date: "$timing.timestamp" } },
    month: { $dateToString: { format: "%Y-%m", date: "$timing.timestamp" } }
  };
  
  const analytics = await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          period: groupByFormat[groupBy],
          category: '$activity.category',
          type: '$activity.type'
        },
        count: { $sum: 1 },
        avgEngagement: { $avg: '$engagement.interactionScore' },
        totalTimeSpent: { $sum: '$timing.timeOnPage' },
        uniqueSessions: { $addToSet: '$session.sessionId' },
        conversions: { $sum: { $cond: ['$conversion.isConversion', 1, 0] } }
      }
    },
    {
      $group: {
        _id: '$_id.period',
        activities: {
          $push: {
            category: '$_id.category',
            type: '$_id.type',
            count: '$count',
            avgEngagement: '$avgEngagement',
            totalTimeSpent: '$totalTimeSpent',
            uniqueSessions: { $size: '$uniqueSessions' },
            conversions: '$conversions'
          }
        },
        totalActivities: { $sum: '$count' },
        totalEngagement: { $avg: '$avgEngagement' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalConversions: { $sum: '$conversions' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return analytics;
};

/**
 * Get platform-wide activity insights
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Platform insights
 */
export const getPlatformInsights = async (filters = {}) => {
  const ActivityModel = getActivityModel('user_activity');
  
  const {
    dateRange = 7,
    userRole = null,
    activityTypes = null
  } = filters;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  const matchCondition = {
    'timing.timestamp': { $gte: startDate }
  };
  
  if (userRole) {
    matchCondition['user.role'] = userRole;
  }
  
  if (activityTypes && activityTypes.length > 0) {
    matchCondition['activity.type'] = { $in: activityTypes };
  }
  
  const insights = await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user.userId' },
        uniqueSessions: { $addToSet: '$session.sessionId' },
        avgEngagementScore: { $avg: '$engagement.interactionScore' },
        totalConversions: { $sum: { $cond: ['$conversion.isConversion', 1, 0] } },
        
        // Activity breakdown
        activitiesByCategory: {
          $push: {
            category: '$activity.category',
            type: '$activity.type'
          }
        },
        
        // User role breakdown
        activitiesByRole: {
          $push: '$user.role'
        },
        
        // Device breakdown
        activitiesByDevice: {
          $push: '$session.device.type'
        },
        
        // Geographic breakdown
        activitiesByCountry: {
          $push: '$session.location.country'
        },
        
        // Time-based patterns
        activitiesByHour: {
          $push: { $hour: '$timing.timestamp' }
        },
        
        activitiesByDayOfWeek: {
          $push: { $dayOfWeek: '$timing.timestamp' }
        }
      }
    },
    {
      $addFields: {
        uniqueUsersCount: { $size: '$uniqueUsers' },
        uniqueSessionsCount: { $size: '$uniqueSessions' },
        conversionRate: {
          $multiply: [
            { $divide: ['$totalConversions', '$totalActivities'] },
            100
          ]
        },
        avgActivitiesPerUser: {
          $divide: ['$totalActivities', { $size: '$uniqueUsers' }]
        },
        avgActivitiesPerSession: {
          $divide: ['$totalActivities', { $size: '$uniqueSessions' }]
        }
      }
    }
  ]);
  
  return insights.length > 0 ? insights[0] : {};
};

/**
 * Get real-time activity feed
 * @param {Object} options - Feed options
 * @returns {Promise<Array>} Recent activities
 */
export const getActivityFeed = async (options = {}) => {
  const ActivityModel = getActivityModel('user_activity');
  
  const {
    limit = 50,
    userRole = null,
    categories = null,
    excludeTypes = ['page_view'] // Exclude noisy activities by default
  } = options;
  
  const matchCondition = {
    'timing.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  };
  
  if (userRole) {
    matchCondition['user.role'] = userRole;
  }
  
  if (categories && categories.length > 0) {
    matchCondition['activity.category'] = { $in: categories };
  }
  
  if (excludeTypes && excludeTypes.length > 0) {
    matchCondition['activity.type'] = { $nin: excludeTypes };
  }
  
  const activities = await ActivityModel.find(matchCondition)
    .sort({ 'timing.timestamp': -1 })
    .limit(limit)
    .select({
      'user.email': 1,
      'user.role': 1,
      'activity.type': 1,
      'activity.category': 1,
      'activity.action': 1,
      'context.resource': 1,
      'timing.timestamp': 1,
      'session.location.country': 1,
      'session.location.city': 1,
      'conversion.isConversion': 1
    })
    .lean();
  
  return activities;
};

/**
 * Generate activity reports
 * @param {Object} reportConfig - Report configuration
 * @returns {Promise<Object>} Generated report
 */
export const generateActivityReport = async (reportConfig) => {
  const ActivityModel = getActivityModel('user_activity');
  
  const {
    type = 'summary',
    dateRange = 30,
    groupBy = 'day',
    filters = {}
  } = reportConfig;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  const matchCondition = {
    'timing.timestamp': { $gte: startDate },
    ...filters
  };
  
  let report = {};
  
  switch (type) {
    case 'summary':
      report = await generateSummaryReport(ActivityModel, matchCondition, groupBy);
      break;
      
    case 'user_engagement':
      report = await generateEngagementReport(ActivityModel, matchCondition, groupBy);
      break;
      
    case 'conversion_funnel':
      report = await generateConversionReport(ActivityModel, matchCondition);
      break;
      
    case 'geographic':
      report = await generateGeographicReport(ActivityModel, matchCondition);
      break;
      
    default:
      throw new Error(`Invalid report type: ${type}`);
  }
  
  return {
    type,
    dateRange,
    generatedAt: new Date(),
    filters,
    data: report
  };
};

// Helper functions for report generation
const generateSummaryReport = async (ActivityModel, matchCondition, groupBy) => {
  const groupByFormat = {
    hour: { $dateToString: { format: "%Y-%m-%d-%H", date: "$timing.timestamp" } },
    day: { $dateToString: { format: "%Y-%m-%d", date: "$timing.timestamp" } },
    week: { $dateToString: { format: "%Y-%U", date: "$timing.timestamp" } }
  };
  
  return await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: groupByFormat[groupBy],
        totalActivities: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user.userId' },
        uniqueSessions: { $addToSet: '$session.sessionId' },
        avgEngagement: { $avg: '$engagement.interactionScore' },
        conversions: { $sum: { $cond: ['$conversion.isConversion', 1, 0] } }
      }
    },
    {
      $addFields: {
        uniqueUsersCount: { $size: '$uniqueUsers' },
        uniqueSessionsCount: { $size: '$uniqueSessions' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const generateEngagementReport = async (ActivityModel, matchCondition, groupBy) => {
  return await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$user.userId',
        totalActivities: { $sum: 1 },
        avgEngagement: { $avg: '$engagement.interactionScore' },
        totalTimeSpent: { $sum: '$timing.timeOnPage' },
        sessionsCount: { $addToSet: '$session.sessionId' },
        lastActivity: { $max: '$timing.timestamp' },
        firstActivity: { $min: '$timing.timestamp' }
      }
    },
    {
      $addFields: {
        sessionCount: { $size: '$sessionsCount' },
        avgActivitiesPerSession: { $divide: ['$totalActivities', { $size: '$sessionsCount' }] }
      }
    },
    { $sort: { avgEngagement: -1 } }
  ]);
};

const generateConversionReport = async (ActivityModel, matchCondition) => {
  return await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$conversion.conversionType',
        totalEvents: { $sum: 1 },
        conversions: { $sum: { $cond: ['$conversion.isConversion', 1, 0] } },
        uniqueUsers: { $addToSet: '$user.userId' }
      }
    },
    {
      $addFields: {
        conversionRate: {
          $multiply: [{ $divide: ['$conversions', '$totalEvents'] }, 100]
        },
        uniqueUsersCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { conversionRate: -1 } }
  ]);
};

const generateGeographicReport = async (ActivityModel, matchCondition) => {
  return await ActivityModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          country: '$session.location.country',
          city: '$session.location.city'
        },
        totalActivities: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user.userId' },
        avgEngagement: { $avg: '$engagement.interactionScore' },
        conversions: { $sum: { $cond: ['$conversion.isConversion', 1, 0] } }
      }
    },
    {
      $addFields: {
        uniqueUsersCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { totalActivities: -1 } }
  ]);
};

// Utility function to generate session ID
const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  getActivityModel,
  createActivityModel,
  trackActivity,
  getUserActivityAnalytics,
  getPlatformInsights,
  getActivityFeed,
  generateActivityReport
};
