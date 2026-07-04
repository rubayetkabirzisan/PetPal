require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/petpal";

mongoose.connect(mongoUrl)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((e) => console.error("Error connecting to MongoDB:", e));

// Routes
app.use("/api/users",                 require("./routes/userRoutes"));
app.use("/api/profile",               require("./routes/profileRoutes"));
app.use("/api/messages",              require("./routes/messageRoutes"));
app.use("/api/pets",                  require("./routes/petRoutes"));
app.use("/api/verification_requests", require("./routes/verificationRoutes"));
// app.use("/api/applications",          require("./routes/applicationRoutes")); // Removed stub
// app.use("/api/profile",               require("./routes/profileRoutes")); // Removed stub
// app.use("/api/adoption-history",      require("./routes/adoptionHistory")); // Removed stub
app.use("/api/analytics",             require("./routes/analytics"));
app.use("/api/careEntries",           require("./routes/careEntryRoutes"));
// app.use("/api/messages",              require("./routes/messageRoutes")); // Removed stub
// app.use("/api/emergency",             require("./routes/emergencyRoutes")); // Removed stub
app.use("/api/notifications",         require("./routes/notificationRoutes"));
app.use("/api/reminders",             require("./routes/reminders"));
app.use("/api/lostpets",              require("./routes/LostpetRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});