// utils/networkUtils.js
import { Platform } from 'react-native';

// Auto-detect the correct base URL based on platform and environment
export const getBaseURL = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // Android emulator
      return 'http://10.0.2.2:5000/api';
    } else {
      // iOS simulator or physical device on same network
      return 'http://localhost:5000/api';
    }
  } else {
    // Production environment - replace with your deployed backend URL
    return 'https://your-backend-domain.com/api';
  }
};

// Check network connectivity (optional enhancement)
export const checkNetworkConnection = async () => {
  try {
    const response = await fetch(getBaseURL().replace('/api', '/health'), {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};