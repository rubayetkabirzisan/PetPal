// routes/petRoutes.js
const express = require("express");
const Pet = require("../models/Pet");
const router = express.Router();

// Get all lost pets
router.get("/viewAll", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pets" });
  }
});

// Add a new lost pet
router.post("/addpet", async (req, res) => {
  const { name, type, breed, color, lastSeen, location, reportedDate, status, ownerName, ownerPhone, description, image } = req.body;

  const newPet = new Pet({
    name,
    type,
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
  });

  try {
    const savedPet = await newPet.save();
    res.status(201).json(savedPet);
  } catch (err) {
    res.status(500).json({ message: "Error adding pet" });
  }
});

// Update pet status
router.patch("/update/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: "Error updating pet status" });
  }
});

// Delete a pet
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted successfully", deletedPet });
  } catch (err) {
    res.status(500).json({ message: "Error deleting pet" });
  }
});

module.exports = router;
