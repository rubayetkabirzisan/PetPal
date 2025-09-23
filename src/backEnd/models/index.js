// Central export file for all MongoDB models
// This allows easy importing of models throughout the application

const User = require('./User');
const Pet = require('./Pet');
const Shelter = require('./Shelter');
const Application = require('./Application');
const LostPet = require('./LostPet');
const Notification = require('./Notification');
const Message = require('./Message');
const GPSTracking = require('./GPSTracking');
const CareEntry = require('./CareEntry');
const Reminder = require('./Reminder');
const Analytics = require('./Analytics');
const EmergencyAction = require('./EmergencyAction');
const Session = require('./Session');
const UserVerification = require('./UserVerification');

module.exports = {
  // Core models
  User,
  Pet,
  Shelter,
  Application,
  
  // Specialized models
  LostPet,
  Notification,
  Message,
  GPSTracking,
  
  // Utility models
  CareEntry,
  Reminder,
  Analytics,
  EmergencyAction,
  
  // Authentication models
  Session,
  UserVerification
};

// Alternative individual exports for backward compatibility
module.exports.User = User;
module.exports.Pet = Pet;
module.exports.Shelter = Shelter;
module.exports.Application = Application;
module.exports.LostPet = LostPet;
module.exports.Notification = Notification;
module.exports.Message = Message;
module.exports.GPSTracking = GPSTracking;
module.exports.CareEntry = CareEntry;
module.exports.Reminder = Reminder;
module.exports.Analytics = Analytics;
module.exports.EmergencyAction = EmergencyAction;
module.exports.Session = Session;
module.exports.UserVerification = UserVerification;
