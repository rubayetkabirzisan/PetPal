const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require("bcryptjs");  // <-- add this
// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, location, bio, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      uid: `user_${Date.now()}`,
      name,
      email,
      password: hashed,
      phone,
      location,
      bio,
      userType
    });

    await user.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // optional: check userType
    if (userType && user.userType !== userType) {
      return res.status(400).json({ message: "Wrong user type" });
    }

    res.json({ message: "Login successful", user: { uid: user.uid, name: user.name, email: user.email, userType: user.userType } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
//auth screen