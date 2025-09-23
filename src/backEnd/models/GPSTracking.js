const mongoose = require('mongoose');

const gpsTrackingSchema = new mongoose.Schema({
  // Pet information
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  petName: {
    type: String,
    required: true,
    trim: true
  },
  petType: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'small-mammal', 'reptile', 'farm'],
    required: true
  },
  // Owner information
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Device information
  deviceInfo: {
    deviceId: { type: String, required: true, unique: true },
    deviceType: { type: String, required: true }, // brand/model
    serialNumber: String,
    firmwareVersion: String,
    batteryType: String,
    installDate: { type: Date, default: Date.now },
    warrantyExpires: Date,
    isActive: { type: Boolean, default: true }
  },
  // Current status
  currentStatus: {
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: Number,
      altitude: Number,
      heading: Number,
      speed: Number
    },
    lastUpdate: { type: Date, required: true },
    batteryLevel: { type: Number, required: true, min: 0, max: 100 },
    signalStrength: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['safe', 'alert', 'low_battery', 'offline', 'emergency'],
      required: true
    },
    isMoving: { type: Boolean, default: false },
    temperature: Number,
    humidity: Number
  },
  // Location history
  locationHistory: [{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: Number,
    altitude: Number,
    heading: Number,
    speed: Number,
    batteryLevel: Number,
    timestamp: { type: Date, required: true },
    activityType: {
      type: String,
      enum: ['stationary', 'walking', 'running', 'playing', 'resting']
    }
  }],
  // Safe zones
  safeZones: [{
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['home', 'park', 'vet', 'daycare', 'friends', 'custom'],
      required: true
    },
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    radius: { type: Number, required: true }, // in meters
    isActive: { type: Boolean, default: true },
    notifyEntry: { type: Boolean, default: true },
    notifyExit: { type: Boolean, default: true },
    schedule: {
      enabled: { type: Boolean, default: false },
      days: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      startTime: String,
      endTime: String
    }
  }],
  // Alerts and notifications
  alerts: [{
    type: {
      type: String,
      enum: ['zone_exit', 'zone_entry', 'low_battery', 'offline', 'emergency', 'unusual_activity'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    location: {
      latitude: Number,
      longitude: Number
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    isResolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: Date
  }],
  // Settings and preferences
  settings: {
    trackingInterval: { type: Number, default: 60 }, // seconds
    batteryLowThreshold: { type: Number, default: 20 }, // percentage
    offlineThreshold: { type: Number, default: 300 }, // seconds
    alertMethods: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacyMode: { type: Boolean, default: false },
    shareLocation: { type: Boolean, default: false },
    historRetention: { type: Number, default: 30 } // days
  },
  // Sharing and permissions
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['view_location', 'view_history', 'manage_zones', 'receive_alerts']
    }],
    sharedAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  // Activity tracking
  dailyActivity: [{
    date: { type: Date, required: true },
    steps: Number,
    distanceTraveled: Number, // in meters
    timeActive: Number, // in minutes
    timeResting: Number, // in minutes
    calories: Number,
    averageSpeed: Number,
    maxSpeed: Number,
    zonesVisited: [String]
  }],
  // Health and behavior insights
  insights: [{
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['activity_pattern', 'location_pattern', 'behavior_change', 'health_alert']
    },
    description: String,
    data: mongoose.Schema.Types.Mixed,
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  // Emergency contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    relationship: String,
    priority: { type: Number, default: 1 }
  }],
  // Subscription and billing
  subscription: {
    planType: {
      type: String,
      enum: ['basic', 'premium', 'family'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    renewalDate: Date,
    lastPayment: Date
  },
  // Administrative
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

gpsTrackingSchema.index({ petId: 1 });
gpsTrackingSchema.index({ ownerId: 1 });
gpsTrackingSchema.index({ 'deviceInfo.deviceId': 1 });
gpsTrackingSchema.index({ 'currentStatus.location': '2dsphere' });
gpsTrackingSchema.index({ 'currentStatus.lastUpdate': -1 });
gpsTrackingSchema.index({ 'currentStatus.status': 1 });
gpsTrackingSchema.index({ 'locationHistory.timestamp': -1 });

module.exports = mongoose.models.GPSTracking || mongoose.model('GPSTracking', gpsTrackingSchema);
