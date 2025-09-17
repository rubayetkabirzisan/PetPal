// models/Application.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  timestamp: String,
  type: { type: String, enum: ["approval", "status_update"] },
  status: String,
  messageId: String,
  success: Boolean,
});

const applicationSchema = new mongoose.Schema({
  petId: String,
  petName: String,
  petType: String,
  petBreed: String,
  adopterName: String,
  adopterEmail: String,
  adopterPhone: String,
  status: { type: String, enum: ["Pending", "Under Review", "Approved", "Rejected"] },
  submittedDate: String,
  priority: { type: String, enum: ["High", "Medium", "Low"] },
  notes: String,
  notificationHistory: [notificationSchema],
  formData: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    housingType: String,
    ownRent: String,
    hasYard: Boolean,
    yardFenced: Boolean,
    landlordsName: String,
    landlordsPhone: String,
    previousPets: String,
    currentPets: String,
    veterinarian: String,
    vetPhone: String,
    petExperience: String,
    workSchedule: String,
    hoursAlone: String,
    exerciseCommitment: String,
    travelFrequency: String,
    familyMembers: String,
    allergies: Boolean,
    reference1Name: String,
    reference1Phone: String,
    reference1Relation: String,
    reference2Name: String,
    reference2Phone: String,
    reference2Relation: String,
    whyAdopt: String,
    expectations: String,
    trainingPlan: String,
    healthCareCommitment: String,
    financialPreparation: String,
    additionalComments: String,
  },
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
