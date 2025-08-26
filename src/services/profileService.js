// services/profileService.js
import ApiService from './api';

class ProfileService {
  async fetchUserProfile(uid) {
    try {
      const profile = await ApiService.getProfile(uid);
      return profile;
    } catch (error) {
      if (error.message.includes('Profile not found')) {
        // Return null if profile doesn't exist yet
        return null;
      }
      throw error;
    }
  }

  async saveUserProfile(uid, profileData) {
    try {
      // Try to update first
      const updatedProfile = await ApiService.updateProfile(uid, profileData);
      return updatedProfile;
    } catch (error) {
      // If update fails because profile doesn't exist, create new one
      if (error.message.includes('Profile not found')) {
        const newProfile = await ApiService.createProfile({
          uid,
          ...profileData
        });
        return newProfile;
      }
      throw error;
    }
  }

  async createUserProfile(uid, profileData) {
    try {
      const newProfile = await ApiService.createProfile({
        uid,
        ...profileData
      });
      return newProfile;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProfileService();