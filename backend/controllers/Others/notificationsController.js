import { db } from '../config/database.js';
import * as schema from '../schema.js';
import * as dashboardSchema from '../schema/dashboardSchema.js';
import { eq, desc, and } from 'drizzle-orm';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const notifications = await db
      .select()
      .from(dashboardSchema.notifications)
      .where(eq(dashboardSchema.notifications.userId, userId))
      .orderBy(desc(dashboardSchema.notifications.createdAt))
      .limit(limit);
    
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const settings = await db
      .select()
      .from(dashboardSchema.userPreferences)
      .where(eq(dashboardSchema.userPreferences.userId, userId));

    // Return default settings if none exist
    if (!settings.length) {
      return res.json({
        success: true,
        data: {
          emailNotifications: true,
          pushNotifications: true,
          jobAlerts: true,
          applicationUpdates: true,
          interviewReminders: true,
          marketingEmails: false,
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        emailNotifications: Boolean(settings[0].emailNotifications),
        pushNotifications: Boolean(settings[0].pushNotifications),
        jobAlerts: Boolean(settings[0].jobAlerts),
        applicationUpdates: true,
        interviewReminders: true,
        marketingEmails: false,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const settings = req.body;
    
    // Check if user preferences exist
    const existingSettings = await db
      .select()
      .from(dashboardSchema.userPreferences)
      .where(eq(dashboardSchema.userPreferences.userId, userId));
    
    if (existingSettings.length > 0) {
      // Update existing settings
      await db
        .update(dashboardSchema.userPreferences)
        .set({
          emailNotifications: settings.emailNotifications ? 1 : 0,
          pushNotifications: settings.pushNotifications ? 1 : 0,
          jobAlerts: settings.jobAlerts ? 1 : 0,
          updatedAt: new Date().toISOString()
        })
        .where(eq(dashboardSchema.userPreferences.userId, userId));
    } else {
      // Insert new settings
      await db.insert(dashboardSchema.userPreferences).values({
        userId: userId,
        emailNotifications: settings.emailNotifications ? 1 : 0,
        pushNotifications: settings.pushNotifications ? 1 : 0,
        jobAlerts: settings.jobAlerts ? 1 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    
    await db
      .update(dashboardSchema.notifications)
      .set({ isRead: 1 })
      .where(and(
        eq(dashboardSchema.notifications.id, notificationId),
        eq(dashboardSchema.notifications.userId, userId)
      ));
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await db
      .update(dashboardSchema.notifications)
      .set({ isRead: 1 })
      .where(eq(dashboardSchema.notifications.userId, userId));
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    
    await db
      .delete(dashboardSchema.notifications)
      .where(and(
        eq(dashboardSchema.notifications.id, notificationId),
        eq(dashboardSchema.notifications.userId, userId)
      ));
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
