const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true,
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true }
  },
  // Address Information
  addressInfo: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    housingType: { 
      type: String, 
      enum: ['house', 'apartment', 'condo', 'other'], 
      required: true 
    },
    ownRent: { 
      type: String, 
      enum: ['own', 'rent', 'other'], 
      required: true 
    },
    hasYard: { type: Boolean, default: false },
    yardFenced: { type: Boolean, default: false },
    landlordsName: String,
    landlordsPhone: String
  },
  // Pet Experience
  petExperience: {
    previousPets: String,
    currentPets: String,
    veterinarian: String,
    vetPhone: String,
    petExperience: String
  },
  // Lifestyle Information
  lifestyle: {
    workSchedule: String,
    hoursAlone: String,
    exerciseCommitment: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    travelFrequency: String,
    activityLevel: String,
    reasonForAdoption: String,
    petPlacement: String,
    allergies: String,
    expectations: String
  },
  // Emergency & References
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  references: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  // Financial Information
  financialInfo: {
    canAffordCare: { type: Boolean, default: false },
    estimatedMonthlyCost: Number,
    emergencyFund: { type: Boolean, default: false }
  },
  // Agreement & Consent
  agreements: {
    homeVisit: { type: Boolean, default: false },
    backgroundCheck: { type: Boolean, default: false },
    returnPolicy: { type: Boolean, default: false },
    spayNeuter: { type: Boolean, default: false },
    updates: { type: Boolean, default: false }
  },
  // Application Processing
  submissionDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  decisionDate: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  rejectionReason: String,
  // Follow-up Information
  homeVisitScheduled: Date,
  homeVisitCompleted: Date,
  homeVisitNotes: String,
  meetGreetScheduled: Date,
  meetGreetCompleted: Date,
  meetGreetNotes: String,
  // Communication
  lastContactDate: Date,
  contactLog: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['call', 'email', 'visit', 'message'] },
    notes: String,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Documents
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  // Priority and flags
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  flags: [String],
  // Adoption completion
  adoptionDate: Date,
  adoptionFee: Number,
  trialPeriod: {
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'failed']
    }
  }
}, {
  timestamps: true
});

applicationSchema.index({ petId: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submissionDate: -1 });
applicationSchema.index({ applicationId: 1 });

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
