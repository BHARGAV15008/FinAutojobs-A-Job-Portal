/**
 * Analytics Service for Backend
 * Tracks API usage, performance metrics, and user behavior
 */

import mongoose from "mongoose";

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["page_view", "api_call", "user_action", "error", "performance"],
    },
    eventName: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
      index: true,
    },
    sessionId: String,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "hours",
    },
  }
);

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

class AnalyticsService {
  /**
   * Track an analytics event
   * @param {Object} eventData - Event data
   */
  async trackEvent(eventData) {
    try {
      const event = new AnalyticsEvent(eventData);
      await event.save();
      return { success: true, eventId: event._id };
    } catch (error) {
      console.error("Error tracking analytics event:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track API call
   * @param {Object} req - Express request object
   * @param {number} duration - Request duration in ms
   */
  async trackApiCall(req, duration) {
    const eventData = {
      eventType: "api_call",
      eventName: `${req.method} ${req.path}`,
      userId: req.user?.id || req.user?.userId,
      sessionId: req.sessionID,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: req.res?.statusCode,
        duration,
        query: req.query,
        params: req.params,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    };

    return this.trackEvent(eventData);
  }

  /**
   * Track user action
   * @param {string} userId - User ID
   * @param {string} action - Action name
   * @param {Object} metadata - Additional metadata
   */
  async trackUserAction(userId, action, metadata = {}) {
    const eventData = {
      eventType: "user_action",
      eventName: action,
      userId,
      metadata,
    };

    return this.trackEvent(eventData);
  }

  /**
   * Track error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  async trackError(error, context = {}) {
    const eventData = {
      eventType: "error",
      eventName: error.name || "UnknownError",
      metadata: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    };

    return this.trackEvent(eventData);
  }

  /**
   * Get analytics summary
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} filters - Additional filters
   */
  async getAnalyticsSummary(startDate, endDate, filters = {}) {
    try {
      const query = {
        timestamp: { $gte: startDate, $lte: endDate },
        ...filters,
      };

      const [totalEvents, eventsByType, topUsers, topEndpoints] =
        await Promise.all([
          // Total events
          AnalyticsEvent.countDocuments(query),

          // Events by type
          AnalyticsEvent.aggregate([
            { $match: query },
            { $group: { _id: "$eventType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),

          // Top users
          AnalyticsEvent.aggregate([
            { $match: { ...query, userId: { $exists: true } } },
            { $group: { _id: "$userId", eventCount: { $sum: 1 } } },
            { $sort: { eventCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "baseusers",
                localField: "_id",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
            {
              $project: {
                userId: "$_id",
                eventCount: 1,
                userName: {
                  $concat: ["$user.firstName", " ", "$user.lastName"],
                },
                userEmail: "$user.email",
              },
            },
          ]),

          // Top API endpoints
          AnalyticsEvent.aggregate([
            { $match: { ...query, eventType: "api_call" } },
            { $group: { _id: "$eventName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ]),
        ]);

      return {
        success: true,
        data: {
          totalEvents,
          eventsByType,
          topUsers,
          topEndpoints,
          dateRange: { startDate, endDate },
        },
      };
    } catch (error) {
      console.error("Error getting analytics summary:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get performance metrics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  async getPerformanceMetrics(startDate, endDate) {
    try {
      const apiCalls = await AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: "api_call",
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$eventName",
            avgDuration: { $avg: "$metadata.duration" },
            minDuration: { $min: "$metadata.duration" },
            maxDuration: { $max: "$metadata.duration" },
            count: { $sum: 1 },
          },
        },
        { $sort: { avgDuration: -1 } },
      ]);

      return {
        success: true,
        data: {
          apiCalls,
          dateRange: { startDate, endDate },
        },
      };
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean old analytics data
   * @param {number} daysToKeep - Number of days to keep
   */
  async cleanOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AnalyticsEvent.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      console.log(`Cleaned ${result.deletedCount} old analytics events`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error("Error cleaning old analytics data:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new AnalyticsService();
export { AnalyticsEvent };
