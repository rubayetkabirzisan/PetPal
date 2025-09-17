/**
 * Messages API Service
 * Handles messaging functionality with the backend
 */

import apiService from './ApiService'

export interface BackendMessage {
  _id: string
  text: string
  sender: 'user' | 'shelter'
  timestamp: string
  senderName?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMessageRequest {
  text: string
  sender: 'user' | 'shelter'
  senderName?: string
}

class MessagesService {
  /**
   * Get all messages
   */
  async getAllMessages(): Promise<BackendMessage[]> {
    try {
      const response = await apiService.get('/messages')
      return response.messages || response
    } catch (error) {
      console.error('Get all messages failed:', error)
      throw error
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<BackendMessage> {
    try {
      const response = await apiService.get(`/messages/${messageId}`)
      return response.message || response
    } catch (error) {
      console.error('Get message by ID failed:', error)
      throw error
    }
  }

  /**
   * Send new message
   */
  async sendMessage(messageData: CreateMessageRequest): Promise<BackendMessage> {
    try {
      // Add timestamp if not provided
      const messageWithTimestamp = {
        ...messageData,
        timestamp: new Date().toISOString()
      }
      
      const response = await apiService.post('/messages', messageWithTimestamp)
      return response.message || response
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiService.delete(`/messages/${messageId}`)
    } catch (error) {
      console.error('Delete message failed:', error)
      throw error
    }
  }

  /**
   * Get messages by sender
   */
  async getMessagesBySender(sender: 'user' | 'shelter'): Promise<BackendMessage[]> {
    try {
      const response = await apiService.get(`/messages/sender/${sender}`)
      return response.messages || response
    } catch (error) {
      console.error('Get messages by sender failed:', error)
      throw error
    }
  }

  /**
   * Get conversation messages (for chat functionality)
   */
  async getConversationMessages(conversationId?: string): Promise<BackendMessage[]> {
    try {
      const endpoint = conversationId ? `/messages/conversation/${conversationId}` : '/messages'
      const response = await apiService.get(endpoint)
      return response.messages || response
    } catch (error) {
      console.error('Get conversation messages failed:', error)
      throw error
    }
  }
}

export const messagesService = new MessagesService()
export default messagesService