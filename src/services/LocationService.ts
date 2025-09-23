import { API_CONFIG, apiCall } from '../config/api';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface GPSTracking {
  _id?: string;
  id?: string;
  petId: string;
  userId: string;
  deviceId: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  batteryLevel: number;
  signalStrength: number;
  isInsideSafeZone: boolean;
  safeZoneId?: string;
  timestamp: Date;
  createdAt?: Date;
}

export interface SafeZone {
  _id?: string;
  id?: string;
  petId: string;
  userId: string;
  name: string;
  center: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  radius: number; // in meters
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationResponse {
  success: boolean;
  data?: {
    location?: GPSTracking;
    locations?: GPSTracking[];
    safeZone?: SafeZone;
    safeZones?: SafeZone[];
    analytics?: any;
    summary?: any;
    petAnalytics?: any[];
    period?: string;
  };
  message?: string;
  error?: string;
}

export interface LocationAnalytics {
  totalPets: number;
  activeTrackers: number;
  lowBatteryTrackers: number;
  totalDistanceTraveled: number;
  averageAccuracy: number;
  petAnalytics: {
    petId: string;
    petName: string;
    distanceTraveled: number;
    batteryLevel: number;
    signalStrength: number;
    locationCount: number;
    lastUpdate: Date;
  }[];
}

class LocationService {
  /**
   * Get current location for a pet
   */
  async getPetLocation(petId: string, userId?: string): Promise<LocationResponse> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.GPS.LOCATION(petId)}${userId ? `?userId=${userId}` : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get pet location error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pet location',
      };
    }
  }

  /**
   * Update pet location
   */
  async updatePetLocation(petId: string, locationData: {
    userId: string;
    deviceId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    batteryLevel: number;
    signalStrength: number;
  }): Promise<LocationResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.GPS.UPDATE_LOCATION(petId), {
        method: 'PUT',
        body: JSON.stringify(locationData),
      });

      return response;
    } catch (error) {
      console.error('Update pet location error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update pet location',
      };
    }
  }

  /**
   * Get location history for a pet
   */
  async getLocationHistory(petId: string, params?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<LocationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${API_CONFIG.ENDPOINTS.GPS.HISTORY}/${petId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get location history error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location history',
      };
    }
  }

  /**
   * Get GPS tracking data for admin or user
   */
  async getGPSTracking(userId: string, params?: {
    petId?: string;
    period?: string;
    isAdmin?: boolean;
  }): Promise<LocationResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.period) queryParams.append('period', params.period);
      if (params?.isAdmin) queryParams.append('isAdmin', params.isAdmin.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.GPS.TRACKING}?${queryParams.toString()}`, {
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
   * Get location analytics
   */
  async getLocationAnalytics(userId: string, params?: {
    period?: '1d' | '7d' | '30d' | '90d';
    petId?: string;
  }): Promise<LocationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.petId) queryParams.append('petId', params.petId);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.GPS.ANALYTICS(userId)}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get location analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location analytics',
      };
    }
  }

  /**
   * Get safe zone for a pet
   */
  async getSafeZone(petId: string, userId?: string): Promise<LocationResponse> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.GPS.SAFE_ZONE(petId)}${userId ? `?userId=${userId}` : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get safe zone error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get safe zone',
      };
    }
  }

  /**
   * Update safe zone for a pet
   */
  async updateSafeZone(petId: string, safeZoneData: {
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
    description?: string;
  }): Promise<LocationResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.GPS.UPDATE_SAFE_ZONE(petId), {
        method: 'PUT',
        body: JSON.stringify(safeZoneData),
      });

      return response;
    } catch (error) {
      console.error('Update safe zone error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update safe zone',
      };
    }
  }

  /**
   * Get GPS alerts
   */
  async getGPSAlerts(userId: string, params?: {
    petId?: string;
    type?: 'safe_zone_exit' | 'low_battery' | 'device_offline';
    read?: boolean;
    limit?: number;
  }): Promise<LocationResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.read !== undefined) queryParams.append('read', params.read.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.GPS.ALERTS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get GPS alerts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get GPS alerts',
      };
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }

  /**
   * Check if location is within safe zone
   */
  isWithinSafeZone(
    petLat: number,
    petLon: number,
    safeZoneLat: number,
    safeZoneLon: number,
    radius: number
  ): boolean {
    const distance = this.calculateDistance(petLat, petLon, safeZoneLat, safeZoneLon);
    return distance <= radius;
  }
}

export default new LocationService();
