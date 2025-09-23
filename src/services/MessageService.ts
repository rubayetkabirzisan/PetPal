import { API_CONFIG, apiCall } from '../config/api';

export interface Message {
  _id?: string;
  id?: string;
  senderId: string;
  receiverId: string;
  chatRoomId?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  readStatus: boolean;
  sentAt: Date;
  readAt?: Date;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    filename: string;
    size: number;
  }[];
  metadata?: {
    petId?: string;
    applicationId?: string;
    isSystemMessage?: boolean;
    actionType?: 'schedule_visit' | 'application_update' | 'adoption_approved';
  };
  
  // Populated fields
  sender?: {
    name: string;
    avatar?: string;
    userType: 'admin' | 'adopter';
  };
  receiver?: {
    name: string;
    avatar?: string;
    userType: 'admin' | 'adopter';
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatRoom {
  _id?: string;
  id?: string;
  participants: string[];
  petId?: string;
  applicationId?: string;
  roomType: 'adoption' | 'support' | 'general';
  lastMessage?: Message;
  lastActivity: Date;
  isActive: boolean;
  
  // Populated fields
  pet?: {
    name: string;
    type: string;
    images: string[];
  };
  participantDetails?: {
    userId: string;
    name: string;
    avatar?: string;
    userType: 'admin' | 'adopter';
    isOnline: boolean;
  }[];
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageResponse {
  success: boolean;
  data?: {
    message?: Message;
    messages?: Message[];
    chatRoom?: ChatRoom;
    chatRooms?: ChatRoom[];
    totalCount?: number;
    unreadCount?: number;
  };
  message?: string;
  error?: string;
}

export interface SendMessageData {
  senderId: string;
  receiverId: string;
  chatRoomId?: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  attachments?: {
    type: 'image' | 'file';
    url: string;
    filename: string;
    size: number;
  }[];
  metadata?: {
    petId?: string;
    applicationId?: string;
    actionType?: string;
  };
}

class MessageService {
  /**
   * Get all chat rooms for a user
   */
  async getChatRooms(userId: string, params?: {
    type?: 'adoption' | 'support' | 'general';
    isActive?: boolean;
    limit?: number;
    page?: number;
  }): Promise<MessageResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CHAT.ROOMS}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get chat rooms error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chat rooms',
      };
    }
  }

  /**
   * Get or create a chat room
   */
  async getOrCreateChatRoom(data: {
    userId: string;
    otherUserId: string;
    petId?: string;
    applicationId?: string;
    roomType?: 'adoption' | 'support' | 'general';
  }): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.ROOMS, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Get or create chat room error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get or create chat room',
      };
    }
  }

  /**
   * Get chat room details
   */
  async getChatRoom(chatRoomId: string, userId: string): Promise<MessageResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CHAT.ROOM(chatRoomId)}?userId=${userId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get chat room error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chat room',
      };
    }
  }

  /**
   * Get messages in a chat room
   */
  async getMessages(chatRoomId: string, params?: {
    userId?: string;
    page?: number;
    limit?: number;
    before?: Date;
  }): Promise<MessageResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.before) queryParams.append('before', params.before.toISOString());

      const url = `${API_CONFIG.ENDPOINTS.CHAT.MESSAGES(chatRoomId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiCall(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get messages error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get messages',
      };
    }
  }

  /**
   * Send a message
   */
  async sendMessage(chatRoomId: string, messageData: SendMessageData): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.SEND_MESSAGE(chatRoomId), {
        method: 'POST',
        body: JSON.stringify(messageData),
      });

      return response;
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatRoomId: string, userId: string, messageIds?: string[]): Promise<MessageResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.CHAT.ROOM(chatRoomId)}/read`, {
        method: 'PUT',
        body: JSON.stringify({ userId, messageIds }),
      });

      return response;
    } catch (error) {
      console.error('Mark messages as read error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read',
      };
    }
  }

  /**
   * Schedule a visit through chat
   */
  async scheduleVisit(chatRoomId: string, data: {
    userId: string;
    petId: string;
    proposedDate: Date;
    message?: string;
  }): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.SCHEDULE_VISIT(chatRoomId), {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Schedule visit error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule visit',
      };
    }
  }

  /**
   * View application through chat
   */
  async viewApplication(chatRoomId: string, data: {
    userId: string;
    applicationId: string;
  }): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.VIEW_APPLICATION(chatRoomId), {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('View application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to view application',
      };
    }
  }

  /**
   * Start voice call
   */
  async startVoiceCall(chatRoomId: string, data: {
    userId: string;
    callType: 'voice';
  }): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.VOICE_CALL(chatRoomId), {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Start voice call error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start voice call',
      };
    }
  }

  /**
   * Start video call
   */
  async startVideoCall(chatRoomId: string, data: {
    userId: string;
    callType: 'video';
  }): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.VIDEO_CALL(chatRoomId), {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Start video call error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start video call',
      };
    }
  }

  /**
   * Upload file attachment
   */
  async uploadAttachment(chatRoomId: string, data: {
    userId: string;
    file: File;
    type: 'image' | 'file';
  }): Promise<MessageResponse> {
    try {
      const formData = new FormData();
      formData.append('userId', data.userId);
      formData.append('file', data.file);
      formData.append('type', data.type);

      const response = await apiCall(API_CONFIG.ENDPOINTS.CHAT.ATTACH_FILE(chatRoomId), {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it for FormData
        },
      });

      return response;
    } catch (error) {
      console.error('Upload attachment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload attachment',
      };
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<MessageResponse> {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.MESSAGES.LIST}?userId=${userId}&unreadOnly=true&count=true`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get unread count',
      };
    }
  }
}

export default new MessageService();
