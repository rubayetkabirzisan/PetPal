// routes/verificationRoutes.js
const express = require("express");
const VerificationRequest = require("../models/VerificationRequest");

const router = express.Router();

// GET all verification requests
router.get("/viewAll", async (req, res) => {
  try {
    const requests = await VerificationRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Error fetching verification requests" });
  }
});

// POST a new verification request
router.post("/newReq", async (req, res) => {
  try {
    const newRequest = new VerificationRequest(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: "Error adding verification request" });
  }
});

// PUT to update verification request status
router.put("/:id", async (req, res) => {
  try {
    const updatedRequest = await VerificationRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: "Error updating verification request" });
  }
});

// DELETE a verification request
router.delete("/:id", async (req, res) => {
  try {
    await VerificationRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Verification request deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting verification request" });
  }
});

module.exports = router;
//adopter verification