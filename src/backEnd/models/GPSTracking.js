// models/GPSTracking.js
const mongoose = require('mongoose');

const locationPointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  altitude: { type: Number }, // in meters
  accuracy: { type: Number }, // in meters
  speed: { type: Number }, // in km/h
  heading: { type: Number, min: 0, max: 360 }, // degrees from north
  timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false });

const safeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: { type: Number, required: true, min: 10 }, // minimum 10 meters
  shape: { 
    type: String, 
    enum: ['circle', 'polygon'], 
    default: 'circle' 
  },
  coordinates: [{ // For polygon shapes
    latitude: { type: Number },
    longitude: { type: Number }
  }],
  isActive: { type: Boolean, default: true },
  alertOnExit: { type: Boolean, default: true },
  alertOnEntry: { type: Boolean, default: false },
  timeRestrictions: {
    startTime: { type: String }, // HH:MM format
    endTime: { type: String }, // HH:MM format
    daysOfWeek: [{ type: Number, min: 0, max: 6 }] // 0=Sunday
  }
}, { timestamps: true });

const gpsDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  deviceType: { 
    type: String, 
    enum: ['collar', 'tag', 'harness', 'implant'],
    required: true 
  },
  manufacturer: { type: String },
  model: { type: String },
  firmware: { type: String },
  batteryLevel: { type: Number, min: 0, max: 100 },
  batteryType: { 
    type: String, 
    enum: ['rechargeable', 'replaceable', 'solar'] 
  },
  signalStrength: { type: Number, min: -120, max: -30 }, // dBm
  lastHeartbeat: { type: Date },
  isOnline: { type: Boolean, default: false },
  activationDate: { type: Date, default: Date.now },
  warrantyExpiry: { type: Date },
  settings: {
    trackingInterval: { type: Number, default: 60 }, // seconds
    lowBatteryThreshold: { type: Number, default: 20 }, // percentage
    geofenceEnabled: { type: Boolean, default: true },
    sosEnabled: { type: Boolean, default: true },
    temperatureMonitoring: { type: Boolean, default: false }
  }
}, { _id: false });

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'geofence_exit', 'geofence_entry', 'low_battery', 
      'device_offline', 'panic_button', 'temperature_alert',
      'speed_alert', 'inactivity_alert', 'tamper_alert'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: { type: String, required: true },
  location: locationPointSchema,
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed } // Additional alert-specific data
}, { timestamps: true });

