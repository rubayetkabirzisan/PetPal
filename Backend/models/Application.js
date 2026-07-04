const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  petId: { type: String, required: true },
  shelterId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Application Denied'], 
    default: 'Pending'
  },
  submittedDate: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
  petName: { type: String, default: "" },
  petBreed: { type: String, default: "" },
  petImage: { type: String, default: "" },
  shelterName: { type: String, default: "" },
  completionPercentage: { type: Number, default: 20 },
  currentStep: { type: String, default: "Initial Review" },
  timeline: [{
    id: String,
    status: String,
    description: String,
    completed: Boolean,
    date: Date
  }]
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
