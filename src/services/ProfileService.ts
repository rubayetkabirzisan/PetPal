/**
 * ProfileService - Service for managing user profiles
 * Handles viewing, creating, and updating user profile information
 */

import { apiService } from './ApiService'

// TypeScript interfaces for profile data
export interface UserProfile {
  _id?: string
  uid: string
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  preferences?: {
    notifications?: boolean
    emailUpdates?: boolean
    petTypes?: string[]
    adoptionRadius?: number
  }
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserProfileData {
  uid: string
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  preferences?: {
    notifications?: boolean
    emailUpdates?: boolean
    petTypes?: string[]
    adoptionRadius?: number
  }
}

export interface UpdateUserProfileData {
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  preferences?: {
    notifications?: boolean
    emailUpdates?: boolean
    petTypes?: string[]
    adoptionRadius?: number
  }
  verificationStatus?: 'pending' | 'verified' | 'rejected'
}

export class ProfileService {
  /**
   * Get user profile by UID
   * @param uid - The unique identifier of the user
   * @returns Promise<UserProfile>
   */
  static async getUserProfile(uid: string): Promise<UserProfile> {
    try {
      const response = await apiService.get(`/profile/view/${uid}`)
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error fetching user profile:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile')
    }
  }

  /**
   * Update user profile (creates if doesn't exist)
   * @param uid - The unique identifier of the user
   * @param profileData - The profile data to update
   * @returns Promise<UserProfile>
   */
  static async updateUserProfile(uid: string, profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const response = await apiService.put(`/profile/update/${uid}`, profileData)
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(error.response?.data?.message || 'Failed to update user profile')
    }
  }

  /**
   * Create a new user profile
   * @param profileData - The profile data to create
   * @returns Promise<UserProfile>
   */
  static async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    try {
      const response = await apiService.post('/profile/create', profileData)
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error creating user profile:', error)
      throw new Error(error.response?.data?.message || 'Failed to create user profile')
    }
  }

  /**
   * Delete user profile
   * @param uid - The unique identifier of the user
   * @returns Promise<{ message: string }>
   */
  static async deleteUserProfile(uid: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/profile/delete/${uid}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting user profile:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete user profile')
    }
  }

  /**
   * Get all user profiles (admin function)
   * @returns Promise<UserProfile[]>
   */
  static async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const response = await apiService.get('/profile/viewAll')
      return response.data as UserProfile[]
    } catch (error: any) {
      console.error('Error fetching all user profiles:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch all user profiles')
    }
  }

  /**
   * Update profile avatar/photo
   * @param uid - The unique identifier of the user
   * @param avatarUrl - The URL of the new avatar
   * @returns Promise<UserProfile>
   */
  static async updateProfileAvatar(uid: string, avatarUrl: string): Promise<UserProfile> {
    try {
      const response = await apiService.patch(`/profile/avatar/${uid}`, { avatar: avatarUrl })
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error updating profile avatar:', error)
      throw new Error(error.response?.data?.message || 'Failed to update profile avatar')
    }
  }

  /**
   * Update user preferences
   * @param uid - The unique identifier of the user
   * @param preferences - The preferences to update
   * @returns Promise<UserProfile>
   */
  static async updateUserPreferences(uid: string, preferences: UserProfile['preferences']): Promise<UserProfile> {
    try {
      const response = await apiService.patch(`/profile/preferences/${uid}`, { preferences })
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error updating user preferences:', error)
      throw new Error(error.response?.data?.message || 'Failed to update user preferences')
    }
  }

  /**
   * Update verification status (admin function)
   * @param uid - The unique identifier of the user
   * @param status - The verification status
   * @returns Promise<UserProfile>
   */
  static async updateVerificationStatus(uid: string, status: UserProfile['verificationStatus']): Promise<UserProfile> {
    try {
      const response = await apiService.patch(`/profile/verification/${uid}`, { verificationStatus: status })
      return response.data as UserProfile
    } catch (error: any) {
      console.error('Error updating verification status:', error)
      throw new Error(error.response?.data?.message || 'Failed to update verification status')
    }
  }

  /**
   * Search user profiles by location
   * @param location - The location to search for
   * @returns Promise<UserProfile[]>
   */
  static async searchProfilesByLocation(location: string): Promise<UserProfile[]> {
    try {
      const response = await apiService.get(`/profile/searchByLocation/${encodeURIComponent(location)}`)
      return response.data as UserProfile[]
    } catch (error: any) {
      console.error('Error searching profiles by location:', error)
      throw new Error(error.response?.data?.message || 'Failed to search profiles by location')
    }
  }

  /**
   * Get profiles by verification status
   * @param status - The verification status to filter by
   * @returns Promise<UserProfile[]>
   */
  static async getProfilesByVerificationStatus(status: UserProfile['verificationStatus']): Promise<UserProfile[]> {
    try {
      const response = await apiService.get(`/profile/viewByStatus/${status}`)
      return response.data as UserProfile[]
    } catch (error: any) {
      console.error('Error fetching profiles by verification status:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch profiles by verification status')
    }
  }
}

export default ProfileService