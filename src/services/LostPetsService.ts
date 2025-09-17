/**
 * LostPetsService - Service for managing lost and found pets
 * Handles lost pet reports, updates, and tracking
 */

import { apiService } from './ApiService'

// TypeScript interfaces for lost pets data
export interface LostPet {
  _id?: string
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string
  color: string
  lastSeen: string
  location: string
  reportedDate: string
  status: 'lost' | 'found' | 'reunited' | 'closed'
  ownerName: string
  ownerPhone: string
  description: string
  image?: string
  userId?: string
  reward?: number
  microchipped?: boolean
  microchipId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateLostPetData {
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string
  color: string
  lastSeen: string
  location: string
  reportedDate: string
  ownerName: string
  ownerPhone: string
  description: string
  image?: string
  userId?: string
  reward?: number
  microchipped?: boolean
  microchipId?: string
}

export interface UpdateLostPetData {
  name?: string
  type?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed?: string
  color?: string
  lastSeen?: string
  location?: string
  status?: 'lost' | 'found' | 'reunited' | 'closed'
  ownerName?: string
  ownerPhone?: string
  description?: string
  image?: string
  reward?: number
  microchipped?: boolean
  microchipId?: string
}

export class LostPetsService {
  /**
   * Get all lost pets
   * @returns Promise<LostPet[]>
   */
  static async getAllLostPets(): Promise<LostPet[]> {
    try {
      const response = await apiService.get('/lostpet/viewAll')
      return response.data as LostPet[]
    } catch (error: any) {
      console.error('Error fetching lost pets:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lost pets')
    }
  }

  /**
   * Add a new lost pet report
   * @param petData - The lost pet data to add
   * @returns Promise<LostPet>
   */
  static async addLostPet(petData: CreateLostPetData): Promise<LostPet> {
    try {
      const response = await apiService.post('/lostpet/addpet', petData)
      return response.data as LostPet
    } catch (error: any) {
      console.error('Error adding lost pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to add lost pet report')
    }
  }

  /**
   * Update lost pet status
   * @param petId - The ID of the lost pet to update
   * @param status - The new status
   * @returns Promise<LostPet>
   */
  static async updateLostPetStatus(petId: string, status: LostPet['status']): Promise<LostPet> {
    try {
      const response = await apiService.patch(`/lostpet/update/${petId}`, { status })
      return response.data as LostPet
    } catch (error: any) {
      console.error('Error updating lost pet status:', error)
      throw new Error(error.response?.data?.message || 'Failed to update lost pet status')
    }
  }

  /**
   * Update lost pet information
   * @param petId - The ID of the lost pet to update
   * @param updateData - The data to update
   * @returns Promise<LostPet>
   */
  static async updateLostPet(petId: string, updateData: UpdateLostPetData): Promise<LostPet> {
    try {
      const response = await apiService.put(`/lostpet/update/${petId}`, updateData)
      return response.data as LostPet
    } catch (error: any) {
      console.error('Error updating lost pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to update lost pet information')
    }
  }

  /**
   * Delete a lost pet report
   * @param petId - The ID of the lost pet to delete
   * @returns Promise<{ message: string, deletedPet: LostPet }>
   */
  static async deleteLostPet(petId: string): Promise<{ message: string, deletedPet: LostPet }> {
    try {
      const response = await apiService.delete(`/lostpet/delete/${petId}`)
      return response.data as { message: string, deletedPet: LostPet }
    } catch (error: any) {
      console.error('Error deleting lost pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete lost pet report')
    }
  }

  /**
   * Get lost pet by ID
   * @param petId - The ID of the lost pet to retrieve
   * @returns Promise<LostPet>
   */
  static async getLostPetById(petId: string): Promise<LostPet> {
    try {
      const response = await apiService.get(`/lostpet/viewById/${petId}`)
      return response.data as LostPet
    } catch (error: any) {
      console.error('Error fetching lost pet:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lost pet')
    }
  }

  /**
   * Get lost pets by status
   * @param status - The status to filter by
   * @returns Promise<LostPet[]>
   */
  static async getLostPetsByStatus(status: LostPet['status']): Promise<LostPet[]> {
    try {
      const response = await apiService.get(`/lostpet/viewByStatus/${status}`)
      return response.data as LostPet[]
    } catch (error: any) {
      console.error('Error fetching lost pets by status:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lost pets by status')
    }
  }

  /**
   * Get lost pets by location
   * @param location - The location to search in
   * @returns Promise<LostPet[]>
   */
  static async getLostPetsByLocation(location: string): Promise<LostPet[]> {
    try {
      const response = await apiService.get(`/lostpet/viewByLocation/${encodeURIComponent(location)}`)
      return response.data as LostPet[]
    } catch (error: any) {
      console.error('Error fetching lost pets by location:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lost pets by location')
    }
  }

  /**
   * Search lost pets by multiple criteria
   * @param searchCriteria - The search criteria
   * @returns Promise<LostPet[]>
   */
  static async searchLostPets(searchCriteria: {
    type?: string
    breed?: string
    location?: string
    status?: string
    dateRange?: { start: string; end: string }
  }): Promise<LostPet[]> {
    try {
      const queryParams = new URLSearchParams()
      if (searchCriteria.type) queryParams.append('type', searchCriteria.type)
      if (searchCriteria.breed) queryParams.append('breed', searchCriteria.breed)
      if (searchCriteria.location) queryParams.append('location', searchCriteria.location)
      if (searchCriteria.status) queryParams.append('status', searchCriteria.status)
      if (searchCriteria.dateRange?.start) queryParams.append('startDate', searchCriteria.dateRange.start)
      if (searchCriteria.dateRange?.end) queryParams.append('endDate', searchCriteria.dateRange.end)

      const endpoint = `/lostpet/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiService.get(endpoint)
      return response.data as LostPet[]
    } catch (error: any) {
      console.error('Error searching lost pets:', error)
      throw new Error(error.response?.data?.message || 'Failed to search lost pets')
    }
  }
}

export default LostPetsService