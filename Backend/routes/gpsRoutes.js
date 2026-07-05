const express = require('express');
const AdoptionHistory = require('../models/AdoptionHistory');

const router = express.Router();

// Get simulated tracked pets for a user
router.get('/track/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all pets this user has adopted
    const adoptedPets = await AdoptionHistory.find({ userId });
    
    if (!adoptedPets || adoptedPets.length === 0) {
      return res.json([]);
    }

    // Generate simulated GPS data for each adopted pet
    const trackedPets = adoptedPets.map((history) => {
      // Simulate random battery level between 10% and 100%
      const batteryLevel = Math.floor(Math.random() * 90) + 10;
      
      // Assign status based on battery or random chance
      let status = "Safe";
      if (batteryLevel < 20) {
        status = "Low Battery";
      } else if (Math.random() > 0.8) {
        status = "Alert"; // 20% chance of random alert for demo
      }

      // Pick a random mock location string
      const locations = ["Home", "Backyard", "Living Room", "Nearby Park", "Front Porch"];
      const lastLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Random last update time
      const times = ["Just now", "2 minutes ago", "5 minutes ago", "10 minutes ago"];
      const lastUpdate = times[Math.floor(Math.random() * times.length)];

      return {
        id: history.petId,
        name: history.petName,
        type: history.petBreed || "Unknown",
        lastLocation: lastLocation,
        lastUpdate: lastUpdate,
        batteryLevel: batteryLevel,
        status: status,
      };
    });

    res.json(trackedPets);
  } catch (err) {
    console.error("Error generating simulated GPS data:", err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
