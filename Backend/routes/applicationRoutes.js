const express = require('express');
const Application = require('../models/Application');

const router = express.Router();

// Get all applications for a user
router.get('/viewById/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId }).sort({ submittedDate: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new application
router.post('/create', async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.json(newApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status (Admin)
router.patch('/updateStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create a real event-driven notification for the adopter
    const Notification = require('../models/Notification');
    const newNotif = new Notification({
      userId: application.userId, // Assuming Application model has userId
      title: `Application ${status}`,
      message: `Your adoption application for ${application.petName} was marked as ${status}.`,
      time: new Date().toISOString(),
      type: "application",
      read: false
    });
    await newNotif.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
