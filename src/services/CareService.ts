import { API_CONFIG, apiCall } from '../config/api';

export interface CareEntry {
  _id?: string;
  id?: string;
  petId: string;
  userId: string;
  title: string;
  type: 'feeding' | 'medication' | 'exercise' | 'grooming' | 'vet_visit' | 'vaccination' | 'behavior' | 'other';
  description: string;
  date: Date;
  
  // Type-specific fields
  feeding?: {
    foodType: string;
    amount: string;
    notes?: string;
  };
  
  medication?: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration?: string;
    veterinarian?: string;
    notes?: string;
  };
  
  exercise?: {
    activity: string;
    duration: number; // in minutes
    location?: string;
    notes?: string;
  };
  
  grooming?: {
    service: string;
    location?: string;
    cost?: number;
    notes?: string;
  };
  
  vetVisit?: {
    veterinarian: string;
    clinic: string;
    reason: string;
    diagnosis?: string;
    treatment?: string;
    followUpDate?: Date;
    cost?: number;
    notes?: string;
  };
  
  vaccination?: {
    vaccineName: string;
    veterinarian: string;
    clinic: string;
    nextDueDate?: Date;
    batchNumber?: string;
    notes?: string;
  };
  
  // Attachments
  attachments?: {
    type: 'image' | 'document' | 'video';
    url: string;
    filename: string;
    size: number;
  }[];
  
  // Status and tracking
  isImportant: boolean;
  tags: string[];
  
  // Pet details (populated)
  pet?: {
    name: string;
    type: string;
    breed: string;
    images: string[];
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CareResponse {
  success: boolean;
  data?: {
    entry?: CareEntry;
    entries?: CareEntry[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    statistics?: {
      totalEntries: number;
      entriesByType: { [key: string]: number };
      recentEntries: CareEntry[];
      upcomingReminders: any[];
    };
  };
  message?: string;
  error?: string;
}

export interface CreateCareEntryData {
  petId: string;
  userId: string;
  title: string;
  type: CareEntry['type'];
  description: string;
  date: Date;
  feeding?: CareEntry['feeding'];
  medication?: CareEntry['medication'];
  exercise?: CareEntry['exercise'];
  grooming?: CareEntry['grooming'];
  vetVisit?: CareEntry['vetVisit'];
  vaccination?: CareEntry['vaccination'];
  attachments?: CareEntry['attachments'];
  isImportant?: boolean;
  tags?: string[];
}

class CareService {
  /**
   * Get care journal entries
   */
  async getCareEntries(params: {
    userId: string;
    petId?: string;
    type?: CareEntry['type'];
    startDate?: Date;
    endDate?: Date;
    isImportant?: boolean;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'createdAt' | 'type';
    sortOrder?: 'asc' | 'desc';
  }): Promise<CareResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId);
      
      if (params.petId) queryParams.append('petId', params.petId);
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params.isImportant !== undefined) queryParams.append('isImportant', params.isImportant.toString());
      if (params.tags) {
        params.tags.forEach(tag => queryParams.append('tags[]', tag));
      }
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.JOURNAL}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get care entries error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get care entries',
      };
    }
  }

  /**
   * Get a specific care entry
   */
  async getCareEntry(entryId: string, userId: string): Promise<CareResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.JOURNAL_ENTRY(entryId)}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get care entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get care entry',
      };
    }
  }

  /**
   * Create a new care entry
   */
  async createCareEntry(entryData: CreateCareEntryData): Promise<CareResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.ADD_ENTRY, {
        method: 'POST',
        body: JSON.stringify(entryData),
      });

      return response;
    } catch (error) {
      console.error('Create care entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create care entry',
      };
    }
  }

  /**
   * Update a care entry
   */
  async updateCareEntry(entryId: string, updateData: Partial<CreateCareEntryData>): Promise<CareResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CARE.UPDATE_ENTRY(entryId), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update care entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update care entry',
      };
    }
  }

  /**
   * Delete a care entry
   */
  async deleteCareEntry(entryId: string, userId: string): Promise<CareResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.DELETE_ENTRY(entryId)}?userId=${userId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete care entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete care entry',
      };
    }
  }

  /**
   * Get care statistics
   */
  async getCareStatistics(userId: string, params?: {
    petId?: string;
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<CareResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.JOURNAL}/statistics?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get care statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get care statistics',
      };
    }
  }

  /**
   * Upload attachment for care entry
   */
  async uploadAttachment(entryId: string, data: {
    userId: string;
    file: File;
    type: 'image' | 'document' | 'video';
  }): Promise<CareResponse> {
    try {
      const formData = new FormData();
      formData.append('userId', data.userId);
      formData.append('file', data.file);
      formData.append('type', data.type);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.JOURNAL_ENTRY(entryId)}/attachment`, {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it for FormData
        },
      });

      return response;
    } catch (error) {
      console.error('Upload attachment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload attachment',
      };
    }
  }

  /**
   * Search care entries
   */
  async searchCareEntries(params: {
    userId: string;
    query: string;
    petId?: string;
    type?: CareEntry['type'];
    limit?: number;
  }): Promise<CareResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId);
      queryParams.append('q', params.query);
      
      if (params.petId) queryParams.append('petId', params.petId);
      if (params.type) queryParams.append('type', params.type);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CARE.JOURNAL}/search?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Search care entries error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search care entries',
      };
    }
  }
}

export default new CareService();
