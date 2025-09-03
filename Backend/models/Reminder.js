const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: String,
  completed: Boolean,
  petId: String,
  userId: String,
  type: {
    type: String,
    enum: ['vaccine', 'grooming', 'checkup', 'medication']
  },
  recurring: Boolean,
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'weekly'
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
});

module.exports = mongoose.model("Reminder", reminderSchema);
