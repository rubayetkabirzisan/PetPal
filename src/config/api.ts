// API Configuration
// Update this IP address to match your development machine's IP
// You can find your IP by running: ifconfig | grep "inet " | grep -v 127.0.0.1

const DEV_IP = '192.168.0.171'; // Your machine's IP address
const DEV_PORT = '3000';

// API Base URL - automatically detects if running on device vs simulator
const getBaseURL = () => {
  // In production, you would use your production API URL
  if (__DEV__) {
    // For development, use your machine's IP address
    return `http://${DEV_IP}:${DEV_PORT}`;
  } else {
    // For production, use your production API URL
    return 'https://your-production-api.com';
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
    },
    
    // Pet management endpoints
    PETS: {
      BROWSE: '/api/browse-pets',
      PROFILE: (petId: string) => `/api/pet-profile/${petId}`,
      SEARCH: '/api/browse-pets/search',
      FAVORITES: '/api/browse-pets/favorites',
      TOGGLE_FAVORITE: (petId: string) => `/api/browse-pets/${petId}/favorite`,
    },
    
    // Adoption endpoints
    ADOPTION: {
      HISTORY: (adoptionId: string) => `/api/adoption-history/${adoptionId}`,
      TRACKER: '/api/adoption-tracker',
      APPLICATION: '/api/adoption-application',
      LIST_APPLICATIONS: '/api/application-list',
      APPLICATION_DETAILS: (applicationId: string) => `/api/application-details/${applicationId}`,
    },
    
    // Admin endpoints
    ADMIN: {
      DASHBOARD: '/api/admin-dashboard',
      PETS: '/api/admin-pets',
      ADD_PET: '/api/add-pet',
      LOST_PETS: '/api/admin-lost-pets',
      USERS: '/api/admin-users',
      APPLICATIONS: '/api/admin-applications',
    },
    
    // GPS and Location endpoints
    GPS: {
      LOCATION: (petId: string) => `/api/pet-location/${petId}`,
      ANALYTICS: (userId: string) => `/api/pet-location/analytics/${userId}`,
      UPDATE_LOCATION: (petId: string) => `/api/pet-location/${petId}`,
      SAFE_ZONE: (petId: string) => `/api/safe-zone/${petId}`,
    },
    
    // Lost pets endpoints
    LOST_PETS: {
      REPORT: '/api/lost-pets/report',
      LIST: '/api/lost-pets',
      UPDATE: (reportId: string) => `/api/lost-pets/${reportId}`,
    },
    
    // Care and reminders endpoints
    CARE: {
      JOURNAL: '/api/care-journal',
      JOURNAL_ENTRY: (entryId: string) => `/api/care-journal/${entryId}`,
      REMINDERS: '/api/reminders',
      REMINDER: (reminderId: string) => `/api/reminders/${reminderId}`,
    },
    
    // AI and recommendations
    AI: {
      RECOMMENDATIONS: '/api/ai-pet-recommendations',
      MATCHING: '/api/ai-matching',
    },
    
    // Settings and preferences
    SETTINGS: {
      PREFERENCES: (userId: string) => `/api/settings/preferences/${userId}`,
      NOTIFICATIONS: (userId: string) => `/api/settings/notifications/${userId}`,
    },
    
    // Chat endpoints (existing)
    CHAT: {
      ROOMS: '/api/chat',
      ROOM: (chatRoomId: string) => `/api/chat/${chatRoomId}`,
      SCHEDULE_VISIT: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/schedule-visit`,
      VIEW_APPLICATION: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/view-application`,
      VOICE_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/voice-call`,
      VIDEO_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/video-call`,
      ATTACH_FILE: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/attach-file`,
      ACTIVE_CALLS: (chatRoomId: string) => `/api/chat/${chatRoomId}/calls/active`,
      END_CALL: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/end`,
      CALL_STATUS: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/status`,
    }
  }
};

// JWT Token management
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = "@petpal/token";
const REFRESH_TOKEN_KEY = "@petpal/refresh_token";

export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
};

// Function to refresh authentication token
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await TokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      await TokenManager.setToken(data.token);
      if (data.refreshToken) {
        await TokenManager.setRefreshToken(data.refreshToken);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Helper function to make API calls with proper error handling and authentication
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making API call to: ${url}`);
    
    // Get authentication token
    const token = await TokenManager.getToken();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    // Handle 401 unauthorized - try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the original request with new token
        const newToken = await TokenManager.getToken();
        const retryResponse = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(newToken && { Authorization: `Bearer ${newToken}` }),
            ...options.headers,
          },
          ...options,
        });
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      
      // Token refresh failed or retry failed - redirect to login
      await TokenManager.clearTokens();
      throw new Error('Authentication failed. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default API_CONFIG;