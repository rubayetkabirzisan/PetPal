import { API_CONFIG, apiCall } from '../config/api';
import { Pet } from './PetService';

export interface AdminDashboardStats {
  totalPets: number;
  totalApplications: number;
  totalUsers: number;
  pendingApplications: number;
  adoptedPets: number;
  availablePets: number;
  recentApplications: any[];
  recentPets: Pet[];
}

export interface AdminResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface PetFormData {
  userId: string;
  shelterId?: string;
  petData: Omit<Pet, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
}

class AdminService {
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(userId: string): Promise<AdminResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard stats',
      };
    }
  }

  /**
   * Get all pets for management
   */
  async getAllPets(adminId: string, params?: { page?: number; limit?: number; status?: string }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.PETS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get all pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pets',
      };
    }
  }

  /**
   * Add new pet
   */
  async addPet(petFormData: PetFormData): Promise<AdminResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ADMIN.ADD_PET, {
        method: 'POST',
        body: JSON.stringify(petFormData),
      });

      return response;
    } catch (error) {
      console.error('Add pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add pet',
      };
    }
  }

  /**
   * Update pet information
   */
  async updatePet(petId: string, petData: Partial<Pet>, userId: string): Promise<AdminResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ADMIN.EDIT_PET(petId), {
        method: 'PUT',
        body: JSON.stringify({ petData, userId }),
      });

      return response;
    } catch (error) {
      console.error('Update pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update pet',
      };
    }
  }

  /**
   * Delete pet
   */
  async deletePet(petId: string, adminId: string): Promise<AdminResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ADMIN.DELETE_PET(petId), {
        method: 'DELETE',
        body: JSON.stringify({ adminId }),
      });

      return response;
    } catch (error) {
      console.error('Delete pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete pet',
      };
    }
  }

  /**
   * Get all applications for admin review
   */
  async getAllApplications(adminId: string, params?: { status?: string; page?: number; limit?: number }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get all applications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get applications',
      };
    }
  }

  /**
   * Approve application
   */
  async approveApplication(applicationId: string, adminId: string, notes?: string): Promise<AdminResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS}/${applicationId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ adminId, notes }),
      });

      return response;
    } catch (error) {
      console.error('Approve application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve application',
      };
    }
  }

  /**
   * Reject application
   */
  async rejectApplication(applicationId: string, adminId: string, rejectionReason: string): Promise<AdminResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS}/${applicationId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ adminId, rejectionReason }),
      });

      return response;
    } catch (error) {
      console.error('Reject application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject application',
      };
    }
  }

  /**
   * Get all users for admin management
   */
  async getAllUsers(adminId: string, params?: { userType?: string; page?: number; limit?: number }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.userType) queryParams.append('userType', params.userType);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users',
      };
    }
  }

  /**
   * Get admin GPS tracking data
   */
  async getGPSTracking(adminId: string, params?: { petId?: string; period?: string }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.GPS_TRACKING}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get GPS tracking error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get GPS tracking data',
      };
    }
  }

  /**
   * Get admin lost pets
   */
  async getLostPets(adminId: string, params?: { status?: string; page?: number; limit?: number }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.LOST_PETS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get lost pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lost pets',
      };
    }
  }

  /**
   * Get admin notifications
   */
  async getNotifications(adminId: string, params?: { read?: boolean; page?: number; limit?: number }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.read !== undefined) queryParams.append('read', params.read.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS}?${queryParams.toString()}`, {
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
   * Get admin statistics
   */
  async getStatistics(adminId: string, params?: { period?: string; type?: string }): Promise<AdminResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('adminId', adminId);
      
      if (params?.period) queryParams.append('period', params.period);
      if (params?.type) queryParams.append('type', params.type);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ADMIN.STATISTICS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      };
    }
  }
}

export default new AdminService();