const gpsTrackingSchema = new mongoose.Schema({
  // Associated entities
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet', 
    required: true,
    unique: true,
    index: true
  },
  petName: { type: String, required: true },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Device information
  device: gpsDeviceSchema,
  
  // Current status
  isActive: { type: Boolean, default: true, index: true },
  currentLocation: locationPointSchema,
  lastKnownLocation: locationPointSchema,
  
  // Location history (limited to recent points for performance)
  locationHistory: [locationPointSchema],
  maxHistoryPoints: { type: Number, default: 1000 },
  
  // Safe zones
  safeZones: [safeZoneSchema],
  
  // Tracking settings
  trackingMode: {
    type: String,
    enum: ['continuous', 'interval', 'power_save', 'on_demand'],
    default: 'interval'
  },
  trackingInterval: { type: Number, default: 300 }, // seconds
  
  // Movement and activity
  activityData: {
    totalDistance: { type: Number, default: 0 }, // in meters
    dailyDistance: { type: Number, default: 0 }, // in meters
    averageSpeed: { type: Number, default: 0 }, // km/h
    maxSpeed: { type: Number, default: 0 }, // km/h
    isMoving: { type: Boolean, default: false },
    lastMovement: { type: Date },
    restingTime: { type: Number, default: 0 }, // minutes
    activeTime: { type: Number, default: 0 } // minutes
  },
  
  // Health and environment monitoring
  environmentalData: {
    temperature: { type: Number }, // Celsius
    humidity: { type: Number }, // percentage
    lightLevel: { type: Number }, // lux
    uvIndex: { type: Number }
  },
  
  // Alerts and notifications
  alerts: [alertSchema],
  alertSettings: {
    geofenceAlerts: { type: Boolean, default: true },
    batteryAlerts: { type: Boolean, default: true },
    movementAlerts: { type: Boolean, default: false },
    temperatureAlerts: { type: Boolean, default: false },
    inactivityThreshold: { type: Number, default: 120 } // minutes
  },
  
  // Emergency features
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  
  sosActivated: { type: Boolean, default: false },
  sosActivatedAt: { type: Date },
  sosLocation: locationPointSchema,
  
  // Statistics and analytics
  statistics: {
    totalTrackingTime: { type: Number, default: 0 }, // hours
    averageDailyDistance: { type: Number, default: 0 },
    favoriteLocations: [{
      name: { type: String },
      location: locationPointSchema,
      visitCount: { type: Number, default: 1 },
      totalTimeSpent: { type: Number, default: 0 } // minutes
    }],
    escapeAttempts: { type: Number, default: 0 },
    longestDistance: { type: Number, default: 0 }, // meters from home
    mostActiveHour: { type: Number, min: 0, max: 23 }
  },
  
  // Data retention
  dataRetentionDays: { type: Number, default: 90 },
  lastCleanup: { type: Date },
  
  // Sharing and permissions
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: [{
      type: String,
      enum: ['view_location', 'view_history', 'manage_alerts', 'manage_zones']
    }],
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Service and subscription
  serviceProvider: { type: String },
  subscriptionPlan: { type: String },
  subscriptionExpiry: { type: Date },
  dataUsage: {
    monthlyLimit: { type: Number }, // MB
    currentUsage: { type: Number, default: 0 }, // MB
    resetDate: { type: Date }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
gpsTrackingSchema.virtual('batteryStatus').get(function() {
  const level = this.device?.batteryLevel;
  if (!level) return 'unknown';
  if (level > 50) return 'good';
  if (level > 20) return 'medium';
  if (level > 10) return 'low';
  return 'critical';
});

gpsTrackingSchema.virtual('connectionStatus').get(function() {
  if (!this.device?.isOnline) return 'offline';
  
  const lastHeartbeat = this.device.lastHeartbeat;
  if (!lastHeartbeat) return 'unknown';
  
  const minutesAgo = (Date.now() - lastHeartbeat.getTime()) / (1000 * 60);
  if (minutesAgo <= 5) return 'online';
  if (minutesAgo <= 15) return 'delayed';
  return 'offline';
});

gpsTrackingSchema.virtual('isInSafeZone').get(function() {
  if (!this.currentLocation || this.safeZones.length === 0) return null;
  
  return this.safeZones.some(zone => {
    if (!zone.isActive) return false;
    
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      zone.center.latitude,
      zone.center.longitude
    );
    
    return distance <= zone.radius;
  });
});

// Indexes for better performance
gpsTrackingSchema.index({ petId: 1 });
gpsTrackingSchema.index({ ownerId: 1 });
gpsTrackingSchema.index({ 'device.deviceId': 1 });
gpsTrackingSchema.index({ isActive: 1 });
gpsTrackingSchema.index({ 'currentLocation.timestamp': -1 });
gpsTrackingSchema.index({ 'alerts.type': 1, 'alerts.acknowledged': 1 });

// Geospatial indexes
gpsTrackingSchema.index({ 
  'currentLocation.latitude': 1, 
  'currentLocation.longitude': 1 
});

// Pre-save middleware
gpsTrackingSchema.pre('save', function(next) {
  // Limit location history size
  if (this.locationHistory.length > this.maxHistoryPoints) {
    this.locationHistory = this.locationHistory.slice(-this.maxHistoryPoints);
  }
  
  // Update last known location if we have a current location
  if (this.currentLocation && this.currentLocation.timestamp) {
    this.lastKnownLocation = { ...this.currentLocation };
  }
  
  next();
});

// Instance methods
gpsTrackingSchema.methods.addLocationPoint = function(locationData) {
  const point = {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    altitude: locationData.altitude,
    accuracy: locationData.accuracy,
    speed: locationData.speed,
    heading: locationData.heading,
    timestamp: locationData.timestamp || new Date()
  };
  
  // Update current location
  this.currentLocation = point;
  
  // Add to history
  this.locationHistory.push(point);
  
  // Check geofences
  this.checkGeofences(point);
  
  return this.save();
};

gpsTrackingSchema.methods.checkGeofences = function(location) {
  this.safeZones.forEach(zone => {
    if (!zone.isActive) return;
    
    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      zone.center.latitude,
      zone.center.longitude
    );
    
    const isInZone = distance <= zone.radius;
    const wasInZone = this.wasInSafeZone(zone._id);
    
    // Generate alerts for zone entry/exit
    if (isInZone && !wasInZone && zone.alertOnEntry) {
      this.createAlert('geofence_entry', `${this.petName} entered ${zone.name}`, location);
    } else if (!isInZone && wasInZone && zone.alertOnExit) {
      this.createAlert('geofence_exit', `${this.petName} left ${zone.name}`, location);
    }
  });
};

