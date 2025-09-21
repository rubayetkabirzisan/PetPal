const express = require('express');
const router = express.Router();

// In-memory storage for chat rooms and messages (in production, this would be a database)
let chatRooms = [
  {
    id: "1",
    conversationId: "1",
    userId: "user-001",
    shelterId: "shelter-001",
    shelterName: "Happy Paws Shelter",
    shelterImage: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=100&h=100&fit=crop",
    status: "online", // online, offline, busy
    lastActivity: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    petId: "pet-001",
    applicationId: "app-001",
    roomType: "adoption_inquiry",
    shelterContact: {
      phone: "(555) 123-4567",
      email: "contact@happypaws.com",
      representative: "Sarah Johnson",
      role: "Adoption Coordinator"
    }
  },
  {
    id: "2",
    conversationId: "2",
    userId: "user-001",
    shelterId: "shelter-002",
    shelterName: "Feline Friends Rescue",
    shelterImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    status: "offline",
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    petId: "pet-002",
    applicationId: "app-002",
    roomType: "adoption_follow_up",
    shelterContact: {
      phone: "(555) 987-6543",
      email: "info@felinefriends.org",
      representative: "Mike Chen",
      role: "Volunteer Coordinator"
    }
  }
];

let chatMessages = [
  // Chat Room 1 - Happy Paws Shelter
  {
    id: "msg-chat-001",
    chatRoomId: "1",
    senderId: "user-001",
    senderType: "user",
    senderName: "John Doe",
    text: "Hi! I'm interested in learning about pets available for adoption at your shelter. Do you have any medium-sized dogs that are good with children?",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    status: "delivered", // sent, delivered, read
    editedAt: null,
    attachments: [],
    replyTo: null
  },
  {
    id: "msg-chat-002",
    chatRoomId: "1",
    senderId: "shelter-001",
    senderType: "shelter",
    senderName: "Sarah - Happy Paws Shelter",
    text: "Hello! Thank you for your interest in our shelter. We currently have several medium-sized dogs that are great with children. We have a 3-year-old Lab mix and a 2-year-old Beagle who are both very friendly and well-socialized.",
    timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    status: "read",
    editedAt: null,
    attachments: [],
    replyTo: null
  },
  {
    id: "msg-chat-003",
    chatRoomId: "1",
    senderId: "user-001",
    senderType: "user",
    senderName: "John Doe",
    text: "That sounds perfect! I have a 5-year-old daughter and we're looking for an active companion. What's the next step to visit the shelter?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    status: "read",
    editedAt: null,
    attachments: [],
    replyTo: null
  },
  {
    id: "msg-chat-004",
    chatRoomId: "1",
    senderId: "shelter-001",
    senderType: "shelter",
    senderName: "Sarah - Happy Paws Shelter",
    text: "Wonderful! You can schedule a visit to our shelter through our online calendar. We're open daily from 10AM to 5PM. Would you like me to send you the link to schedule a visit?",
    timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    status: "read",
    editedAt: null,
    attachments: [],
    replyTo: null
  },
  
  // Chat Room 2 - Feline Friends Rescue
  {
    id: "msg-chat-005",
    chatRoomId: "2",
    senderId: "shelter-002",
    senderType: "shelter",
    senderName: "Mike - Feline Friends Rescue",
    text: "Hi John! Thanks for your application for Bella. We've reviewed it and everything looks great. Are you available for a meet and greet this weekend?",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    status: "delivered",
    editedAt: null,
    attachments: [],
    replyTo: null
  }
];

// Chat actions log (for tracking quick actions, calls, etc.)
let chatActions = [];
let actionIdCounter = 1;

// Active call sessions storage
let activeCalls = new Map(); // callId -> { type, participants, startTime, status, roomUrl }

// Call queue for managing incoming and outgoing calls
let callQueue = [];
let callIdCounter = 1;

// Call configuration and settings
const CALL_CONFIG = {
  voice: {
    maxDuration: 30 * 60 * 1000, // 30 minutes
    autoEndTimeout: 35 * 60 * 1000, // 35 minutes auto-cleanup
    ringTimeout: 30000, // 30 seconds ring time
    twilioEnabled: true, // In production, integrate with Twilio
    supportedCodecs: ['G.711', 'G.729', 'Opus']
  },
  video: {
    maxDuration: 45 * 60 * 1000, // 45 minutes
    autoEndTimeout: 50 * 60 * 1000, // 50 minutes auto-cleanup
    ringTimeout: 45000, // 45 seconds ring time
    webRTCEnabled: true, // In production, integrate with WebRTC/Agora
    maxResolution: '1080p',
    supportedFeatures: ['screen_share', 'chat', 'recording', 'whiteboard']
  },
  general: {
    maxConcurrentCalls: 3,
    callLogRetention: 24 * 60 * 60 * 1000, // 24 hours
    enableCallRecording: false, // Privacy compliance
    emergencyCallsEnabled: true
  }
};

// Typing indicators
let typingIndicators = new Map(); // chatRoomId -> { userId, timestamp }

