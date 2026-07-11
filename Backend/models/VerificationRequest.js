const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  adopterId: { type: String, required: true },    // uid of the adopter
  adopterName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  submittedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  documents: [
    {
      type: { type: String },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      }
    }
  ],
  notes: { type: String, default: "" }
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
