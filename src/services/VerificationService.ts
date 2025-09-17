/**
 * VerificationService - Service for managing user verification requests
 * Handles verification requests for adopters and shelter admins
 */

import { apiService } from './ApiService'

// TypeScript interfaces for verification data
export interface VerificationRequest {
  _id?: string
  userId: string
  userType: 'adopter' | 'admin' | 'shelter' | 'foster'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  documentType: 'drivers_license' | 'passport' | 'id_card' | 'utility_bill' | 'other'
  documentUrl?: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_additional_info'
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  additionalDocuments?: string[]
  businessLicense?: string // For shelters/admin users
  organizationName?: string // For shelters/admin users
  createdAt?: string
  updatedAt?: string
}

export interface CreateVerificationRequestData {
  userId: string
  userType: 'adopter' | 'admin' | 'shelter' | 'foster'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  documentType: 'drivers_license' | 'passport' | 'id_card' | 'utility_bill' | 'other'
  documentUrl?: string
  notes?: string
  businessLicense?: string // For shelters/admin users
  organizationName?: string // For shelters/admin users
}

export interface UpdateVerificationRequestData {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_additional_info'
  notes?: string
  reviewedBy?: string
  rejectionReason?: string
  additionalDocuments?: string[]
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  documentType?: 'drivers_license' | 'passport' | 'id_card' | 'utility_bill' | 'other'
  documentUrl?: string
}

export class VerificationService {
  /**
   * Get all verification requests
   * @returns Promise<VerificationRequest[]>
   */
  static async getAllVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const response = await apiService.get('/verification/viewAll')
      return response.data as VerificationRequest[]
    } catch (error: any) {
      console.error('Error fetching verification requests:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch verification requests')
    }
  }

  /**
   * Create a new verification request
   * @param verificationData - The verification request data to create
   * @returns Promise<VerificationRequest>
   */
  static async createVerificationRequest(verificationData: CreateVerificationRequestData): Promise<VerificationRequest> {
    try {
      const response = await apiService.post('/verification/newReq', verificationData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error creating verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to create verification request')
    }
  }

  /**
   * Update verification request
   * @param requestId - The ID of the verification request to update
   * @param updateData - The data to update
   * @returns Promise<VerificationRequest>
   */
  static async updateVerificationRequest(requestId: string, updateData: UpdateVerificationRequestData): Promise<VerificationRequest> {
    try {
      const response = await apiService.put(`/verification/${requestId}`, updateData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error updating verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to update verification request')
    }
  }

  /**
   * Delete verification request
   * @param requestId - The ID of the verification request to delete
   * @returns Promise<{ message: string }>
   */
  static async deleteVerificationRequest(requestId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/verification/${requestId}`)
      return response.data as { message: string }
    } catch (error: any) {
      console.error('Error deleting verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete verification request')
    }
  }

  /**
   * Get verification request by ID
   * @param requestId - The ID of the verification request to retrieve
   * @returns Promise<VerificationRequest>
   */
  static async getVerificationRequestById(requestId: string): Promise<VerificationRequest> {
    try {
      const response = await apiService.get(`/verification/viewById/${requestId}`)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error fetching verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch verification request')
    }
  }

  /**
   * Get verification requests by user ID
   * @param userId - The ID of the user to get verification requests for
   * @returns Promise<VerificationRequest[]>
   */
  static async getVerificationRequestsByUserId(userId: string): Promise<VerificationRequest[]> {
    try {
      const response = await apiService.get(`/verification/viewByUser/${userId}`)
      return response.data as VerificationRequest[]
    } catch (error: any) {
      console.error('Error fetching verification requests by user:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch verification requests for user')
    }
  }

  /**
   * Get verification requests by status
   * @param status - The status to filter by
   * @returns Promise<VerificationRequest[]>
   */
  static async getVerificationRequestsByStatus(status: VerificationRequest['status']): Promise<VerificationRequest[]> {
    try {
      const response = await apiService.get(`/verification/viewByStatus/${status}`)
      return response.data as VerificationRequest[]
    } catch (error: any) {
      console.error('Error fetching verification requests by status:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch verification requests by status')
    }
  }

  /**
   * Approve verification request
   * @param requestId - The ID of the verification request to approve
   * @param reviewedBy - The ID of the admin who reviewed
   * @returns Promise<VerificationRequest>
   */
  static async approveVerificationRequest(requestId: string, reviewedBy: string): Promise<VerificationRequest> {
    try {
      const updateData = {
        status: 'approved' as const,
        reviewedBy,
        reviewedAt: new Date().toISOString()
      }
      const response = await apiService.put(`/verification/${requestId}`, updateData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error approving verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to approve verification request')
    }
  }

  /**
   * Reject verification request
   * @param requestId - The ID of the verification request to reject
   * @param rejectionReason - The reason for rejection
   * @param reviewedBy - The ID of the admin who reviewed
   * @returns Promise<VerificationRequest>
   */
  static async rejectVerificationRequest(requestId: string, rejectionReason: string, reviewedBy: string): Promise<VerificationRequest> {
    try {
      const updateData = {
        status: 'rejected' as const,
        rejectionReason,
        reviewedBy,
        reviewedAt: new Date().toISOString()
      }
      const response = await apiService.put(`/verification/${requestId}`, updateData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error rejecting verification request:', error)
      throw new Error(error.response?.data?.message || 'Failed to reject verification request')
    }
  }

  /**
   * Request additional information
   * @param requestId - The ID of the verification request
   * @param additionalInfo - The additional information needed
   * @param reviewedBy - The ID of the admin who reviewed
   * @returns Promise<VerificationRequest>
   */
  static async requestAdditionalInformation(requestId: string, additionalInfo: string, reviewedBy: string): Promise<VerificationRequest> {
    try {
      const updateData = {
        status: 'requires_additional_info' as const,
        notes: additionalInfo,
        reviewedBy,
        reviewedAt: new Date().toISOString()
      }
      const response = await apiService.put(`/verification/${requestId}`, updateData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error requesting additional information:', error)
      throw new Error(error.response?.data?.message || 'Failed to request additional information')
    }
  }

  /**
   * Upload additional document for verification
   * @param requestId - The ID of the verification request
   * @param documentUrl - The URL of the additional document
   * @returns Promise<VerificationRequest>
   */
  static async uploadAdditionalDocument(requestId: string, documentUrl: string): Promise<VerificationRequest> {
    try {
      // First get the current request to append to existing documents
      const currentRequest = await this.getVerificationRequestById(requestId)
      const additionalDocuments = [...(currentRequest.additionalDocuments || []), documentUrl]
      
      const updateData = {
        additionalDocuments,
        status: 'under_review' as const // Reset to under review when new document is uploaded
      }
      const response = await apiService.put(`/verification/${requestId}`, updateData)
      return response.data as VerificationRequest
    } catch (error: any) {
      console.error('Error uploading additional document:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload additional document')
    }
  }
}

export default VerificationService