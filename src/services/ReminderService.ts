import { API_CONFIG, apiCall } from '../config/api';

export interface Reminder {
  _id?: string;
  id?: string;
  userId: string;
  petId: string;
  title: string;
  description?: string;
  type: 'medication' | 'vaccination' | 'vet_appointment' | 'grooming' | 'feeding' | 'exercise' | 'other';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  
  // Recurrence settings
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
    daysOfWeek?: number[]; // 0-6, Sunday to Saturday
    endDate?: Date;
    maxOccurrences?: number;
  };
  
  // Notification settings
  notifications: {
    enabled: boolean;
    reminderTimes: number[]; // minutes before due date
    pushNotification: boolean;
    emailNotification: boolean;
  };
  
  // Additional details based on type
  medication?: {
    medicationName: string;
    dosage: string;
    instructions?: string;
  };
  
  vaccination?: {
    vaccineName: string;
    veterinarian?: string;
    clinic?: string;
  };
  
  vetAppointment?: {
    veterinarian: string;
    clinic: string;
    address?: string;
    phone?: string;
    reason?: string;
  };
  
  grooming?: {
    service: string;
    location?: string;
    phone?: string;
  };
  
  // Priority and status
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  tags: string[];
  
  // Pet details (populated)
  pet?: {
    name: string;
    type: string;
    breed: string;
    images: string[];
  };
  
  // Next occurrence for recurring reminders
  nextOccurrence?: Date;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReminderResponse {
  success: boolean;
  data?: {
    reminder?: Reminder;
    reminders?: Reminder[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    statistics?: {
      total: number;
      completed: number;
      overdue: number;
      upcoming: number;
      completionRate: number;
      remindersByType: { [key: string]: number };
    };
  };
  message?: string;
  error?: string;
}

export interface CreateReminderData {
  userId: string;
  petId: string;
  title: string;
  description?: string;
  type: Reminder['type'];
  dueDate: Date;
  isRecurring?: boolean;
  recurrence?: Reminder['recurrence'];
  notifications?: Reminder['notifications'];
  medication?: Reminder['medication'];
  vaccination?: Reminder['vaccination'];
  vetAppointment?: Reminder['vetAppointment'];
  grooming?: Reminder['grooming'];
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  tags?: string[];
}

class ReminderService {
  /**
   * Get all reminders for a user
   */
  async getReminders(params: {
    userId: string;
    petId?: string;
    type?: Reminder['type'];
    completed?: boolean;
    overdue?: boolean;
    upcoming?: boolean;
    priority?: Reminder['priority'];
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'dueDate' | 'createdAt' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReminderResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId);
      
      if (params.petId) queryParams.append('petId', params.petId);
      if (params.type) queryParams.append('type', params.type);
      if (params.completed !== undefined) queryParams.append('completed', params.completed.toString());
      if (params.overdue !== undefined) queryParams.append('overdue', params.overdue.toString());
      if (params.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params.tags) {
        params.tags.forEach(tag => queryParams.append('tags[]', tag));
      }
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get reminders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reminders',
      };
    }
  }

  /**
   * Get a specific reminder
   */
  async getReminder(reminderId: string, userId: string): Promise<ReminderResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.UPDATE(reminderId)}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reminder',
      };
    }
  }

  /**
   * Create a new reminder
   */
  async createReminder(reminderData: CreateReminderData): Promise<ReminderResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.REMINDERS.CREATE, {
        method: 'POST',
        body: JSON.stringify(reminderData),
      });

      return response;
    } catch (error) {
      console.error('Create reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create reminder',
      };
    }
  }

  /**
   * Update a reminder
   */
  async updateReminder(reminderId: string, updateData: Partial<CreateReminderData>): Promise<ReminderResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.REMINDERS.UPDATE(reminderId), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update reminder',
      };
    }
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId: string, userId: string): Promise<ReminderResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.DELETE(reminderId)}?userId=${userId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete reminder',
      };
    }
  }

  /**
   * Mark reminder as completed
   */
  async markCompleted(reminderId: string, userId: string, completedAt?: Date): Promise<ReminderResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.REMINDERS.MARK_COMPLETE(reminderId), {
        method: 'PUT',
        body: JSON.stringify({ 
          userId, 
          completedAt: completedAt || new Date() 
        }),
      });

      return response;
    } catch (error) {
      console.error('Mark reminder completed error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark reminder as completed',
      };
    }
  }

  /**
   * Get overdue reminders
   */
  async getOverdueReminders(userId: string, params?: {
    petId?: string;
    type?: Reminder['type'];
    limit?: number;
  }): Promise<ReminderResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      queryParams.append('overdue', 'true');
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get overdue reminders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get overdue reminders',
      };
    }
  }

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(userId: string, params?: {
    petId?: string;
    type?: Reminder['type'];
    days?: number; // next X days
    limit?: number;
  }): Promise<ReminderResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      queryParams.append('upcoming', 'true');
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.days) queryParams.append('days', params.days.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get upcoming reminders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get upcoming reminders',
      };
    }
  }

  /**
   * Get reminder statistics
   */
  async getReminderStatistics(userId: string, params?: {
    petId?: string;
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<ReminderResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.LIST}/statistics?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get reminder statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reminder statistics',
      };
    }
  }

  /**
   * Snooze a reminder
   */
  async snoozeReminder(reminderId: string, userId: string, snoozeUntil: Date): Promise<ReminderResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.UPDATE(reminderId)}/snooze`, {
        method: 'PUT',
        body: JSON.stringify({ userId, snoozeUntil }),
      });

      return response;
    } catch (error) {
      console.error('Snooze reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to snooze reminder',
      };
    }
  }

  /**
   * Batch update reminders
   */
  async batchUpdateReminders(data: {
    userId: string;
    reminderIds: string[];
    updates: {
      completed?: boolean;
      priority?: Reminder['priority'];
      tags?: string[];
    };
  }): Promise<ReminderResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.REMINDERS.LIST}/batch-update`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Batch update reminders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch update reminders',
      };
    }
  }
}

export default new ReminderService();
