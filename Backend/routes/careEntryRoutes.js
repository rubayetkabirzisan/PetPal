const express = require('express');
const CareEntry = require('../models/careEntry');

const router = express.Router();
const auth = require("../middleware/auth");

// Get all care entries
router.get('/viewAll', auth, async (req, res) => {
  try {
    const careEntries = await CareEntry.find().sort({ date: -1 });
    res.json(careEntries);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get all care entries by User ID
router.get('/viewByUser/:userId', auth, async (req, res) => {
  try {
    const careEntries = await CareEntry.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(careEntries);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get a single care entry by ID
router.get('/viewById/:id', auth, async (req, res) => {
  try {
    const careEntry = await CareEntry.findById(req.params.id);
    if (!careEntry) {
      return res.status(404).json({ msg: 'Care Entry not found' });
    }
    res.json(careEntry);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create a new care entry
router.post('/create', auth, async (req, res) => {
  try {
    console.log("CareEntry Create Body:", req.body);
    const newCareEntry = new CareEntry(req.body);
    await newCareEntry.save();
    res.json(newCareEntry);
  } catch (err) {
    console.error("CareEntry Create Error:", err);
    res.status(500).json({ error: err.message, message: 'Server Error' });
  }
});

// Update a care entry
router.put('/update/:id', auth, async (req, res) => {
  try {
    const updatedCareEntry = await CareEntry.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body },
      { new: true }
    );
    res.json(updatedCareEntry);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete a care entry
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await CareEntry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Care Entry Deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
// carejournal 