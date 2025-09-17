/**
 * NotificationService - Service for managing notifications
 * Handles viewing, creating, and marking notifications as read
 */

import { apiService } from './ApiService'

// TypeScript interfaces for notification data
export interface Notification {
  _id?: string
  title: string
  message: string
  time: string
  type: 'info' | 'warning' | 'error' | 'success' | 'adoption' | 'reminder' | 'general'
  read: boolean
  userId?: string
  petId?: string
  applicationId?: string
  priority?: 'low' | 'medium' | 'high'
  actionRequired?: boolean
  expirationDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateNotificationData {
  title: string
  message: string
  time?: string
  type: 'info' | 'warning' | 'error' | 'success' | 'adoption' | 'reminder' | 'general'
  read?: boolean
  userId?: string
  petId?: string
  applicationId?: string
  priority?: 'low' | 'medium' | 'high'
  actionRequired?: boolean
  expirationDate?: string
}

export interface UpdateNotificationData {
  title?: string
  message?: string
  read?: boolean
  type?: 'info' | 'warning' | 'error' | 'success' | 'adoption' | 'reminder' | 'general'
  priority?: 'low' | 'medium' | 'high'
  actionRequired?: boolean
}

export class NotificationService {
  /**
   * Get all notifications
   * @returns Promise<Notification[]>
   */
  static async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await apiService.get('/notification/viewAll')
      return response.data as Notification[]
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }

  /**
   * Add a new notification
   * @param notificationData - The notification data to add
   * @returns Promise<Notification>
   */
  static async addNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const dataToSend = {
        ...notificationData,
        time: notificationData.time || new Date().toISOString(),
        read: notificationData.read || false
      }
      const response = await apiService.post('/notification/AddNew', dataToSend)
      return response.data as Notification
    } catch (error: any) {
      console.error('Error adding notification:', error)
      throw new Error(error.response?.data?.message || 'Failed to add notification')
    }
  }

  /**
   * Mark notification as read
   * @param notificationId - The ID of the notification to mark as read
   * @returns Promise<Notification>
   */
  static async markNotificationAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiService.patch(`/notification/markRead/${notificationId}`, {})
      return response.data as Notification
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }

  /**
   * Get notification by ID
   * @param notificationId - The ID of the notification to retrieve
   * @returns Promise<Notification>
   */
  static async getNotificationById(notificationId: string): Promise<Notification> {
    try {
      const response = await apiService.get(`/notification/viewById/${notificationId}`)
      return response.data as Notification
    } catch (error: any) {
      console.error('Error fetching notification:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch notification')
    }
  }

  /**
   * Get notifications by user ID
   * @param userId - The ID of the user to get notifications for
   * @returns Promise<Notification[]>
   */
  static async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    try {
      const response = await apiService.get(`/notification/viewByUser/${userId}`)
      return response.data as Notification[]
    } catch (error: any) {
      console.error('Error fetching notifications by user:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications for user')
    }
  }

  /**
   * Get unread notifications
   * @param userId - Optional user ID to filter by
   * @returns Promise<Notification[]>
   */
  static async getUnreadNotifications(userId?: string): Promise<Notification[]> {
    try {
      const endpoint = userId 
        ? `/notification/unread/${userId}` 
        : '/notification/unread'
      const response = await apiService.get(endpoint)
      return response.data as Notification[]
    } catch (error: any) {
      console.error('Error fetching unread notifications:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch unread notifications')
    }
  }

  /**
   * Get notifications by type
   * @param type - The type to filter by
   * @returns Promise<Notification[]>
   */
  static async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    try {
      const response = await apiService.get(`/notification/viewByType/${type}`)
      return response.data as Notification[]
    } catch (error: any) {
      console.error('Error fetching notifications by type:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications by type')
    }
  }

  /**
   * Update notification
   * @param notificationId - The ID of the notification to update
   * @param updateData - The data to update
   * @returns Promise<Notification>
   */
  static async updateNotification(notificationId: string, updateData: UpdateNotificationData): Promise<Notification> {
    try {
      const response = await apiService.put(`/notification/update/${notificationId}`, updateData)
      return response.data as Notification
    } catch (error: any) {
      console.error('Error updating notification:', error)
      throw new Error(error.response?.data?.message || 'Failed to update notification')
    }
  }

  /**
   * Delete notification
   * @param notificationId - The ID of the notification to delete
   * @returns Promise<{ message: string }>
   */
  static async deleteNotification(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/notification/delete/${notificationId}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete notification')
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - The ID of the user
   * @returns Promise<{ count: number, message: string }>
   */
  static async markAllAsReadForUser(userId: string): Promise<{ count: number, message: string }> {
    try {
      const response = await apiService.patch(`/notification/markAllRead/${userId}`, {})
      return response.data as { count: number, message: string }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read')
    }
  }
}

export default NotificationService