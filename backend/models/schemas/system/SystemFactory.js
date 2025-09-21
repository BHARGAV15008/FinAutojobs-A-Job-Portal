/**
 * System Factory
 * 
 * Factory pattern implementation for creating and managing system-related models.
 * Provides unified interface for notifications, analytics, and system management.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import NotificationSchema from './NotificationSchema.js';
import AnalyticsSchema from './AnalyticsSchema.js';

// Model cache to avoid re-compilation
const modelCache = new Map();

/**
 * Get system-related model based on type
 * @param {string} type - Model type (notification, analytics, settings, logs)
 * @returns {mongoose.Model} Mongoose model for the specified type
 */
export const getSystemModel = (type) => {
  if (!type) {
    throw new Error('Type is required to get system model');
  }
  
  const normalizedType = type.toLowerCase();
  
  // Check cache first
  if (modelCache.has(normalizedType)) {
    return modelCache.get(normalizedType);
  }
  
  let model;
  
  switch (normalizedType) {
    case 'notification':
    case 'notifications':
      model = mongoose.model('Notification', NotificationSchema);
      break;
      
    case 'analytics':
    case 'analytic':
      model = mongoose.model('Analytics', AnalyticsSchema);
      break;
      
    default:
      throw new Error(`Invalid system model type: ${type}. Supported types: notification, analytics`);
  }
  
  // Cache the model
  modelCache.set(normalizedType, model);
  
  return model;
};

/**
 * Create a new system-related model instance
 * @param {string} type - Model type
 * @param {Object} data - Model data
 * @returns {mongoose.Document} New model document
 */
export const createSystemModel = (type, data = {}) => {
  const Model = getSystemModel(type);
  return new Model(data);
};

/**
 * Notification management utilities
 */
export const notificationManager = {
  /**
   * Send notification to user(s)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<mongoose.Document>} Created notification
   */
  send: async (notificationData) => {
    const NotificationModel = getSystemModel('notification');
    
    const notification = new NotificationModel({
      ...notificationData,
      delivery: {
        channels: notificationData.channels || [{ type: 'in_app', status: 'pending' }],
        overallStatus: 'pending'
      },
      system: {
        generatedBy: 'system',
        generatedAt: new Date()
      }
    });
    
    return await notification.save();
  },
  
  /**
   * Send bulk notifications
   * @param {Array} notifications - Array of notification data
   * @returns {Promise<Array>} Created notifications
   */
  sendBulk: async (notifications) => {
    const NotificationModel = getSystemModel('notification');
    
    const notificationDocs = notifications.map(data => new NotificationModel({
      ...data,
      delivery: {
        channels: data.channels || [{ type: 'in_app', status: 'pending' }],
        overallStatus: 'pending'
      },
      system: {
        generatedBy: 'system',
        generatedAt: new Date(),
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }
    }));
    
    return await NotificationModel.insertMany(notificationDocs);
  },
  
  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User notifications
   */
  getUserNotifications: async (userId, options = {}) => {
    const NotificationModel = getSystemModel('notification');
    
    const {
      limit = 20,
      skip = 0,
      unreadOnly = false,
      categories = null,
      priority = null
    } = options;
    
    const query = {
      'recipient.userId': new mongoose.Types.ObjectId(userId),
      'scheduling.expiresAt': { $gt: new Date() }
    };
    
    if (unreadOnly) {
      query['interaction.isRead'] = false;
    }
    
    if (categories && categories.length > 0) {
      query['content.category'] = { $in: categories };
    }
    
    if (priority) {
      query['content.priority'] = priority;
    }
    
    return await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },
  
  /**
   * Mark notifications as read
   * @param {Array} notificationIds - Notification IDs
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  markAsRead: async (notificationIds, userId) => {
    const NotificationModel = getSystemModel('notification');
    
    return await NotificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        'recipient.userId': new mongoose.Types.ObjectId(userId)
      },
      {
        $set: {
          'interaction.isRead': true,
          'interaction.readAt': new Date()
        }
      }
    );
  },
  
  /**
   * Get notification statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Notification stats
   */
  getStats: async (filters = {}) => {
    const NotificationModel = getSystemModel('notification');
    
    const matchCondition = {};
    
    if (filters.dateRange) {
      matchCondition.createdAt = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }
    
    if (filters.category) {
      matchCondition['content.category'] = filters.category;
    }
    
    if (filters.userRole) {
      matchCondition['recipient.role'] = filters.userRole;
    }
    
    return await NotificationModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalRead: { $sum: { $cond: ['$interaction.isRead', 1, 0] } },
          totalClicked: { $sum: { $cond: ['$interaction.isClicked', 1, 0] } },
          totalDelivered: { $sum: { $cond: [{ $eq: ['$delivery.overallStatus', 'delivered'] }, 1, 0] } },
          totalFailed: { $sum: { $cond: [{ $eq: ['$delivery.overallStatus', 'failed'] }, 1, 0] } },
          avgDeliveryTime: { $avg: '$system.processingTime' }
        }
      },
      {
        $addFields: {
          readRate: { $multiply: [{ $divide: ['$totalRead', '$totalSent'] }, 100] },
          clickRate: { $multiply: [{ $divide: ['$totalClicked', '$totalRead'] }, 100] },
          deliveryRate: { $multiply: [{ $divide: ['$totalDelivered', '$totalSent'] }, 100] }
        }
      }
    ]);
  }
};

