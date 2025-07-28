import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface Notification {
  id: string;
  type: 'payment' | 'security' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  userId: string;
}

// In-memory storage for demo (use database in production)
let notifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $250.00 from John Doe',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false,
    priority: 'high',
    userId: 'user1',
  },
  {
    id: '2',
    type: 'security',
    title: 'New Login Detected',
    message: 'Someone signed in from a new device in New York',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    priority: 'high',
    userId: 'user1',
  },
  {
    id: '3',
    type: 'system',
    title: 'Maintenance Complete',
    message: 'System maintenance has been completed successfully',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    read: true,
    priority: 'medium',
    userId: 'user1',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Failed',
    message: 'Payment to Alice Smith failed due to insufficient funds',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    priority: 'high',
    userId: 'user1',
  },
  {
    id: '5',
    type: 'promotion',
    title: 'New Feature Available',
    message: 'Check out our new analytics dashboard with advanced insights',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    priority: 'low',
    userId: 'user1',
  },
];

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { filter = 'all', limit = 50, offset = 0 } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let userNotifications = notifications.filter(n => n.userId === user.id.toString() || n.userId === 'user1');

    // Apply filters
    if (filter === 'unread') {
      userNotifications = userNotifications.filter(n => !n.read);
    } else if (filter === 'payment') {
      userNotifications = userNotifications.filter(n => n.type === 'payment');
    } else if (filter === 'security') {
      userNotifications = userNotifications.filter(n => n.type === 'security');
    }

    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedNotifications = userNotifications.slice(startIndex, startIndex + limitNum);

    const unreadCount = notifications.filter(n => 
      (n.userId === user.id.toString() || n.userId === 'user1') && !n.read
    ).length;

    res.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        total: userNotifications.length,
        limit: limitNum,
        offset: startIndex,
        hasMore: startIndex + limitNum < userNotifications.length,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { notificationId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = notifications.find(n => 
      n.id === notificationId && (n.userId === user.id.toString() || n.userId === 'user1')
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userNotifications = notifications.filter(n => 
      n.userId === user.id.toString() || n.userId === 'user1'
    );

    userNotifications.forEach(notification => {
      notification.read = true;
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: userNotifications.length,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { notificationId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notificationIndex = notifications.findIndex(n => 
      n.id === notificationId && (n.userId === user.id.toString() || n.userId === 'user1')
    );

    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const deletedNotification = notifications.splice(notificationIndex, 1)[0];

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: deletedNotification,
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Mock notification settings
    const settings = {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      categories: {
        payment: true,
        security: true,
        system: true,
        promotion: false,
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
    };

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
};

export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const settings = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In a real implementation, save settings to database
    console.log('Updating notification settings for user:', user.id, settings);

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
};
