// routes/emergencyRoutes.js
const express = require('express');
const router = express.Router();
const EmergencyAction = require('../models/EmergencyAction');

// POST request to send emergency action
router.post('/action', async (req, res) => {
  try {
    const actionData = req.body;

    const emergencyAction = new EmergencyAction({
      type: actionData.type,
      details: actionData.details,
      status: 'Completed',  // Assuming the action is completed once it's submitted
    });

    await emergencyAction.save();
    res.status(201).json({ message: 'Emergency action completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete action' });
  }
});

module.exports = router;
