const mongoose = require('mongoose');

const timeSeriesDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const demographicDataSchema = new mongoose.Schema({
  category: { type: String, required: true },
  value: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
  percentage: { type: Number, min: 0, max: 100 }
}, { _id: false });

const performanceMetricSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String },
  trend: { 
    type: String, 
    enum: ['increasing', 'decreasing', 'stable', 'unknown'],
    default: 'unknown' 
  },
  changePercent: { type: Number },
  benchmark: { type: Number },
  lastCalculated: { type: Date, default: Date.now }
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  // Entity association
  entityType: {
    type: String,
    enum: ['shelter', 'system', 'user', 'pet'],
    default: 'shelter',
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  entityName: { type: String },
  
  // Report metadata
  reportType: {
    type: String,
    enum: [
      'adoption_performance', 'pet_statistics', 'user_engagement',
      'financial_summary', 'operational_metrics', 'care_analytics'
    ],
    default: 'adoption_performance',
    index: true
  },
  
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  
  startDate: { type: Date, index: true },
  endDate: { type: Date, index: true },
  
  // Core metrics
  metrics: {
    totalPets: { type: Number, default: 0 },
    availablePets: { type: Number, default: 0 },
    adoptedPets: { type: Number, default: 0 },
    adoptionRate: { type: Number, min: 0, max: 100 },
    averageDaysToAdoption: { type: Number },
    totalApplications: { type: Number, default: 0 },
    pendingApplications: { type: Number, default: 0 },
    approvedApplications: { type: Number, default: 0 },
    applicationApprovalRate: { type: Number, min: 0, max: 100 },
    activeUsers: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 }
  },
  
  // Detailed analytics
  performanceMetrics: [performanceMetricSchema],
  demographics: [demographicDataSchema],
  timeSeries: [timeSeriesDataSchema],
  
  // Breed and pet type analysis
  breedAnalytics: {
    mostPopularBreeds: [demographicDataSchema],
    fastestAdoptingBreeds: [demographicDataSchema]
  },
  
  petTypeBreakdown: [demographicDataSchema],
  
  // Temporal patterns
  monthlyTrends: [timeSeriesDataSchema],
  
  // Legacy fields for backward compatibility
  analyticsData: [{
    title: { type: String },
    value: { type: String },
    icon: { type: String },
    color: { type: String }
  }],
  
  recentMetrics: [{
    metric: { type: String },
    value: { type: String },
    trend: { type: String }
  }],
  
  // Administrative
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
analyticsSchema.virtual('adoptionEfficiency').get(function() {
  if (!this.metrics.averageDaysToAdoption || !this.metrics.adoptionRate) return null;
  return (this.metrics.adoptionRate / this.metrics.averageDaysToAdoption * 100).toFixed(2);
});

// Indexes for better performance
analyticsSchema.index({ entityType: 1, entityId: 1, reportType: 1 });
analyticsSchema.index({ startDate: 1, endDate: 1 });
analyticsSchema.index({ reportType: 1, lastUpdated: -1 });

// Pre-save middleware
analyticsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Calculate percentage fields
  if (this.metrics.totalPets > 0) {
    this.metrics.adoptionRate = (this.metrics.adoptedPets / this.metrics.totalPets) * 100;
  }
  
  if (this.metrics.totalApplications > 0) {
    this.metrics.applicationApprovalRate = (this.metrics.approvedApplications / this.metrics.totalApplications) * 100;
  }
  
  next();
});

// Instance methods
analyticsSchema.methods.updateMetric = function(metricName, value, unit, benchmark) {
  const existingMetric = this.performanceMetrics.find(m => m.metric === metricName);
  
  if (existingMetric) {
    existingMetric.value = value;
    existingMetric.unit = unit;
    existingMetric.benchmark = benchmark;
    existingMetric.lastCalculated = new Date();
  } else {
    this.performanceMetrics.push({
      metric: metricName,
      value,
      unit,
      benchmark,
      lastCalculated: new Date()
    });
  }
};

analyticsSchema.methods.addTimeSeriesPoint = function(date, value, metadata = {}) {
  this.timeSeries.push({
    date: new Date(date),
    value,
    metadata
  });
  
  // Keep only last 365 data points for performance
  if (this.timeSeries.length > 365) {
    this.timeSeries = this.timeSeries.slice(-365);
  }
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
