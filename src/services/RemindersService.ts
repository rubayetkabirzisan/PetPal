/**
 * RemindersService - Service for managing pet care reminders
 * Handles creating, updating, and managing reminder notifications
 */

import { apiService } from './ApiService'

// TypeScript interfaces for reminder data
export interface Reminder {
  _id?: string
  title: string
  description: string
  dueDate: string
  petId?: string
  userId: string
  type: 'feeding' | 'medication' | 'vet' | 'grooming' | 'exercise' | 'training' | 'other'
  recurring?: boolean
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  notificationEnabled?: boolean
  lastNotified?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateReminderData {
  title: string
  description: string
  dueDate: string
  petId?: string
  userId: string
  type: 'feeding' | 'medication' | 'vet' | 'grooming' | 'exercise' | 'training' | 'other'
  recurring?: boolean
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: 'low' | 'medium' | 'high'
  notificationEnabled?: boolean
}

export interface UpdateReminderData {
  title?: string
  description?: string
  dueDate?: string
  type?: 'feeding' | 'medication' | 'vet' | 'grooming' | 'exercise' | 'training' | 'other'
  recurring?: boolean
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  notificationEnabled?: boolean
}

export class RemindersService {
  /**
   * Get reminders by user ID
   * @param userId - The ID of the user to get reminders for
   * @returns Promise<Reminder[]>
   */
  static async getRemindersByUserId(userId: string): Promise<Reminder[]> {
    try {
      const response = await apiService.get(`/reminders/viewById/${userId}`)
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching reminders:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch reminders')
    }
  }

  /**
   * Add a new reminder
   * @param reminderData - The reminder data to add
   * @returns Promise<Reminder>
   */
  static async addReminder(reminderData: CreateReminderData): Promise<Reminder> {
    try {
      const response = await apiService.post('/reminders/addNew', {
        ...reminderData,
        completed: false
      })
      return response.data as Reminder
    } catch (error: any) {
      console.error('Error adding reminder:', error)
      throw new Error(error.response?.data?.message || 'Failed to add reminder')
    }
  }

  /**
   * Mark reminder as completed
   * @param reminderId - The ID of the reminder to mark as completed
   * @returns Promise<Reminder>
   */
  static async markReminderCompleted(reminderId: string): Promise<Reminder> {
    try {
      const response = await apiService.put(`/reminders/markCompleted/${reminderId}`, { completed: true })
      return response.data as Reminder
    } catch (error: any) {
      console.error('Error marking reminder as completed:', error)
      throw new Error(error.response?.data?.message || 'Failed to mark reminder as completed')
    }
  }

  /**
   * Update reminder
   * @param reminderId - The ID of the reminder to update
   * @param updateData - The data to update
   * @returns Promise<Reminder>
   */
  static async updateReminder(reminderId: string, updateData: UpdateReminderData): Promise<Reminder> {
    try {
      const response = await apiService.put(`/reminders/update/${reminderId}`, updateData)
      return response.data as Reminder
    } catch (error: any) {
      console.error('Error updating reminder:', error)
      throw new Error(error.response?.data?.message || 'Failed to update reminder')
    }
  }

  /**
   * Delete reminder
   * @param reminderId - The ID of the reminder to delete
   * @returns Promise<{ message: string }>
   */
  static async deleteReminder(reminderId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/reminders/delete/${reminderId}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting reminder:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete reminder')
    }
  }

  /**
   * Get all reminders (admin function)
   * @returns Promise<Reminder[]>
   */
  static async getAllReminders(): Promise<Reminder[]> {
    try {
      const response = await apiService.get('/reminders/viewAll')
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching all reminders:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch all reminders')
    }
  }

  /**
   * Get reminders by pet ID
   * @param petId - The ID of the pet to get reminders for
   * @returns Promise<Reminder[]>
   */
  static async getRemindersByPetId(petId: string): Promise<Reminder[]> {
    try {
      const response = await apiService.get(`/reminders/viewByPet/${petId}`)
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching reminders by pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch reminders for pet')
    }
  }

  /**
   * Get overdue reminders
   * @param userId - Optional user ID to filter by
   * @returns Promise<Reminder[]>
   */
  static async getOverdueReminders(userId?: string): Promise<Reminder[]> {
    try {
      const endpoint = userId 
        ? `/reminders/overdue/${userId}` 
        : '/reminders/overdue'
      const response = await apiService.get(endpoint)
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching overdue reminders:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue reminders')
    }
  }

  /**
   * Get upcoming reminders
   * @param userId - Optional user ID to filter by
   * @param days - Number of days to look ahead (default: 7)
   * @returns Promise<Reminder[]>
   */
  static async getUpcomingReminders(userId?: string, days: number = 7): Promise<Reminder[]> {
    try {
      const endpoint = userId 
        ? `/reminders/upcoming/${userId}?days=${days}` 
        : `/reminders/upcoming?days=${days}`
      const response = await apiService.get(endpoint)
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching upcoming reminders:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming reminders')
    }
  }

  /**
   * Get reminders by type
   * @param type - The type of reminder to filter by
   * @param userId - Optional user ID to filter by
   * @returns Promise<Reminder[]>
   */
  static async getRemindersByType(type: Reminder['type'], userId?: string): Promise<Reminder[]> {
    try {
      const endpoint = userId 
        ? `/reminders/viewByType/${type}/${userId}` 
        : `/reminders/viewByType/${type}`
      const response = await apiService.get(endpoint)
      return response.data as Reminder[]
    } catch (error: any) {
      console.error('Error fetching reminders by type:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch reminders by type')
    }
  }

  /**
   * Snooze reminder (reschedule to later date)
   * @param reminderId - The ID of the reminder to snooze
   * @param snoozeUntil - The new due date
   * @returns Promise<Reminder>
   */
  static async snoozeReminder(reminderId: string, snoozeUntil: string): Promise<Reminder> {
    try {
      const response = await apiService.patch(`/reminders/snooze/${reminderId}`, { dueDate: snoozeUntil })
      return response.data as Reminder
    } catch (error: any) {
      console.error('Error snoozing reminder:', error)
      throw new Error(error.response?.data?.message || 'Failed to snooze reminder')
    }
  }
}

export default RemindersService