/**
 * Analytics management utilities
 */
export const analyticsManager = {
  /**
   * Record metric data
   * @param {Object} metricData - Metric data
   * @returns {Promise<mongoose.Document>} Created analytics record
   */
  recordMetric: async (metricData) => {
    const AnalyticsModel = getSystemModel('analytics');
    
    const analytics = new AnalyticsModel({
      ...metricData,
      processing: {
        processedAt: new Date(),
        dataSource: metricData.dataSource || 'system',
        version: '1.0.0'
      }
    });
    
    return await analytics.save();
  },
  
  /**
   * Get dashboard metrics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Dashboard metrics
   */
  getDashboardMetrics: async (filters = {}) => {
    const AnalyticsModel = getSystemModel('analytics');
    
    const {
      userRole = 'all',
      period = 'day',
      dateRange = 7
    } = filters;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    const matchCondition = {
      'time.period': period,
      'time.periodStart': { $gte: startDate, $lte: endDate }
    };
    
    if (userRole !== 'all') {
      matchCondition['dimensions.user.role'] = userRole;
    }
    
    return await AnalyticsModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$metric.category',
          metrics: {
            $push: {
              name: '$metric.name',
              current: '$values.current',
              previous: '$values.previous',
              change: '$values.change.percentage',
              unit: '$metric.unit'
            }
          },
          totalValue: { $sum: '$values.current' },
          avgValue: { $avg: '$values.current' },
          maxValue: { $max: '$values.current' },
          minValue: { $min: '$values.current' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
  },
  
  /**
   * Get metric trends
   * @param {string} metricName - Metric name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Metric trend data
   */
  getMetricTrend: async (metricName, options = {}) => {
    const AnalyticsModel = getSystemModel('analytics');
    
    const {
      period = 'day',
      dateRange = 30,
      dimensions = {}
    } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    const matchCondition = {
      'metric.name': metricName,
      'time.period': period,
      'time.periodStart': { $gte: startDate, $lte: endDate }
    };
    
    // Add dimension filters
    Object.keys(dimensions).forEach(key => {
      if (dimensions[key]) {
        matchCondition[`dimensions.${key}`] = dimensions[key];
      }
    });
    
    return await AnalyticsModel.find(matchCondition)
      .sort({ 'time.periodStart': 1 })
      .select({
        'time.periodStart': 1,
        'values.current': 1,
        'values.change.percentage': 1,
        'metric.unit': 1
      })
      .lean();
  },
  
  /**
   * Generate analytics report
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise<Object>} Generated report
   */
  generateReport: async (reportConfig) => {
    const AnalyticsModel = getSystemModel('analytics');
    
    const {
      type = 'summary',
      metrics = [],
      dateRange = 30,
      groupBy = 'day',
      dimensions = {}
    } = reportConfig;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    const matchCondition = {
      'time.period': groupBy,
      'time.periodStart': { $gte: startDate, $lte: endDate }
    };
    
    if (metrics.length > 0) {
      matchCondition['metric.name'] = { $in: metrics };
    }
    
    // Add dimension filters
    Object.keys(dimensions).forEach(key => {
      if (dimensions[key]) {
        matchCondition[`dimensions.${key}`] = dimensions[key];
      }
    });
    
    let reportData;
    
    switch (type) {
      case 'summary':
        reportData = await AnalyticsModel.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$metric.name',
              totalValue: { $sum: '$values.current' },
              avgValue: { $avg: '$values.current' },
              maxValue: { $max: '$values.current' },
              minValue: { $min: '$values.current' },
              latestValue: { $last: '$values.current' },
              changePercentage: { $last: '$values.change.percentage' },
              unit: { $first: '$metric.unit' },
              category: { $first: '$metric.category' }
            }
          },
          { $sort: { totalValue: -1 } }
        ]);
        break;
        
      case 'trend':
        reportData = await AnalyticsModel.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                period: '$time.periodStart',
                metric: '$metric.name'
              },
              value: { $sum: '$values.current' }
            }
          },
          {
            $group: {
              _id: '$_id.metric',
              data: {
                $push: {
                  period: '$_id.period',
                  value: '$value'
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;
        
      case 'comparison':
        reportData = await AnalyticsModel.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                metric: '$metric.name',
                dimension: `$dimensions.${Object.keys(dimensions)[0] || 'user.role'}`
              },
              totalValue: { $sum: '$values.current' },
              avgValue: { $avg: '$values.current' }
            }
          },
          {
            $group: {
              _id: '$_id.metric',
              breakdown: {
                $push: {
                  dimension: '$_id.dimension',
                  total: '$totalValue',
                  average: '$avgValue'
                }
              }
            }
          }
        ]);
        break;
        
      default:
        throw new Error(`Invalid report type: ${type}`);
    }
    
    return {
      type,
      dateRange,
      generatedAt: new Date(),
      config: reportConfig,
      data: reportData
    };
  },
  
  /**
   * Get real-time metrics
   * @param {Array} metricNames - Metric names to fetch
   * @returns {Promise<Array>} Real-time metric values
   */
  getRealTimeMetrics: async (metricNames = []) => {
    const AnalyticsModel = getSystemModel('analytics');
    
    const matchCondition = {
      'time.period': 'minute',
      'time.periodStart': { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    };
    
    if (metricNames.length > 0) {
      matchCondition['metric.name'] = { $in: metricNames };
    }
    
    return await AnalyticsModel.find(matchCondition)
      .sort({ 'time.periodStart': -1 })
      .limit(100)
      .select({
        'metric.name': 1,
        'metric.category': 1,
        'values.current': 1,
        'values.change.percentage': 1,
        'time.periodStart': 1
      })
      .lean();
  }
};

