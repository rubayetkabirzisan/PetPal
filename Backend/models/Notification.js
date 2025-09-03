const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['application', 'message', 'reminder', 'update'], required: true },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
