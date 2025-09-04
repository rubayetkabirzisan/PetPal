// models/Pet.js
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: String,
  type: String,
  breed: String,
  color: String,
  lastSeen: String,
  location: String,
  reportedDate: String,
  status: {
    type: String,
    enum: ["Active", "Found", "Closed"],
    default: "Active",
  },
  ownerName: String,
  ownerPhone: String,
  description: String,
  image: String,
});

module.exports = mongoose.model("LostPet", petSchema);
