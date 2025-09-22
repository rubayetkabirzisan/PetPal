import { API_CONFIG, apiCall } from '../config/api';

export interface PetLocation {
  petId: string;
  petName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  batteryLevel: number;
  signalStrength: string;
  isInSafeZone: boolean;
  lastUpdate: string;
}

export interface SafeZone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  isActive: boolean;
}

export interface LocationAnalytics {
  petId: string;
  petName: string;
  distanceTraveled: number;
  batteryLevel: number;
  signalStrength: string;
  locationCount: number;
  lastUpdate: string;
}

export class LocationService {
  /**
   * Get current pet location
   */
  static async getPetLocation(petId: string, userId: string) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.GPS.LOCATION(petId)}?userId=${userId}`;

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          location: response.data.location,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch pet location' };
    } catch (error) {
      console.error('Error fetching pet location:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Update pet location
   */
  static async updatePetLocation(petId: string, locationData: {
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    signalStrength?: string;
    userId: string;
  }) {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.GPS.UPDATE_LOCATION(petId), {
        method: 'PUT',
        body: JSON.stringify(locationData),
      });

      if (response.success) {
        return {
          success: true,
          location: response.data.location,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update pet location' };
    } catch (error) {
      console.error('Error updating pet location:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get location analytics
   */
  static async getLocationAnalytics(userId: string, period: string = '7d') {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.GPS.ANALYTICS(userId)}?period=${period}`;

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          summary: response.data.summary,
          petAnalytics: response.data.petAnalytics || [],
          period: response.data.period,
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch location analytics' };
    } catch (error) {
      console.error('Error fetching location analytics:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Get safe zones for a pet
   */
  static async getSafeZones(petId: string, userId: string) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.GPS.SAFE_ZONE(petId)}?userId=${userId}`;

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          safeZones: response.data.safeZones || [],
        };
      }
      
      return { success: false, error: response.error || 'Failed to fetch safe zones' };
    } catch (error) {
      console.error('Error fetching safe zones:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Create or update safe zone
   */
  static async updateSafeZone(petId: string, safeZoneData: {
    name: string;
    centerLat: number;
    centerLng: number;
    radius: number;
    isActive: boolean;
    userId: string;
    safeZoneId?: string;
  }) {
    try {
      const method = safeZoneData.safeZoneId ? 'PUT' : 'POST';
      const response = await apiCall(API_CONFIG.ENDPOINTS.GPS.SAFE_ZONE(petId), {
        method,
        body: JSON.stringify(safeZoneData),
      });

      if (response.success) {
        return {
          success: true,
          safeZone: response.data.safeZone,
        };
      }
      
      return { success: false, error: response.error || 'Failed to update safe zone' };
    } catch (error) {
      console.error('Error updating safe zone:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  /**
   * Delete safe zone
   */
  static async deleteSafeZone(petId: string, safeZoneId: string, userId: string) {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.GPS.SAFE_ZONE(petId)}/${safeZoneId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      });

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return { success: false, error: response.error || 'Failed to delete safe zone' };
    } catch (error) {
      console.error('Error deleting safe zone:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }
}