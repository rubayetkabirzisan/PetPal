// routes/petRoutes.js
const express = require("express");
const Pet = require("../models/Pet");
const router = express.Router();

// Get all pets
router.get("/view", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: "Error fetching pets" });
  }
});

// Add a new pet
router.post("/addpet", async (req, res) => {
  try {
    const newPet = new Pet(req.body);
    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(500).json({ error: "Error adding pet" });
  }
});

// Update a pet's status or other fields
router.put("/:id", async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ error: "Error updating pet" });
  }
});

// Delete a pet
router.delete("/:id", async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pet deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting pet" });
  }
});

module.exports = router;
//admin lost pet screen