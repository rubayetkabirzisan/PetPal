const express = require('express');
const AdoptionHistory = require('../models/AdoptionHistory');

const router = express.Router();
const auth = require("../middleware/auth");

// Get all adoption history for a user
router.get('/viewById/:userId', auth, async (req, res) => {
  try {
    const history = await AdoptionHistory.find({ userId: req.params.userId }).sort({ adoptionDate: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new adoption history entry
router.post('/create', auth, async (req, res) => {
  try {
    const newEntry = new AdoptionHistory(req.body);
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
