const express = require('express');
const User = require('../models/User');
const router = express.Router();
const auth = require("../middleware/auth");

// View profile
router.get("/view/:uid", auth, async (req, res) => {
  try {
    // Both _id and uid can be used depending on what frontend sends
    const user = await User.findOne({ 
      $or: [{ uid: req.params.uid }, { _id: req.params.uid.match(/^[0-9a-fA-F]{24}$/) ? req.params.uid : null }] 
    });
    
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Don't send password hash back
    const profile = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      userType: user.userType,
      createdAt: user.createdAt
    };
    
    res.json(profile);
  } catch (err) {
    console.error("Profile view error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile
router.put("/update/:uid", auth, async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    
    const user = await User.findOneAndUpdate(
      { $or: [{ uid: req.params.uid }, { _id: req.params.uid.match(/^[0-9a-fA-F]{24}$/) ? req.params.uid : null }] },
      { name, phone, location, bio },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
