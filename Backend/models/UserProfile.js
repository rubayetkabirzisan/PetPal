const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID or custom ID
  name: String,
  email: String,
  phone: String,
  location: String,
  bio: String
}, { timestamps: true })

module.exports = mongoose.model('UserProfile', userProfileSchema)
