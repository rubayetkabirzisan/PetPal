const express = require('express');
const router = express.Router();

// In-memory storage for notifications (in production, this would be a database)
let notifications = [
  {
    id: '1',
    userId: 'user-001',
    title: 'Application Update',
    message: 'Your application for Buddy has been approved! Please contact the shelter to arrange pickup.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: 'application',
    read: false,
    targetScreen: 'ApplicationDetails',
    targetParams: { applicationId: 'app123', petName: 'Buddy' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'adoption',
    actionRequired: true
  },
  {
    id: '2',
    userId: 'user-001',
    title: 'New Message',
    message: 'Happy Paws Shelter sent you a message about Max.',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: 'message',
    read: false,
    targetScreen: 'Chat',
    targetParams: { conversationId: 'conv456', shelterName: 'Happy Paws Shelter', petName: 'Max' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    category: 'communication',
    actionRequired: false,
    senderId: 'shelter-001',
    senderName: 'Happy Paws Shelter'
  },
  {
    id: '3',
    userId: 'user-001',
    title: 'Reminder',
    message: 'Don\'t forget to schedule a vet appointment for Luna within 7 days of adoption.',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    type: 'reminder',
    read: true,
    targetScreen: 'PetCareReminders',
    targetParams: { petId: 'pet789', petName: 'Luna' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    category: 'care',
    actionRequired: true,
    reminderDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    recurring: false
  },
  {
    id: '4',
    userId: 'user-001',
    title: 'Pet Updates',
    message: 'Luna\'s GPS tracker has detected movement outside the safe zone.',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    type: 'application',
    read: true,
    targetScreen: 'PetProfile',
    targetParams: { petId: 'pet789' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'safety',
    actionRequired: true,
    gpsData: {
      latitude: 40.7128,
      longitude: -74.0060,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: '5',
    userId: 'user-001',
    title: 'Lost Pet Alert',
    message: 'A pet matching Max\'s description has been reported in your area.',
    time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    type: 'reminder',
    read: true,
    targetScreen: 'LostPetDetails',
    targetParams: { petId: 'pet456' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    category: 'community',
    actionRequired: false,
    location: {
      city: 'New York',
      state: 'NY',
      radius: '5 miles'
    }
  },
  {
    id: '6',
    userId: 'user-001',
    title: 'App Update',
    message: 'New features available! Check out our improved pet matching system.',
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    type: 'update',
    read: true,
    targetScreen: 'AIMatching',
    targetParams: {},
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    category: 'system',
    actionRequired: false,
    version: '2.1.0',
    features: ['AI Matching', 'GPS Tracking', 'Video Calls']
  },
  // Additional sample notifications for other users
  {
    id: '7',
    userId: 'user-002',
    title: 'Welcome to PetPal!',
    message: 'Thanks for joining PetPal! Complete your profile to start finding your perfect pet companion.',
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    type: 'update',
    read: false,
    targetScreen: 'Profile',
    targetParams: {},
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 'medium',
    category: 'onboarding',
    actionRequired: true
  }
];

// Notification counters for generating IDs
let notificationIdCounter = 8;

// Helper function to format time for display
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 10080) { // Less than 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInMinutes / 10080);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
};

// Helper function to validate notification data
const validateNotificationData = (data) => {
  const required = ['userId', 'title', 'message', 'type'];
  const validTypes = ['application', 'message', 'reminder', 'update'];
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  for (const field of required) {
    if (!data[field]) {
      return { valid: false, error: `${field} is required` };
    }
  }
  
  if (!validTypes.includes(data.type)) {
    return { valid: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` };
  }
  
  if (data.priority && !validPriorities.includes(data.priority)) {
    return { valid: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` };
  }
  
  return { valid: true };
};

// Helper function to send push notification (simulated)
const sendPushNotification = async (userId, notification) => {
  try {
    // In production: Integrate with FCM/APNs for real push notifications
    console.log(`Sending push notification to user ${userId}:`, {
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: notification.id,
        targetScreen: notification.targetScreen,
        targetParams: notification.targetParams
      }
    });
    
    // Simulate push notification delivery
    return {
      success: true,
      messageId: `push_${Date.now()}`,
      deliveredAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// GET /api/notifications - Get all notifications for a user
router.get('/', (req, res) => {
  try {
    const { 
      userId, 
      type, 
      read, 
      priority, 
      category,
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let userNotifications = notifications.filter(notification => 
      notification.userId === userId
    );
    
    // Apply filters
    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }
    
    if (read !== undefined) {
      const isRead = read === 'true';
      userNotifications = userNotifications.filter(n => n.read === isRead);
    }
    
    if (priority) {
      userNotifications = userNotifications.filter(n => n.priority === priority);
    }
    
    if (category) {
      userNotifications = userNotifications.filter(n => n.category === category);
    }
    
    // Sort notifications
    userNotifications.sort((a, b) => {
      const aValue = new Date(a[sortBy]);
      const bValue = new Date(b[sortBy]);
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    // Format notifications with display time
    const formattedNotifications = paginatedNotifications.map(notification => ({
      ...notification,
      timeFormatted: formatNotificationTime(notification.time)
    }));
    
    // Calculate statistics
    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      byType: {
        application: userNotifications.filter(n => n.type === 'application').length,
        message: userNotifications.filter(n => n.type === 'message').length,
        reminder: userNotifications.filter(n => n.type === 'reminder').length,
        update: userNotifications.filter(n => n.type === 'update').length
      },
      byPriority: {
        low: userNotifications.filter(n => n.priority === 'low').length,
        medium: userNotifications.filter(n => n.priority === 'medium').length,
        high: userNotifications.filter(n => n.priority === 'high').length,
        urgent: userNotifications.filter(n => n.priority === 'urgent').length
      }
    };
    
    res.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        pagination: {
          total: userNotifications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < userNotifications.length
        },
        stats: stats
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// GET /api/notifications/:notificationId - Get a specific notification
router.get('/:notificationId', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const notification = notifications.find(n => 
      n.id === notificationId && n.userId === userId
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        notification: {
          ...notification,
          timeFormatted: formatNotificationTime(notification.time)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
});

// POST /api/notifications - Create a new notification
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type,
      targetScreen,
      targetParams = {},
      priority = 'medium',
      category = 'general',
      actionRequired = false,
      sendPush = true,
      scheduleFor = null,
      expiresAt = null,
      metadata = {}
    } = req.body;
    
    // Validate required fields
    const validation = validateNotificationData({ userId, title, message, type, priority });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    const now = new Date().toISOString();
    const scheduledTime = scheduleFor ? new Date(scheduleFor).toISOString() : now;
    
    // Create new notification
    const newNotification = {
      id: (notificationIdCounter++).toString(),
      userId: userId,
      title: title,
      message: message,
      time: scheduledTime,
      type: type,
      read: false,
      targetScreen: targetScreen || null,
      targetParams: targetParams,
      createdAt: now,
      updatedAt: now,
      priority: priority,
      category: category,
      actionRequired: actionRequired,
      expiresAt: expiresAt,
      metadata: metadata
    };
    
    notifications.push(newNotification);
    
    // Send push notification if requested and not scheduled
    let pushResult = null;
    if (sendPush && !scheduleFor) {
      pushResult = await sendPushNotification(userId, newNotification);
    }
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification: {
          ...newNotification,
          timeFormatted: formatNotificationTime(newNotification.time)
        },
        pushNotification: pushResult
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// PUT /api/notifications/:notificationId/read - Mark notification as read/unread
router.put('/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, read = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const notificationIndex = notifications.findIndex(n => 
      n.id === notificationId && n.userId === userId
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Update read status
    notifications[notificationIndex].read = read;
    notifications[notificationIndex].updatedAt = new Date().toISOString();
    
    if (read) {
      notifications[notificationIndex].readAt = new Date().toISOString();
    } else {
      delete notifications[notificationIndex].readAt;
    }
    
    res.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`,
      data: {
        notification: {
          ...notifications[notificationIndex],
          timeFormatted: formatNotificationTime(notifications[notificationIndex].time)
        }
      }
    });
  } catch (error) {
    console.error('Error updating notification read status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification read status',
      error: error.message
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read for a user
router.put('/mark-all-read', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const now = new Date().toISOString();
    let updatedCount = 0;
    
    // Update all unread notifications for the user
    notifications.forEach((notification, index) => {
      if (notification.userId === userId && !notification.read) {
        notifications[index].read = true;
        notifications[index].updatedAt = now;
        notifications[index].readAt = now;
        updatedCount++;
      }
    });
    
    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      data: {
        updatedCount: updatedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// DELETE /api/notifications/:notificationId - Delete a specific notification
router.delete('/:notificationId', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const notificationIndex = notifications.findIndex(n => 
      n.id === notificationId && n.userId === userId
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        deletedNotification: deletedNotification
      }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// DELETE /api/notifications/clear-all - Clear all notifications for a user
router.delete('/clear-all', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const initialCount = notifications.length;
    notifications = notifications.filter(n => n.userId !== userId);
    const deletedCount = initialCount - notifications.length;
    
    res.json({
      success: true,
      message: `${deletedCount} notifications cleared`,
      data: {
        deletedCount: deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications',
      error: error.message
    });
  }
});

// GET /api/notifications/stats - Get notification statistics for a user
router.get('/stats/overview', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userNotifications = notifications.filter(n => n.userId === userId);
    
    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      read: userNotifications.filter(n => n.read).length,
      actionRequired: userNotifications.filter(n => n.actionRequired).length,
      byType: {
        application: userNotifications.filter(n => n.type === 'application').length,
        message: userNotifications.filter(n => n.type === 'message').length,
        reminder: userNotifications.filter(n => n.type === 'reminder').length,
        update: userNotifications.filter(n => n.type === 'update').length
      },
      byPriority: {
        low: userNotifications.filter(n => n.priority === 'low').length,
        medium: userNotifications.filter(n => n.priority === 'medium').length,
        high: userNotifications.filter(n => n.priority === 'high').length,
        urgent: userNotifications.filter(n => n.priority === 'urgent').length
      },
      byCategory: {
        adoption: userNotifications.filter(n => n.category === 'adoption').length,
        communication: userNotifications.filter(n => n.category === 'communication').length,
        care: userNotifications.filter(n => n.category === 'care').length,
        safety: userNotifications.filter(n => n.category === 'safety').length,
        community: userNotifications.filter(n => n.category === 'community').length,
        system: userNotifications.filter(n => n.category === 'system').length,
        onboarding: userNotifications.filter(n => n.category === 'onboarding').length
      },
      recentActivity: {
        last24Hours: userNotifications.filter(n => 
          new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        lastWeek: userNotifications.filter(n => 
          new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    };
    
    res.json({
      success: true,
      data: {
        stats: stats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
});

// POST /api/notifications/bulk-action - Perform bulk actions on notifications
router.post('/bulk-action', (req, res) => {
  try {
    const { userId, action, notificationIds = [], filters = {} } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    const validActions = ['mark_read', 'mark_unread', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }
    
    let targetNotifications = [];
    
    // Select notifications based on IDs or filters
    if (notificationIds.length > 0) {
      targetNotifications = notifications.filter(n => 
        n.userId === userId && notificationIds.includes(n.id)
      );
    } else {
      // Apply filters
      targetNotifications = notifications.filter(n => n.userId === userId);
      
      if (filters.type) {
        targetNotifications = targetNotifications.filter(n => n.type === filters.type);
      }
      if (filters.read !== undefined) {
        targetNotifications = targetNotifications.filter(n => n.read === filters.read);
      }
      if (filters.priority) {
        targetNotifications = targetNotifications.filter(n => n.priority === filters.priority);
      }
    }
    
    let processedCount = 0;
    const now = new Date().toISOString();
    
    // Perform the action
    switch (action) {
      case 'mark_read':
        targetNotifications.forEach(notification => {
          const index = notifications.findIndex(n => n.id === notification.id);
          if (index !== -1 && !notifications[index].read) {
            notifications[index].read = true;
            notifications[index].updatedAt = now;
            notifications[index].readAt = now;
            processedCount++;
          }
        });
        break;
        
      case 'mark_unread':
        targetNotifications.forEach(notification => {
          const index = notifications.findIndex(n => n.id === notification.id);
          if (index !== -1 && notifications[index].read) {
            notifications[index].read = false;
            notifications[index].updatedAt = now;
            delete notifications[index].readAt;
            processedCount++;
          }
        });
        break;
        
      case 'delete':
        const initialCount = notifications.length;
        notifications = notifications.filter(n => 
          !targetNotifications.some(target => target.id === n.id)
        );
        processedCount = initialCount - notifications.length;
        break;
    }
    
    res.json({
      success: true,
      message: `Bulk action '${action}' completed on ${processedCount} notifications`,
      data: {
        action: action,
        processedCount: processedCount,
        targetCount: targetNotifications.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
});

module.exports = router;
