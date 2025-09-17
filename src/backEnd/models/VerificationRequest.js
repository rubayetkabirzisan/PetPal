// models/VerificationRequest.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  id: String,
  type: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"] },
});

const verificationRequestSchema = new mongoose.Schema({
  adopterName: String,
  email: String,
  phone: String,
  address: String,
  submittedDate: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"] },
  documents: [documentSchema],
  notes: { type: String, required: false },
});

const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);

module.exports = VerificationRequest;
