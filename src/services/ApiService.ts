/**
 * API Configuration and Base URL
 * This file contains the configuration for connecting to the backend server
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

// Base URL for the backend API
// Change this to your actual backend URL when deploying
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development URL
  : 'https://your-production-api.com/api'  // Production URL

// Auth token storage key
export const AUTH_TOKEN_KEY = '@petpal/auth_token'

/**
 * API configuration class to handle HTTP requests
 */
class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Get stored auth token
   */
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  /**
   * Store auth token
   */
  async setAuthToken(token: string) {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
    } catch (error) {
      console.error('Error storing auth token:', error)
    }
  }

  /**
   * Remove auth token
   */
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Error removing auth token:', error)
    }
  }

  /**
   * Make HTTP request with proper headers
   */
  async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken()
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`)
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
export default apiService