/**
 * Authentication API Service
 * Handles user authentication with the backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import apiService from './ApiService'

export interface BackendUser {
  uid: string
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  userType: 'adopter' | 'shelter' | 'admin'
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
  userType?: 'adopter' | 'shelter' | 'admin'
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  phone?: string
  location?: string
  bio?: string
  userType: 'adopter' | 'shelter' | 'admin'
}

export interface AuthResponse {
  message: string
  user?: BackendUser
  token?: string
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/users/login', credentials)
      
      if (response.token) {
        await apiService.setAuthToken(response.token)
      }
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  /**
   * Register new user
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/users/signup', userData)
      return response
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.removeAuthToken()
      // Clear any other stored user data
      await AsyncStorage.removeItem('@petpal/user')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<BackendUser> {
    try {
      const response = await apiService.get('/users/profile')
      return response.user
    } catch (error) {
      console.error('Get current user failed:', error)
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await apiService.getAuthToken()
      return !!token
    } catch (error) {
      return false
    }
  }
}

export const authService = new AuthService()
export default authService