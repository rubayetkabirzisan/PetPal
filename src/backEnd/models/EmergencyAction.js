// models/EmergencyAction.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { 
    type: String, 
    enum: ['owner', 'emergency_contact', 'veterinarian', 'family', 'friend', 'neighbor'],
    required: true
  },
  isPrimary: { type: Boolean, default: false },
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const actionLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  performedByName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
  result: { 
    type: String,
    enum: ['success', 'failed', 'partial', 'pending']
  },
  evidence: [{ // Photos, documents, etc.
    type: { type: String, enum: ['photo', 'document', 'audio', 'video'] },
    url: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { _id: false });

const emergencyActionSchema = new mongoose.Schema({
  // Basic Information
  emergencyType: {
    type: String,
    required: true,
    enum: [
      'lost_pet', 'injured_pet', 'aggressive_behavior', 'natural_disaster',
      'fire', 'theft', 'abuse_report', 'medical_emergency', 'evacuation',
      'facility_emergency', 'transport_emergency', 'weather_emergency'
    ],
    index: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    default: 'medium',
    index: true
  },
  
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  
  // Associated Entities
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet',
    index: true
  },
  petName: { type: String },
  petPhoto: { type: String }, // URL for quick reference
  
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  reportedByName: { type: String, required: true },
  reportedByRole: {
    type: String,
    enum: ['owner', 'shelter_staff', 'volunteer', 'veterinarian', 'citizen', 'authority']
  },
  
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  assignedToName: { type: String },
  
  // Location and Context
  location: locationSchema,
  incidentLocation: { type: String, maxlength: 500 }, // Descriptive location
  
  // Emergency Details
  details: {
    // Lost pet specific
    lastSeenTime: { type: Date },
    lastSeenLocation: locationSchema,
    searchRadius: { type: Number }, // in meters
    
    // Medical emergency specific
    symptoms: [{ type: String }],
    injuries: [{ type: String }],
    vitalSigns: {
      temperature: { type: Number },
      heartRate: { type: Number },
      respiratoryRate: { type: Number }
    },
    
    // Behavioral emergency
    behaviorDescription: { type: String },
    triggersIdentified: [{ type: String }],
    safetyMeasuresTaken: [{ type: String }],
    
    // Environmental emergency
    weatherConditions: { type: String },
    hazardsIdentified: [{ type: String }],
    evacuationRequired: { type: Boolean, default: false },
    
    // Additional context
    witnessAccounts: [{ 
      witnessName: { type: String },
      witnessContact: { type: String },
      account: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Emergency Contacts and Notifications
  emergencyContacts: [contactSchema],
  
  // Actions and Response
  actionType: {
    type: String,
    required: true,
    enum: ['broadcast', 'authorities', 'search', 'medical', 'evacuation', 'investigation', 'monitoring'],
    index: true
  },
  
  actionsPlan: [{
    action: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['immediate', 'urgent', 'high', 'medium', 'low'],
      default: 'medium' 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    estimatedDuration: { type: Number }, // minutes
    resources: [{ type: String }], // Resources needed
    dependencies: [{ type: String }], // Other actions this depends on
    status: { 
      type: String, 
      enum: ['planned', 'in_progress', 'completed', 'cancelled', 'failed'],
      default: 'planned'
    }
  }],
  
  actionLog: [actionLogSchema],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled', 'escalated', 'monitoring'],
    default: 'active',
    index: true
  },
  
  resolution: {
    outcome: { 
      type: String,
      enum: ['successful', 'unsuccessful', 'partial', 'ongoing', 'cancelled']
    },
    resolutionDetails: { type: String, maxlength: 1000 },
    resolvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    resolvedAt: { type: Date },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    lessonsLearned: { type: String }
  },
  
  // Communication and Broadcasting
  broadcastSettings: {
    channels: [{
      type: String,
      enum: ['social_media', 'local_news', 'radio', 'community_boards', 'pet_finder_sites', 'app_notifications']
    }],
    message: { type: String },
    mediaAttachments: [{ type: String }], // URLs
    broadcastRadius: { type: Number }, // in miles
    targetAudience: [{ 
      type: String,
      enum: ['general_public', 'pet_owners', 'local_shelters', 'veterinarians', 'volunteers']
    }],
    broadcastSent: { type: Boolean, default: false },
    broadcastSentAt: { type: Date },
    responses: [{
      responderId: { type: String },
      responderName: { type: String },
      responseType: { 
        type: String, 
        enum: ['sighting', 'assistance_offer', 'information', 'false_alarm']
      },
      message: { type: String },
      location: locationSchema,
      timestamp: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false }
    }]
  },
  
  // Authority Involvement
  authoritiesInvolved: [{
    organization: { 
      type: String, 
      enum: ['police', 'fire_department', 'animal_control', 'emergency_services', 'veterinary_emergency']
    },
    contactPerson: { type: String },
    contactNumber: { type: String },
    caseNumber: { type: String },
    status: { 
      type: String, 
      enum: ['contacted', 'responding', 'on_scene', 'completed']
    },
    notes: { type: String }
  }],
  
  // Resources and Coordination
  resourcesDeployed: [{
    resourceType: { 
      type: String,
      enum: ['personnel', 'vehicle', 'equipment', 'medical_supplies', 'communication_device']
    },
    description: { type: String },
    assignedTo: { type: String },
    deployedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date },
    condition: { 
      type: String,
      enum: ['good', 'damaged', 'lost', 'consumed']
    }
  }],
  
  // Timeline and Updates
  timeline: [{
    timestamp: { type: Date, default: Date.now },
    event: { type: String, required: true },
    details: { type: String },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    isPublic: { type: Boolean, default: false } // Whether this update can be shared publicly
  }],
  
  // Public Information
  isPublic: { type: Boolean, default: true },
  publicDescription: { type: String }, // Sanitized version for public sharing
  
  // Analytics and Metrics
  responseTime: { type: Number }, // minutes from report to first action
  resolutionTime: { type: Number }, // minutes from start to resolution
  resourceCost: { type: Number }, // estimated cost
  
  // Related Emergencies
  relatedEmergencies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmergencyAction' 
  }],
  
  // Quality Assurance
  reviewRequired: { type: Boolean, default: false },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewNotes: { type: String },
  reviewDate: { type: Date }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
emergencyActionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

emergencyActionSchema.virtual('duration').get(function() {
  if (!this.resolution.resolvedAt) {
    return Math.floor((new Date() - this.createdAt) / (1000 * 60)); // minutes
  }
  return Math.floor((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
});

emergencyActionSchema.virtual('urgencyScore').get(function() {
  let score = 0;
  
  // Severity scoring
  const severityScores = { low: 1, medium: 3, high: 7, critical: 10 };
  score += severityScores[this.severity] || 0;
  
  // Time factor (older emergencies get higher urgency)
  const hoursOld = (new Date() - this.createdAt) / (1000 * 60 * 60);
  score += Math.min(hoursOld * 0.5, 5);
  
  // Emergency type factor
  const typeMultipliers = {
    'medical_emergency': 2,
    'injured_pet': 2,
    'natural_disaster': 1.5,
    'lost_pet': 1,
    'aggressive_behavior': 1.5
  };
  score *= (typeMultipliers[this.emergencyType] || 1);
  
  return Math.min(Math.round(score), 20); // Cap at 20
});

// Indexes for better performance
emergencyActionSchema.index({ emergencyType: 1, status: 1 });
emergencyActionSchema.index({ severity: 1, createdAt: -1 });
emergencyActionSchema.index({ reportedBy: 1, createdAt: -1 });
emergencyActionSchema.index({ assignedTo: 1, status: 1 });
emergencyActionSchema.index({ petId: 1, emergencyType: 1 });
emergencyActionSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Compound indexes
emergencyActionSchema.index({ 
  status: 1, 
  severity: 1, 
  createdAt: -1 
});

// Pre-save middleware
emergencyActionSchema.pre('save', function(next) {
  // Calculate response time if first action is logged
  if (!this.responseTime && this.actionLog.length > 0) {
    const firstAction = this.actionLog.sort((a, b) => a.timestamp - b.timestamp)[0];
    this.responseTime = Math.floor((firstAction.timestamp - this.createdAt) / (1000 * 60));
  }
  
  // Calculate resolution time if resolved
  if (this.status === 'resolved' && this.resolution.resolvedAt && !this.resolutionTime) {
    this.resolutionTime = Math.floor((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
  }
  
  // Add to timeline if status changed
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      event: `Status changed to ${this.status}`,
      details: `Emergency status updated`,
      updatedBy: this.assignedTo // This should be set by the calling code
    });
  }
  
  next();
});

// Instance methods
emergencyActionSchema.methods.addTimelineEvent = function(event, details, updatedBy, isPublic = false) {
  this.timeline.push({
    timestamp: new Date(),
    event,
    details,
    updatedBy,
    isPublic
  });
  return this.save();
};

emergencyActionSchema.methods.logAction = function(action, performedBy, performedByName, details, result = 'success', evidence = []) {
  this.actionLog.push({
    action,
    performedBy,
    performedByName,
    timestamp: new Date(),
    details,
    result,
    evidence
  });
  return this.save();
};

emergencyActionSchema.methods.escalate = function(newSeverity, reason, escalatedBy) {
  const oldSeverity = this.severity;
  this.severity = newSeverity;
  this.status = 'escalated';
  
  this.addTimelineEvent(
    'Emergency Escalated',
    `Severity changed from ${oldSeverity} to ${newSeverity}. Reason: ${reason}`,
    escalatedBy,
    false
  );
  
  return this.save();
};

emergencyActionSchema.methods.resolve = function(outcome, details, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    outcome,
    resolutionDetails: details,
    resolvedBy,
    resolvedAt: new Date()
  };
  
  this.addTimelineEvent(
    'Emergency Resolved',
    `Resolution: ${outcome}. ${details}`,
    resolvedBy,
    true
  );
  
  return this.save();
};

emergencyActionSchema.methods.addBroadcastResponse = function(responderId, responderName, responseType, message, location) {
  this.broadcastSettings.responses.push({
    responderId,
    responderName,
    responseType,
    message,
    location,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static methods
emergencyActionSchema.statics.getActiveEmergencies = function(severity = null) {
  const query = { status: 'active' };
  if (severity) query.severity = severity;
  
  return this.find(query)
    .sort({ severity: -1, createdAt: -1 })
    .populate('reportedBy assignedTo', 'name email phone')
    .populate('petId', 'name type breed images');
};

emergencyActionSchema.statics.getCriticalEmergencies = function() {
  return this.find({ 
    status: 'active',
    severity: 'critical'
  }).sort({ createdAt: -1 });
};

emergencyActionSchema.statics.getEmergenciesNearLocation = function(latitude, longitude, radiusKm = 10) {
  // This would require MongoDB geospatial queries
  // For now, a simplified version
  return this.find({
    status: 'active',
    'location.latitude': { 
      $gte: latitude - (radiusKm / 111), // Rough conversion
      $lte: latitude + (radiusKm / 111)
    },
    'location.longitude': { 
      $gte: longitude - (radiusKm / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusKm / (111 * Math.cos(latitude * Math.PI / 180)))
    }
  });
};

emergencyActionSchema.statics.getEmergencyStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 },
        averageResolutionTime: { $avg: '$resolutionTime' },
        criticalCount: { 
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('EmergencyAction', emergencyActionSchema);
