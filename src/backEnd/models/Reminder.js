const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['photo', 'document', 'receipt'],
    required: true 
  },
  url: { type: String, required: true },
  filename: { type: String, required: true }
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  
  // Associated entities
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet', 
    required: true,
    index: true
  },
  petName: { type: String, required: true }, // Denormalized for quick access
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Timing
  dueDate: { type: Date, required: true, index: true },
  dueDateString: { type: String }, // Keep for backward compatibility
  reminderTime: { type: String }, // Time of day for reminder (HH:MM format)
  
  // Status
  completed: { type: Boolean, default: false, index: true },
  completedDate: { type: Date },
  completedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // Categorization
  type: {
    type: String,
    enum: [
      'vaccine', 'grooming', 'checkup', 'medication', 'feeding', 
      'exercise', 'training', 'vet_visit', 'flea_treatment', 
      'dental_care', 'weight_check', 'behavior_assessment', 'other'
    ],
    required: true,
    index: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Recurrence
  recurring: { type: Boolean, default: false, index: true },
  recurringPattern: {
    interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() { return this.recurring; }
    },
    frequency: { type: Number, default: 1 }, // Every X intervals
    endDate: { type: Date }, // When to stop recurring
    maxOccurrences: { type: Number }, // Maximum number of occurrences
    daysOfWeek: [{ 
      type: Number, 
      min: 0, 
      max: 6 
    }], // For weekly: 0=Sunday, 1=Monday, etc.
    dayOfMonth: { type: Number, min: 1, max: 31 }, // For monthly
    monthsOfYear: [{ type: Number, min: 1, max: 12 }] // For yearly
  },
  
  // Parent reminder (for recurring instances)
  parentReminder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reminder'
  },
  isRecurringInstance: { type: Boolean, default: false },
  
  // Notification settings
  notifications: {
    enabled: { type: Boolean, default: true },
    advanceNotice: [{ 
      amount: { type: Number, required: true }, // e.g., 2
      unit: { 
        type: String, 
        enum: ['minutes', 'hours', 'days', 'weeks'],
        required: true 
      }
    }], // e.g., 2 days before, 1 hour before
    sent: [{ 
      sentAt: { type: Date },
      notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
    }]
  },
  
  // Care context
  careContext: {
    lastCompleted: { type: Date }, // When this type of care was last done
    nextSuggested: { type: Date }, // AI-suggested next occurrence
    importance: {
      type: String,
      enum: ['optional', 'recommended', 'required', 'critical'],
      default: 'recommended'
    },
    relatedCareEntryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CareEntry' 
    }
  },
  
  // Location and provider
  location: {
    name: { type: String }, // e.g., "Downtown Vet Clinic"
    address: { type: String },
    phone: { type: String },
    website: { type: String }
  },
  
  // Cost estimation
  estimatedCost: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Instructions and notes
  instructions: { type: String, maxlength: 1000 },
  notes: { type: String, maxlength: 1000 },
  
  // Documentation
  attachments: [attachmentSchema],
  
  // Completion details
  completionNotes: { type: String, maxlength: 500 },
  actualCost: { type: Number, min: 0 },
  
  // Snooze functionality
  snoozed: { type: Boolean, default: false },
  snoozeUntil: { type: Date },
  snoozeCount: { type: Number, default: 0 },
  
  // Categories and tags
  tags: [{ type: String }],
  category: {
    type: String,
    enum: ['health', 'grooming', 'nutrition', 'exercise', 'training', 'social', 'administrative'],
    default: 'health'
  },
  
  // Shared reminders (for families or multiple caregivers)
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    canEdit: { type: Boolean, default: false },
    canComplete: { type: Boolean, default: true },
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Administrative
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  createdDate: { type: Date, default: Date.now }, // Keep for backward compatibility
  isActive: { type: Boolean, default: true },
  
  // AI suggestions
  aiSuggested: { type: Boolean, default: false },
  aiConfidence: { type: Number, min: 0, max: 1 }, // 0-1 confidence score
  aiReasoning: { type: String } // Why AI suggested this reminder
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
reminderSchema.virtual('status').get(function() {
  if (this.completed) return 'completed';
  if (this.snoozed && this.snoozeUntil > new Date()) return 'snoozed';
  
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
});

