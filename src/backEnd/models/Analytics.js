const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Identification and categorization
  eventType: {
    type: String,
    required: true,
    enum: [
      'user_action',
      'pet_view',
      'pet_favorite',
      'application_submit',
      'application_status_change',
      'adoption_completed',
      'lost_pet_report',
      'lost_pet_found',
      'message_sent',
      'search_performed',
      'login',
      'logout',
      'registration',
      'profile_update',
      'notification_sent',
      'notification_read',
      'page_view',
      'system_event',
      'error_occurred'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['user', 'pet', 'application', 'adoption', 'lost_pet', 'messaging', 'system']
  },
  action: {
    type: String,
    required: true
  },
  label: String,
  value: Number,
  // User and session information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['admin', 'adopter', 'shelter', 'anonymous']
  },
  sessionId: String,
  // Related entities
  relatedEntityType: {
    type: String,
    enum: ['pet', 'application', 'user', 'shelter', 'lostPet', 'message', 'notification']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Location and device information
  location: {
    country: String,
    state: String,
    city: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown']
    },
    os: String,
    browser: String,
    userAgent: String,
    screenResolution: String,
    language: String
  },
  // Performance metrics
  performance: {
    loadTime: Number,
    responseTime: Number,
    memoryUsage: Number,
    cpuUsage: Number
  },
  // Event details and metadata
  eventData: mongoose.Schema.Types.Mixed,
  properties: mongoose.Schema.Types.Mixed,
  customDimensions: mongoose.Schema.Types.Mixed,
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hour: {
    type: Number,
    min: 0,
    max: 23
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  month: Number,
  year: Number,
  // Aggregation helpers
  dateKey: String, // YYYY-MM-DD
  hourKey: String, // YYYY-MM-DD-HH
  // Source and referrer
  source: String,
  medium: String,
  campaign: String,
  referrer: String,
  landingPage: String,
  // Error tracking
  error: {
    message: String,
    stack: String,
    code: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  // A/B testing
  experiments: [{
    name: String,
    variant: String,
    version: String
  }],
  // User journey
  previousEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analytics'
  },
  nextEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analytics'
  },
  funnel: String,
  funnelStep: Number,
  // Attribution
  firstTouch: {
    source: String,
    medium: String,
    campaign: String,
    timestamp: Date
  },
  lastTouch: {
    source: String,
    medium: String,
    campaign: String,
    timestamp: Date
  },
  // Revenue and conversion
  revenue: {
    amount: Number,
    currency: String,
    transactionId: String
  },
  conversion: {
    goal: String,
    value: Number,
    conversionId: String
  },
  // Cohort analysis
  cohort: {
    week: String,
    month: String,
    quarter: String,
    year: String
  },
  // Quality and validation
  isValid: {
    type: Boolean,
    default: true
  },
  validationErrors: [String],
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  // Privacy and compliance
  isAnonymized: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  ipHashed: String,
  gdprConsent: Boolean,
  // Aggregation flags
  isDuplicate: {
    type: Boolean,
    default: false
  },
  isBot: {
    type: Boolean,
    default: false
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  // Additional metadata
  version: String,
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'production'
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ category: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
analyticsSchema.index({ dateKey: 1 });
analyticsSchema.index({ hourKey: 1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ isProcessed: 1 });
analyticsSchema.index({ timestamp: -1 });

// Compound indexes for common queries
analyticsSchema.index({ eventType: 1, userId: 1, timestamp: -1 });
analyticsSchema.index({ category: 1, action: 1, timestamp: -1 });
analyticsSchema.index({ userType: 1, eventType: 1, timestamp: -1 });

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
