const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, default: 'USA' },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  isVerified: { type: Boolean, default: false }
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  petTypes: [{ type: String }], // ['dog', 'cat', 'bird']
  breeds: [{ type: String }],
  sizes: [{ type: String }], // ['Small', 'Medium', 'Large']
  ageRanges: [{ type: String }], // ['Young', 'Adult', 'Senior']
  specialNeeds: { type: Boolean, default: false },
  maxDistance: { type: Number, default: 25 }, // miles
  adoptionFeeRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000 }
  },
  notifications: {
    newPets: { type: Boolean, default: true },
    applications: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  communicationMethod: {
    type: String,
    enum: ['email', 'sms', 'push', 'all'],
    default: 'all'
  }
}, { _id: false });

const adoptionHistorySchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  petName: { type: String, required: true },
  adoptionDate: { type: Date, required: true },
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  shelterName: { type: String },
  status: {
    type: String,
    enum: ['successful', 'returned', 'rehomed'],
    default: 'successful'
  },
  returnReason: { type: String },
  returnDate: { type: Date }
}, { timestamps: true });

const verificationSchema = new mongoose.Schema({
  idVerified: { type: Boolean, default: false },
  idDocument: { type: String }, // URL to uploaded ID
  addressVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  backgroundCheckStatus: {
    type: String,
    enum: ['not_required', 'pending', 'approved', 'rejected'],
    default: 'not_required'
  },
  backgroundCheckDate: { type: Date },
  references: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    verified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    notes: { type: String }
  }],
  verificationLevel: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  }
}, { _id: false });

const shelterPermissionsSchema = new mongoose.Schema({
  canManagePets: { type: Boolean, default: false },
  canApproveApplications: { type: Boolean, default: false },
  canManageStaff: { type: Boolean, default: false },
  canViewAnalytics: { type: Boolean, default: false },
  canManageEvents: { type: Boolean, default: false },
  canAccessFinancials: { type: Boolean, default: false },
  canManageEmergencies: { type: Boolean, default: false },
  permissions: [{ type: String }] // Additional custom permissions
}, { _id: false });

const UserSchema = new mongoose.Schema({
  // Authentication
  uid: { type: String, unique: true, sparse: true }, // Firebase UID or other external auth
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: function() { 
      return !this.socialAuth || this.socialAuth.length === 0; 
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Social authentication
  socialAuth: [{
    provider: { type: String, enum: ['google', 'facebook', 'apple'] },
    providerId: { type: String },
    email: { type: String },
    connectedAt: { type: Date, default: Date.now }
  }],
  
  // Basic Information
  name: { 
    first: { type: String, required: true, trim: true },
    last: { type: String, required: true, trim: true }
  },
  displayName: { type: String, trim: true }, // How they want to be shown publicly
  
  // Contact Information
  phone: { 
    type: String, 
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  alternatePhone: { type: String, trim: true },
  
  // Location
  address: addressSchema,
  timeZone: { type: String, default: 'America/New_York' },
  
  // Profile
  bio: { type: String, maxlength: 1000 },
  profilePhoto: { type: String }, // URL
  coverPhoto: { type: String }, // URL
  dateOfBirth: { type: Date },
  
  // User Type and Role
  userType: { 
    type: String, 
    enum: ["adopter", "shelter_staff", "shelter_admin", "volunteer", "foster", "admin"], 
    default: "adopter",
    index: true
  },
  
  // Shelter association (for staff/volunteers)
  associatedShelter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shelter',
    index: true
  },
  shelterRole: {
    type: String,
    enum: ['staff', 'volunteer', 'manager', 'director', 'veterinarian']
  },
  shelterPermissions: shelterPermissionsSchema,
  
  // Account Status
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String },
  suspensionDate: { type: Date },
  
  // Verification
  verification: verificationSchema,
  
  // Preferences and Settings
  preferences: preferencesSchema,
  
  // Activity and History
  lastLogin: { type: Date },
  lastActive: { type: Date },
  loginCount: { type: Number, default: 0 },
  
  // Adoption related
  adoptionHistory: [adoptionHistorySchema],
  favoritePets: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet' 
  }],
  applications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  }],
  
  // Living situation (for adopters)
  livingSituation: {
    homeType: {
      type: String,
      enum: ['house', 'apartment', 'condo', 'townhouse', 'mobile_home', 'other']
    },
    homeOwnership: {
      type: String,
      enum: ['own', 'rent', 'live_with_family']
    },
    hasYard: { type: Boolean },
    yardType: {
      type: String,
      enum: ['fenced', 'unfenced', 'none']
    },
    householdSize: { type: Number, min: 1 },
    hasChildren: { type: Boolean },
    childrenAges: [{ type: Number }],
    hasOtherPets: { type: Boolean },
    otherPetsDetails: [{ 
      type: { type: String },
      name: { type: String },
      age: { type: String },
      spayedNeutered: { type: Boolean }
    }],
    landlordApproval: { type: Boolean }, // For renters
    petDeposit: { type: Boolean } // If required by landlord
  },
  
  // Experience and qualifications
  petExperience: {
    yearsOfExperience: { type: Number, default: 0 },
    typesOfPets: [{ type: String }],
    trainingExperience: { type: Boolean, default: false },
    specialNeedsExperience: { type: Boolean, default: false },
    volunteerExperience: [{ 
      organization: { type: String },
      role: { type: String },
      duration: { type: String },
      reference: { type: String }
    }]
  },
  
  // Financial information (basic)
  financialInfo: {
    canAffordCare: { type: Boolean },
    hasVetBudget: { type: Boolean },
    estimatedMonthlyBudget: { type: Number },
    hasEmergencyFund: { type: Boolean }
  },
  
  // Communication preferences
  communicationSettings: {
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true }
  },
  
  // Privacy settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'shelters_only', 'private'],
      default: 'shelters_only'
    },
    showRealName: { type: Boolean, default: false },
    shareAdoptionHistory: { type: Boolean, default: false },
    allowDirectMessages: { type: Boolean, default: true }
  },
  
  // Emergency contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Account security
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    backupCodes: [{ type: String }],
    passwordLastChanged: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    sessionTokens: [{ 
      token: { type: String },
      device: { type: String },
      createdAt: { type: Date, default: Date.now },
      lastUsed: { type: Date, default: Date.now }
    }]
  },
  
  // Analytics and metrics
  metrics: {
    petsViewed: { type: Number, default: 0 },
    applicationsSubmitted: { type: Number, default: 0 },
    messagesExchanged: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    searchesPerformed: { type: Number, default: 0 }
  },
  
  // Legacy fields for backward compatibility
  location: { type: String }, // Keep old location field
  
  // Administrative
  notes: [{ 
    note: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: true } // Not visible to the user
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.password;
      delete ret.security.sessionTokens;
      delete ret.security.backupCodes;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtuals
UserSchema.virtual('fullName').get(function() {
  if (this.name && this.name.first && this.name.last) {
    return `${this.name.first} ${this.name.last}`;
  }
  return this.displayName || 'User';
});

UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

UserSchema.virtual('verificationScore').get(function() {
  let score = 0;
  const verification = this.verification || {};
  
  if (verification.emailVerified) score += 20;
  if (verification.phoneVerified) score += 20;
  if (verification.idVerified) score += 30;
  if (verification.addressVerified) score += 20;
  if (verification.backgroundCheckStatus === 'approved') score += 10;
  
  return score;
});

UserSchema.virtual('isHighlyVerified').get(function() {
  return this.verificationScore >= 70;
});

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ userType: 1, isActive: 1 });
UserSchema.index({ associatedShelter: 1, userType: 1 });
UserSchema.index({ 'address.city': 1, 'address.state': 1 });
UserSchema.index({ lastActive: -1 });
UserSchema.index({ 'verification.emailVerified': 1 });

