const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Token information
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  tokenType: {
    type: String,
    default: 'Bearer'
  },
  // Session timing
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Device and client information
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown'
    },
    platform: String,
    os: String,
    browser: String,
    version: String,
    userAgent: String,
    deviceId: String,
    model: String,
    manufacturer: String
  },
  // Location and network
  location: {
    ipAddress: String,
    country: String,
    state: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Session status and security
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'invalid'],
    default: 'active'
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokedReason: String,
  // Security flags
  isSecure: {
    type: Boolean,
    default: true
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  suspiciousReasons: [String],
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Authentication method
  authMethod: {
    type: String,
    enum: ['password', 'social', 'biometric', 'two_factor', 'magic_link'],
    default: 'password'
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  // Session activity
  loginCount: {
    type: Number,
    default: 1
  },
  actions: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    resource: String,
    method: String,
    statusCode: Number,
    responseTime: Number
  }],
  // Permissions and scopes
  permissions: [String],
  scopes: [String],
  roles: [String],
  // Application context
  applicationId: String,
  clientId: String,
  clientType: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'api', 'service']
  },
  // Refresh token tracking
  refreshTokenUsed: {
    type: Boolean,
    default: false
  },
  refreshTokenUsedAt: Date,
  refreshCount: {
    type: Number,
    default: 0
  },
  maxRefreshCount: {
    type: Number,
    default: 10
  },
  // Session metadata
  metadata: mongoose.Schema.Types.Mixed,
  tags: [String],
  // Audit trail
  auditLog: [{
    timestamp: { type: Date, default: Date.now },
    event: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ accessToken: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ isActive: 1, expiresAt: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ lastActivity: -1 });

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
