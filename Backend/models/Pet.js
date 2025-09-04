const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  petId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  species: { type: String, required: true, enum: ["dog", "cat", "bird", "rabbit", "other"] },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  size: { type: String, enum: ["small", "medium", "large"], required: true },
  color: { type: String, required: true },
  description: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  vaccinated: { type: Boolean, default: false },
  spayedNeutered: { type: Boolean, default: false },
  specialNeeds: { type: String, default: "" },
  images: [{ type: String }], // Array of image URLs
  adoptionStatus: { 
    type: String, 
    enum: ["available", "pending", "adopted", "fostered"], 
    default: "available" 
  },
  shelterInfo: {
    shelterId: { type: String, required: true },
    shelterName: { type: String, required: true },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
      address: { type: String }
    }
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  adoptionFee: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  personality: {
    energyLevel: { type: String, enum: ["low", "medium", "high"] },
    goodWithKids: { type: Boolean, default: false },
    goodWithPets: { type: Boolean, default: false },
    houseTrained: { type: Boolean, default: false },
    temperament: [{ type: String }] // ["friendly", "calm", "playful", etc.]
  }
});

module.exports = mongoose.model("Pet", PetSchema);