gpsTrackingSchema.methods.createAlert = function(type, message, location, metadata = {}) {
  const alert = {
    type,
    message,
    location,
    metadata,
    severity: this.getAlertSeverity(type)
  };
  
  this.alerts.push(alert);
  return alert;
};

gpsTrackingSchema.methods.getAlertSeverity = function(alertType) {
  const severityMap = {
    'geofence_exit': 'high',
    'geofence_entry': 'low',
    'low_battery': 'medium',
    'device_offline': 'high',
    'panic_button': 'critical',
    'temperature_alert': 'medium',
    'speed_alert': 'medium',
    'inactivity_alert': 'low',
    'tamper_alert': 'high'
  };
  
  return severityMap[alertType] || 'medium';
};

gpsTrackingSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

gpsTrackingSchema.methods.wasInSafeZone = function(zoneId) {
  // Check if pet was in this safe zone based on previous location
  if (!this.lastKnownLocation || this.locationHistory.length < 2) return false;
  
  const previousLocation = this.locationHistory[this.locationHistory.length - 2];
  const zone = this.safeZones.id(zoneId);
  
  if (!zone) return false;
  
  const distance = this.calculateDistance(
    previousLocation.latitude,
    previousLocation.longitude,
    zone.center.latitude,
    zone.center.longitude
  );
  
  return distance <= zone.radius;
};

gpsTrackingSchema.methods.getLocationHistory = function(startDate, endDate) {
  return this.locationHistory.filter(point => {
    const timestamp = new Date(point.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });
};

gpsTrackingSchema.methods.activateSOS = function(location) {
  this.sosActivated = true;
  this.sosActivatedAt = new Date();
  this.sosLocation = location || this.currentLocation;
  
  this.createAlert('panic_button', `SOS activated for ${this.petName}`, this.sosLocation, {
    sosActivated: true
  });
  
  return this.save();
};

// Static methods
gpsTrackingSchema.statics.getActiveDevices = function() {
  return this.find({ 
    isActive: true,
    'device.isOnline': true 
  }).select('petId petName device.batteryLevel device.signalStrength currentLocation');
};

gpsTrackingSchema.statics.getLowBatteryDevices = function(threshold = 20) {
  return this.find({
    isActive: true,
    'device.batteryLevel': { $lte: threshold }
  });
};

gpsTrackingSchema.statics.getOfflineDevices = function() {
  const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000));
  return this.find({
    isActive: true,
    $or: [
      { 'device.isOnline': false },
      { 'device.lastHeartbeat': { $lt: fiveMinutesAgo } }
    ]
  });
};

gpsTrackingSchema.statics.cleanupOldData = function() {
  // Remove old location history points beyond retention period
  return this.updateMany(
    {},
    { $unset: { 'locationHistory.90': 1 } } // Keep last 90 points
  );
};

module.exports = mongoose.model('GPSTracking', gpsTrackingSchema);