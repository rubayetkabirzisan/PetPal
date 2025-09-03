const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytics'); // Model to store analytics data

// Example Analytics Route: Get data
router.get('/view', async (req, res) => {
  try {
    const data = await Analytics.find();
    console.log(data); // Log the response to ensure data is being fetched
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});


// Example Analytics Route: Save data
router.post('/save', async (req, res) => {
  try {
    const newData = new Analytics(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
//analytics screen