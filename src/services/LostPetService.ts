import { API_CONFIG, apiCall } from '../config/api';

export interface LostPet {
  _id?: string;
  id?: string;
  reporterId: string;
  petId?: string; // Optional if reporting someone else's lost pet
  
  // Basic information
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female' | 'unknown';
  
  // Physical description
  physicalDescription: {
    size: 'tiny' | 'small' | 'medium' | 'large' | 'extra_large';
    color: string;
    markings?: string;
    distinctiveFeatures?: string[];
    microchipped: boolean;
    microchipId?: string;
    collar?: {
      present: boolean;
      color?: string;
      type?: string;
      tags?: string;
    };
  };
  
  // Lost information
  lostDate: Date;
  lastSeenLocation: {
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
    radius?: number; // search radius in kilometers
  };
  
  circumstances: string;
  status: 'missing' | 'found' | 'sighted' | 'returned_home' | 'closed';
  
  // Contact information
  contact: {
    name: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
    preferredContactMethod: 'phone' | 'email' | 'text';
  };
  
  // Images and media
  images: string[];
  
  // Reward information
  reward?: {
    offered: boolean;
    amount?: number;
    description?: string;
  };
  
  // Behavioral information
  behavior?: {
    temperament: string;
    friendlyToStrangers: boolean;
    friendlyToAnimals: boolean;
    trainingLevel: 'none' | 'basic' | 'advanced';
    specialNeeds?: string;
    medicationRequired?: boolean;
    medications?: string[];
  };
  
  // Search efforts
  searchEfforts: Array<{
    type: 'flyers_posted' | 'social_media' | 'shelters_contacted' | 'vets_contacted' | 'neighbors_asked' | 'search_organized' | 'other';
    description: string;
    date: Date;
    location?: string;
    results?: string;
  }>;
  
