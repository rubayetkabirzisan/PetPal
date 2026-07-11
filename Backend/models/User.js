const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  userType: { type: String, enum: ["adopter", "shelter", "admin"], default: "adopter" },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },
  savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }]
});

module.exports = mongoose.model("User", UserSchema);