// Helper function to format timestamp for display
const formatChatTimestamp = (timestamp) => {
  const messageDate = new Date(timestamp);
  return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Helper function to check if user has access to chat room
const hasRoomAccess = (chatRoomId, userId) => {
  const room = chatRooms.find(room => room.id === chatRoomId);
  return room && (room.userId === userId || room.shelterId === userId);
};

// Helper function to generate unique call ID
const generateCallId = (type) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}-${timestamp}-${random}`;
};

// Helper function to check if user can make a call
const canUserMakeCall = (userId) => {
  const userActiveCalls = Array.from(activeCalls.values())
    .filter(call => call.participants.includes(userId) && call.status !== 'ended');
  
  return userActiveCalls.length < CALL_CONFIG.general.maxConcurrentCalls;
};

// Helper function to initiate external call service (Twilio/WebRTC)
const initiateExternalCall = async (callType, callId, participants, roomData) => {
  try {
    if (callType === 'voice') {
      // In production: Integrate with Twilio Voice API
      const voiceCall = {
        service: 'twilio_voice',
        callSid: `voice_${callId}`,
        from: '+15551234567', // Twilio number
        to: roomData.shelterContact.phone,
        url: `https://api.petpal.com/voice/webhook/${callId}`,
        statusCallback: `https://api.petpal.com/voice/status/${callId}`,
        record: CALL_CONFIG.general.enableCallRecording
      };
      
      // Simulate Twilio API call
      console.log('Initiating Twilio voice call:', voiceCall);
      
      return {
        success: true,
        callSid: voiceCall.callSid,
        dialUrl: `tel:${roomData.shelterContact.phone}`,
        estimatedConnection: '5-10 seconds'
      };
      
    } else if (callType === 'video') {
      // In production: Integrate with Agora/WebRTC
      const videoCall = {
        service: 'agora_rtc',
        channelName: `petpal_${callId}`,
        appId: 'your_agora_app_id',
        token: `temp_token_${callId}`, // Generate temporary token
        uid: participants[0],
        roomUrl: `https://meet.petpal.com/room/${callId}`,
        features: CALL_CONFIG.video.supportedFeatures
      };
      
      // Simulate Agora SDK initialization
      console.log('Initiating Agora video call:', videoCall);
      
      return {
        success: true,
        channelName: videoCall.channelName,
        token: videoCall.token,
        roomUrl: videoCall.roomUrl,
        appId: videoCall.appId,
        estimatedConnection: '3-5 seconds'
      };
    }
  } catch (error) {
    console.error('Error initiating external call:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to send call notification to participants
const sendCallNotification = async (callId, callType, initiator, participants, roomData) => {
  try {
    // In production: Send push notifications via FCM/APNs
    const notification = {
      type: 'incoming_call',
      callId: callId,
      callType: callType,
      from: initiator,
      shelterName: roomData.shelterName,
      representative: roomData.shelterContact.representative,
      title: `Incoming ${callType} call`,
      body: `${roomData.shelterContact.representative} from ${roomData.shelterName} is calling`,
      actions: ['accept', 'decline'],
      priority: 'high',
      sound: 'call_ringtone.mp3'
    };
    
    // Simulate push notification sending
    console.log('Sending call notification:', notification);
    
    return {
      success: true,
      notificationId: `notif_${Date.now()}`,
      deliveredTo: participants.length
    };
  } catch (error) {
    console.error('Error sending call notification:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to handle call state changes
const updateCallState = (callId, newState, additionalData = {}) => {
  if (activeCalls.has(callId)) {
    const call = activeCalls.get(callId);
    call.status = newState;
    call.lastUpdated = new Date().toISOString();
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      call[key] = additionalData[key];
    });
    
    activeCalls.set(callId, call);
    
    // Log state change for monitoring
    console.log(`Call ${callId} state changed to: ${newState}`, additionalData);
    
    return call;
  }
  return null;
};

// GET /api/chat - Get all chat rooms for a user
router.get('/', (req, res) => {
  try {
    const { userId, status } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let userChatRooms = chatRooms.filter(room => 
      room.userId === userId || room.shelterId === userId
    );
    
    // Filter by status if provided
    if (status) {
      userChatRooms = userChatRooms.filter(room => room.status === status);
    }
    
    // Sort by last activity (most recent first)
    userChatRooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    
    // Add unread message count and last message info
    const roomsWithInfo = userChatRooms.map(room => {
      const roomMessages = chatMessages.filter(msg => msg.chatRoomId === room.id);
      const lastMessage = roomMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      const unreadCount = roomMessages.filter(msg => 
        msg.senderType !== (room.userId === userId ? 'user' : 'shelter') && 
        msg.status !== 'read'
      ).length;
      
      return {
        ...room,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          timestampFormatted: formatChatTimestamp(lastMessage.timestamp),
          senderName: lastMessage.senderName
        } : null,
        unreadCount: unreadCount,
        messageCount: roomMessages.length
      };
    });
    
    res.json({
      success: true,
      data: {
        chatRooms: roomsWithInfo,
        totalRooms: userChatRooms.length,
        activeRooms: userChatRooms.filter(room => room.status === 'online').length
      }
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms',
      error: error.message
    });
  }
});

// GET /api/chat/:chatRoomId - Get chat room details and messages
router.get('/:chatRoomId', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    
    // Get messages for this chat room
    let roomMessages = chatMessages
      .filter(msg => msg.chatRoomId === chatRoomId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = roomMessages.slice(startIndex, endIndex);
    
    // Format messages with display timestamps
    const formattedMessages = paginatedMessages.map(msg => ({
      ...msg,
      timestampFormatted: formatChatTimestamp(msg.timestamp)
    }));
    
    // Check if there's someone typing
    const isTyping = typingIndicators.has(chatRoomId);
    const typingInfo = isTyping ? typingIndicators.get(chatRoomId) : null;
    
    res.json({
      success: true,
      data: {
        chatRoom: chatRoom,
        messages: formattedMessages,
        typing: {
          isTyping: isTyping,
          user: typingInfo
        },
        pagination: {
          total: roomMessages.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < roomMessages.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat room details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat room details',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/send - Send a message in chat room
router.post('/:chatRoomId/send', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, text, messageType = 'text', replyTo, attachments = [] } = req.body;
    
    if (!userId || !text) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message text are required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    const senderType = chatRoom.userId === userId ? 'user' : 'shelter';
    const senderName = senderType === 'user' ? 'John Doe' : chatRoom.shelterContact.representative + ' - ' + chatRoom.shelterName;
    
    // Create new message
    const newMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: senderType,
      senderName: senderName,
      text: text,
      timestamp: new Date().toISOString(),
      messageType: messageType,
      status: 'sent',
      editedAt: null,
      attachments: attachments,
      replyTo: replyTo || null
    };
    
    chatMessages.push(newMessage);
    
    // Update chat room last activity
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex] = {
      ...chatRooms[roomIndex],
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Remove typing indicator
    typingIndicators.delete(chatRoomId);
    
    // Simulate message delivery status update
    setTimeout(() => {
      const messageIndex = chatMessages.findIndex(msg => msg.id === newMessage.id);
      if (messageIndex !== -1) {
        chatMessages[messageIndex].status = 'delivered';
      }
    }, 1000);
    
    // Simulate auto-reply from shelter (for demo purposes)
    if (senderType === 'user') {
      setTimeout(() => {
        const autoReply = {
          id: `msg-chat-${Date.now() + 1}`,
          chatRoomId: chatRoomId,
          senderId: chatRoom.shelterId,
          senderType: 'shelter',
          senderName: chatRoom.shelterContact.representative + ' - ' + chatRoom.shelterName,
          text: "Thank you for your message! I'll get back to you shortly.",
          timestamp: new Date().toISOString(),
          messageType: 'text',
          status: 'sent',
          editedAt: null,
          attachments: [],
          replyTo: null
        };
        
        chatMessages.push(autoReply);
        
        // Update room activity
        chatRooms[roomIndex].lastActivity = new Date().toISOString();
        chatRooms[roomIndex].updatedAt = new Date().toISOString();
      }, 2000);
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          ...newMessage,
          timestampFormatted: formatChatTimestamp(newMessage.timestamp)
        },
        chatRoom: chatRooms[roomIndex]
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/typing - Set typing indicator
router.post('/:chatRoomId/typing', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, isTyping } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    if (isTyping) {
      typingIndicators.set(chatRoomId, {
        userId: userId,
        timestamp: new Date().toISOString()
      });
      
      // Auto-remove typing indicator after 5 seconds
      setTimeout(() => {
        typingIndicators.delete(chatRoomId);
      }, 5000);
    } else {
      typingIndicators.delete(chatRoomId);
    }
    
    res.json({
      success: true,
      message: `Typing indicator ${isTyping ? 'set' : 'removed'}`,
      data: {
        isTyping: isTyping,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error setting typing indicator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set typing indicator',
      error: error.message
    });
  }
});

// PUT /api/chat/:chatRoomId/messages/:messageId/status - Update message status (read/delivered)
router.put('/:chatRoomId/messages/:messageId/status', (req, res) => {
  try {
    const { chatRoomId, messageId } = req.params;
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: 'User ID and status are required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const messageIndex = chatMessages.findIndex(msg => 
      msg.id === messageId && msg.chatRoomId === chatRoomId
    );
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Update message status
    chatMessages[messageIndex].status = status;
    
    res.json({
      success: true,
      message: `Message status updated to ${status}`,
      data: {
        message: {
          ...chatMessages[messageIndex],
          timestampFormatted: formatChatTimestamp(chatMessages[messageIndex].timestamp)
        }
      }
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/actions/schedule-visit - Handle schedule visit quick action
router.post('/:chatRoomId/actions/schedule-visit', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, preferredDate, preferredTime, notes } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    
    // Create system message for visit request
    const visitMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: 'user',
      senderName: 'John Doe',
      text: "I'd like to schedule a visit to meet the pet. What times are available?",
      timestamp: new Date().toISOString(),
      messageType: 'action',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null
    };
    
    chatMessages.push(visitMessage);
    
    // Log the action
    const action = {
      id: actionIdCounter++,
      chatRoomId: chatRoomId,
      userId: userId,
      actionType: 'schedule_visit',
      details: {
        preferredDate: preferredDate,
        preferredTime: preferredTime,
        notes: notes
      },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    chatActions.push(action);
    
    // Update chat room
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex].lastActivity = new Date().toISOString();
    
    // Simulate shelter response
    setTimeout(() => {
      const response = {
        id: `msg-chat-${Date.now() + 1}`,
        chatRoomId: chatRoomId,
        senderId: chatRoom.shelterId,
        senderType: 'shelter',
        senderName: chatRoom.shelterContact.representative + ' - ' + chatRoom.shelterName,
        text: "Great! We're available for visits Monday-Friday 10am-6pm, and weekends 9am-5pm. What day works best for you?",
        timestamp: new Date().toISOString(),
        messageType: 'text',
        status: 'sent',
        editedAt: null,
        attachments: [],
        replyTo: null
      };
      
      chatMessages.push(response);
    }, 1500);
    
    res.status(201).json({
      success: true,
      message: 'Visit request sent successfully',
      data: {
        message: {
          ...visitMessage,
          timestampFormatted: formatChatTimestamp(visitMessage.timestamp)
        },
        action: action
      }
    });
  } catch (error) {
    console.error('Error scheduling visit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule visit',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/actions/view-application - Handle view application quick action
router.post('/:chatRoomId/actions/view-application', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    
    // Create system message for application status inquiry
    const appMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: 'user',
      senderName: 'John Doe',
      text: "Can you tell me the status of my adoption application?",
      timestamp: new Date().toISOString(),
      messageType: 'action',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null
    };
    
    chatMessages.push(appMessage);
    
    // Log the action
    const action = {
      id: actionIdCounter++,
      chatRoomId: chatRoomId,
      userId: userId,
      actionType: 'view_application',
      details: {
        applicationId: chatRoom.applicationId
      },
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    chatActions.push(action);
    
    // Update chat room
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex].lastActivity = new Date().toISOString();
    
    // Simulate shelter response with application status
    setTimeout(() => {
      const response = {
        id: `msg-chat-${Date.now() + 1}`,
        chatRoomId: chatRoomId,
        senderId: chatRoom.shelterId,
        senderType: 'shelter',
        senderName: chatRoom.shelterContact.representative + ' - ' + chatRoom.shelterName,
        text: "Your application is currently under review. We should have an update for you within 2-3 business days. Thank you for your patience!",
        timestamp: new Date().toISOString(),
        messageType: 'text',
        status: 'sent',
        editedAt: null,
        attachments: [],
        replyTo: null
      };
      
      chatMessages.push(response);
    }, 1500);
    
    res.status(201).json({
      success: true,
      message: 'Application status request sent successfully',
      data: {
        message: {
          ...appMessage,
          timestampFormatted: formatChatTimestamp(appMessage.timestamp)
        },
        action: action,
        applicationStatus: {
          id: chatRoom.applicationId,
          status: 'Under Review',
          submittedDate: '2025-09-15',
          expectedResponse: '2-3 business days'
        }
      }
    });
  } catch (error) {
    console.error('Error viewing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view application',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/actions/voice-call - Initiate voice call
router.post('/:chatRoomId/actions/voice-call', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, priority = 'normal' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    // Check if user can make a call
    if (!canUserMakeCall(userId)) {
      return res.status(429).json({
        success: false,
        message: 'Maximum concurrent calls reached. Please end an existing call first.'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    const callId = generateCallId('voice');
    const participants = [userId, chatRoom.shelterId];
    
    // Check shelter availability (simulated)
    const shelterAvailable = chatRoom.status === 'online' || priority === 'emergency';
    if (!shelterAvailable && priority !== 'emergency') {
      return res.status(503).json({
        success: false,
        message: 'Shelter is currently offline. Please try again later or leave a message.',
        shelterStatus: chatRoom.status,
        alternativeActions: ['leave_message', 'schedule_callback', 'emergency_call']
      });
    }
    
    // Create active call session with comprehensive data
    const callSession = {
      type: 'voice',
      chatRoomId: chatRoomId,
      participants: participants,
      initiator: userId,
      target: chatRoom.shelterId,
      startTime: new Date().toISOString(),
      status: 'initiating',
      priority: priority,
      shelterContact: chatRoom.shelterContact.phone,
      shelterName: chatRoom.shelterName,
      representative: chatRoom.shelterContact.representative,
      callConfig: {
        codec: 'Opus',
        bitrate: '64kbps',
        encryption: 'DTLS-SRTP',
        recordingEnabled: CALL_CONFIG.general.enableCallRecording
      },
      metadata: {
        userAgent: req.headers['user-agent'] || 'PetPal-Mobile',
        timestamp: Date.now(),
        timezone: 'UTC',
        sessionId: `session_${Date.now()}`
      }
    };
    
    activeCalls.set(callId, callSession);
    
    // Initiate external call service (Twilio/Native dialer)
    const externalCallResult = await initiateExternalCall('voice', callId, participants, chatRoom);
    
    if (!externalCallResult.success) {
      activeCalls.delete(callId);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate call through external service',
        error: externalCallResult.error
      });
    }
    
    // Update call status to ringing
    updateCallState(callId, 'ringing', {
      callSid: externalCallResult.callSid,
      dialUrl: externalCallResult.dialUrl
    });
    
    // Send notification to shelter
    const notificationResult = await sendCallNotification(
      callId, 
      'voice', 
      userId, 
      [chatRoom.shelterId], 
      chatRoom
    );
    
    // Create system message for voice call initiation
    const callMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: 'system',
      senderName: 'PetPal System',
      text: `📞 Voice call initiated with ${chatRoom.shelterName} (${chatRoom.shelterContact.representative})`,
      timestamp: new Date().toISOString(),
      messageType: 'call_initiation',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null,
      callData: {
        callId: callId,
        callType: 'voice',
        status: 'ringing'
      }
    };
    
    chatMessages.push(callMessage);
    
    // Log the action with comprehensive details
    const action = {
      id: actionIdCounter++,
      chatRoomId: chatRoomId,
      userId: userId,
      actionType: 'voice_call_initiate',
      details: {
        callId: callId,
        shelterContact: chatRoom.shelterContact.phone,
        callStatus: 'ringing',
        callType: 'voice',
        priority: priority,
        externalCallSid: externalCallResult.callSid,
        estimatedConnection: externalCallResult.estimatedConnection
      },
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    
    chatActions.push(action);
    
    // Auto-answer simulation for shelter (in production, this would be handled by the shelter's device)
    setTimeout(() => {
      if (activeCalls.has(callId) && activeCalls.get(callId).status === 'ringing') {
        updateCallState(callId, 'connected', {
          connectedAt: new Date().toISOString(),
          callQuality: 'HD',
          connection: 'stable'
        });
        
        // Add connected message
        const connectedMessage = {
          id: `msg-chat-${Date.now() + 1}`,
          chatRoomId: chatRoomId,
          senderId: 'system',
          senderType: 'system',
          senderName: 'PetPal System',
          text: `✅ Voice call connected with ${chatRoom.shelterContact.representative}`,
          timestamp: new Date().toISOString(),
          messageType: 'call_connected',
          status: 'sent',
          editedAt: null,
          attachments: [],
          replyTo: null
        };
        
        chatMessages.push(connectedMessage);
      }
    }, 3000); // Simulate 3 second connection time
    
    // Auto-cleanup call after configured timeout
    setTimeout(() => {
      if (activeCalls.has(callId) && activeCalls.get(callId).status !== 'ended') {
        updateCallState(callId, 'timeout');
        activeCalls.delete(callId);
      }
    }, CALL_CONFIG.voice.autoEndTimeout);
    
    // Update chat room activity
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex].lastActivity = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      message: 'Voice call initiated successfully',
      data: {
        callId: callId,
        status: 'ringing',
        message: {
          ...callMessage,
          timestampFormatted: formatChatTimestamp(callMessage.timestamp)
        },
        action: action,
        callDetails: {
          callId: callId,
          callType: 'voice',
          status: 'ringing',
          shelterContact: chatRoom.shelterContact.phone,
          shelterName: chatRoom.shelterName,
          representative: chatRoom.shelterContact.representative,
          dialUrl: externalCallResult.dialUrl,
          callSid: externalCallResult.callSid,
          estimatedConnection: externalCallResult.estimatedConnection,
          maxDuration: CALL_CONFIG.voice.maxDuration / 60000 + ' minutes',
          features: ['mute', 'hold', 'transfer', 'conference']
        },
        notification: {
          sent: notificationResult.success,
          deliveredTo: notificationResult.deliveredTo || 0
        }
      }
    });
  } catch (error) {
    console.error('Error initiating voice call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate voice call',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/actions/video-call - Initiate video call
router.post('/:chatRoomId/actions/video-call', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, quality = 'HD', features = [] } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    // Check if user can make a video call
    if (!canUserMakeCall(userId)) {
      return res.status(429).json({
        success: false,
        message: 'Maximum concurrent calls reached. Please end an existing call first.'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    const callId = generateCallId('video');
    const participants = [userId, chatRoom.shelterId];
    
    // Check shelter video capability
    const shelterVideoEnabled = chatRoom.status === 'online';
    if (!shelterVideoEnabled) {
      return res.status(503).json({
        success: false,
        message: 'Shelter video services are currently unavailable. Please try voice call or message instead.',
        alternativeActions: ['voice_call', 'leave_message', 'schedule_video_call']
      });
    }
    
    // Merge requested features with supported features
    const enabledFeatures = [
      ...CALL_CONFIG.video.supportedFeatures,
      ...features.filter(f => CALL_CONFIG.video.supportedFeatures.includes(f))
    ];
    
    // Create comprehensive video call session
    const videoSession = {
      type: 'video',
      chatRoomId: chatRoomId,
      participants: participants,
      initiator: userId,
      target: chatRoom.shelterId,
      startTime: new Date().toISOString(),
      status: 'initializing',
      quality: quality,
      features: enabledFeatures,
      shelterName: chatRoom.shelterName,
      representative: chatRoom.shelterContact.representative,
      videoConfig: {
        resolution: quality === 'HD' ? '1280x720' : '640x480',
        frameRate: 30,
        bitrate: quality === 'HD' ? '1.5Mbps' : '800Kbps',
        codec: 'H.264',
        encryption: 'DTLS-SRTP'
      },
      audioConfig: {
        codec: 'Opus',
        bitrate: '64kbps',
        sampleRate: '48kHz',
        echoCancellation: true,
        noiseSuppression: true
      },
      metadata: {
        browser: req.headers['user-agent'] || 'PetPal-Mobile',
        timestamp: Date.now(),
        sessionId: `video_session_${Date.now()}`
      }
    };
    
    activeCalls.set(callId, videoSession);
    
    // Initiate external video call service (Agora/WebRTC)
    const externalCallResult = await initiateExternalCall('video', callId, participants, chatRoom);
    
    if (!externalCallResult.success) {
      activeCalls.delete(callId);
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize video call service',
        error: externalCallResult.error
      });
    }
    
    // Update call status to preparing
    updateCallState(callId, 'preparing', {
      channelName: externalCallResult.channelName,
      token: externalCallResult.token,
      roomUrl: externalCallResult.roomUrl,
      appId: externalCallResult.appId
    });
    
    // Send video call invitation to shelter
    const notificationResult = await sendCallNotification(
      callId, 
      'video', 
      userId, 
      [chatRoom.shelterId], 
      chatRoom
    );
    
    // Create system message for video call initiation
    const videoCallMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: 'system',
      senderName: 'PetPal System',
      text: `📹 Video call initiated with ${chatRoom.shelterName} (${chatRoom.shelterContact.representative})`,
      timestamp: new Date().toISOString(),
      messageType: 'video_call_initiation',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null,
      callData: {
        callId: callId,
        callType: 'video',
        status: 'preparing',
        roomUrl: externalCallResult.roomUrl
      }
    };
    
    chatMessages.push(videoCallMessage);
    
    // Log the comprehensive action
    const action = {
      id: actionIdCounter++,
      chatRoomId: chatRoomId,
      userId: userId,
      actionType: 'video_call_initiate',
      details: {
        callId: callId,
        roomUrl: externalCallResult.roomUrl,
        channelName: externalCallResult.channelName,
        callStatus: 'preparing',
        callType: 'video',
        quality: quality,
        features: enabledFeatures,
        estimatedConnection: externalCallResult.estimatedConnection
      },
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    
    chatActions.push(action);
    
    // Simulate video room preparation and connection
    setTimeout(() => {
      if (activeCalls.has(callId) && activeCalls.get(callId).status === 'preparing') {
        updateCallState(callId, 'waiting_for_participants', {
          roomReady: true,
          waitingStartTime: new Date().toISOString()
        });
        
        // Add room ready message
        const roomReadyMessage = {
          id: `msg-chat-${Date.now() + 1}`,
          chatRoomId: chatRoomId,
          senderId: 'system',
          senderType: 'system',
          senderName: 'PetPal System',
          text: `🎥 Video call room is ready. Waiting for ${chatRoom.shelterContact.representative} to join...`,
          timestamp: new Date().toISOString(),
          messageType: 'video_room_ready',
          status: 'sent',
          editedAt: null,
          attachments: [],
          replyTo: null
        };
        
        chatMessages.push(roomReadyMessage);
      }
    }, 2000);
    
    // Simulate shelter joining the video call
    setTimeout(() => {
      if (activeCalls.has(callId) && activeCalls.get(callId).status === 'waiting_for_participants') {
        updateCallState(callId, 'connected', {
          connectedAt: new Date().toISOString(),
          videoQuality: quality,
          participantsConnected: 2,
          streamStatus: 'active'
        });
        
        // Add connected message
        const connectedMessage = {
          id: `msg-chat-${Date.now() + 2}`,
          chatRoomId: chatRoomId,
          senderId: 'system',
          senderType: 'system',
          senderName: 'PetPal System',
          text: `✅ Video call connected! Both participants are now in the call.`,
          timestamp: new Date().toISOString(),
          messageType: 'video_call_connected',
          status: 'sent',
          editedAt: null,
          attachments: [],
          replyTo: null
        };
        
        chatMessages.push(connectedMessage);
      }
    }, 5000);
    
    // Auto-cleanup call after configured timeout
    setTimeout(() => {
      if (activeCalls.has(callId) && activeCalls.get(callId).status !== 'ended') {
        updateCallState(callId, 'timeout');
        activeCalls.delete(callId);
      }
    }, CALL_CONFIG.video.autoEndTimeout);
    
    // Update chat room activity
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex].lastActivity = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      message: 'Video call initiated successfully',
      data: {
        callId: callId,
        status: 'preparing',
        message: {
          ...videoCallMessage,
          timestampFormatted: formatChatTimestamp(videoCallMessage.timestamp)
        },
        action: action,
        callDetails: {
          callId: callId,
          callType: 'video',
          status: 'preparing',
          roomUrl: externalCallResult.roomUrl,
          channelName: externalCallResult.channelName,
          token: externalCallResult.token,
          appId: externalCallResult.appId,
          shelterName: chatRoom.shelterName,
          representative: chatRoom.shelterContact.representative,
          quality: quality,
          maxDuration: CALL_CONFIG.video.maxDuration / 60000 + ' minutes',
          features: enabledFeatures,
          videoConfig: videoSession.videoConfig,
          audioConfig: videoSession.audioConfig,
          joinInstructions: 'The video call room is being prepared. You will be notified when ready to join.'
        },
        notification: {
          sent: notificationResult.success,
          deliveredTo: notificationResult.deliveredTo || 0
        }
      }
    });
  } catch (error) {
    console.error('Error initiating video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate video call',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/actions/attach-file - Handle file attachment
router.post('/:chatRoomId/actions/attach-file', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, fileType, fileName, fileUrl, fileSize } = req.body;
    
    if (!userId || !fileType || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'User ID, file type, and file name are required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
    const senderType = chatRoom.userId === userId ? 'user' : 'shelter';
    
    // Create message with attachment
    const attachmentMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: senderType,
      senderName: senderType === 'user' ? 'John Doe' : chatRoom.shelterContact.representative + ' - ' + chatRoom.shelterName,
      text: `📎 ${fileName}`,
      timestamp: new Date().toISOString(),
      messageType: 'attachment',
      status: 'sent',
      editedAt: null,
      attachments: [{
        id: `attach-${Date.now()}`,
        fileName: fileName,
        fileType: fileType,
        fileUrl: fileUrl || `https://files.petpal.com/${fileName}`,
        fileSize: fileSize || '1.2 MB'
      }],
      replyTo: null
    };
    
    chatMessages.push(attachmentMessage);
    
    // Log the action
    const action = {
      id: actionIdCounter++,
      chatRoomId: chatRoomId,
      userId: userId,
      actionType: 'file_attachment',
      details: {
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize
      },
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    chatActions.push(action);
    
    // Update chat room
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex].lastActivity = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      message: 'File attached successfully',
      data: {
        message: {
          ...attachmentMessage,
          timestampFormatted: formatChatTimestamp(attachmentMessage.timestamp)
        },
        action: action
      }
    });
  } catch (error) {
    console.error('Error attaching file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to attach file',
      error: error.message
    });
  }
});

// GET /api/chat/:chatRoomId/actions - Get chat actions history
router.get('/:chatRoomId/actions', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, actionType, limit = 20, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    let roomActions = chatActions.filter(action => action.chatRoomId === chatRoomId);
    
    // Filter by action type if provided
    if (actionType) {
      roomActions = roomActions.filter(action => action.actionType === actionType);
    }
    
    // Sort by timestamp (most recent first)
    roomActions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedActions = roomActions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        actions: paginatedActions,
        pagination: {
          total: roomActions.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < roomActions.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat actions',
      error: error.message
    });
  }
});

