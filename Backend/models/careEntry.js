const mongoose = require('mongoose');

const careEntrySchema = new mongoose.Schema({
  petName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['medical', 'feeding', 'grooming', 'exercise', 'training', 'vet_visit', 'general', 'other'], 
    default: 'general'
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }
});

const CareEntry = mongoose.model('CareEntry', careEntrySchema);

module.exports = CareEntry;
