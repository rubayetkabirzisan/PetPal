// models/EmergencyAction.js
const mongoose = require('mongoose');

const emergencyActionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['broadcast', 'authorities', 'search'],
  },
  details: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
});

module.exports = mongoose.model('EmergencyAction', emergencyActionSchema);
