// API Configuration
// Update this IP address to match your development machine's IP
// You can find your IP by running: ifconfig | grep "inet " | grep -v 127.0.0.1

declare const __DEV__: boolean;

const DEV_IP = '192.168.0.171'; // Your machine's IP address
const DEV_PORT = '3000';

// API Base URL - automatically detects if running on device vs simulator
const getBaseURL = () => {
  // In production, you would use your production API URL
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
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
      LOGIN: '/api/users/login',
      REGISTER: '/api/users/signup',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
      VERIFY: '/api/verification/verify',
      RESEND_VERIFICATION: '/api/verification/resend',
    },
    
    // Pet management endpoints
    PETS: {
      VIEW_ALL: '/api/pets/view',
      ADD: '/api/pets/addpet',
      UPDATE: (id: string) => `/api/pets/${id}`,
      DELETE: (id: string) => `/api/pets/${id}`,
      BROWSE: '/api/browse/pets',
      PROFILE: (id: string) => `/api/pet-profile/${id}`,
      SEARCH: '/api/browse/pets/search',
      TOGGLE_FAVORITE: (id: string) => `/api/pets/${id}/toggle-favorite`,
      FAVORITES: '/api/pets/favorites',
      MANAGE: '/api/manage-pets',
      ADD_PET: '/api/add-pet',
      EDIT: (id: string) => `/api/edit-pet/${id}`,
    },
    
    // Application/Adoption endpoints
    APPLICATIONS: {
      VIEW_ALL: '/api/applications/viewAll',
      CREATE: '/api/applications/newApp',
      UPDATE: (id: string) => `/api/applications/${id}`,
      DELETE: (id: string) => `/api/applications/${id}`,
      LIST: '/api/application-list',
      FORM: '/api/application-form',
      DETAILS: (id: string) => `/api/application-details/${id}`,
      HISTORY: '/api/adoption-history',
      TRACKER: '/api/application-tracker',
      APPROVE: (id: string) => `/api/admin-applications/${id}/approve`,
      REJECT: (id: string) => `/api/admin-applications/${id}/reject`,
      CANCEL: (id: string) => `/api/application-tracker/${id}/cancel`,
    },
    
    // Admin endpoints
    ADMIN: {
      DASHBOARD: '/api/admin-dashboard',
      DASHBOARD_STATS: '/api/admin-dashboard/stats',
      PETS: '/api/manage-pets',
      ADD_PET: '/api/add-pet',
      EDIT_PET: (id: string) => `/api/edit-pet/${id}`,
      DELETE_PET: (id: string) => `/api/manage-pets/${id}`,
      APPLICATIONS: '/api/admin-applications',
      USERS: '/api/admin-dashboard/users',
      LOST_PETS: '/api/admin-lost-pets',
      GPS_TRACKING: '/api/admin-gps-tracking',
      NOTIFICATIONS: '/api/admin-notifications',
      STATISTICS: '/api/admin-statistics',
    },
    
    // GPS and location endpoints
    GPS: {
      TRACKING: '/api/gps-tracking',
      LOCATION: (petId: string) => `/api/pet-location/${petId}`,
      UPDATE_LOCATION: (petId: string) => `/api/pet-location/${petId}`,
      ANALYTICS: (userId: string) => `/api/pet-location/analytics/${userId}`,
      SAFE_ZONE: (petId: string) => `/api/safe-zone/${petId}`,
      UPDATE_SAFE_ZONE: (petId: string) => `/api/safe-zone/${petId}`,
      ALERTS: '/api/gps-tracking/alerts',
      HISTORY: '/api/pet-location',
    },
    
    // Lost pets endpoints
    LOST_PETS: {
      REPORT: '/api/lost-pets/report',
      CREATE: '/api/lost-pets',
      LIST: '/api/lost-pets',
      UPDATE: (reportId: string) => `/api/lost-pets/${reportId}`,
      DELETE: (reportId: string) => `/api/lost-pets/${reportId}`,
      REPORT_SIGHTING: '/api/lost-pets/sighting',
      ADMIN_LIST: '/api/admin-lost-pets',
    },
    
    // Care and maintenance endpoints
    CARE: {
      JOURNAL: '/api/care-journal',
      JOURNAL_ENTRY: (id: string) => `/api/care-journal/${id}`,
      ADD_ENTRY: '/api/care-journal',
      UPDATE_ENTRY: (id: string) => `/api/care-journal/${id}`,
      DELETE_ENTRY: (id: string) => `/api/care-journal/${id}`,
    },
    
    // Reminders endpoints
    REMINDERS: {
      LIST: '/api/reminders',
      CREATE: '/api/reminders',
      UPDATE: (id: string) => `/api/reminders/${id}`,
      DELETE: (id: string) => `/api/reminders/${id}`,
      MARK_COMPLETE: (id: string) => `/api/reminders/${id}/complete`,
    },
    
    // Analytics endpoints
    ANALYTICS: {
      GET: '/api/analytics',
      TRACK: '/api/analytics/track',
      DASHBOARD: '/api/analytics-dashboard',
      STATISTICS: '/api/admin-statistics',
      USER: '/api/analytics/user',
      REPORTS: '/api/analytics/reports',
      PET: (petId: string) => `/api/analytics/pet/${petId}`,
      SEARCH: '/api/analytics/search',
      FUNNEL: '/api/analytics/funnel',
      GEOGRAPHIC: '/api/analytics/geographic',
      REALTIME: '/api/analytics/realtime',
      PERFORMANCE: '/api/analytics/performance',
    },
    
    // Emergency actions
    EMERGENCY: {
      ACTIONS: '/api/emergency-actions',
      LIST: '/api/emergency-actions',
      CREATE: '/api/emergency-actions',
      UPDATE: (id: string) => `/api/emergency-actions/${id}`,
      DELETE: (id: string) => `/api/emergency-actions/${id}`,
    },
    
    // Notifications endpoints
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      CREATE: '/api/notifications',
      UPDATE: (id: string) => `/api/notifications/${id}`,
      DELETE: (id: string) => `/api/notifications/${id}`,
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      ADMIN: '/api/admin-notifications',
    },
    
    // Messages endpoints
    MESSAGES: {
      LIST: '/api/messages',
      CREATE: '/api/messages',
      UPDATE: (id: string) => `/api/messages/${id}`,
      DELETE: (id: string) => `/api/messages/${id}`,
      CHAT_ROOM: (roomId: string) => `/api/messages/room/${roomId}`,
    },
    
    // AI and recommendations
    AI: {
      RECOMMENDATIONS: '/api/ai-pet-recommendations',
      MATCHING: '/api/ai-matching',
      PET_SCREEN: '/api/ai-pet',
    },
    
    // Settings and preferences
    SETTINGS: {
      PREFERENCES: (userId: string) => `/api/settings/preferences/${userId}`,
      NOTIFICATIONS: (userId: string) => `/api/settings/notifications/${userId}`,
      UPDATE_PREFERENCES: (userId: string) => `/api/settings/preferences/${userId}`,
    },
    
    // Chat endpoints
    CHAT: {
      ROOMS: '/api/chat',
      ROOM: (chatRoomId: string) => `/api/chat/${chatRoomId}`,
      MESSAGES: (chatRoomId: string) => `/api/chat/${chatRoomId}/messages`,
      SEND_MESSAGE: (chatRoomId: string) => `/api/chat/${chatRoomId}/send`,
      SCHEDULE_VISIT: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/schedule-visit`,
      VIEW_APPLICATION: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/view-application`,
      VOICE_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/voice-call`,
      VIDEO_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/video-call`,
      ATTACH_FILE: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/attach-file`,
      ACTIVE_CALLS: (chatRoomId: string) => `/api/chat/${chatRoomId}/calls/active`,
      END_CALL: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/end`,
      CALL_STATUS: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/status`,
    },
    
    // User verification endpoints  
    VERIFICATION: {
      VERIFY: '/api/verification/verify',
      RESEND: '/api/verification/resend',
      STATUS: (userId: string) => `/api/verification/status/${userId}`,
    },
    
    // Backend test endpoint
    BACKEND_TEST: '/api/backend-test',
  },

  // Additional compatibility endpoints for backward compatibility
  SCHEDULE_VISIT: (id: string) => `/api/appointments/schedule/${id}`,
  VIEW_APPLICATION: (id: string) => `/api/application-details/${id}`,
  VOICE_CALL: (id: string) => `/api/calls/voice/${id}`,
  VIDEO_CALL: (id: string) => `/api/calls/video/${id}`,
  ATTACH_FILE: (id: string) => `/api/chat/${id}/attach`,
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