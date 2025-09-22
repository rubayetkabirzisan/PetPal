const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['photo', 'document', 'receipt', 'medical_record'],
    required: true 
  },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  prescribedBy: { type: String } // Veterinarian name
}, { _id: false });

const careEntrySchema = new mongoose.Schema({
  // Basic Information
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet', 
    required: true,
    index: true
  },
  petName: { type: String, required: true }, // Keep for compatibility
  
  // Entry Classification
  type: { 
    type: String, 
    enum: ['medical', 'feeding', 'grooming', 'exercise', 'training', 'vet_visit', 'general', 'other'], 
    default: 'general',
    index: true
  },
  subType: { 
    type: String,
    validate: {
      validator: function(value) {
        if (!value) return true;
        
        const validSubTypes = {
          medical: ['vaccination', 'medication', 'treatment', 'surgery', 'dental', 'checkup'],
          feeding: ['meal', 'treat', 'supplement', 'diet_change', 'weight_check'],
          grooming: ['bath', 'nail_trim', 'brushing', 'ear_cleaning', 'flea_treatment'],
          exercise: ['walk', 'play_session', 'training_exercise', 'agility'],
          training: ['obedience', 'house_training', 'socialization', 'behavior_modification'],
          vet_visit: ['routine_checkup', 'emergency', 'follow_up', 'consultation'],
          general: ['behavior_observation', 'milestone', 'incident'],
          other: ['other']
        };
        
        return validSubTypes[this.type]?.includes(value);
      },
      message: 'Invalid subType for the selected type'
    }
  },
  
  // Content
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  
  // Scheduling and timing
  date: { type: Date, required: true, index: true },
  duration: { type: Number }, // in minutes
  nextDue: { type: Date }, // For recurring care items
  isRecurring: { type: Boolean, default: false },
  
  // Medical specific fields
  medications: [medicationSchema],
  temperature: { type: Number }, // in Fahrenheit
  weight: { type: Number }, // in pounds
  symptoms: [{ type: String }],
  diagnosis: { type: String },
  treatment: { type: String },
  veterinarian: {
    name: { type: String },
    clinic: { type: String },
    phone: { type: String }
  },
  
  // Financial information
  cost: { type: Number, min: 0, default: 0 },
  paidBy: {
    type: String,
    enum: ['shelter', 'adopter', 'insurance', 'sponsor', 'other']
  },
  
  // Quality and outcome tracking
  outcome: {
    type: String,
    enum: ['successful', 'partial', 'unsuccessful', 'ongoing', 'cancelled']
  },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpNotes: { type: String },
  
  // Documentation
  attachments: [attachmentSchema],
  notes: { type: String, maxlength: 1000 },
  
  // Administrative
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdByName: { type: String },
  createdByRole: {
    type: String,
    enum: ['adopter', 'shelter_staff', 'veterinarian', 'volunteer', 'admin']
  },
  
  // Categorization and tagging
  tags: [{ type: String }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for entry age
careEntrySchema.virtual('daysSinceEntry').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
careEntrySchema.index({ petId: 1, date: -1 });
careEntrySchema.index({ type: 1, date: -1 });
careEntrySchema.index({ createdBy: 1, date: -1 });
careEntrySchema.index({ nextDue: 1 });

// Compound indexes
careEntrySchema.index({ petId: 1, type: 1, date: -1 });

// Static methods
careEntrySchema.statics.getCarePlan = function(petId, startDate, endDate) {
  return this.find({
    petId: petId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

careEntrySchema.statics.getUpcomingCare = function(petId, days = 30) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    petId: petId,
    nextDue: { $gte: now, $lte: futureDate }
  }).sort({ nextDue: 1 });
};

const CareEntry = mongoose.model('CareEntry', careEntrySchema);

module.exports = CareEntry;
