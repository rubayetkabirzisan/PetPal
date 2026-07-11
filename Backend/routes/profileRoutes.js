const express = require('express');
const User = require('../models/User');
const router = express.Router();
const auth = require("../middleware/auth");

// Helper: check if the requesting user owns this profile, or is admin
const ownsProfile = (req, uid) => {
  if (req.user.type === 'admin') return true;
  // uid can be the MongoDB _id OR the custom uid string
  return req.user.id === uid || req.user.uid === uid;
};


// View profile
router.get("/view/:uid", auth, async (req, res) => {
  try {
    // S3 FIX: Users can only view their own profile (admins can view any)
    if (!ownsProfile(req, req.params.uid)) {
      return res.status(403).json({ message: "Access denied" });
    }

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
    // S3 FIX: Users can only update their own profile
    if (!ownsProfile(req, req.params.uid)) {
      return res.status(403).json({ message: "Access denied" });
    }

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


// Get saved pets
router.get("/saved-pets/:uid", auth, async (req, res) => {
  try {
    // S3 FIX: Users can only view their own saved pets
    if (!ownsProfile(req, req.params.uid)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findOne({ 
      $or: [{ uid: req.params.uid }, { _id: req.params.uid.match(/^[0-9a-fA-F]{24}$/) ? req.params.uid : null }] 
    }).populate('savedPets');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user.savedPets || []);
  } catch (err) {
    console.error("Fetch saved pets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save a pet
router.post("/save-pet", auth, async (req, res) => {
  try {
    const { petId } = req.body;
    // S3 FIX: Always use req.user.id — never trust uid from the body
    const uid = req.user.id;
    const user = await User.findOneAndUpdate(
      { $or: [{ uid }, { _id: uid.match(/^[0-9a-fA-F]{24}$/) ? uid : null }] },
      { $addToSet: { savedPets: petId } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Pet saved successfully", savedPets: user.savedPets });
  } catch (err) {
    console.error("Save pet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsave a pet
router.post("/unsave-pet", auth, async (req, res) => {
  try {
    const { petId } = req.body;
    // S3 FIX: Always use req.user.id — never trust uid from the body
    const uid = req.user.id;
    const user = await User.findOneAndUpdate(
      { $or: [{ uid }, { _id: uid.match(/^[0-9a-fA-F]{24}$/) ? uid : null }] },
      { $pull: { savedPets: petId } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Pet unsaved successfully", savedPets: user.savedPets });
  } catch (err) {
    console.error("Unsave pet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
