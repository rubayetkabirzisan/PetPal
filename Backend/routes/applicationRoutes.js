const express = require('express');
const Application = require('../models/Application');

const router = express.Router();
const auth = require("../middleware/auth");

router.get('/drop-index', auth, async (req, res) => {
  try {
    const result = await Application.collection.dropIndex('applicationId_1');
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get all applications for a user
router.get('/viewById/:userId', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId }).sort({ submittedDate: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const payload = req.body;
    
    // Auto-generate standard timeline if not provided
    if (!payload.timeline || payload.timeline.length === 0) {
      payload.timeline = [
        {
          id: "step1",
          status: "Application Submitted",
          description: "Your application has been received.",
          completed: true,
          date: new Date().toISOString()
        },
        {
          id: "step2",
          status: "Initial Review",
          description: "Our team is reviewing your application.",
          completed: false,
          date: null
        },
        {
          id: "step3",
          status: "Interview & Home Check",
          description: "We will contact you to schedule a brief interview.",
          completed: false,
          date: null
        },
        {
          id: "step4",
          status: "Final Decision",
          description: "Your application is approved or denied.",
          completed: false,
          date: null
        }
      ];
      payload.completionPercentage = 25;
      payload.currentStep = "Initial Review";
    }

    const newApplication = new Application(payload);
    await newApplication.save();
    res.json(newApplication);
  } catch (err) {
    console.error("Application create error:", err.message);
    console.error("Payload was:", req.body);
    res.status(500).json({ error: err.message });
  }
});

// Update application status (Admin)
router.patch('/updateStatus/:id', auth, async (req, res) => {
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
