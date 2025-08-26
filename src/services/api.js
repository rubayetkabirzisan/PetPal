// services/api.js
import { getBaseURL } from '../utils/networkUtils';

const API_BASE_URL = getBaseURL();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Profile methods
  async getProfile(uid) {
    return this.request(`/profile/view/${uid}`);
  }

  async updateProfile(uid, profileData) {
    return this.request(`/profile/update/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async createProfile(profileData) {
    return this.request('/profile/addNew', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }
}

export default new ApiService();