/**
 * Pets API Service
 * Handles pet-related API calls with the backend
 */

import apiService from './ApiService'

export interface BackendPet {
  _id: string
  name: string
  type: string
  breed: string
  color: string
  lastSeen?: string
  location: string
  reportedDate?: string
  status: 'Active' | 'Found' | 'Closed'
  ownerName?: string
  ownerPhone?: string
  description: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePetRequest {
  name: string
  type: string
  breed: string
  color: string
  location: string
  description: string
  image?: string
  ownerName?: string
  ownerPhone?: string
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  status?: 'Active' | 'Found' | 'Closed'
}

class PetsService {
  /**
   * Get all pets
   */
  async getAllPets(): Promise<BackendPet[]> {
    try {
      const response = await apiService.get('/pets')
      return response.pets || response
    } catch (error) {
      console.error('Get all pets failed:', error)
      throw error
    }
  }

  /**
   * Get pet by ID
   */
  async getPetById(petId: string): Promise<BackendPet> {
    try {
      const response = await apiService.get(`/pets/${petId}`)
      return response.pet || response
    } catch (error) {
      console.error('Get pet by ID failed:', error)
      throw error
    }
  }

  /**
   * Create new pet
   */
  async createPet(petData: CreatePetRequest): Promise<BackendPet> {
    try {
      const response = await apiService.post('/pets', petData)
      return response.pet || response
    } catch (error) {
      console.error('Create pet failed:', error)
      throw error
    }
  }

  /**
   * Update pet
   */
  async updatePet(petId: string, petData: UpdatePetRequest): Promise<BackendPet> {
    try {
      const response = await apiService.put(`/pets/${petId}`, petData)
      return response.pet || response
    } catch (error) {
      console.error('Update pet failed:', error)
      throw error
    }
  }

  /**
   * Delete pet
   */
  async deletePet(petId: string): Promise<void> {
    try {
      await apiService.delete(`/pets/${petId}`)
    } catch (error) {
      console.error('Delete pet failed:', error)
      throw error
    }
  }

  /**
   * Search pets by criteria
   */
  async searchPets(searchParams: {
    type?: string
    breed?: string
    location?: string
    status?: string
  }): Promise<BackendPet[]> {
    try {
      const queryString = new URLSearchParams(searchParams).toString()
      const response = await apiService.get(`/pets/search?${queryString}`)
      return response.pets || response
    } catch (error) {
      console.error('Search pets failed:', error)
      throw error
    }
  }
}

export const petsService = new PetsService()
export default petsService