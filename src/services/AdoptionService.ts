import { API_CONFIG, apiCall } from '../config/api';

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  userId: string;
  status: string;
  statusDisplay: string;
  applicationDate: string;
  lastUpdated: string;
  shelterName: string;
  progress: {
    step: number;
    totalSteps: number;
    completedSteps: string[];
    nextStep: string;
  };
}

export interface AdoptionHistory {
  adoption: AdoptionApplication;
  timeline: any[];
  documents: any[];
  nextSteps: string[];
}

export class AdoptionService {
  /**
   * Get adoption history for a specific adoption
   */
  static async getAdoptionHistory(adoptionId: string, userId: string) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.adoption.HISTORY(adoptionId)}?userId=${userId}`;
      
      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch adoption history' };
    } catch (error) {
      console.error('Error fetching adoption history:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get adoption tracker (all user's applications)
   */
  static async getAdoptionTracker(userId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.adoption.TRACKER}?userId=${userId}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          applications: response.data.applications || [],
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch adoption tracker' };
    } catch (error) {
      console.error('Error fetching adoption tracker:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Submit adoption application
   */
  static async submitApplication(applicationData: {
    petId: string;
    userId: string;
    personalInfo: any;
    livingInfo: any;
    petExperience: any;
    references: any;
  }) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.adoption.APPLICATION, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      if (response.success) {
        return {
          success: true,
          applicationId: response.data.applicationId,
          application: response.data.application,
        };
      }
      
      return { success: false, error: response.error || 'Failed to submit application' };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get application list
   */
  static async getApplicationList(userId: string, filters?: { status?: string }) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.adoption.LIST_APPLICATIONS}?userId=${userId}`;
      
      if (filters?.status) {
        endpoint += `&status=${filters.status}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          applications: response.data.applications || [],
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch applications' };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get application details
   */
  static async getApplicationDetails(applicationId: string, userId: string) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.adoption.APPLICATION_DETAILS(applicationId)}?userId=${userId}`;

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          application: response.data.application,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch application details' };
    } catch (error) {
      console.error('Error fetching application details:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update application status (for admin)
   */
  static async updateApplicationStatus(applicationId: string, status: string, adminId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.adoption.APPLICATION_DETAILS(applicationId), {
        method: 'PATCH',
        body: JSON.stringify({ status, adminId }),
      });

      if (response.success) {
        return {
          success: true,
          application: response.data.application,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update application status' };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}