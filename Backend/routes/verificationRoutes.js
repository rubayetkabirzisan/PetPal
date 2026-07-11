const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const VerificationRequest = require("../models/VerificationRequest");

// --- ADOPTER ROUTES ---

// Submit a new verification request
router.post("/submit", auth, async (req, res) => {
  try {
    const { adopterName, email, phone, address, documents } = req.body;
    const adopterId = req.user.id; // Always use JWT, never trust body

    // Prevent duplicate pending submissions
    const existing = await VerificationRequest.findOne({ adopterId, status: "Pending" });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending verification request." });
    }

    const newRequest = new VerificationRequest({
      adopterId,
      adopterName,
      email,
      phone,
      address,
      documents: documents || [
        { type: "ID Verification", status: "Pending" },
        { type: "Address Proof", status: "Pending" },
        { type: "Income Verification", status: "Pending" },
      ],
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Verification submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get own verification status (adopter views their own)
router.get("/my-status", auth, async (req, res) => {
  try {
    const adopterId = req.user.id;
    const request = await VerificationRequest.findOne({ adopterId }).sort({ submittedDate: -1 });
    if (!request) {
      return res.status(404).json({ message: "No verification request found" });
    }
    res.json(request);
  } catch (err) {
    console.error("Verification status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- ADMIN ROUTES ---

// Get all verification requests (admin only)
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const requests = await VerificationRequest.find().sort({ submittedDate: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Verification list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a verification request (admin only)
router.patch("/approve/:id", auth, async (req, res) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { notes } = req.body;
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        notes: notes || "All documents verified.",
        "documents.$[].status": "Approved",
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("Verification approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a verification request (admin only)
router.patch("/reject/:id", auth, async (req, res) => {
  try {
    if (req.user.type !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { notes } = req.body;
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", notes: notes || "" },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("Verification reject error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;