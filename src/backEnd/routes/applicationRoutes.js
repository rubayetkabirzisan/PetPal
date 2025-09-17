// routes/applicationRoutes.js
const express = require("express");
const Application = require("../models/Application");

const router = express.Router();

// GET all applications
router.get("/viewAll", async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching applications" });
  }
});

// POST a new application
router.post("/newApp", async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (err) {
    res.status(500).json({ error: "Error adding application" });
  }
});

// PUT to update an application status
router.put("/:id", async (req, res) => {
  try {
    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedApplication);
  } catch (err) {
    res.status(500).json({ error: "Error updating application" });
  }
});

// DELETE an application
router.delete("/:id", async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting application" });
  }
});

module.exports = router;
//admin application screen