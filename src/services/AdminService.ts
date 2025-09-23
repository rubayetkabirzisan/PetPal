import { API_CONFIG, apiCall } from '../config/api';

export interface AdminDashboardStats {
  totalPets: number;
  availablePets: number;
  adoptedPets: number;
  pendingApplications: number;
  totalAdopters: number;
  activeAdmins: number;
  monthlyAdoptions: number;
  recentActivity: any[];
}

export interface AdminPet {
  id: string;
  name: string;
  breed: string;
  age: number;
  status: string;
  dateAdded: string;
  lastUpdated: string;
  images: string[];
  adoptionFee: number;
  applicationCount: number;
}

export class AdminService {
  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(adminId: string) {
    try {
          const response = await apiCall(`${API_CONFIG.ENDPOINTS.admin.dashboard}?adminId=${adminId}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          stats: response.data.stats,
          recentActivity: response.data.recentActivity || [],
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch dashboard stats' };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get all pets (admin view)
   */
  static async getAdminPets(adminId: string, filters?: { status?: string; limit?: number }) {
    try {
          let endpoint = `${API_CONFIG.ENDPOINTS.admin.pets}?adminId=${adminId}`;
      
      if (filters?.status) {
        endpoint += `&status=${filters.status}`;
      }
      if (filters?.limit) {
        endpoint += `&limit=${filters.limit}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          pets: response.data.pets || [],
          totalCount: response.data.totalCount || 0,
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch admin pets' };
    } catch (error) {
      console.error('Error fetching admin pets:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Add new pet
   */
  static async addPet(petData: {
    name: string;
    breed: string;
    age: number;
    size: string;
    gender: string;
    description: string;
    adoptionFee: number;
    images: string[];
    healthRecords: any[];
    adminId: string;
  }) {
    try {
          const response = await apiCall(API_CONFIG.ENDPOINTS.admin.addPet, {
        method: 'POST',
        body: JSON.stringify(petData),
      });

      if (response.success) {
        return {
          success: true,
          pet: response.data.pet,
        };
      }
      
      return { success: false, error: response.error || 'Failed to add pet' };
    } catch (error) {
      console.error('Error adding pet:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update pet information
   */
  static async updatePet(petId: string, petData: Partial<AdminPet>, adminId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.admin.PETS}/${petId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...petData, adminId }),
      });

      if (response.success) {
        return {
          success: true,
          pet: response.data.pet,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update pet' };
    } catch (error) {
      console.error('Error updating pet:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Delete pet
   */
  static async deletePet(petId: string, adminId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.admin.PETS}/${petId}`, {
        method: 'DELETE',
        body: JSON.stringify({ adminId }),
      });

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return { success: false, error: response.error || 'Failed to delete pet' };
    } catch (error) {
      console.error('Error deleting pet:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get lost pets reports (admin view)
   */
  static async getLostPetsReports(adminId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.admin.LOST_PETS}?adminId=${adminId}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          reports: response.data.reports || [],
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch lost pets reports' };
    } catch (error) {
      console.error('Error fetching lost pets reports:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get all users (admin view)
   */
  static async getUsers(adminId: string, filters?: { userType?: string; status?: string }) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.admin.USERS}?adminId=${adminId}`;
      
      if (filters?.userType) {
        endpoint += `&userType=${filters.userType}`;
      }
      if (filters?.status) {
        endpoint += `&status=${filters.status}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          users: response.data.users || [],
          summary: response.data.summary,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch users' };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get adoption applications (admin view)
   */
  static async getAdminApplications(adminId: string, filters?: { status?: string; petId?: string }) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.admin.APPLICATIONS}?adminId=${adminId}`;
      
      if (filters?.status) {
        endpoint += `&status=${filters.status}`;
      }
      if (filters?.petId) {
        endpoint += `&petId=${filters.petId}`;
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
}