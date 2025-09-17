// models/AdoptionHistory.js
const mongoose = require("mongoose");

const adoptionHistorySchema = new mongoose.Schema({
  petId: { type: String, required: true },
  userId: { type: String, required: true },
  petName: { type: String, required: true },
  petBreed: { type: String, required: true },
  petImage: { type: String, required: true },
  applicationId: { type: String, required: true },
  applicationDate: { type: String, required: true },
  adoptionDate: { type: String, required: false },
  status: { type: String, required: true },
  notes: { type: String, required: false },
  shelterName: { type: String, required: true },
  shelterContact: { type: String, required: true },
});

const AdoptionHistory = mongoose.model("AdoptionHistory", adoptionHistorySchema);

module.exports = AdoptionHistory;
