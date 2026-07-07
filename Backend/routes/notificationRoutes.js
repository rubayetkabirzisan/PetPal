const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();
const auth = require("../middleware/auth");

// Get all notifications by user
router.get('/viewByUser/:userId', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ time: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new notification
router.post('/AddNew', auth, async (req, res) => {
  const notification = new Notification({
    userId: req.body.userId,
    title: req.body.title,
    message: req.body.message,
    time: req.body.time,
    type: req.body.type,
    read: req.body.read || false
  });

  try {
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/markRead/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark all notifications as read for a specific user
router.patch('/markAllRead/:userId', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
//notofication