// Text search index
UserSchema.index({ 
  'name.first': 'text', 
  'name.last': 'text', 
  displayName: 'text',
  email: 'text' 
});

// Geospatial index for location-based queries
UserSchema.index({ 'address.coordinates': '2dsphere' });

// Pre-save middleware
UserSchema.pre('save', async function(next) {
  // Hash password if it's new or modified
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Update timestamps
  this.updatedAt = new Date();
  
  // Set display name if not provided
  if (!this.displayName && this.name && this.name.first) {
    this.displayName = this.name.first;
  }
  
  // Sync old location field with new address
  if (this.address && this.address.city && this.address.state) {
    this.location = `${this.address.city}, ${this.address.state}`;
  }
  
  next();
});

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  this.loginCount += 1;
  return this.save();
};

UserSchema.methods.addFavorite = function(petId) {
  if (!this.favoritePets.includes(petId)) {
    this.favoritePets.push(petId);
    return this.save();
  }
  return Promise.resolve(this);
};

UserSchema.methods.removeFavorite = function(petId) {
  this.favoritePets = this.favoritePets.filter(id => !id.equals(petId));
  return this.save();
};

UserSchema.methods.canAccessShelter = function(shelterId) {
  if (this.userType === 'admin') return true;
  if (!this.associatedShelter) return false;
  return this.associatedShelter.toString() === shelterId.toString();
};

UserSchema.methods.hasPermission = function(permission) {
  if (this.userType === 'admin') return true;
  if (!this.shelterPermissions) return false;
  return this.shelterPermissions.permissions.includes(permission) || 
         this.shelterPermissions[permission] === true;
};

UserSchema.methods.addNote = function(note, addedBy, isInternal = true) {
  this.notes.push({
    note,
    addedBy,
    isInternal,
    addedAt: new Date()
  });
  return this.save();
};

UserSchema.methods.verifyEmail = function() {
  this.verification = this.verification || {};
  this.verification.emailVerified = true;
  this.isVerified = this.verificationScore >= 40; // Basic verification threshold
  return this.save();
};

UserSchema.methods.verifyPhone = function() {
  this.verification = this.verification || {};
  this.verification.phoneVerified = true;
  this.isVerified = this.verificationScore >= 40;
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findActiveUsers = function(userType) {
  const query = { isActive: true };
  if (userType) query.userType = userType;
  return this.find(query).sort({ lastActive: -1 });
};

UserSchema.statics.findByShelter = function(shelterId, roles = []) {
  const query = { 
    associatedShelter: shelterId,
    isActive: true 
  };
  if (roles.length > 0) {
    query.shelterRole = { $in: roles };
  }
  return this.find(query);
};

UserSchema.statics.findNearLocation = function(latitude, longitude, maxDistance = 25) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance * 1609.34 // Convert miles to meters
      }
    },
    isActive: true
  });
};

UserSchema.statics.getUserStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$userType',
        count: { $sum: 1 },
        activeCount: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedCount: { 
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model("User", UserSchema);
