// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/messageModel");

// Get all messages
router.get("/viewAll", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a new message
router.post("/sendNew", async (req, res) => {
  const { text, sender, timestamp, senderName } = req.body;

  try {
    const newMessage = new Message({
      text,
      sender,
      timestamp,
      senderName,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
