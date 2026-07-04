const mongoose = require('mongoose');

const adoptionHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  petId: { type: String, required: true },
  applicationId: { type: String, required: true },
  adoptionDate: { type: Date, default: Date.now },
  applicationDate: { type: Date },
  status: { type: String, enum: ['adopted', 'approved'], default: 'adopted' },
  notes: { type: String, default: "" },
  petName: { type: String, default: "" },
  petBreed: { type: String, default: "" },
  petImage: { type: String, default: "" },
  shelterName: { type: String, default: "" },
  shelterContact: { type: String, default: "" }
});

const AdoptionHistory = mongoose.model('AdoptionHistory', adoptionHistorySchema);
module.exports = AdoptionHistory;
