// models/messageModel.js
const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['image', 'document', 'video', 'audio'],
    required: true 
  },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number }, // in bytes
  mimeType: { type: String }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  // Conversation and participants
  conversationId: { 
    type: String, 
    required: true,
    index: true
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  senderName: { type: String, required: true },
  senderType: {
    type: String,
    enum: ['adopter', 'shelter', 'admin'],
    required: true
  },
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  recipientName: { type: String, required: true },
  recipientType: {
    type: String,
    enum: ['adopter', 'shelter', 'admin'],
    required: true
  },
  
  // Message content
  text: { type: String, required: true, maxlength: 2000 }, // Keep backward compatibility
  content: { type: String, maxlength: 2000 }, // New field for content
  messageType: { 
    type: String, 
    enum: ["text", "image", "file", "system", "automated"], 
    default: "text" 
  },
  
  // Message status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  
  // Context and metadata
  petContext: {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    petName: { type: String },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
  },
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Message threading and replies
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  
  // Legacy fields for backward compatibility
  sender: { type: String, enum: ["user", "shelter", "adopter", "admin"] },
  timestamp: { type: String }, // Keep as string for backward compatibility
  
  // System messages
  systemMessageType: {
    type: String,
    enum: ['application_update', 'adoption_confirmed', 'visit_scheduled', 'reminder'],
    required: function() { return this.messageType === 'system' || this.messageType === 'automated'; }
  },
  
  // Message priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, { 
  timestamps: true 
});

// Virtual to sync content with text for backward compatibility
messageSchema.virtual('actualContent').get(function() {
  return this.content || this.text;
});

// Pre-save middleware to sync text and content fields
messageSchema.pre('save', function(next) {
  if (this.content && !this.text) {
    this.text = this.content;
  } else if (this.text && !this.content) {
    this.content = this.text;
  }
  
  if (this.isNew && !this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  next();
});

// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });
messageSchema.index({ 'petContext.petId': 1 });
messageSchema.index({ 'petContext.applicationId': 1 });

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
