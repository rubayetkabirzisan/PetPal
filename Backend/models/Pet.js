// models/Pet.js
const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  name: String,
  type: String,
  breed: String,
  color: String,
  lastSeen: String,
  location: String,
  reportedDate: String,
  status: { type: String, enum: ["Active", "Found", "Closed"] },
  ownerName: String,
  ownerPhone: String,
  description: String,
  image: String,
});

const Pet = mongoose.model("Pet", PetSchema);

module.exports = Pet;
