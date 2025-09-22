require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Importing cors
const bodyParser = require("body-parser"); // Importing bodyParser (if using it)
const adopterRoutes = require('./routes/AdopterDashboardScreen');
const browseRoutes = require('./routes/BrowsePetsScreen');
const lostPetsRoutes = require('./routes/LostPetsScreen');
const gpsTrackingRoutes = require('./routes/GPSTrackingScreen');
const adopterProfileRoutes = require('./routes/AdopterProfileScreen');
const adminDashboardRoutes = require('./routes/AdminDashboardScreen');
const managePetsRoutes = require('./routes/ManagePetsScreen');
const adminGPSTrackingRoutes = require('./routes/AdminGPSTrackingScreen');
const adminApplicationsRoutes = require('./routes/AdminApplicationsScreen');
const modernApplicationListRoutes = require('./routes/ModernApplicationListScreen');
const messagesRoutes = require('./routes/MessagesScreen');
const chatRoutes = require('./routes/ChatScreen');
const notificationsRoutes = require('./routes/NotificationsScreen');
const adoptionHistoryRoutes = require('./routes/AdoptionHistoryScreen');
const careJournalRoutes = require('./routes/CareJournalScreen');
const remindersRoutes = require('./routes/RemindersScreen');
const petProfileRoutes = require('./routes/PetProfileScreen');
const applicationFormRoutes = require('./routes/ApplicationFormScreen');
const safeZoneRoutes = require('./routes/SafeZoneScreen');
const petLocationRoutes = require('./routes/PetLocationScreen');
const settingsRoutes = require('./routes/SettingsScreen');
const addPetRoutes = require('./routes/AddPetScreen');
const editPetRoutes = require('./routes/EditPetScreen');
const reportLostPetRoutes = require('./routes/ReportLostPetScreen');
const analyticsRoutes = require('./routes/AnalyticsScreen');
const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());
 // Using CORS middleware
app.use(express.json()); // Express built-in JSON parser

// Mock authentication middleware for testing (add this for adopter routes)
app.use('/api/adopter', (req, res, next) => {
  req.user = {
    id: 'adopter-001',
    name: 'Test User',
    email: 'testuser@petpal.com',
    role: 'adopter'
  };
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Use the PORT from environment variables or fallback to 3000
const PORT = process.env.PORT || 3000;

// MongoDB connection URL from environment variable
const mongoUrl = process.env.MONGO_URI || "mongodb+srv://rubayetkabirz:admin@cluster0.xqq91hf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB:", e);
  });

// Routes - only the ones that exist and we want to test
app.use('/api/adopter', adopterRoutes);
app.use('/api/browse', browseRoutes);
app.use('/api/lost-pets-screen', lostPetsRoutes);
app.use('/api/gps-tracking', gpsTrackingRoutes);
app.use('/api/adopter-profile', adopterProfileRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/manage-pets', managePetsRoutes);
app.use('/api/admin-gps-tracking', adminGPSTrackingRoutes);
app.use('/api/admin-applications', adminApplicationsRoutes);
app.use('/api/modern-application-list', modernApplicationListRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/adoption-history', adoptionHistoryRoutes);
app.use('/api/care-journal', careJournalRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/pet-profile', petProfileRoutes);
app.use('/api/application-form', applicationFormRoutes);
app.use('/api/safe-zone', safeZoneRoutes);
app.use('/api/pet-location', petLocationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/add-pet', addPetRoutes);
app.use('/api/edit-pet', editPetRoutes);
app.use('/api/report-lost-pet', reportLostPetRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PetPal API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
