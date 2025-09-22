const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['navigate', 'api_call', 'external_link', 'dismiss'],
    required: true 
  },
  target: { type: String }, // screen name, API endpoint, or URL
  params: { type: mongoose.Schema.Types.Mixed } // parameters for the action
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  // Recipient information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  userType: {
    type: String,
    enum: ['adopter', 'shelter', 'admin'],
    required: true
  },
  
  // Content
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  shortMessage: { type: String, maxlength: 100 }, // For push notifications
  
  // Classification
  type: { 
    type: String, 
    enum: ['application', 'message', 'reminder', 'update', 'system', 'emergency', 'promotion'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['adoption', 'communication', 'care', 'safety', 'community', 'system', 'marketing'],
    required: true
  },
  subCategory: { type: String }, // More specific categorization
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  actionRequired: { type: Boolean, default: false },
  
  // Status tracking
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  
  // Timing
  time: { type: String }, // Keep for backward compatibility
  scheduledFor: { type: Date }, // When to send the notification
  expiresAt: { type: Date }, // When the notification becomes irrelevant
  
  // Related entities
  relatedEntities: {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    petName: { type: String },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    careEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareEntry' },
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' }
  },
  
  // Navigation and actions
  targetScreen: { type: String }, // Screen to navigate to when tapped
  targetParams: { type: mongoose.Schema.Types.Mixed }, // Parameters for navigation
  actions: [actionSchema], // Available actions for rich notifications
  
  // Sender information (for non-system notifications)
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  senderType: {
    type: String,
    enum: ['user', 'shelter', 'admin', 'system']
  },
  
  // Rich content
  imageUrl: { type: String }, // Image for rich notifications
  iconType: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'heart', 'paw', 'bell']
  },
  
  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  
  // Push notification specific
  pushNotificationData: {
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    pushId: { type: String }, // ID from push service
    error: { type: String } // Error message if push failed
  },
  
  // Email specific
  emailData: {
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    emailId: { type: String },
    subject: { type: String },
    htmlContent: { type: String },
    error: { type: String }
  },
  
  // Analytics and tracking
  impressions: { type: Number, default: 0 }, // How many times viewed
  clicks: { type: Number, default: 0 }, // How many times acted upon
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date },
  
  // Grouping and threading
  groupKey: { type: String }, // For grouping similar notifications
  threadId: { type: String }, // For threading related notifications
  
  // Location context (for location-based notifications)
  location: {
    city: { type: String },
    state: { type: String },
    radius: { type: Number } // in miles
  },
  
  // Personalization data
  personalizationData: { type: mongoose.Schema.Types.Mixed },
  
  // A/B testing
  experimentId: { type: String },
  variant: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age of notification
notificationSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
});

// Virtual for formatted message
notificationSchema.virtual('displayMessage').get(function() {
  return this.shortMessage || this.message;
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, priority: -1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ groupKey: 1, createdAt: -1 });
notificationSchema.index({ threadId: 1, createdAt: -1 });

// Compound indexes
notificationSchema.index({ userId: 1, type: 1, read: 1 });
notificationSchema.index({ 'relatedEntities.petId': 1, userId: 1 });
notificationSchema.index({ 'relatedEntities.applicationId': 1, userId: 1 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set delivery timestamp if being marked as delivered
  if (this.delivered && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  // Set read timestamp if being marked as read
  if (this.read && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Set default scheduled time
  if (!this.scheduledFor) {
    this.scheduledFor = new Date();
  }
  
  // Ensure backward compatibility with time field
  if (!this.time && this.createdAt) {
    this.time = this.createdAt.toISOString();
  }
  
  next();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

notificationSchema.methods.incrementImpressions = function() {
  this.impressions += 1;
  return this.save();
};

notificationSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

notificationSchema.methods.dismiss = function() {
  this.dismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId: userId, read: false });
};

notificationSchema.statics.getByPriority = function(userId, priority) {
  return this.find({ 
    userId: userId, 
    priority: priority,
    read: false 
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.cleanup = function() {
  // Remove expired notifications
  const now = new Date();
  return this.deleteMany({ 
    expiresAt: { $lt: now }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
