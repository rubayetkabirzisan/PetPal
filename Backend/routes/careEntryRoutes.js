const express = require('express');
const CareEntry = require('../models/careEntry');

const router = express.Router();

// Get all care entries
router.get('/viewAll', async (req, res) => {
  try {
    const careEntries = await CareEntry.find().sort({ date: -1 });
    res.json(careEntries);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get a single care entry by ID
router.get('/viewById/:id', async (req, res) => {
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
router.post('/create', async (req, res) => {
  try {
    const newCareEntry = new CareEntry(req.body);
    await newCareEntry.save();
    res.json(newCareEntry);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update a care entry
router.put('/update/:id', async (req, res) => {
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
router.delete('/delete/:id', async (req, res) => {
  try {
    await CareEntry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Care Entry Deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
// carejournal 