/**
 * AnalyticsService - Service for managing analytics data
 * Handles viewing and saving analytics data for insights and reporting
 */

import { apiService } from './ApiService'

// TypeScript interfaces for analytics data
export interface AnalyticsData {
  _id?: string
  metric: string
  value: number
  category: 'adoption' | 'pets' | 'users' | 'applications' | 'general'
  timestamp: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface CreateAnalyticsData {
  metric: string
  value: number
  category: 'adoption' | 'pets' | 'users' | 'applications' | 'general'
  timestamp?: string
  metadata?: Record<string, any>
}

export interface AnalyticsFilter {
  category?: string
  startDate?: string
  endDate?: string
  metric?: string
}

export class AnalyticsService {
  /**
   * Get all analytics data
   * @param filter - Optional filter parameters
   * @returns Promise<AnalyticsData[]>
   */
  static async getAllAnalytics(filter?: AnalyticsFilter): Promise<AnalyticsData[]> {
    try {
      const queryParams = new URLSearchParams()
      if (filter?.category) queryParams.append('category', filter.category)
      if (filter?.startDate) queryParams.append('startDate', filter.startDate)
      if (filter?.endDate) queryParams.append('endDate', filter.endDate)
      if (filter?.metric) queryParams.append('metric', filter.metric)

      const endpoint = `/analytics/view${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiService.get(endpoint)
      return response.data as AnalyticsData[]
    } catch (error: any) {
      console.error('Error fetching analytics data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics data')
    }
  }

  /**
   * Save new analytics data
   * @param analyticsData - The analytics data to save
   * @returns Promise<AnalyticsData>
   */
  static async saveAnalyticsData(analyticsData: CreateAnalyticsData): Promise<AnalyticsData> {
    try {
      const dataToSave = {
        ...analyticsData,
        timestamp: analyticsData.timestamp || new Date().toISOString()
      }
      const response = await apiService.post('/analytics/save', dataToSave)
      return response.data as AnalyticsData
    } catch (error: any) {
      console.error('Error saving analytics data:', error)
      throw new Error(error.response?.data?.message || 'Failed to save analytics data')
    }
  }

  /**
   * Get analytics data by category
   * @param category - The category to filter by
   * @returns Promise<AnalyticsData[]>
   */
  static async getAnalyticsByCategory(category: AnalyticsData['category']): Promise<AnalyticsData[]> {
    try {
      const response = await apiService.get(`/analytics/view?category=${category}`)
      return response.data as AnalyticsData[]
    } catch (error: any) {
      console.error('Error fetching analytics by category:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics by category')
    }
  }

  /**
   * Get analytics data for a specific metric
   * @param metric - The metric name to filter by
   * @returns Promise<AnalyticsData[]>
   */
  static async getAnalyticsByMetric(metric: string): Promise<AnalyticsData[]> {
    try {
      const response = await apiService.get(`/analytics/view?metric=${metric}`)
      return response.data as AnalyticsData[]
    } catch (error: any) {
      console.error('Error fetching analytics by metric:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics by metric')
    }
  }

  /**
   * Delete analytics data by ID
   * @param analyticsId - The ID of the analytics data to delete
   * @returns Promise<void>
   */
  static async deleteAnalyticsData(analyticsId: string): Promise<void> {
    try {
      await apiService.delete(`/analytics/delete/${analyticsId}`)
    } catch (error: any) {
      console.error('Error deleting analytics data:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete analytics data')
    }
  }

  /**
   * Batch save multiple analytics data points
   * @param analyticsArray - Array of analytics data to save
   * @returns Promise<AnalyticsData[]>
   */
  static async batchSaveAnalytics(analyticsArray: CreateAnalyticsData[]): Promise<AnalyticsData[]> {
    try {
      const dataToSave = analyticsArray.map(data => ({
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      }))
      const response = await apiService.post('/analytics/batch', dataToSave)
      return response.data as AnalyticsData[]
    } catch (error: any) {
      console.error('Error batch saving analytics:', error)
      throw new Error(error.response?.data?.message || 'Failed to batch save analytics data')
    }
  }
}

export default AnalyticsService