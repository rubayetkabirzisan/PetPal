const express = require('express');
const router = express.Router();

// In-memory storage for messages and conversations (in production, this would be a database)
let conversations = [
  {
    id: "1",
    userId: "user-001",
    shelterName: "Happy Paws Shelter",
    shelterId: "shelter-001",
    lastMessage: "Thank you for your interest in our available pets! We'd love to schedule a meet and greet.",
    lastMessageId: "msg-001-005",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unread: true,
    unreadCount: 2,
    shelterImage: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=100&h=100&fit=crop",
    shelterContact: {
      phone: "(555) 123-4567",
      email: "contact@happypaws.com",
      address: "123 Main St, Springfield, IL"
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "active",
    petId: "pet-001", // Related pet if applicable
    applicationId: "app-001" // Related application if applicable
  },
  {
    id: "2",
    userId: "user-001",
    shelterName: "Feline Friends Rescue",
    shelterId: "shelter-002",
    lastMessage: "Your application has been approved! When would you like to visit our shelter?",
    lastMessageId: "msg-002-003",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    unread: true,
    unreadCount: 1,
    shelterImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    shelterContact: {
      phone: "(555) 987-6543",
      email: "info@felinefriends.org",
      address: "456 Cat Lane, Springfield, IL"
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    petId: "pet-002",
    applicationId: "app-002"
  },
  {
    id: "3",
    userId: "user-001",
    shelterName: "Austin Animal Center",
    shelterId: "shelter-003",
    lastMessage: "We received your application and will review it within 2-3 business days.",
    lastMessageId: "msg-003-001",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    unread: false,
    unreadCount: 0,
    shelterImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100&h=100&fit=crop",
    shelterContact: {
      phone: "(555) 456-7890",
      email: "adopt@austinanimals.org",
      address: "789 Pet Street, Austin, TX"
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    petId: "pet-003",
    applicationId: "app-003"
  },
  {
    id: "4",
    userId: "user-001",
    shelterName: "Pawsome Adoptions",
    shelterId: "shelter-004",
    lastMessage: "Hi! We saw you're interested in our Golden Retriever, Max. Would you like to know more?",
    lastMessageId: "msg-004-002",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    unread: false,
    unreadCount: 0,
    shelterImage: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=100&h=100&fit=crop",
    shelterContact: {
      phone: "(555) 321-9876",
      email: "help@pawsome.com",
      address: "321 Dog Ave, Springfield, IL"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    petId: "pet-004",
    applicationId: null
  }
];

// Individual messages within conversations
let messages = [
  // Conversation 1 - Happy Paws Shelter
  {
    id: "msg-001-001",
    conversationId: "1",
    senderId: "shelter-001",
    senderType: "shelter",
    senderName: "Happy Paws Shelter",
    content: "Hello! Thank you for your interest in adopting from Happy Paws Shelter.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-001-002",
    conversationId: "1",
    senderId: "user-001",
    senderType: "user",
    senderName: "John Doe",
    content: "Hi! I'm interested in learning more about the pets you have available for adoption.",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-001-003",
    conversationId: "1",
    senderId: "shelter-001",
    senderType: "shelter",
    senderName: "Happy Paws Shelter",
    content: "Great! We have several wonderful dogs and cats looking for homes. What type of pet are you looking for?",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-001-004",
    conversationId: "1",
    senderId: "user-001",
    senderType: "user",
    senderName: "John Doe",
    content: "I'm looking for a medium-sized dog that's good with children. My family has two kids aged 8 and 12.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-001-005",
    conversationId: "1",
    senderId: "shelter-001",
    senderType: "shelter",
    senderName: "Happy Paws Shelter",
    content: "Thank you for your interest in our available pets! We'd love to schedule a meet and greet.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: false,
    edited: false
  },
  
  // Conversation 2 - Feline Friends Rescue
  {
    id: "msg-002-001",
    conversationId: "2",
    senderId: "shelter-002",
    senderType: "shelter",
    senderName: "Feline Friends Rescue",
    content: "Welcome to Feline Friends Rescue! We received your adoption application.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-002-002",
    conversationId: "2",
    senderId: "user-001",
    senderType: "user",
    senderName: "John Doe",
    content: "Thank you! I'm very excited about the possibility of adopting Bella.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-002-003",
    conversationId: "2",
    senderId: "shelter-002",
    senderType: "shelter",
    senderName: "Feline Friends Rescue",
    content: "Your application has been approved! When would you like to visit our shelter?",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: false,
    edited: false
  },
  
  // Conversation 3 - Austin Animal Center
  {
    id: "msg-003-001",
    conversationId: "3",
    senderId: "shelter-003",
    senderType: "shelter",
    senderName: "Austin Animal Center",
    content: "We received your application and will review it within 2-3 business days.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  
  // Conversation 4 - Pawsome Adoptions
  {
    id: "msg-004-001",
    conversationId: "4",
    senderId: "shelter-004",
    senderType: "shelter",
    senderName: "Pawsome Adoptions",
    content: "Hello! We noticed you viewed our Golden Retriever, Max. Do you have any questions?",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  },
  {
    id: "msg-004-002",
    conversationId: "4",
    senderId: "shelter-004",
    senderType: "shelter",
    senderName: "Pawsome Adoptions",
    content: "Hi! We saw you're interested in our Golden Retriever, Max. Would you like to know more?",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    messageType: "text",
    read: true,
    edited: false
  }
];

// Notifications for messages
let messageNotifications = [];
let notificationIdCounter = 1;

// Helper function to format timestamp for display
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return messageDate.toLocaleDateString();
  }
};

// GET /api/messages - Get all conversations for a user
router.get('/', (req, res) => {
  try {
    const { userId, search, limit = 20, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let userConversations = conversations.filter(conv => conv.userId === userId);
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      userConversations = userConversations.filter(conv =>
        conv.shelterName.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by last message timestamp (most recent first)
    userConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedConversations = userConversations.slice(startIndex, endIndex);
    
    // Format conversations with display timestamps
    const formattedConversations = paginatedConversations.map(conv => ({
      ...conv,
      timestampFormatted: formatTimestamp(conv.timestamp)
    }));
    
    // Calculate summary statistics
    const totalUnread = conversations
      .filter(conv => conv.userId === userId)
      .reduce((sum, conv) => sum + conv.unreadCount, 0);
    
    const stats = {
      totalConversations: conversations.filter(conv => conv.userId === userId).length,
      unreadConversations: conversations.filter(conv => conv.userId === userId && conv.unread).length,
      totalUnreadMessages: totalUnread,
      activeConversations: conversations.filter(conv => conv.userId === userId && conv.status === 'active').length
    };
    
    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        stats: stats,
        pagination: {
          total: userConversations.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < userConversations.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Verify user has access to this conversation
    const conversation = conversations.find(conv => 
      conv.id === conversationId && conv.userId === userId
    );
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }
    
    // Get messages for this conversation
    let conversationMessages = messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = conversationMessages.slice(startIndex, endIndex);
    
    // Format messages with display timestamps
    const formattedMessages = paginatedMessages.map(msg => ({
      ...msg,
      timestampFormatted: formatTimestamp(msg.timestamp)
    }));
    
    res.json({
      success: true,
      data: {
        conversation: conversation,
        messages: formattedMessages,
        pagination: {
          total: conversationMessages.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < conversationMessages.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation messages',
      error: error.message
    });
  }
});

// POST /api/messages - Create a new conversation
router.post('/', (req, res) => {
  try {
    const { userId, shelterId, shelterName, initialMessage, petId, applicationId } = req.body;
    
    if (!userId || !shelterId || !shelterName) {
      return res.status(400).json({
        success: false,
        message: 'User ID, shelter ID, and shelter name are required'
      });
    }
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv =>
      conv.userId === userId && conv.shelterId === shelterId
    );
    
    if (existingConversation) {
      return res.status(409).json({
        success: false,
        message: 'Conversation with this shelter already exists',
        data: existingConversation
      });
    }
    
    // Create new conversation
    const newConversation = {
      id: `conv-${Date.now()}`,
      userId: userId,
      shelterName: shelterName,
      shelterId: shelterId,
      lastMessage: initialMessage || "Conversation started",
      lastMessageId: null,
      timestamp: new Date().toISOString(),
      unread: false,
      unreadCount: 0,
      shelterImage: `https://images.unsplash.com/photo-1518176258769-f227c798150e?w=100&h=100&fit=crop&random=${Date.now()}`,
      shelterContact: {
        phone: "(555) 000-0000",
        email: "contact@shelter.com",
        address: "Address to be updated"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      petId: petId || null,
      applicationId: applicationId || null
    };
    
    conversations.push(newConversation);
    
    // Create initial message if provided
    if (initialMessage) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: userId,
        senderType: "user",
        senderName: "User",
        content: initialMessage,
        timestamp: new Date().toISOString(),
        messageType: "text",
        read: true,
        edited: false
      };
      
      messages.push(newMessage);
      newConversation.lastMessageId = newMessage.id;
    }
    
    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: newConversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
});

// POST /api/messages/:conversationId/send - Send a message in a conversation
router.post('/:conversationId/send', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, content, messageType = 'text' } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message content are required'
      });
    }
    
    // Verify conversation exists and user has access
    const conversationIndex = conversations.findIndex(conv => 
      conv.id === conversationId && conv.userId === userId
    );
    
    if (conversationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }
    
    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId,
      senderId: userId,
      senderType: "user",
      senderName: "User",
      content: content,
      timestamp: new Date().toISOString(),
      messageType: messageType,
      read: true,
      edited: false
    };
    
    messages.push(newMessage);
    
    // Update conversation with last message
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      lastMessage: content,
      lastMessageId: newMessage.id,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create notification for shelter (in a real app, this would notify the shelter)
    const notification = {
      id: notificationIdCounter++,
      conversationId: conversationId,
      messageId: newMessage.id,
      recipientId: conversations[conversationIndex].shelterId,
      recipientType: 'shelter',
      senderId: userId,
      senderName: 'User',
      type: 'new_message',
      title: 'New Message',
      message: `New message from ${newMessage.senderName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    messageNotifications.push(notification);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          ...newMessage,
          timestampFormatted: formatTimestamp(newMessage.timestamp)
        },
        conversation: conversations[conversationIndex],
        notification: notification
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

// PUT /api/messages/:conversationId/read - Mark conversation as read
router.put('/:conversationId/read', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const conversationIndex = conversations.findIndex(conv => 
      conv.id === conversationId && conv.userId === userId
    );
    
    if (conversationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }
    
    // Mark conversation as read
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      unread: false,
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };
    
    // Mark all messages in this conversation as read for the user
    messages.forEach((message, index) => {
      if (message.conversationId === conversationId && message.senderType === 'shelter') {
        messages[index].read = true;
      }
    });
    
    res.json({
      success: true,
      message: 'Conversation marked as read',
      data: conversations[conversationIndex]
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: error.message
    });
  }
});

// DELETE /api/messages/:conversationId - Delete/archive a conversation
router.delete('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, archive = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const conversationIndex = conversations.findIndex(conv => 
      conv.id === conversationId && conv.userId === userId
    );
    
    if (conversationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }
    
    if (archive) {
      // Archive the conversation (keep in database but hide from UI)
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        status: 'archived',
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: 'Conversation archived successfully',
        data: conversations[conversationIndex]
      });
    } else {
      // Permanently delete conversation and all messages
      const deletedConversation = conversations[conversationIndex];
      conversations.splice(conversationIndex, 1);
      
      // Remove all messages from this conversation
      messages = messages.filter(msg => msg.conversationId !== conversationId);
      
      // Remove related notifications
      messageNotifications = messageNotifications.filter(notif => 
        notif.conversationId !== conversationId
      );
      
      res.json({
        success: true,
        message: 'Conversation deleted permanently',
        data: deletedConversation
      });
    }
  } catch (error) {
    console.error('Error deleting/archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete/archive conversation',
      error: error.message
    });
  }
});

// GET /api/messages/search/:userId - Search messages and conversations
router.get('/search/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { query, type = 'all', limit = 20, offset = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchLower = query.toLowerCase();
    let results = [];
    
    if (type === 'all' || type === 'conversations') {
      // Search in conversations
      const conversationResults = conversations
        .filter(conv => 
          conv.userId === userId &&
          (conv.shelterName.toLowerCase().includes(searchLower) ||
           conv.lastMessage.toLowerCase().includes(searchLower))
        )
        .map(conv => ({
          ...conv,
          searchType: 'conversation',
          timestampFormatted: formatTimestamp(conv.timestamp)
        }));
      
      results.push(...conversationResults);
    }
    
    if (type === 'all' || type === 'messages') {
      // Search in message content
      const userConversationIds = conversations
        .filter(conv => conv.userId === userId)
        .map(conv => conv.id);
      
      const messageResults = messages
        .filter(msg => 
          userConversationIds.includes(msg.conversationId) &&
          msg.content.toLowerCase().includes(searchLower)
        )
        .map(msg => {
          const conversation = conversations.find(conv => conv.id === msg.conversationId);
          return {
            ...msg,
            searchType: 'message',
            conversation: conversation,
            timestampFormatted: formatTimestamp(msg.timestamp)
          };
        });
      
      results.push(...messageResults);
    }
    
    // Sort by relevance/timestamp
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        results: paginatedResults,
        query: query,
        searchType: type,
        pagination: {
          total: results.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < results.length
        }
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
});

// GET /api/messages/notifications/:userId - Get message notifications
router.get('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    
    let userNotifications = messageNotifications.filter(notif => 
      // Get notifications for conversations the user is part of
      conversations.some(conv => 
        conv.userId === userId && 
        (conv.id === notif.conversationId || conv.shelterId === notif.senderId)
      )
    );
    
    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(notif => !notif.read);
    }
    
    // Sort by timestamp (most recent first)
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        unreadCount: messageNotifications.filter(notif => 
          !notif.read && conversations.some(conv => 
            conv.userId === userId && 
            (conv.id === notif.conversationId || conv.shelterId === notif.senderId)
          )
        ).length,
        pagination: {
          total: userNotifications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < userNotifications.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching message notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message notifications',
      error: error.message
    });
  }
});

module.exports = router;