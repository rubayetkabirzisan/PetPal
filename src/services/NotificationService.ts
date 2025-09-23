import { API_CONFIG, apiCall } from '../config/api';

export interface Notification {
  _id?: string;
  id?: string;
  userId: string;
  type: 'application_update' | 'message' | 'reminder' | 'gps_alert' | 'adoption_approved' | 'adoption_rejected' | 'lost_pet_alert' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Related data
  relatedId?: string; // ID of related entity (pet, application, etc.)
  relatedType?: 'pet' | 'application' | 'message' | 'reminder' | 'gps_tracking';
  
  // Notification actions
  actions?: {
    type: 'view' | 'approve' | 'reject' | 'navigate';
    label: string;
    url?: string;
    data?: any;
  }[];
  
  // Scheduling
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  
  // Platform specific
  pushToken?: string;
  platform?: 'ios' | 'android' | 'web';
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationResponse {
  success: boolean;
  data?: {
    notification?: Notification;
    notifications?: Notification[];
    totalCount?: number;
    unreadCount?: number;
    currentPage?: number;
    totalPages?: number;
  };
  message?: string;
  error?: string;
}

export interface CreateNotificationData {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  relatedId?: string;
  relatedType?: 'pet' | 'application' | 'message' | 'reminder' | 'gps_tracking';
  actions?: Notification['actions'];
  scheduledFor?: Date;
  platform?: 'ios' | 'android' | 'web';
}

class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: string, params?: {
    type?: Notification['type'];
    isRead?: boolean;
    priority?: Notification['priority'];
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get notifications',
      };
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationData): Promise<NotificationResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CREATE, {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });

      return response;
    } catch (error) {
      console.error('Create notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId), {
        method: 'PUT',
        body: JSON.stringify({ userId }),
      });

      return response;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, params?: {
    type?: Notification['type'];
    before?: Date;
  }): Promise<NotificationResponse> {
    try {
      const requestData: any = { userId };
      if (params?.type) requestData.type = params.type;
      if (params?.before) requestData.before = params.before.toISOString();

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}/mark-all-read`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });

      return response;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      };
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<NotificationResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(notificationId), {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });

      return response;
    } catch (error) {
      console.error('Delete notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete notification',
      };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, params?: {
    type?: Notification['type'];
    priority?: Notification['priority'];
  }): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      queryParams.append('isRead', 'false');
      queryParams.append('count', 'true');
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.priority) queryParams.append('priority', params.priority);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get unread count',
      };
    }
  }

  /**
   * Get admin notifications
   */
  async getAdminNotifications(adminId: string, params?: {
    type?: Notification['type'];
    priority?: Notification['priority'];
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.ADMIN}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get admin notifications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get admin notifications',
      };
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(data: {
    userIds: string[];
    title: string;
    message: string;
    type?: Notification['type'];
    data?: any;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<NotificationResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.CREATE}/push`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Send push notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send push notification',
      };
    }
  }

  /**
   * Update notification settings/preferences
   */
  async updateNotificationSettings(userId: string, settings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    types: {
      [key in Notification['type']]?: {
        push: boolean;
        email: boolean;
      };
    };
  }): Promise<NotificationResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ userId, settings }),
      });

      return response;
    } catch (error) {
      console.error('Update notification settings error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification settings',
      };
    }
  }

  /**
   * Register push token for notifications
   */
  async registerPushToken(userId: string, data: {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
  }): Promise<NotificationResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}/register-token`, {
        method: 'POST',
        body: JSON.stringify({ userId, ...data }),
      });

      return response;
    } catch (error) {
      console.error('Register push token error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register push token',
      };
    }
  }
}

export default new NotificationService();
