const mongoose = require('mongoose');

const AppInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String },
  author: { type: String }
});

module.exports = mongoose.model('AppInfo', AppInfoSchema);
