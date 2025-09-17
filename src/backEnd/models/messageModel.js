// models/messageModel.js
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    text: { type: String, required: true },
    sender: { type: String, enum: ["user", "shelter"], required: true },
    timestamp: { type: String, required: true },
    senderName: { type: String, required: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
