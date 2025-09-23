import { API_CONFIG, apiCall } from '../config/api';

export interface EmergencyAction {
  _id?: string;
  id?: string;
  userId: string;
  petId: string;
  type: 'injury' | 'illness' | 'missing' | 'aggressive_behavior' | 'accident' | 'poisoning' | 'breathing_difficulty' | 'bleeding' | 'seizure' | 'other';
  
  // Basic information
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitoring' | 'escalated';
  
  // Emergency details
  symptoms: string[];
  circumstances: string;
  immediateActions: string[];
  
  // Location and timing
  location: {
    address?: string;
    latitude?: number;
    longitude?: number;
    type: 'home' | 'park' | 'vet_clinic' | 'road' | 'other';
  };
  
  emergencyTime: Date;
  reportedTime: Date;
  
  // Medical information
  medicalInfo?: {
    vitals?: {
      temperature?: number;
      heartRate?: number;
      respiratoryRate?: number;
      consciousness: 'alert' | 'lethargic' | 'unconscious';
    };
    medications?: string[];
    allergies?: string[];
    preExistingConditions?: string[];
  };
  
  // Contact information
  contacts: {
    veterinarian?: {
      name: string;
      phone: string;
      clinic: string;
      address?: string;
      isEmergency?: boolean;
    };
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    shelter?: {
      name: string;
      phone: string;
      address?: string;
    };
  };
  
  // Actions taken
  actionsTaken: Array<{
    action: string;
    time: Date;
    takenBy: string;
    outcome?: string;
    notes?: string;
  }>;
  
  // Follow-up information
  followUp?: {
    required: boolean;
    scheduledDate?: Date;
    type?: 'vet_visit' | 'monitoring' | 'medication' | 'behavioral';
    notes?: string;
  };
  
  // Media attachments
  attachments: Array<{
    type: 'photo' | 'video' | 'document';
    url: string;
    description?: string;
    timestamp: Date;
  }>;
  
  // Resolution
  resolution?: {
    outcome: 'recovered' | 'referred_to_vet' | 'hospitalized' | 'ongoing_treatment' | 'other';
    details?: string;
    finalDiagnosis?: string;
    treatment?: string;
    resolvedAt?: Date;
  };
  
  // Pet details (populated)
  pet?: {
    name: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    images: string[];
  };
  