// GET /api/chat/:chatRoomId/calls/active - Get active calls for a chat room
router.get('/:chatRoomId/calls/active', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    // Find active calls for this chat room
    const activeRoomCalls = Array.from(activeCalls.entries())
      .filter(([callId, call]) => 
        call.chatRoomId === chatRoomId && 
        call.status !== 'ended' && 
        call.participants.includes(userId)
      )
      .map(([callId, call]) => ({
        callId: callId,
        type: call.type,
        status: call.status,
        startTime: call.startTime,
        participants: call.participants,
        roomUrl: call.roomUrl,
        shelterName: call.shelterName,
        features: call.features || []
      }));
    
    res.json({
      success: true,
      data: {
        activeCalls: activeRoomCalls,
        callCount: activeRoomCalls.length
      }
    });
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active calls',
      error: error.message
    });
  }
});

// PUT /api/chat/:chatRoomId/calls/:callId/end - End an active call
router.put('/:chatRoomId/calls/:callId/end', (req, res) => {
  try {
    const { chatRoomId, callId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    // Check if call exists and user is a participant
    if (!activeCalls.has(callId)) {
      return res.status(404).json({
        success: false,
        message: 'Call not found or already ended'
      });
    }
    
    const call = activeCalls.get(callId);
    if (!call.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this call'
      });
    }
    
    // Calculate call duration
    const startTime = new Date(call.startTime);
    const endTime = new Date();
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    
    // End the call
    call.status = 'ended';
    call.endTime = endTime.toISOString();
    call.duration = `${durationMinutes} minutes`;
    
    // Create system message for call end
    const endMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: userId,
      senderType: 'system',
      senderName: 'System',
      text: `📞 ${call.type === 'video' ? 'Video' : 'Voice'} call ended (Duration: ${call.duration})`,
      timestamp: new Date().toISOString(),
      messageType: 'system',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null
    };
    
    chatMessages.push(endMessage);
    
    // Remove from active calls after a delay (keep for history)
    setTimeout(() => {
      activeCalls.delete(callId);
    }, 60000); // Keep for 1 minute for history
    
    // Update chat room
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    if (roomIndex !== -1) {
      chatRooms[roomIndex].lastActivity = new Date().toISOString();
    }
    
    res.json({
      success: true,
      message: 'Call ended successfully',
      data: {
        callId: callId,
        duration: call.duration,
        endTime: call.endTime,
        message: {
          ...endMessage,
          timestampFormatted: formatChatTimestamp(endMessage.timestamp)
        }
      }
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end call',
      error: error.message
    });
  }
});

