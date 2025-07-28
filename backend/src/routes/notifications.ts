import express from 'express';
import { auth } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/notificationsController';

const router = express.Router();

// Get notifications
router.get('/', auth, getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', auth, markAsRead);

// Mark all notifications as read
router.patch('/read-all', auth, markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, deleteNotification);

// Get notification settings
router.get('/settings', auth, getNotificationSettings);

// Update notification settings
router.put('/settings', auth, updateNotificationSettings);

export default router;
