const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");

// Get all reminders for a user
router.get("/viewById/:userId", async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a new reminder
router.post("/addNew", async (req, res) => {
  const {
    title,
    description,
    dueDate,
    petId,
    userId,
    type,
    recurring,
    recurringInterval,
  } = req.body;

  const newReminder = new Reminder({
    title,
    description,
    dueDate,
    petId,
    userId,
    type,
    recurring,
    recurringInterval,
    completed: false,
  });

  try {
    const savedReminder = await newReminder.save();
    res.json(savedReminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a reminder (e.g., mark as completed)
router.put("/markCompleted/:id", async (req, res) => {
  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedReminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a reminder
router.delete("/delete/:id", async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