// GET /api/chat/:chatRoomId/calls/:callId/status - Get call status
router.get('/:chatRoomId/calls/:callId/status', (req, res) => {
  try {
    const { chatRoomId, callId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    // Check if call exists
    if (!activeCalls.has(callId)) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }
    
    const call = activeCalls.get(callId);
    
    // Calculate current call duration if still active
    let currentDuration = null;
    if (call.status !== 'ended') {
      const startTime = new Date(call.startTime);
      const now = new Date();
      const durationMinutes = Math.floor((now - startTime) / (1000 * 60));
      currentDuration = `${durationMinutes} minutes`;
    }
    
    res.json({
      success: true,
      data: {
        callId: callId,
        type: call.type,
        status: call.status,
        startTime: call.startTime,
        endTime: call.endTime || null,
        duration: call.duration || currentDuration,
        participants: call.participants,
        roomUrl: call.roomUrl || null,
        shelterName: call.shelterName,
        features: call.features || []
      }
    });
  } catch (error) {
    console.error('Error fetching call status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call status',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/calls/:callId/answer - Answer an incoming call
router.post('/:chatRoomId/calls/:callId/answer', async (req, res) => {
  try {
    const { chatRoomId, callId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access and call exists
    if (!hasRoomAccess(chatRoomId, userId) || !activeCalls.has(callId)) {
      return res.status(404).json({
        success: false,
        message: 'Call not found or access denied'
      });
    }
    
    const call = activeCalls.get(callId);
    
    if (!call.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this call'
      });
    }
    
    if (call.status !== 'ringing' && call.status !== 'waiting_for_participants') {
      return res.status(400).json({
        success: false,
        message: `Cannot answer call in ${call.status} state`
      });
    }
    
    // Answer the call
    updateCallState(callId, 'connected', {
      answeredBy: userId,
      answeredAt: new Date().toISOString(),
      connectionQuality: 'excellent'
    });
    
    // Create answer message
    const answerMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: 'system',
      senderType: 'system',
      senderName: 'PetPal System',
      text: `📞 Call answered and connected successfully`,
      timestamp: new Date().toISOString(),
      messageType: 'call_answered',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null
    };
    
    chatMessages.push(answerMessage);
    
    res.json({
      success: true,
      message: 'Call answered successfully',
      data: {
        callId: callId,
        status: 'connected',
        connectedAt: call.answeredAt,
        callDetails: {
          type: call.type,
          quality: call.connectionQuality,
          roomUrl: call.roomUrl,
          duration: '00:00:00'
        },
        message: {
          ...answerMessage,
          timestampFormatted: formatChatTimestamp(answerMessage.timestamp)
        }
      }
    });
  } catch (error) {
    console.error('Error answering call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer call',
      error: error.message
    });
  }
});

// POST /api/chat/:chatRoomId/calls/:callId/reject - Reject an incoming call
router.post('/:chatRoomId/calls/:callId/reject', async (req, res) => {
  try {
    const { chatRoomId, callId } = req.params;
    const { userId, reason = 'declined' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access and call exists
    if (!hasRoomAccess(chatRoomId, userId) || !activeCalls.has(callId)) {
      return res.status(404).json({
        success: false,
        message: 'Call not found or access denied'
      });
    }
    
    const call = activeCalls.get(callId);
    
    if (!call.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this call'
      });
    }
    
    // Reject the call
    updateCallState(callId, 'rejected', {
      rejectedBy: userId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });
    
    // Create rejection message
    const rejectionMessage = {
      id: `msg-chat-${Date.now()}`,
      chatRoomId: chatRoomId,
      senderId: 'system',
      senderType: 'system',
      senderName: 'PetPal System',
      text: `📞 Call was declined. You can try again later or leave a message.`,
      timestamp: new Date().toISOString(),
      messageType: 'call_rejected',
      status: 'sent',
      editedAt: null,
      attachments: [],
      replyTo: null
    };
    
    chatMessages.push(rejectionMessage);
    
    // Remove call after short delay
    setTimeout(() => {
      activeCalls.delete(callId);
    }, 5000);
    
    res.json({
      success: true,
      message: 'Call rejected successfully',
      data: {
        callId: callId,
        status: 'rejected',
        rejectedAt: call.rejectedAt,
        reason: reason,
        alternativeActions: ['leave_message', 'schedule_callback', 'try_again_later'],
        message: {
          ...rejectionMessage,
          timestampFormatted: formatChatTimestamp(rejectionMessage.timestamp)
        }
      }
    });
  } catch (error) {
    console.error('Error rejecting call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject call',
      error: error.message
    });
  }
});

