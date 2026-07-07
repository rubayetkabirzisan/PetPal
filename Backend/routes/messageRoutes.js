const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();
const auth = require("../middleware/auth");

// Get active conversations for a user
router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Group by the "other" user AND the petId
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const petId = msg.petId || 'general';
      const key = `${otherUserId}_${petId}`;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUserId,
          latestMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread messages sent TO the current user
      if (msg.receiverId === userId && !msg.read) {
        conversationsMap.get(key).unreadCount += 1;
      }
    }

    // Resolve user details for each conversation
    const conversations = [];
    for (const [key, data] of conversationsMap.entries()) {
      const otherUserId = data.otherUserId;
      const otherUser = await User.findOne({ 
        $or: [{ uid: otherUserId }, { _id: otherUserId.match(/^[0-9a-fA-F]{24}$/) ? otherUserId : null }]
      });
      
      if (otherUser) {
        conversations.push({
          id: otherUserId, // other user's ID
          name: otherUser.name,
          userType: otherUser.userType,
          lastMessage: data.latestMessage.text,
          timestamp: data.latestMessage.createdAt,
          unread: data.unreadCount > 0,
          unreadCount: data.unreadCount,
          petName: data.latestMessage.petName,
          petId: data.latestMessage.petId
        });
      } else {
        // Fallback for mock IDs like 'shelter1'
        conversations.push({
          id: otherUserId,
          name: data.latestMessage.senderId === otherUserId ? (data.latestMessage.senderName || 'Shelter') : 'Shelter',
          userType: 'shelter',
          lastMessage: data.latestMessage.text,
          timestamp: data.latestMessage.createdAt,
          unread: data.unreadCount > 0,
          unreadCount: data.unreadCount,
          petName: data.latestMessage.petName,
          petId: data.latestMessage.petId
        });
      }
    }

    // Sort by most recent
    conversations.sort((a, b) => b.timestamp - a.timestamp);

    res.json(conversations);
  } catch (err) {
    console.error("Conversations Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get chat history between two users regarding a specific pet
router.get('/history/:userId/:otherUserId/:petId', auth, async (req, res) => {
  try {
    const { userId, otherUserId, petId } = req.params;

    const query = {
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    };
    
    // Filter by petId if it's not the fallback "general"
    if (petId && petId !== 'general' && petId !== 'undefined') {
      query.petId = petId;
    } else {
      query.$or = query.$or.map(cond => ({ ...cond, petId: { $in: [null, undefined, ''] } }));
    }

    const history = await Message.find(query).sort({ createdAt: 1 }); // Oldest to newest for chat UI

    // Mark messages as read if the current user is the receiver
    const updateQuery = { senderId: otherUserId, receiverId: userId, read: false };
    if (petId && petId !== 'general' && petId !== 'undefined') {
      updateQuery.petId = petId;
    }
    
    await Message.updateMany(updateQuery, { $set: { read: true } });

    res.json(history);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { senderId, receiverId, text, senderName, petId, petName } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      senderName,
      petId,
      petName
    });

    await newMessage.save();

    // Create a real event-driven notification for the receiver
    const Notification = require('../models/Notification');
    const newNotif = new Notification({
      userId: receiverId,
      title: "New Message",
      message: `${senderName || 'Someone'} sent you a new message.`,
      time: new Date().toISOString(),
      type: "message",
      read: false
    });
    await newNotif.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