reminderSchema.virtual('daysUntilDue').get(function() {
  if (this.completed) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

reminderSchema.virtual('isOverdue').get(function() {
  if (this.completed) return false;
  return new Date() > new Date(this.dueDate);
});

// Indexes for better performance
reminderSchema.index({ petId: 1, dueDate: 1 });
reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ type: 1, completed: 1 });
reminderSchema.index({ recurring: 1, dueDate: 1 });
reminderSchema.index({ parentReminder: 1 });
reminderSchema.index({ 'careContext.importance': 1, dueDate: 1 });

// Compound indexes
reminderSchema.index({ petId: 1, type: 1, completed: 1 });
reminderSchema.index({ userId: 1, completed: 1, dueDate: 1 });

// Pre-save middleware
reminderSchema.pre('save', function(next) {
  // Sync dueDate and dueDateString for backward compatibility
  if (this.dueDate && !this.dueDateString) {
    this.dueDateString = this.dueDate.toISOString().split('T')[0];
  }
  
  // Set completed date when marking as completed
  if (this.completed && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  // Clear completed date if uncompleting
  if (!this.completed && this.completedDate) {
    this.completedDate = undefined;
  }
  
  next();
});

// Instance methods
reminderSchema.methods.complete = function(completedBy, notes) {
  this.completed = true;
  this.completedDate = new Date();
  this.completedBy = completedBy;
  if (notes) this.completionNotes = notes;
  return this.save();
};

reminderSchema.methods.snooze = function(hours) {
  this.snoozed = true;
  this.snoozeUntil = new Date(Date.now() + (hours * 60 * 60 * 1000));
  this.snoozeCount += 1;
  return this.save();
};

reminderSchema.methods.createNext = async function() {
  if (!this.recurring || !this.recurringPattern) return null;
  
  const nextDue = this.calculateNextDueDate();
  if (!nextDue) return null;
  
  const nextReminder = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    dueDate: nextDue,
    completed: false,
    completedDate: undefined,
    completedBy: undefined,
    completionNotes: undefined,
    snoozed: false,
    snoozeUntil: undefined,
    snoozeCount: 0,
    parentReminder: this.parentReminder || this._id,
    isRecurringInstance: true,
    notifications: {
      ...this.notifications,
      sent: []
    }
  });
  
  return nextReminder.save();
};

reminderSchema.methods.calculateNextDueDate = function() {
  if (!this.recurring || !this.recurringPattern) return null;
  
  const current = new Date(this.dueDate);
  const { interval, frequency = 1 } = this.recurringPattern;
  
  let next = new Date(current);
  
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + frequency);
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 * frequency));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + frequency);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + frequency);
      break;
  }
  
  // Check if we've exceeded end date or max occurrences
  if (this.recurringPattern.endDate && next > this.recurringPattern.endDate) {
    return null;
  }
  
  return next;
};

// Static methods
reminderSchema.statics.getOverdue = function(userId, petId) {
  const query = {
    completed: false,
    dueDate: { $lt: new Date() },
    isActive: true
  };
  
  if (userId) query.userId = userId;
  if (petId) query.petId = petId;
  
  return this.find(query).sort({ dueDate: 1 });
};

reminderSchema.statics.getDueToday = function(userId, petId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    completed: false,
    dueDate: { $gte: today, $lt: tomorrow },
    isActive: true
  };
  
  if (userId) query.userId = userId;
  if (petId) query.petId = petId;
  
  return this.find(query).sort({ dueDate: 1 });
};

reminderSchema.statics.getUpcoming = function(userId, petId, days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const query = {
    completed: false,
    dueDate: { $gte: now, $lte: future },
    isActive: true
  };
  
  if (userId) query.userId = userId;
  if (petId) query.petId = petId;
  
  return this.find(query).sort({ dueDate: 1 });
};

module.exports = mongoose.model("Reminder", reminderSchema);
