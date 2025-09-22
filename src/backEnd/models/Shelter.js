// models/Shelter.js
const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  socialMedia: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String }
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, { _id: false });

const operatingHoursSchema = new mongoose.Schema({
  monday: { open: String, close: String, closed: { type: Boolean, default: false } },
  tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
  wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
  thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
  friday: { open: String, close: String, closed: { type: Boolean, default: false } },
  saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
  sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
}, { _id: false });

const capacitySchema = new mongoose.Schema({
  dogs: { current: Number, maximum: Number },
  cats: { current: Number, maximum: Number },
  other: { current: Number, maximum: Number }
}, { _id: false });

const ShelterSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 2000 },
  type: {
    type: String,
    enum: ['municipal', 'private_nonprofit', 'rescue_group', 'foster_network'],
    required: true
  },
  
  // Contact and Location
  contactInfo: contactInfoSchema,
  location: locationSchema,
  
  // Operations
  operatingHours: operatingHoursSchema,
  capacity: capacitySchema,
  
  // Services and Features
  services: [{
    type: String,
    enum: [
      'adoption', 'fostering', 'veterinary_care', 'training', 'grooming',
      'boarding', 'spay_neuter', 'microchipping', 'vaccination',
      'behavioral_assessment', 'rehabilitation', 'emergency_care'
    ]
  }],
  
  adoptionProcess: {
    applicationRequired: { type: Boolean, default: true },
    homeVisitRequired: { type: Boolean, default: false },
    referenceCheckRequired: { type: Boolean, default: true },
    processingTimedays: { type: Number, default: 7 },
    adoptionFeeRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 500 }
    }
  },
  
  // Staff and Volunteers
  staff: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['director', 'manager', 'veterinarian', 'volunteer_coordinator', 'adoption_counselor', 'caretaker']
    },
    permissions: [{
      type: String,
      enum: ['manage_pets', 'approve_applications', 'manage_staff', 'view_analytics', 'manage_events']
    }]
  }],
  
  // Statistics and Performance
  statistics: {
    totalAnimalsRescued: { type: Number, default: 0 },
    totalAdoptions: { type: Number, default: 0 },
    currentAnimals: { type: Number, default: 0 },
    adoptionRate: { type: Number, default: 0 }, // percentage
    averageStayDays: { type: Number, default: 0 }
  },
  
  // Verification and Compliance
  licenses: [{
    type: { type: String, required: true },
    number: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  }],
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'revoked'],
    default: 'pending'
  },
  
  // Financial and Donation Information
  donationInfo: {
    acceptsDonations: { type: Boolean, default: true },
    taxExemptNumber: { type: String },
    paymentMethods: [{ type: String }], // ['paypal', 'stripe', 'venmo', etc.]
    wishList: [{ type: String }] // items needed
  },
  
  // Media and Branding
  logo: { type: String }, // URL to logo
  images: [{ type: String }], // URLs to facility images
  
  // Administrative
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total capacity
ShelterSchema.virtual('totalCapacity').get(function() {
  const cap = this.capacity || {};
  return (cap.dogs?.maximum || 0) + (cap.cats?.maximum || 0) + (cap.other?.maximum || 0);
});

// Virtual for current occupancy rate
ShelterSchema.virtual('occupancyRate').get(function() {
  const cap = this.capacity || {};
  const current = (cap.dogs?.current || 0) + (cap.cats?.current || 0) + (cap.other?.current || 0);
  const maximum = this.totalCapacity;
  return maximum > 0 ? Math.round((current / maximum) * 100) : 0;
});

// Indexes for better performance
ShelterSchema.index({ 'location.city': 1, 'location.state': 1 });
ShelterSchema.index({ type: 1, isActive: 1 });
ShelterSchema.index({ verificationStatus: 1 });
ShelterSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
ShelterSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Shelter", ShelterSchema);