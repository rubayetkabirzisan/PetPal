const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  // ── Core identity ──────────────────────────────────────────────
  name:         { type: String, required: true },
  species:      { type: String, required: true },   // "dog" | "cat" | "bird" | etc.
  type:         { type: String },                   // alias kept for legacy compat
  breed:        { type: String, default: "" },
  color:        { type: String, default: "" },
  gender:       { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
  age:          { type: String, default: "" },      // stored as string e.g. "3 years"
  description:  { type: String, default: "" },
  image:        { type: String, default: "" },      // primary image URL
  images:       [{ type: String }],                 // gallery URLs

  // ── Adoption status ────────────────────────────────────────────
  status: {
    type: String,
    enum: ["available", "pending", "adopted", "Active", "Found", "Closed"],
    default: "available",
  },
  location:     { type: String, default: "" },
  adoptionFee:  { type: Number, default: 0 },
  dateAdded:    { type: Date, default: Date.now },

  // ── Shelter reference ──────────────────────────────────────────
  shelterId:    { type: String, default: "" },
  shelterName:  { type: String, default: "" },

  // ── Medical ────────────────────────────────────────────────────
  vaccinated:     { type: Boolean, default: false },
  neutered:       { type: Boolean, default: false },
  microchipped:   { type: Boolean, default: false },
  houseTrained:   { type: Boolean, default: false },
  medicalHistory: { type: String, default: "" },
  specialNeeds:   { type: String, default: "" },

  // ── ML MATCHING FIELDS ─────────────────────────────────────────
  // Required by cosine similarity, Random Forest, and KNN matchers.
  // All fields mirror the UserPreferences interface in AiPetScreen.tsx.

  size: {
    type: String,
    enum: ["small", "medium", "large", ""],
    default: "",
  },

  activityLevel: {
    type: String,
    enum: ["low", "medium", "high", ""],
    default: "",
  },

  energyLevel: {
    type: String,
    enum: ["Low", "Medium", "High", ""],  // capital variant used in sample-data.ts
    default: "",
  },

  goodWithKids:   { type: Boolean, default: false },
  goodWithPets:   { type: Boolean, default: false },
  hypoallergenic: { type: Boolean, default: false },

  // Bidirectional matching — pet's own needs (Angle 3 research contribution)
  // These represent what the pet REQUIRES from an adopter, not just what it tolerates.
  requiresExperience: {
    type: String,
    enum: ["beginner", "intermediate", "experienced", ""],
    default: "",
  },
  idealLivingSpace: {
    type: String,
    enum: ["apartment", "house", "farm", "any", ""],
    default: "any",
  },
  idealActivityLevel: {
    type: String,
    enum: ["low", "medium", "high", "any", ""],
    default: "any",
  },
  minTimeAvailable: {
    type: String,
    enum: ["low", "medium", "high", ""],
    default: "low",
  },

  // ── Personality tags ───────────────────────────────────────────
  personality: [{ type: String }],

  // ── Legacy lost-pet fields (kept for LostPet route compat) ────
  lastSeen:     { type: String },
  reportedDate: { type: String },
  ownerName:    { type: String },
  ownerPhone:   { type: String },
  
  // ── Advanced Lost Pet Fields ──────────────────────────────────
  contactEmail: { type: String },
  reward:       { type: String },
  priority:     { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  sightings: [{
    id: String,
    location: String,
    date: String,
    time: String,
    description: String,
    reporterName: String,
    reporterPhone: String,
    reporterEmail: String,
    photos: [String],
    timestamp: String
  }],
  actionLog: [{
    timestamp: String,
    action: String,
    adminName: String,
    notes: String
  }]
});

const Pet = mongoose.model("Pet", PetSchema);

module.exports = Pet;
