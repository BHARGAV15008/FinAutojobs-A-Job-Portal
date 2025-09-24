import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
import {
  getNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationsController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get notifications with optional limit
router.get('/', getNotifications);

// Get notification settings
router.get('/settings', getNotificationSettings);

// Update notification settings
router.put('/settings', updateNotificationSettings);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

export default router;
