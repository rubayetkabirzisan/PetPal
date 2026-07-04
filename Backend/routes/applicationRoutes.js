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

module.exports = router;