/**
 * System health monitoring
 */
export const systemHealth = {
  /**
   * Get system health status
   * @returns {Promise<Object>} System health data
   */
  getHealthStatus: async () => {
    const AnalyticsModel = getSystemModel('analytics');
    const NotificationModel = getSystemModel('notification');
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent system metrics
    const systemMetrics = await AnalyticsModel.find({
      'metric.category': 'system_performance',
      'time.periodStart': { $gte: oneHourAgo }
    }).lean();
    
    // Get notification delivery stats
    const notificationStats = await NotificationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: '$delivery.overallStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate health score
    let healthScore = 100;
    
    // Check for failed notifications
    const failedNotifications = notificationStats.find(stat => stat._id === 'failed');
    if (failedNotifications && failedNotifications.count > 10) {
      healthScore -= 20;
    }
    
    // Check system performance metrics
    const responseTimeMetric = systemMetrics.find(m => m.metric.name === 'avg_response_time');
    if (responseTimeMetric && responseTimeMetric.values.current > 1000) { // > 1 second
      healthScore -= 15;
    }
    
    const errorRateMetric = systemMetrics.find(m => m.metric.name === 'error_rate');
    if (errorRateMetric && errorRateMetric.values.current > 5) { // > 5% error rate
      healthScore -= 25;
    }
    
    return {
      status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'critical',
      score: healthScore,
      timestamp: now,
      metrics: {
        systemPerformance: systemMetrics,
        notificationDelivery: notificationStats
      },
      alerts: healthScore < 90 ? ['System performance degraded'] : []
    };
  }
};

export default {
  getSystemModel,
  createSystemModel,
  notificationManager,
  analyticsManager,
  systemHealth
};
