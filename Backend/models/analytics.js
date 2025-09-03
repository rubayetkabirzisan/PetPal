const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  analyticsData: [
    {
      title: String,
      value: String,
      icon: String,
      color: String,
    },
  ],
  recentMetrics: [
    {
      metric: String,
      value: String,
      trend: String,
    },
  ],
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
