import { API_CONFIG, apiCall } from '../config/api';

export interface Pet {
  _id?: string;
  id?: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  size: 'Small' | 'Medium' | 'Large';
  weight: string;
  color: string;
  description: string;
  personality: string[];
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  houseTrained: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;
  energyLevel: 'Low' | 'Medium' | 'High';
  medicalHistory?: string;
  specialNeeds?: string;
  adoptionFee: number;
  images: string[];
  healthRecords?: any[];
  status: 'available' | 'pending' | 'adopted' | 'unavailable';
  shelterId?: string;
  shelter?: {
    name: string;
    location: string;
    contact: string;
  };
  isFavorited?: boolean;
  applicationCount?: number;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PetFilter {
  type?: string;
  breed?: string;
  size?: string;
  age?: string;
  gender?: string;
  location?: string;
  adoptionFee?: {
    min?: number;
    max?: number;
  };
  personality?: string[];
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  energyLevel?: string;
}

export interface PetResponse {
  success: boolean;
  data?: {
    pet?: Pet;
    pets?: Pet[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
  };
  isFavorited?: boolean; // For toggleFavorite response
  message?: string;
  error?: string;
}

export interface BrowsePetsParams {
  page?: number;
  limit?: number;
  filter?: PetFilter;
  search?: string;
  sortBy?: 'name' | 'age' | 'adoptionFee' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class PetService {
  /**
   * Browse all pets with filtering and pagination
   */
  async browsePets(params: BrowsePetsParams = {}): Promise<PetResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (subValue !== undefined) {
                  if (subValue !== null) {
                    queryParams.append(`filter[${key}][${subKey}]`, subValue.toString());
                  }
                }
              });
            } else if (Array.isArray(value)) {
              value.forEach(item => {
                queryParams.append(`filter[${key}][]`, item.toString());
              });
            } else {
              queryParams.append(`filter[${key}]`, value.toString());
            }
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.PETS.BROWSE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Browse pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to browse pets',
      };
    }
  }

  /**
   * Get pet profile by ID
   */
  async getPetProfile(petId: string, userId?: string): Promise<PetResponse> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.PETS.PROFILE(petId)}${userId ? `?userId=${userId}` : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get pet profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pet profile',
      };
    }
  }

  /**
   * Search pets
   */
  async searchPets(query: string, filters?: PetFilter): Promise<PetResponse> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => params.append(`${key}[]`, item.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.PETS.SEARCH}?${params.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Search pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search pets',
      };
    }
  }

  /**
   * Toggle pet favorite status
   */
  async toggleFavorite(petId: string, userId: string): Promise<PetResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.PETS.TOGGLE_FAVORITE(petId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      return response;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      };
    }
  }

  /**
   * Get user's favorite pets
   */
  async getFavorites(userId: string): Promise<PetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.PETS.FAVORITES}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get favorites error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get favorites',
      };
    }
  }
}

export default new PetService();
