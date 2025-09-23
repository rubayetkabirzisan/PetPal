import { API_CONFIG, apiCall } from '../config/api';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  gender: string;
  description: string;
  images: string[];
  status: string;
  adoptionFee: number;
  location: string;
  shelter: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  healthRecords: any[];
  isFavorited: boolean;
  applicationCount: number;
  viewCount: number;
}

export interface PetSearchFilters {
  breed?: string;
  size?: string;
  age?: string;
  gender?: string;
  location?: string;
  maxFee?: number;
}

export class PetService {
  /**
   * Get all available pets for adoption
   */
  static async getBrowsePets(userId?: string, filters?: PetSearchFilters) {
    try {
      let endpoint = API_CONFIG.ENDPOINTS.pets.BROWSE;
      
      // Add query parameters
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('userId', userId);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          pets: response.data.pets || [],
          totalCount: response.data.totalCount || 0,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch pets' };
    } catch (error) {
      console.error('Error fetching pets:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get detailed pet profile
   */
  static async getPetProfile(petId: string, userId?: string) {
    try {
      let endpoint = API_CONFIG.ENDPOINTS.pets.PROFILE(petId);
      if (userId) {
        endpoint += `?userId=${userId}`;
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          pet: response.data.pet,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch pet profile' };
    } catch (error) {
      console.error('Error fetching pet profile:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Search pets with filters
   */
  static async searchPets(query: string, filters?: PetSearchFilters, userId?: string) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (userId) queryParams.append('userId', userId);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.pets.SEARCH}?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          pets: response.data.pets || [],
          totalCount: response.data.totalCount || 0,
        };
      }
      
      return { success: false, error: response.error || 'Failed to search pets' };
    } catch (error) {
      console.error('Error searching pets:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Toggle pet favorite status
   */
  static async toggleFavorite(petId: string, userId: string) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.pets.TOGGLE_FAVORITE(petId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (response.success) {
        return {
          success: true,
          isFavorited: response.data.isFavorited,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update favorite status' };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get user's favorite pets
   */
  static async getFavorites(userId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.pets.FAVORITES}?userId=${userId}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          favorites: response.data.favorites || [],
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch favorites' };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}