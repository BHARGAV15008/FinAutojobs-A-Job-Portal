import Notification from '../../models/Notification.js';
import { sendEmail } from './emailService.js';

// Send notification to user
export const sendNotification = async ({ userId, type, title, message, data = {}, priority = 'normal' }) => {
  try {
    // Create notification record
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      priority,
      status: 'unread',
      channels: ['in-app'] // Default to in-app notification
    });

    await notification.save();

    // Send real-time notification via Socket.IO if available
    const io = global.io || req?.app?.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        id: notification._id,
        type,
        title,
        message,
        data,
        priority,
        timestamp: notification.createdAt
      });
    }

    // Send push notification for high priority items
    if (priority === 'high') {
      await sendPushNotification(userId, { title, message, data });
    }

    return {
      success: true,
      notificationId: notification._id
    };

  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

// Send bulk notifications
export const sendBulkNotifications = async (notifications) => {
  try {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const result = await sendNotification(notificationData);
        results.push({ ...notificationData, success: true, result });
      } catch (error) {
        console.error(`Failed to send notification to user ${notificationData.userId}:`, error);
        results.push({ ...notificationData, success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId, { page = 1, limit = 20, status, type } = {}) => {
  try {
    const query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query)
    ]);

    return {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, status: 'unread' },
      { 
        status: 'read',
        readAt: new Date()
      }
    );

    return {
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (userId) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              status: '$status'
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, unread: 0, read: 0, byType: [] };
    
    // Group by type
    const typeStats = {};
    result.byType.forEach(item => {
      if (!typeStats[item.type]) {
        typeStats[item.type] = { total: 0, unread: 0, read: 0 };
      }
      typeStats[item.type].total++;
      typeStats[item.type][item.status]++;
    });

    return {
      total: result.total,
      unread: result.unread,
      read: result.read,
      byType: typeStats
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

// Send push notification (placeholder for actual push service integration)
const sendPushNotification = async (userId, { title, message, data }) => {
  try {
    // This is where you would integrate with a push notification service
    // like Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNS), etc.
    
    console.log('Push notification would be sent:', {
      userId,
      title,
      message,
      data
    });

    // Example FCM integration (uncomment and configure when ready):
    /*
    const admin = require('firebase-admin');
    
    // Get user's FCM token from database
    const user = await User.findById(userId).select('fcmToken');
    if (!user?.fcmToken) return;

    const payload = {
      notification: {
        title,
        body: message
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    };

    await admin.messaging().sendToDevice(user.fcmToken, payload);
    */

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

// Send email notification
export const sendEmailNotification = async (userId, { subject, template, data }) => {
  try {
    // Get user email
    const user = await BaseUser.findById(userId).select('email firstName lastName');
    if (!user) {
      throw new Error('User not found');
    }

    await sendEmail({
      to: user.email,
      subject,
      template,
      data: {
        ...data,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Notification templates for different events
export const notificationTemplates = {
  'new_application': {
    title: 'New Job Application',
    message: 'You have received a new application for {jobTitle}',
    priority: 'normal'
  },
  'application_status_update': {
    title: 'Application Status Updated',
    message: 'Your application for {jobTitle} has been {status}',
    priority: 'high'
  },
  'interview_scheduled': {
    title: 'Interview Scheduled',
    message: 'An interview has been scheduled for {jobTitle}',
    priority: 'high'
  },
  'interview_rescheduled': {
    title: 'Interview Rescheduled',
    message: 'Your interview for {jobTitle} has been rescheduled',
    priority: 'high'
  },
  'interview_cancelled': {
    title: 'Interview Cancelled',
    message: 'Your interview for {jobTitle} has been cancelled',
    priority: 'high'
  },
  'new_message': {
    title: 'New Message',
    message: 'You have received a new message from {senderName}',
    priority: 'normal'
  },
  'job_alert': {
    title: 'New Job Matches',
    message: 'We found {count} new jobs that match your preferences',
    priority: 'normal'
  },
  'profile_view': {
    title: 'Profile Viewed',
    message: 'Your profile was viewed by {viewerName}',
    priority: 'low'
  },
  'application_deadline': {
    title: 'Application Deadline Reminder',
    message: 'The application deadline for {jobTitle} is approaching',
    priority: 'normal'
  }
};

// Send templated notification
export const sendTemplatedNotification = async (userId, templateKey, data = {}) => {
  try {
    const template = notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Notification template '${templateKey}' not found`);
    }

    // Replace placeholders in message
    let message = template.message;
    Object.keys(data).forEach(key => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), data[key]);
    });

    return await sendNotification({
      userId,
      type: templateKey,
      title: template.title,
      message,
      data,
      priority: template.priority
    });
  } catch (error) {
    console.error('Error sending templated notification:', error);
    throw error;
  }
};

// Clean up old notifications
export const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'read'
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

// Get notification preferences for user
export const getNotificationPreferences = async (userId) => {
  try {
    // This would typically be stored in a user preferences collection
    // For now, return default preferences
    return {
      email: {
        newApplication: true,
        applicationStatusUpdate: true,
        interviewScheduled: true,
        newMessage: true,
        jobAlert: true
      },
      push: {
        newApplication: true,
        applicationStatusUpdate: true,
        interviewScheduled: true,
        newMessage: false,
        jobAlert: false
      },
      inApp: {
        newApplication: true,
        applicationStatusUpdate: true,
        interviewScheduled: true,
        newMessage: true,
        jobAlert: true,
        profileView: true
      }
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    // This would typically update a user preferences collection
    // For now, just return success
    console.log('Notification preferences updated for user:', userId, preferences);
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

export default {
  sendNotification,
  sendBulkNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  sendEmailNotification,
  sendTemplatedNotification,
  cleanupOldNotifications,
  getNotificationPreferences,
  updateNotificationPreferences
};
