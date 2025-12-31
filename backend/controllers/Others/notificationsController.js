import Notification from '../models/Notification.js';
import NotificationSetting from '../models/NotificationSetting.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const notificationsList = await Notification.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      data: notificationsList,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const settings = await NotificationSetting.findOne({ userId: userId });

    // Return default settings if none exist
    if (!settings) {
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
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const settings = req.body;
    
    await NotificationSetting.findOneAndUpdate(
      { userId: userId },
      settings,
      { upsert: true, new: true, runValidators: true }
    );
    
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
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
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
    
    await Notification.updateMany({ userId: userId }, { read: true });
    
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
    
    const result = await Notification.deleteOne({ _id: notificationId, userId: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
