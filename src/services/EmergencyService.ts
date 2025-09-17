/**
 * EmergencyService - Service for managing emergency actions and reporting
 * Handles emergency pet situations and action tracking
 */

import { apiService } from './ApiService'

// TypeScript interfaces for emergency data
export interface EmergencyAction {
  _id?: string
  type: 'medical' | 'lost' | 'injured' | 'behavioral' | 'evacuation' | 'other'
  details: string
  petId?: string
  userId: string
  location?: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in-progress' | 'completed' | 'resolved'
  responderInfo?: string
  actionTaken?: string
  followUpRequired?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmergencyActionData {
  type: 'medical' | 'lost' | 'injured' | 'behavioral' | 'evacuation' | 'other'
  details: string
  petId?: string
  userId: string
  location?: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  responderInfo?: string
  actionTaken?: string
  followUpRequired?: boolean
}

export interface UpdateEmergencyActionData {
  status?: 'pending' | 'in-progress' | 'completed' | 'resolved'
  responderInfo?: string
  actionTaken?: string
  followUpRequired?: boolean
  details?: string
}

export class EmergencyService {
  /**
   * Submit a new emergency action
   * @param emergencyData - The emergency action data to submit
   * @returns Promise<{ message: string }>
   */
  static async submitEmergencyAction(emergencyData: CreateEmergencyActionData): Promise<{ message: string }> {
    try {
      const response = await apiService.post('/emergency/action', emergencyData)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error submitting emergency action:', error)
      throw new Error(error.response?.data?.message || 'Failed to submit emergency action')
    }
  }

  /**
   * Get all emergency actions
   * @returns Promise<EmergencyAction[]>
   */
  static async getAllEmergencyActions(): Promise<EmergencyAction[]> {
    try {
      const response = await apiService.get('/emergency/viewAll')
      return response.data as EmergencyAction[]
    } catch (error: any) {
      console.error('Error fetching emergency actions:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency actions')
    }
  }

  /**
   * Get emergency action by ID
   * @param actionId - The ID of the emergency action to retrieve
   * @returns Promise<EmergencyAction>
   */
  static async getEmergencyActionById(actionId: string): Promise<EmergencyAction> {
    try {
      const response = await apiService.get(`/emergency/viewById/${actionId}`)
      return response.data as EmergencyAction
    } catch (error: any) {
      console.error('Error fetching emergency action:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency action')
    }
  }

  /**
   * Get emergency actions by user ID
   * @param userId - The ID of the user to get emergency actions for
   * @returns Promise<EmergencyAction[]>
   */
  static async getEmergencyActionsByUserId(userId: string): Promise<EmergencyAction[]> {
    try {
      const response = await apiService.get(`/emergency/viewByUser/${userId}`)
      return response.data as EmergencyAction[]
    } catch (error: any) {
      console.error('Error fetching emergency actions by user:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency actions for user')
    }
  }

  /**
   * Get emergency actions by urgency level
   * @param urgencyLevel - The urgency level to filter by
   * @returns Promise<EmergencyAction[]>
   */
  static async getEmergencyActionsByUrgency(urgencyLevel: EmergencyAction['urgencyLevel']): Promise<EmergencyAction[]> {
    try {
      const response = await apiService.get(`/emergency/viewByUrgency/${urgencyLevel}`)
      return response.data as EmergencyAction[]
    } catch (error: any) {
      console.error('Error fetching emergency actions by urgency:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency actions by urgency level')
    }
  }

  /**
   * Get emergency actions by status
   * @param status - The status to filter by
   * @returns Promise<EmergencyAction[]>
   */
  static async getEmergencyActionsByStatus(status: EmergencyAction['status']): Promise<EmergencyAction[]> {
    try {
      const response = await apiService.get(`/emergency/viewByStatus/${status}`)
      return response.data as EmergencyAction[]
    } catch (error: any) {
      console.error('Error fetching emergency actions by status:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency actions by status')
    }
  }

  /**
   * Update emergency action status and details
   * @param actionId - The ID of the emergency action to update
   * @param updateData - The data to update
   * @returns Promise<EmergencyAction>
   */
  static async updateEmergencyAction(actionId: string, updateData: UpdateEmergencyActionData): Promise<EmergencyAction> {
    try {
      const response = await apiService.put(`/emergency/update/${actionId}`, updateData)
      return response.data as EmergencyAction
    } catch (error: any) {
      console.error('Error updating emergency action:', error)
      throw new Error(error.response?.data?.message || 'Failed to update emergency action')
    }
  }

  /**
   * Delete emergency action
   * @param actionId - The ID of the emergency action to delete
   * @returns Promise<{ message: string }>
   */
  static async deleteEmergencyAction(actionId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/emergency/delete/${actionId}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting emergency action:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete emergency action')
    }
  }

  /**
   * Get emergency contacts and resources
   * @returns Promise<any>
   */
  static async getEmergencyContacts(): Promise<any> {
    try {
      const response = await apiService.get('/emergency/contacts')
      return response.data
    } catch (error: any) {
      console.error('Error fetching emergency contacts:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency contacts')
    }
  }
}

export default EmergencyService