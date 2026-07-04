const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, required: true },
  senderName: { type: String }, // Optional cache for UI
  petId: { type: String }, // Context about which pet the chat is for
  petName: { type: String }, // Context about which pet the chat is for
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
