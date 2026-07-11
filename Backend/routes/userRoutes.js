const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const AdoptionHistory = require('../models/AdoptionHistory');
const VerificationRequest = require('../models/VerificationRequest');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Reminder = require('../models/Reminder');
const CareEntry = require('../models/careEntry');
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// S1 FIX: Validate JWT_SECRET at startup — fail fast rather than falling back to a public string
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "Set it in your .env file before starting the server. " +
    "Using a hardcoded secret in production is a critical security vulnerability."
  );
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Hard stop in production
  }
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || "dev_only_secret_replace_before_deploy";

// S9 FIX: Rate limit login attempts (10 per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// S11 FIX: Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, location, bio, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
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

// Login route — protected by rate limiter
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // optional: check userType
    if (userType && user.userType !== userType) {
      return res.status(400).json({ message: "Wrong user type" });
    }

    // S1 FIX & S13 FIX: 1 day expiration instead of 7 days
    const token = jwt.sign(
      { id: user._id, uid: user.uid, type: user.userType },
      EFFECTIVE_JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token, user: { uid: user.uid, name: user.name, email: user.email, userType: user.userType } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// Change password route
router.post("/change-password", auth, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// S13 FIX: Refresh token route
router.post("/refresh", auth, async (req, res) => {
  try {
    // If the token is valid (auth middleware passes), issue a fresh 1-day token
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const newToken = jwt.sign(
      { id: user._id, uid: user.uid, type: user.userType },
      EFFECTIVE_JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token: newToken });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete account route
router.delete("/delete/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // S8 FIX: Cascade delete associated user records
    await Application.deleteMany({ userId });
    await AdoptionHistory.deleteMany({ userId });
    await VerificationRequest.deleteMany({ adopterId: userId });
    await Notification.deleteMany({ userId });
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
    await Reminder.deleteMany({ userId });
    await CareEntry.deleteMany({ userId });

    const user = await User.findOneAndDelete({ uid: userId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "Account and associated data deleted successfully" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 password reset requests per windowMs
  message: "Too many password reset requests from this IP, please try again after 15 minutes"
});

// Forgot Password Route
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 64-char hex cryptographically secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 15); // 15 mins expiry

    user.resetToken = hashedToken;
    user.resetTokenExpire = expireDate;
    await user.save();

    // Create Ethereal Test Account and Transporter
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: '"PetPal Support" <support@petpal.com>',
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetToken}\nThis code will expire in 15 minutes.`,
      html: `<b>Your password reset code is: ${resetToken}</b><br>This code will expire in 15 minutes.`,
    });

    console.log("====================================");
    console.log("PASSWORD RESET EMAIL SENT!");
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // S5 FIX: Do not log reset tokens to the server console
    // console.log("Code: ", resetToken);
    console.log("====================================");

    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (user.resetToken !== hashedToken) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (new Date() > user.resetTokenExpire) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;