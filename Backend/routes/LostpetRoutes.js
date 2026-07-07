// routes/petRoutes.js
const express = require("express");
const Pet = require("../models/Pet");
const router = express.Router();
const auth = require("../middleware/auth");

// Get all lost pets
router.get("/viewAll", auth, async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pets" });
  }
});

// Add a new lost pet
router.post("/addpet", auth, async (req, res) => {
  const { 
    name, type, species, breed, color, lastSeen, location, reportedDate, status, 
    ownerName, ownerPhone, description, image, contactEmail, reward, priority, actionLog 
  } = req.body;

  const newPet = new Pet({
    name,
    type,
    species: species || type || "Unknown",
    breed,
    color,
    lastSeen,
    location,
    reportedDate,
    status,
    ownerName,
    ownerPhone,
    description,
    image,
    contactEmail,
    reward,
    priority,
    actionLog,
    sightings: []
  });

  try {
    const savedPet = await newPet.save();
    res.status(201).json(savedPet);
  } catch (err) {
    res.status(500).json({ message: "Error adding pet" });
  }
});

// Update pet status
router.patch("/update/:id", auth, async (req, res) => {
  const { status, priority, actionLog } = req.body;
  
  const updateData = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  
  try {
    let updateQuery = { $set: updateData };
    
    // If actionLog is provided, push it to the array
    if (actionLog) {
      updateQuery.$push = { actionLog: actionLog };
    }
    
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );
    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: "Error updating pet status" });
  }
});

// Add a sighting
router.post("/sighting/:id", auth, async (req, res) => {
  try {
    const sighting = req.body;
    
    const actionLogEntry = {
      timestamp: new Date().toISOString(),
      action: "Sighting Reported",
      adminName: "System",
      notes: `Sighting reported by ${sighting.reporterName} at ${sighting.location}`
    };

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          sightings: sighting,
          actionLog: actionLogEntry
        }
      },
      { new: true }
    );
    
    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: "Error adding sighting" });
  }
});

// Delete a pet
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted successfully", deletedPet });
  } catch (err) {
    res.status(500).json({ message: "Error deleting pet" });
  }
});

module.exports = router;
