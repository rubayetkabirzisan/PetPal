const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/petpal";

async function run() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    const result = await db.collection('applications').dropIndex('applicationId_1');
    console.log("Dropped index:", result);
  } catch (err) {
    if (err.code === 27) {
      console.log("Index already dropped or not found.");
    } else {
      console.error("Error:", err);
    }
  } finally {
    mongoose.disconnect();
  }
}

run();
