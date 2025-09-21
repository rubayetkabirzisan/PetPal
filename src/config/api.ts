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
    CHAT: '/api/chat',
    SCHEDULE_VISIT: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/schedule-visit`,
    VIEW_APPLICATION: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/view-application`,
    VOICE_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/voice-call`,
    VIDEO_CALL: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/video-call`,
    ATTACH_FILE: (chatRoomId: string) => `/api/chat/${chatRoomId}/actions/attach-file`,
    ACTIVE_CALLS: (chatRoomId: string) => `/api/chat/${chatRoomId}/calls/active`,
    END_CALL: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/end`,
    CALL_STATUS: (chatRoomId: string, callId: string) => `/api/chat/${chatRoomId}/calls/${callId}/status`,
  }
};

// Helper function to make API calls with proper error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making API call to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default API_CONFIG;