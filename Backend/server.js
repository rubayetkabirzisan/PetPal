require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Importing cors
const bodyParser = require("body-parser"); // Importing bodyParser (if using it)
const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());
 // Using CORS middleware
app.use(express.json()); // Express built-in JSON parser

// Use the PORT from environment variables or fallback to 5000
const PORT = process.env.PORT || 5000;

// MongoDB connection URL from environment variable (use .env file for security)
const mongoUrl = process.env.MONGO_URI || "mongodb+srv://rubayetkabirz:admin@cluster0.xqq91hf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB:", e);
  });

// Routes
app.use("/api/users", require("./routes/userRoutes"));//
app.use("/api/pets", require("./routes/petRoutes"));
app.use("/api/verification_requests", require("./routes/verificationRoutes")); 
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use('/api/profile', require('./routes/profileRoutes'));//
app.use("/api/adoption-history", require("./routes/adoptionHistory"));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/careEntries', require('./routes/careEntryRoutes'));//
app.use("/api/messages", require("./routes/messageRoutes"));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));//
app.use("/api/reminders", require("./routes/reminders"));//
app.use("/api/lostpets", require("./routes/LostpetRoutes"));


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
