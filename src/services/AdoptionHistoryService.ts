/**
 * AdoptionHistoryService - Service for managing adoption   static async createAdoptionHistoryEntry(adoptionData: CreateAdoptionHistoryData): Promise<AdoptionHistoryEntry> {
    try {
      const response = await apiService.post('/adoptionHistory/addEntry', adoptionData)
      return response.data as AdoptionHistoryEntry
    } catch (error: any) {
      console.error('Error creating adoption history entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to create adoption history entry')
    }
  }ecords
 * Handles viewing adoption history by user and creating new adoption records
 */

import { apiService } from './ApiService'

// TypeScript interfaces for adoption history data
export interface AdoptionHistoryEntry {
  _id?: string
  petId: string
  userId: string
  petName: string
  petBreed: string
  petImage?: string
  applicationId: string
  applicationDate: string
  adoptionDate?: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  notes?: string
  shelterName: string
  shelterContact: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAdoptionHistoryData {
  petId: string
  userId: string
  petName: string
  petBreed: string
  petImage?: string
  applicationId: string
  applicationDate: string
  adoptionDate?: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  notes?: string
  shelterName: string
  shelterContact: string
}

export class AdoptionHistoryService {
  /**
   * Get adoption history for a specific user
   * @param userId - The ID of the user to get adoption history for
   * @returns Promise<AdoptionHistoryEntry[]>
   */
  static async getAdoptionHistoryByUserId(userId: string): Promise<AdoptionHistoryEntry[]> {
    try {
      const response = await apiService.get(`/adoptionHistory/view/${userId}`)
      return response.data as AdoptionHistoryEntry[]
    } catch (error: any) {
      console.error('Error fetching adoption history:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch adoption history')
    }
  }

  /**
   * Create a new adoption history entry
   * @param adoptionData - The adoption history data to create
   * @returns Promise<AdoptionHistoryEntry>
   */
  static async createAdoptionHistoryEntry(adoptionData: CreateAdoptionHistoryData): Promise<AdoptionHistoryEntry> {
    try {
      const response = await apiService.post('/adoptionHistory/addEntry', adoptionData)
      return response.data as AdoptionHistoryEntry
    } catch (error: any) {
      console.error('Error creating adoption history entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to create adoption history entry')
    }
  }

  /**
   * Get all adoption history entries (admin function)
   * @returns Promise<AdoptionHistoryEntry[]>
   */
  static async getAllAdoptionHistory(): Promise<AdoptionHistoryEntry[]> {
    try {
      const response = await apiService.get('/adoptionHistory/viewAll')
      return response.data as AdoptionHistoryEntry[]
    } catch (error: any) {
      console.error('Error fetching all adoption history:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch all adoption history')
    }
  }

  /**
   * Update adoption history entry status
   * @param entryId - The ID of the adoption history entry to update
   * @param status - The new status
   * @returns Promise<AdoptionHistoryEntry>
   */
  static async updateAdoptionStatus(entryId: string, status: AdoptionHistoryEntry['status']): Promise<AdoptionHistoryEntry> {
    try {
      const response = await apiService.put(`/adoptionHistory/update/${entryId}`, { status })
      return response.data as AdoptionHistoryEntry
    } catch (error: any) {
      console.error('Error updating adoption status:', error)
      throw new Error(error.response?.data?.message || 'Failed to update adoption status')
    }
  }
}

export default AdoptionHistoryService