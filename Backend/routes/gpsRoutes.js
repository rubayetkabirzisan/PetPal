const express = require('express');
const AdoptionHistory = require('../models/AdoptionHistory');

const router = express.Router();
const auth = require("../middleware/auth");

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
      // Use the petId to generate a deterministic battery level between 50 and 100
      let seed = 0;
      if (history.petId) {
        for (let i = 0; i < history.petId.length; i++) {
          seed += history.petId.charCodeAt(i);
        }
      }
      const batteryLevel = 50 + (seed % 51);
      
      const status = "Safe"; // Always safe in demo unless explicitly changed

      // Pick a deterministic location
      const locations = ["Home", "Backyard", "Living Room", "Nearby Park", "Front Porch"];
      const lastLocation = locations[seed % locations.length];
      
      const lastUpdate = "Just now";

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