// GET /api/chat/calls/monitoring - Get system-wide call monitoring (admin only)
router.get('/calls/monitoring', (req, res) => {
  try {
    const { adminKey } = req.query;
    
    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== 'petpal_admin_2025') {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }
    
    // Get all active calls with monitoring data
    const allActiveCalls = Array.from(activeCalls.entries()).map(([callId, call]) => {
      const duration = call.status === 'connected' && call.answeredAt 
        ? Math.floor((Date.now() - new Date(call.answeredAt).getTime()) / 1000)
        : null;
      
      return {
        callId: callId,
        type: call.type,
        status: call.status,
        chatRoomId: call.chatRoomId,
        participants: call.participants.length,
        initiator: call.initiator,
        startTime: call.startTime,
        duration: duration ? `${Math.floor(duration / 60)}:${duration % 60}` : null,
        quality: call.connectionQuality || 'unknown',
        shelterName: call.shelterName
      };
    });
    
    // System statistics
    const stats = {
      totalActiveCalls: allActiveCalls.length,
      voiceCalls: allActiveCalls.filter(c => c.type === 'voice').length,
      videoCalls: allActiveCalls.filter(c => c.type === 'video').length,
      connectedCalls: allActiveCalls.filter(c => c.status === 'connected').length,
      ringingCalls: allActiveCalls.filter(c => c.status === 'ringing').length,
      averageCallDuration: '5:30', // Would be calculated from historical data
      systemLoad: 'Low',
      serviceHealth: 'Operational'
    };
    
    res.json({
      success: true,
      data: {
        activeCalls: allActiveCalls,
        statistics: stats,
        timestamp: new Date().toISOString(),
        callConfig: {
          maxConcurrentCalls: CALL_CONFIG.general.maxConcurrentCalls,
          voiceMaxDuration: CALL_CONFIG.voice.maxDuration / 60000 + ' minutes',
          videoMaxDuration: CALL_CONFIG.video.maxDuration / 60000 + ' minutes'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching call monitoring data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring data',
      error: error.message
    });
  }
});

// PUT /api/chat/:chatRoomId/status - Update chat room status
router.put('/:chatRoomId/status', (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: 'User ID and status are required'
      });
    }
    
    const validStatuses = ['online', 'offline', 'busy'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: online, offline, or busy'
      });
    }
    
    // Verify user has access to this chat room
    if (!hasRoomAccess(chatRoomId, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or access denied'
      });
    }
    
    const roomIndex = chatRooms.findIndex(room => room.id === chatRoomId);
    chatRooms[roomIndex] = {
      ...chatRooms[roomIndex],
      status: status,
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: `Chat room status updated to ${status}`,
      data: chatRooms[roomIndex]
    });
  } catch (error) {
    console.error('Error updating chat room status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat room status',
      error: error.message
    });
  }
});

module.exports = router;