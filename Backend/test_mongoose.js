const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/petpal');
  const CareEntry = require('./Backend/models/careEntry');
  const entries = await CareEntry.find().lean();
  console.log(entries);
  process.exit(0);
}
test();
