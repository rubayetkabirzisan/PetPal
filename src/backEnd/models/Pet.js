// models/Pet.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String }
}, { _id: false });

const healthRecordSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['vaccination', 'medical_exam', 'surgery', 'medication', 'dental', 'other'],
    required: true 
  },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  description: { type: String },
  veterinarian: { type: String },
  documents: [{ type: String }], // URLs to documents
  nextDue: { type: Date } // For recurring treatments
}, { timestamps: true });

const shelterInfoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  website: { type: String }
}, { _id: false });

const PetSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea_pig', 'reptile', 'fish', 'other']
  },
  breed: { type: String, required: true, trim: true },
  age: { type: String }, // e.g., "2 years", "6 months"
  size: { 
    type: String, 
    enum: ['Small', 'Medium', 'Large', 'Extra Large'],
    default: 'Medium'
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Unknown']
  },
  color: { type: String, trim: true },
  
  // Physical characteristics
  weight: { type: Number }, // in pounds
  microchipId: { type: String, unique: true, sparse: true },
  
  // Status and availability
  status: { 
    type: String, 
    enum: ['Available', 'Pending', 'Adopted', 'On Hold', 'Not Available', 'Medical Hold'],
    default: 'Available'
  },
  adoptionFee: { type: Number, default: 0 },
  
  // Health and care
  vaccinated: { type: Boolean, default: false },
  neutered: { type: Boolean, default: false },
  houseTrained: { type: Boolean, default: false },
  specialNeeds: { type: Boolean, default: false },
  specialNeedsDescription: { type: String },
  healthRecords: [healthRecordSchema],
  
  // Behavioral information
  temperament: [{ type: String }], // e.g., ['Friendly', 'Active', 'Loyal']
  goodWith: [{ 
    type: String,
    enum: ['Children', 'Dogs', 'Cats', 'Other Pets', 'Adults Only']
  }],
  energyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  
  // Media and description
  images: [{ type: String }], // URLs to images
  videos: [{ type: String }], // URLs to videos
  description: { type: String, maxlength: 2000 },
  
  // Location and shelter info
  location: locationSchema,
  shelter: shelterInfoSchema,
  
  // Tracking and analytics
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  
  // GPS Tracking (for adopted pets)
  gpsTracker: {
    enabled: { type: Boolean, default: false },
    deviceId: { type: String },
    batteryLevel: { type: Number, min: 0, max: 100 },
    lastLocation: locationSchema,
    lastUpdate: { type: Date }
  },
  
  // Safe zones for GPS tracking
  safeZones: [{
    name: { type: String, required: true },
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    radius: { type: Number, required: true }, // in meters
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Adoption information
  adoptedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  adoptionDate: { type: Date },
  
  // Administrative
  enteredShelter: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days in shelter
PetSchema.virtual('daysInShelter').get(function() {
  if (this.adoptionDate) return null;
  const now = new Date();
  const entered = this.enteredShelter || this.createdAt;
  const diffTime = Math.abs(now - entered);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for age category
PetSchema.virtual('ageCategory').get(function() {
  if (!this.age) return 'Unknown';
  const age = this.age.toLowerCase();
  if (age.includes('month') || age.includes('week')) return 'Young';
  const yearMatch = age.match(/(\d+)\s*year/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years < 2) return 'Young';
    if (years < 7) return 'Adult';
    return 'Senior';
  }
  return 'Unknown';
});

// Indexes for better query performance
PetSchema.index({ type: 1, status: 1 });
PetSchema.index({ 'location.city': 1, 'location.state': 1 });
PetSchema.index({ breed: 1, type: 1 });
PetSchema.index({ adoptedBy: 1 });
PetSchema.index({ 'shelter.id': 1 });

// Pre-save middleware
PetSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Pet = mongoose.model("Pet", PetSchema);

module.exports = Pet;
