import { API_CONFIG, apiCall } from '../config/api';

export interface CareJournalEntry {
  id: string;
  title: string;
  petId: string;
  petName: string;
  type: string;
  description: string;
  date: string;
  images: string[];
  notes: string;
  veterinarianName?: string;
  cost?: number;
  nextAppointment?: string;
}

export interface Reminder {
  id: string;
  title: string;
  petId: string;
  petName: string;
  type: string;
  dueDate: string;
  completed: boolean;
  description: string;
  priority: string;
  recurring: boolean;
  recurringInterval?: string;
}

export interface ReminderStats {
  completed: number;
  overdue: number;
  upcoming: number;
  total: number;
}

export class CareService {
  /**
   * Get care journal entries
   */
  static async getCareJournal(userId: string, petId?: string) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.CARE.JOURNAL}?userId=${userId}`;
      if (petId) {
        endpoint += `&petId=${petId}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          entries: response.data.entries || [],
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch care journal' };
    } catch (error) {
      console.error('Error fetching care journal:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Add care journal entry
   */
  static async addCareEntry(entryData: {
    title: string;
    petId: string;
    type: string;
    description: string;
    date: string;
    images?: string[];
    notes?: string;
    veterinarianName?: string;
    cost?: number;
    nextAppointment?: string;
    userId: string;
  }) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.JOURNAL, {
        method: 'POST',
        body: JSON.stringify(entryData),
      });

      if (response.success) {
        return {
          success: true,
          entry: response.data.entry,
        };
      }
      
      return { success: false, error: response.error || 'Failed to add care entry' };
    } catch (error) {
      console.error('Error adding care entry:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update care journal entry
   */
  static async updateCareEntry(entryId: string, entryData: Partial<CareJournalEntry>, userId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.JOURNAL_ENTRY(entryId), {
        method: 'PUT',
        body: JSON.stringify({ ...entryData, userId }),
      });

      if (response.success) {
        return {
          success: true,
          entry: response.data.entry,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update care entry' };
    } catch (error) {
      console.error('Error updating care entry:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Delete care journal entry
   */
  static async deleteCareEntry(entryId: string, userId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.JOURNAL_ENTRY(entryId), {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return { success: false, error: response.error || 'Failed to delete care entry' };
    } catch (error) {
      console.error('Error deleting care entry:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get reminders
   */
  static async getReminders(userId: string, filters?: { petId?: string; completed?: boolean; type?: string }) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.CARE.REMINDERS}?userId=${userId}`;
      
      if (filters?.petId) {
        endpoint += `&petId=${filters.petId}`;
      }
      if (filters?.completed !== undefined) {
        endpoint += `&completed=${filters.completed}`;
      }
      if (filters?.type) {
        endpoint += `&type=${filters.type}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          reminders: response.data.reminders || [],
          statistics: response.data.statistics,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch reminders' };
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Add reminder
   */
  static async addReminder(reminderData: {
    title: string;
    petId: string;
    type: string;
    dueDate: string;
    description: string;
    priority: string;
    recurring: boolean;
    recurringInterval?: string;
    userId: string;
  }) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.REMINDERS, {
        method: 'POST',
        body: JSON.stringify(reminderData),
      });

      if (response.success) {
        return {
          success: true,
          reminder: response.data.reminder,
        };
      }
      
      return { success: false, error: response.error || 'Failed to add reminder' };
    } catch (error) {
      console.error('Error adding reminder:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update reminder
   */
  static async updateReminder(reminderId: string, reminderData: Partial<Reminder>, userId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.REMINDER(reminderId), {
        method: 'PUT',
        body: JSON.stringify({ ...reminderData, userId }),
      });

      if (response.success) {
        return {
          success: true,
          reminder: response.data.reminder,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update reminder' };
    } catch (error) {
      console.error('Error updating reminder:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Complete reminder
   */
  static async completeReminder(reminderId: string, userId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.REMINDER(reminderId)}/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (response.success) {
        return {
          success: true,
          reminder: response.data.reminder,
        };
      }
      
      return { success: false, error: response.error || 'Failed to complete reminder' };
    } catch (error) {
      console.error('Error completing reminder:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Delete reminder
   */
  static async deleteReminder(reminderId: string, userId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.REMINDER(reminderId), {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return { success: false, error: response.error || 'Failed to delete reminder' };
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}