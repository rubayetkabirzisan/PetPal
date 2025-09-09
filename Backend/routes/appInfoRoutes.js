const express = require('express');
const router = express.Router();
const AppInfo = require('../models/AppInfo');

// GET /app-info
router.get('/app-info', async (req, res) => {
  try {
    const info = await AppInfo.findOne();
    if (!info) {
      return res.status(404).json({ error: 'App info not found' });
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch app info' });
  }
});

module.exports = router;
