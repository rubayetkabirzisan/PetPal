// routes/adoptionHistory.js
const express = require("express");
const router = express.Router();
const AdoptionHistory = require("../models/AdoptionHistory");

// GET all adoption history
router.get("/view/:userId", async (req, res) => {
  try {
    const history = await AdoptionHistory.find({ userId: req.params.userId });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new adoption history entry
router.post("/addEntry", async (req, res) => {
  const {
    petId,
    userId,
    petName,
    petBreed,
    petImage,
    applicationId,
    applicationDate,
    adoptionDate,
    status,
    notes,
    shelterName,
    shelterContact,
  } = req.body;

  const newAdoptionHistory = new AdoptionHistory({
    petId,
    userId,
    petName,
    petBreed,
    petImage,
    applicationId,
    applicationDate,
    adoptionDate,
    status,
    notes,
    shelterName,
    shelterContact,
  });

  try {
    const savedAdoptionHistory = await newAdoptionHistory.save();
    res.json(savedAdoptionHistory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
//adoption history screen