  // Sightings
  sightings: Array<{
    _id?: string;
    reporterId: string;
    reporterName: string;
    reporterPhone?: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
      description?: string;
    };
    sightingDate: Date;
    reportedDate: Date;
    description: string;
    confidence: 'low' | 'medium' | 'high';
    images?: string[];
    verified: boolean;
    verifiedBy?: string;
    verifiedDate?: Date;
    followedUp: boolean;
    followUpNotes?: string;
  }>;
  
  // Found information
  foundInfo?: {
    foundDate: Date;
    foundLocation: {
      address: string;
      latitude: number;
      longitude: number;
      description?: string;
    };
    foundBy: {
      name: string;
      phone: string;
      email?: string;
    };
    condition: 'excellent' | 'good' | 'fair' | 'injured' | 'critical';
    veterinaryTreatment?: boolean;
    returnedToOwner: boolean;
    returnDate?: Date;
  };
  
  // Administrative
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes?: string;
  isActive: boolean;
  
  // Shelter information if applicable
  shelterInfo?: {
    shelterId: string;
    shelterName: string;
    intakeDate?: Date;
    kennel?: string;
    adoptionEligible?: boolean;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LostPetResponse {
  success: boolean;
  data?: {
    lostPet?: LostPet;
    lostPets?: LostPet[];
    sighting?: LostPet['sightings'][0];
    sightings?: LostPet['sightings'];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    statistics?: {
      total: number;
      active: number;
      found: number;
      returned: number;
      averageReturnTime: number;
      lostPetsByType: { [key: string]: number };
      sightingsByArea: { [key: string]: number };
      successRate: number;
    };
    nearbyLostPets?: Array<LostPet & { distance: number }>;
  };
  message?: string;
  error?: string;
}

export interface CreateLostPetData {
  reporterId: string;
  petId?: string;
  name: string;
  type: LostPet['type'];
  breed: string;
  age: number;
  weight: number;
  gender: LostPet['gender'];
  physicalDescription: LostPet['physicalDescription'];
  lostDate: Date;
  lastSeenLocation: LostPet['lastSeenLocation'];
  circumstances: string;
  contact: LostPet['contact'];
  images: string[];
  reward?: LostPet['reward'];
  behavior?: LostPet['behavior'];
  priority?: LostPet['priority'];
  tags?: string[];
  notes?: string;
}

export interface CreateSightingData {
  lostPetId: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  location: LostPet['sightings'][0]['location'];
  sightingDate: Date;
  description: string;
  confidence: LostPet['sightings'][0]['confidence'];
  images?: string[];
}

class LostPetService {
  /**
   * Report a lost pet
   */
  async reportLostPet(lostPetData: CreateLostPetData): Promise<LostPetResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.LOST_PETS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          ...lostPetData,
          status: 'missing',
          searchEfforts: [],
          sightings: [],
          isActive: true,
        }),
      });

      return response;
    } catch (error) {
      console.error('Report lost pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report lost pet',
      };
    }
  }

  /**
   * Get all lost pets
   */
  async getLostPets(params?: {
    type?: LostPet['type'];
    status?: LostPet['status'];
    location?: {
      latitude: number;
      longitude: number;
      radius: number; // in kilometers
    };
    lostDate?: {
      start?: Date;
      end?: Date;
    };
    reward?: boolean;
    microchipped?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'lostDate' | 'createdAt' | 'priority';
    sortOrder?: 'asc' | 'desc';
  }): Promise<LostPetResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) {
        queryParams.append('latitude', params.location.latitude.toString());
        queryParams.append('longitude', params.location.longitude.toString());
        queryParams.append('radius', params.location.radius.toString());
      }
      if (params?.lostDate?.start) queryParams.append('lostDateStart', params.lostDate.start.toISOString());
      if (params?.lostDate?.end) queryParams.append('lostDateEnd', params.lostDate.end.toISOString());
      if (params?.reward !== undefined) queryParams.append('reward', params.reward.toString());
      if (params?.microchipped !== undefined) queryParams.append('microchipped', params.microchipped.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.LIST}?${queryParams.toString()}`, {
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
   * Get a specific lost pet
   */
  async getLostPet(lostPetId: string): Promise<LostPetResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId), {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get lost pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lost pet',
      };
    }
  }

  /**
   * Update a lost pet report
   */
  async updateLostPet(lostPetId: string, updateData: Partial<CreateLostPetData & {
    status?: LostPet['status'];
    foundInfo?: LostPet['foundInfo'];
    shelterInfo?: LostPet['shelterInfo'];
    isActive?: boolean;
  }>): Promise<LostPetResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response;
    } catch (error) {
      console.error('Update lost pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lost pet',
      };
    }
  }

  /**
   * Report a sighting
   */
  async reportSighting(sightingData: CreateSightingData): Promise<LostPetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(sightingData.lostPetId)}/sightings`, {
        method: 'POST',
        body: JSON.stringify({
          ...sightingData,
          reportedDate: new Date(),
          verified: false,
          followedUp: false,
        }),
      });

      return response;
    } catch (error) {
      console.error('Report sighting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report sighting',
      };
    }
  }

  /**
   * Verify a sighting
   */
  async verifySighting(lostPetId: string, sightingId: string, verifierData: {
    verifiedBy: string;
    verified: boolean;
    notes?: string;
  }): Promise<LostPetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId)}/sightings/${sightingId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({
          ...verifierData,
          verifiedDate: new Date(),
        }),
      });

      return response;
    } catch (error) {
      console.error('Verify sighting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify sighting',
      };
    }
  }

  /**
   * Add search effort
   */
  async addSearchEffort(lostPetId: string, effort: {
    type: LostPet['searchEfforts'][0]['type'];
    description: string;
    location?: string;
    results?: string;
  }): Promise<LostPetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId)}/search-efforts`, {
        method: 'POST',
        body: JSON.stringify({
          ...effort,
          date: new Date(),
        }),
      });

      return response;
    } catch (error) {
      console.error('Add search effort error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add search effort',
      };
    }
  }

  /**
   * Mark pet as found
   */
  async markAsFound(lostPetId: string, foundInfo: LostPet['foundInfo']): Promise<LostPetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId)}/found`, {
        method: 'PUT',
        body: JSON.stringify({
          foundInfo,
          status: 'found',
        }),
      });

      return response;
    } catch (error) {
      console.error('Mark as found error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as found',
      };
    }
  }

  /**
   * Search lost pets
   */
  async searchLostPets(params: {
    query: string;
    filters?: {
      type?: LostPet['type'];
      breed?: string;
      color?: string;
      size?: LostPet['physicalDescription']['size'];
      location?: {
        latitude: number;
        longitude: number;
        radius: number;
      };
    };
    limit?: number;
  }): Promise<LostPetResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.query);
      
      if (params.filters?.type) queryParams.append('type', params.filters.type);
      if (params.filters?.breed) queryParams.append('breed', params.filters.breed);
      if (params.filters?.color) queryParams.append('color', params.filters.color);
      if (params.filters?.size) queryParams.append('size', params.filters.size);
      if (params.filters?.location) {
        queryParams.append('latitude', params.filters.location.latitude.toString());
        queryParams.append('longitude', params.filters.location.longitude.toString());
        queryParams.append('radius', params.filters.location.radius.toString());
      }
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.LIST}/search?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Search lost pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search lost pets',
      };
    }
  }

  /**
   * Get nearby lost pets
   */
  async getNearbyLostPets(params: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
    limit?: number;
  }): Promise<LostPetResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('latitude', params.latitude.toString());
      queryParams.append('longitude', params.longitude.toString());
      queryParams.append('radius', params.radius.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.LIST}/nearby?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get nearby lost pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nearby lost pets',
      };
    }
  }

  /**
   * Get lost pet statistics
   */
  async getLostPetStatistics(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    location?: string;
  }): Promise<LostPetResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.location) queryParams.append('location', params.location);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.LIST}/statistics?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get lost pet statistics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lost pet statistics',
      };
    }
  }

  /**
   * Get user's reported lost pets
   */
  async getUserLostPets(userId: string, params?: {
    status?: LostPet['status'];
    limit?: number;
  }): Promise<LostPetResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('reporterId', userId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.LIST}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get user lost pets error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user lost pets',
      };
    }
  }

  /**
   * Delete lost pet report
   */
  async deleteLostPet(lostPetId: string, userId: string): Promise<LostPetResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.DELETE(lostPetId)}?userId=${userId}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      console.error('Delete lost pet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete lost pet',
      };
    }
  }

  /**
   * Upload lost pet image
   */
  async uploadImage(lostPetId: string, imageFile: File | Blob): Promise<LostPetResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS.UPDATE(lostPetId)}/images`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
        },
      });

      return response;
    } catch (error) {
      console.error('Upload lost pet image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      };
    }
  }
}

export default new LostPetService();
