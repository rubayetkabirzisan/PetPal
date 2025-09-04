const mongoose = require("mongoose");

const VerificationRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  verificationType: { 
    type: String, 
    enum: ["shelter", "adopter", "volunteer"], 
    required: true 
  },
  documents: [{
    type: { type: String, required: true }, // "id", "proof_of_address", "shelter_license", etc.
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  businessInfo: {
    organizationName: { type: String },
    licenseNumber: { type: String },
    address: { type: String },
    website: { type: String },
    description: { type: String }
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "needs_review"], 
    default: "pending" 
  },
  submissionDate: { type: Date, default: Date.now },
  reviewedDate: { type: Date },
  reviewedBy: { type: String }, // admin ID
  reviewNotes: { type: String, default: "" },
  rejectionReason: { type: String, default: "" }
});

module.exports = mongoose.model("VerificationRequest", VerificationRequestSchema);