  // Priority and urgency
  priority: number; // 1-10, 10 being most urgent
  tags: string[];
  notes?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmergencyResponse {
  success: boolean;
  data?: {
    emergency?: EmergencyAction;
    emergencies?: EmergencyAction[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    statistics?: {
      total: number;
      active: number;
      resolved: number;
      critical: number;
      averageResolutionTime: number;
      emergenciesByType: { [key: string]: number };
      emergenciesBySeverity: { [key: string]: number };
    };
    insights?: {
      commonSymptoms: string[];
      frequentLocations: string[];
      peakTimes: Array<{ hour: number; count: number }>;
      recommendations: string[];
    };
  };
  message?: string;
  error?: string;
}

export interface CreateEmergencyData {
  userId: string;
  petId: string;
  type: EmergencyAction['type'];
  title: string;
  description: string;
  severity: EmergencyAction['severity'];
  symptoms: string[];
  circumstances: string;
  immediateActions: string[];
  location: EmergencyAction['location'];
  emergencyTime: Date;
  medicalInfo?: EmergencyAction['medicalInfo'];
  contacts: EmergencyAction['contacts'];
  attachments?: EmergencyAction['attachments'];
  priority?: number;
  tags?: string[];
  notes?: string;
}

class EmergencyService {
  /**
   * Report a new emergency
   */
  async reportEmergency(emergencyData: CreateEmergencyData): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.EMERGENCY.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          ...emergencyData,
          reportedTime: new Date(),
          status: 'active',
          actionsTaken: [],
        }),
      });

      return response;
    } catch (error) {
      console.error('Report emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report emergency',
      };
    }
  }

  /**
   * Get all emergency actions for a user
   */
  async getEmergencyActions(params: {
    userId: string;
    petId?: string;
    type?: EmergencyAction['type'];
    severity?: EmergencyAction['severity'];
    status?: EmergencyAction['status'];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: 'emergencyTime' | 'reportedTime' | 'severity' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<EmergencyResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId);
      
      if (params.petId) queryParams.append('petId', params.petId);
      if (params.type) queryParams.append('type', params.type);
      if (params.severity) queryParams.append('severity', params.severity);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get emergency actions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get emergency actions',
      };
    }
  }

  /**
   * Get a specific emergency action
   */
  async getEmergencyAction(emergencyId: string, userId: string): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE(emergencyId)}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get emergency action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get emergency action',
      };
    }
  }

  /**
   * Update an emergency action
   */
  async updateEmergencyAction(emergencyId: string, updateData: Partial<CreateEmergencyData & {
    status?: EmergencyAction['status'];
    actionsTaken?: EmergencyAction['actionsTaken'];
    followUp?: EmergencyAction['followUp'];
    resolution?: EmergencyAction['resolution'];
  }>): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE(emergencyId), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update emergency action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update emergency action',
      };
    }
  }

  /**
   * Add action taken to emergency
   */
  async addActionTaken(emergencyId: string, action: {
    action: string;
    takenBy: string;
    outcome?: string;
    notes?: string;
  }): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE(emergencyId)}/actions`, {
        method: 'POST',
        body: JSON.stringify({
          ...action,
          time: new Date(),
        }),
      });

      return response;
    } catch (error) {
      console.error('Add action taken error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add action taken',
      };
    }
  }

  /**
   * Upload emergency attachment
   */
  async uploadAttachment(emergencyId: string, attachment: {
    file: File | Blob;
    type: 'photo' | 'video' | 'document';
    description?: string;
  }): Promise<EmergencyResponse> {
    try {
      const formData = new FormData();
      formData.append('file', attachment.file);
      formData.append('type', attachment.type);
      if (attachment.description) {
        formData.append('description', attachment.description);
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE(emergencyId)}/attachments`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
        },
      });

      return response;
    } catch (error) {
      console.error('Upload emergency attachment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload attachment',
      };
    }
  }

  /**
   * Resolve emergency
   */
  async resolveEmergency(emergencyId: string, resolution: EmergencyAction['resolution']): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE(emergencyId)}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          ...resolution,
          resolvedAt: new Date(),
        }),
      });

      return response;
    } catch (error) {
      console.error('Resolve emergency error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve emergency',
      };
    }
  }

  /**
   * Get active emergencies
   */
  async getActiveEmergencies(userId: string, params?: {
    severity?: EmergencyAction['severity'];
    petId?: string;
    limit?: number;
  }): Promise<EmergencyResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      queryParams.append('status', 'active');
      
      if (params?.severity) queryParams.append('severity', params.severity);
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get active emergencies error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active emergencies',
      };
    }
  }

  /**
   * Get emergency statistics
   */
  async getEmergencyStatistics(userId: string, params?: {
    petId?: string;
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<EmergencyResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.LIST}/statistics?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get emergency statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get emergency statistics',
      };
    }
  }

  /**
   * Get emergency insights
   */
  async getEmergencyInsights(userId: string, params?: {
    petId?: string;
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<EmergencyResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.LIST}/insights?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get emergency insights error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get emergency insights',
      };
    }
  }

  /**
   * Delete emergency action
   */
  async deleteEmergencyAction(emergencyId: string, userId: string): Promise<EmergencyResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.DELETE(emergencyId)}?userId=${userId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete emergency action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete emergency action',
      };
    }
  }

  /**
   * Search emergency actions
   */
  async searchEmergencyActions(params: {
    userId: string;
    query: string;
    filters?: {
      type?: EmergencyAction['type'];
      severity?: EmergencyAction['severity'];
      status?: EmergencyAction['status'];
      petId?: string;
    };
    limit?: number;
  }): Promise<EmergencyResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId);
      queryParams.append('q', params.query);
      
      if (params.filters?.type) queryParams.append('type', params.filters.type);
      if (params.filters?.severity) queryParams.append('severity', params.filters.severity);
      if (params.filters?.status) queryParams.append('status', params.filters.status);
      if (params.filters?.petId) queryParams.append('petId', params.filters.petId);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EMERGENCY.LIST}/search?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Search emergency actions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search emergency actions',
      };
    }
  }
}

export default new EmergencyService();
