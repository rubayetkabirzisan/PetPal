require("dotenv").config({ path: "../.env" });
const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/petpal";

async function run() {
  try {
    await mongoose.connect(mongoUrl);
    const db = mongoose.connection.db;
    
    // ModernApplicationListScreen maps:
    // title: event.status
    // status: event.completed ? 'completed' : ...
    // SO: we must put the TITLE inside 'status', and set 'completed: true'

    const timeline = [
      {
        id: "step1",
        status: "Application Submitted",
        description: "Your application has been received.",
        completed: true,
        date: new Date().toISOString()
      },
      {
        id: "step2",
        status: "Initial Review",
        description: "Our team is reviewing your application.",
        completed: false,
        date: null
      },
      {
        id: "step3",
        status: "Interview & Home Check",
        description: "We will contact you to schedule a brief interview.",
        completed: false,
        date: null
      },
      {
        id: "step4",
        status: "Final Decision",
        description: "Your application is approved or denied.",
        completed: false,
        date: null
      }
    ];

    const result = await db.collection('applications').updateOne(
      { _id: new mongoose.Types.ObjectId('6a4bdd817488b137e20da7dd') },
      { 
        $set: { 
          timeline: timeline,
          completionPercentage: 25,
          currentStep: "Initial Review"
        } 
      }
    );
    console.log("Timeline Updated:", result);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

run();
