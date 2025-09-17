/**
 * CareEntryService - Service for managing pet care journal entries
 * Handles CRUD operations for pet care tracking and journal entries
 */

import { apiService } from './ApiService'

// TypeScript interfaces for care entry data
export interface CareEntry {
  _id?: string
  petId: string
  userId: string
  title: string
  description: string
  date: string
  category: 'feeding' | 'exercise' | 'grooming' | 'medical' | 'training' | 'other'
  notes?: string
  photos?: string[]
  reminders?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateCareEntryData {
  petId: string
  userId: string
  title: string
  description: string
  date: string
  category: 'feeding' | 'exercise' | 'grooming' | 'medical' | 'training' | 'other'
  notes?: string
  photos?: string[]
  reminders?: string[]
}

export interface UpdateCareEntryData {
  title?: string
  description?: string
  date?: string
  category?: 'feeding' | 'exercise' | 'grooming' | 'medical' | 'training' | 'other'
  notes?: string
  photos?: string[]
  reminders?: string[]
}

export class CareEntryService {
  /**
   * Get all care entries
   * @returns Promise<CareEntry[]>
   */
  static async getAllCareEntries(): Promise<CareEntry[]> {
    try {
      const response = await apiService.get('/careEntry/viewAll')
      return response.data as CareEntry[]
    } catch (error: any) {
      console.error('Error fetching care entries:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch care entries')
    }
  }

  /**
   * Get care entry by ID
   * @param entryId - The ID of the care entry to retrieve
   * @returns Promise<CareEntry>
   */
  static async getCareEntryById(entryId: string): Promise<CareEntry> {
    try {
      const response = await apiService.get(`/careEntry/viewById/${entryId}`)
      return response.data as CareEntry
    } catch (error: any) {
      console.error('Error fetching care entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch care entry')
    }
  }

  /**
   * Create a new care entry
   * @param careData - The care entry data to create
   * @returns Promise<CareEntry>
   */
  static async createCareEntry(careData: CreateCareEntryData): Promise<CareEntry> {
    try {
      const response = await apiService.post('/careEntry/create', careData)
      return response.data as CareEntry
    } catch (error: any) {
      console.error('Error creating care entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to create care entry')
    }
  }

  /**
   * Update a care entry
   * @param entryId - The ID of the care entry to update
   * @param updateData - The data to update
   * @returns Promise<CareEntry>
   */
  static async updateCareEntry(entryId: string, updateData: UpdateCareEntryData): Promise<CareEntry> {
    try {
      const response = await apiService.put(`/careEntry/update/${entryId}`, updateData)
      return response.data as CareEntry
    } catch (error: any) {
      console.error('Error updating care entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to update care entry')
    }
  }

  /**
   * Delete a care entry
   * @param entryId - The ID of the care entry to delete
   * @returns Promise<{ message: string }>
   */
  static async deleteCareEntry(entryId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/careEntry/delete/${entryId}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting care entry:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete care entry')
    }
  }

  /**
   * Get care entries by pet ID
   * @param petId - The ID of the pet to get care entries for
   * @returns Promise<CareEntry[]>
   */
  static async getCareEntriesByPetId(petId: string): Promise<CareEntry[]> {
    try {
      const response = await apiService.get(`/careEntry/viewByPet/${petId}`)
      return response.data as CareEntry[]
    } catch (error: any) {
      console.error('Error fetching care entries by pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch care entries for pet')
    }
  }

  /**
   * Get care entries by user ID
   * @param userId - The ID of the user to get care entries for
   * @returns Promise<CareEntry[]>
   */
  static async getCareEntriesByUserId(userId: string): Promise<CareEntry[]> {
    try {
      const response = await apiService.get(`/careEntry/viewByUser/${userId}`)
      return response.data as CareEntry[]
    } catch (error: any) {
      console.error('Error fetching care entries by user:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch care entries for user')
    }
  }

  /**
   * Get care entries by category
   * @param category - The category to filter by
   * @returns Promise<CareEntry[]>
   */
  static async getCareEntriesByCategory(category: CareEntry['category']): Promise<CareEntry[]> {
    try {
      const response = await apiService.get(`/careEntry/viewByCategory/${category}`)
      return response.data as CareEntry[]
    } catch (error: any) {
      console.error('Error fetching care entries by category:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch care entries by category')
    }
  }
}

export default CareEntryService