import { API_CONFIG, apiCall } from '../config/api';

export interface Application {
  _id?: string;
  id?: string;
  userId: string;
  petId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applicationDate: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  rejectionReason?: string;
  notes?: string;
  
  // Applicant information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Application details
  housingType: 'house' | 'apartment' | 'condo' | 'other';
  hasYard: boolean;
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  hasChildren: boolean;
  childrenAges?: string;
  experience: string;
  reasonForAdoption: string;
  activityLevel: string;
  timeAvailable: string;
  veterinarianContact?: {
    name: string;
    phone: string;
    clinic: string;
  };
  
  // References
  references: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
  
  // Pet and user details (populated)
  pet?: {
    name: string;
    type: string;
    breed: string;
    images: string[];
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdoptionResponse {
  success: boolean;
  data?: {
    application?: Application;
    applications?: Application[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    adoption?: any;
  };
  message?: string;
  error?: string;
}

export interface ApplicationFormData {
  userId: string;
  petId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  housingType: 'house' | 'apartment' | 'condo' | 'other';
  hasYard: boolean;
  hasOtherPets: boolean;
  otherPetsDetails?: string;
  hasChildren: boolean;
  childrenAges?: string;
  experience: string;
  reasonForAdoption: string;
  activityLevel: string;
  timeAvailable: string;
  veterinarianContact?: {
    name: string;
    phone: string;
    clinic: string;
  };
  references: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
}

class AdoptionService {
  /**
   * Submit a new adoption application
   */
  async submitApplication(applicationData: ApplicationFormData): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.APPLICATIONS.FORM, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      return response;
    } catch (error) {
      console.error('Submit application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application',
      };
    }
  }

  /**
   * Get all applications for a user
   */
  async getUserApplications(userId: string, params?: { status?: string; page?: number; limit?: number }): Promise<AdoptionResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.APPLICATIONS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get user applications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get applications',
      };
    }
  }

  /**
   * Get application details
   */
  async getApplicationDetails(applicationId: string, userId?: string): Promise<AdoptionResponse> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.APPLICATIONS.DETAILS(applicationId)}${userId ? `?userId=${userId}` : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get application details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get application details',
      };
    }
  }

  /**
   * Update application
   */
  async updateApplication(applicationId: string, updateData: Partial<ApplicationFormData>): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.APPLICATIONS.UPDATE(applicationId), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update application',
      };
    }
  }

  /**
   * Cancel application
   */
  async cancelApplication(applicationId: string, userId: string, reason?: string): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.APPLICATIONS.CANCEL(applicationId), {
        method: 'PUT',
        body: JSON.stringify({ userId, reason }),
      });

      return response;
    } catch (error) {
      console.error('Cancel application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel application',
      };
    }
  }

  /**
   * Get adoption history for a user
   */
  async getAdoptionHistory(userId: string, params?: { page?: number; limit?: number }): Promise<AdoptionResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.APPLICATIONS.HISTORY}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get adoption history error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get adoption history',
      };
    }
  }

  /**
   * Get specific adoption history item
   */
  async getAdoptionHistoryItem(adoptionId: string, userId: string): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.APPLICATIONS.HISTORY}/${adoptionId}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get adoption history item error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get adoption history item',
      };
    }
  }

  /**
   * Track application status
   */
  async trackApplication(applicationId: string, userId: string): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.APPLICATIONS.TRACKER}/${applicationId}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Track application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track application',
      };
    }
  }

  /**
   * Get application tracker for user
   */
  async getApplicationTracker(userId: string): Promise<AdoptionResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.APPLICATIONS.TRACKER}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get application tracker error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get application tracker',
      };
    }
  }

  /**
   * Get adoption statistics
   */
  async getAdoptionStats(userId?: string): Promise<AdoptionResponse> {
    try {
      const url = userId ? `/api/adoption-stats?userId=${userId}` : '/api/adoption-stats';
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get adoption stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get adoption stats',
      };
    }
  }
}

export default new AdoptionService();
