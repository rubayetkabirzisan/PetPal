/**
 * Applications API Service
 * Handles adoption application-related API calls with the backend
 */

import apiService from './ApiService'

export interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  zipCode: string
  housingType: string
  ownRent: string
  hasYard: boolean
  yardFenced: boolean
  landlordsName?: string
  landlordsPhone?: string
  previousPets: string
  currentPets: string
  veterinarian: string
  vetPhone: string
  petExperience: string
  workSchedule: string
  hoursAlone: string
  exerciseCommitment: string
  travelFrequency: string
  familyMembers: string
  allergies: boolean
  reference1Name: string
  reference1Phone: string
  reference1Relation: string
  reference2Name: string
  reference2Phone: string
  reference2Relation: string
  whyAdopt: string
  expectations: string
  trainingPlan: string
  healthCareCommitment: string
  financialPreparation: string
  additionalComments?: string
}

export interface NotificationHistory {
  timestamp: string
  type: 'approval' | 'status_update'
  status: string
  messageId: string
  success: boolean
}

export interface BackendApplication {
  _id: string
  petId: string
  petName: string
  petType: string
  petBreed: string
  adopterName: string
  adopterEmail: string
  adopterPhone: string
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
  submittedDate: string
  priority: 'High' | 'Medium' | 'Low'
  notes: string
  notificationHistory: NotificationHistory[]
  formData: ApplicationFormData
  createdAt?: string
  updatedAt?: string
}

export interface CreateApplicationRequest {
  petId: string
  petName: string
  petType: string
  petBreed: string
  adopterName: string
  adopterEmail: string
  adopterPhone: string
  formData: ApplicationFormData
  notes?: string
}

export interface UpdateApplicationRequest {
  status?: 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
  priority?: 'High' | 'Medium' | 'Low'
  notes?: string
}

class ApplicationsService {
  /**
   * Get all applications
   */
  async getAllApplications(): Promise<BackendApplication[]> {
    try {
      const response = await apiService.get('/applications')
      return response.applications || response
    } catch (error) {
      console.error('Get all applications failed:', error)
      throw error
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId: string): Promise<BackendApplication> {
    try {
      const response = await apiService.get(`/applications/${applicationId}`)
      return response.application || response
    } catch (error) {
      console.error('Get application by ID failed:', error)
      throw error
    }
  }

  /**
   * Create new application
   */
  async createApplication(applicationData: CreateApplicationRequest): Promise<BackendApplication> {
    try {
      const response = await apiService.post('/applications', applicationData)
      return response.application || response
    } catch (error) {
      console.error('Create application failed:', error)
      throw error
    }
  }

  /**
   * Update application
   */
  async updateApplication(applicationId: string, applicationData: UpdateApplicationRequest): Promise<BackendApplication> {
    try {
      const response = await apiService.put(`/applications/${applicationId}`, applicationData)
      return response.application || response
    } catch (error) {
      console.error('Update application failed:', error)
      throw error
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(applicationId: string): Promise<void> {
    try {
      await apiService.delete(`/applications/${applicationId}`)
    } catch (error) {
      console.error('Delete application failed:', error)
      throw error
    }
  }

  /**
   * Get applications by user
   */
  async getApplicationsByUser(userId: string): Promise<BackendApplication[]> {
    try {
      const response = await apiService.get(`/applications/user/${userId}`)
      return response.applications || response
    } catch (error) {
      console.error('Get applications by user failed:', error)
      throw error
    }
  }

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(status: string): Promise<BackendApplication[]> {
    try {
      const response = await apiService.get(`/applications/status/${status}`)
      return response.applications || response
    } catch (error) {
      console.error('Get applications by status failed:', error)
      throw error
    }
  }
}

export const applicationsService = new ApplicationsService()
export default applicationsService