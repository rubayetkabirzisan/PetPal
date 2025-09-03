const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications
router.get('/viewAll', async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new notification
router.post('/AddNew', async (req, res) => {
  const notification = new Notification({
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
router.patch('/markRead/:id', async (req, res) => {
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

module.exports = router;
//notofication