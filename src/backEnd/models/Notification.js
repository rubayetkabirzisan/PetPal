const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'application',
      'adoption',
      'lost_pet',
      'found_pet',
      'message',
      'reminder',
      'emergency',
      'system',
      'update',
      'promotion',
      'verification',
      'appointment'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Recipient information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientType: {
    type: String,
    enum: ['user', 'admin', 'shelter', 'all'],
    default: 'user'
  },
  // Sender information (optional)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderType: {
    type: String,
    enum: ['user', 'admin', 'shelter', 'system'],
    default: 'system'
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Related entities
  relatedEntityType: {
    type: String,
    enum: ['pet', 'application', 'lostPet', 'message', 'user', 'shelter', 'appointment']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Delivery channels
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  // Delivery tracking
  deliveryStatus: {
    push: {
      status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    },
    email: {
      status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    },
    sms: {
      status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
      sentAt: Date,
      deliveredAt: Date,
      error: String
    }
  },
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  // Action information
  actionUrl: String,
  actionText: String,
  actionData: mongoose.Schema.Types.Mixed,
  // Appearance
  icon: String,
  color: String,
  image: String,
  // Grouping and batching
  groupId: String,
  batchId: String,
  category: String,
  tags: [String],
  // Engagement tracking
  clickCount: {
    type: Number,
    default: 0
  },
  lastClicked: Date,
  // Administrative
  isSystem: {
    type: Boolean,
    default: false
  },
  isPromotional: {
    type: Boolean,
    default: false
  },
  isPersistent: {
    type: Boolean,
    default: false
  },
  // Retry information
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
  // Template information
  templateId: String,
  templateData: mongoose.Schema.Types.Mixed,
  // Localization
  language: {
    type: String,
    default: 'en'
  },
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  source: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipientId: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
notificationSchema.index({ groupId: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
