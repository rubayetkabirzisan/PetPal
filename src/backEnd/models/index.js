// models/index.js - Central model exports
const mongoose = require('mongoose');

// Import all models
const User = require('./User');
const Pet = require('./Pet');
const Shelter = require('./Shelter');
const Application = require('./Application');
const Message = require('./messageModel');
const Notification = require('./Notification');
const Reminder = require('./Reminder');
const CareEntry = require('./careEntry');
const LostPet = require('./LostPet');
const GPSTracking = require('./GPSTracking');
const Analytics = require('./analytics');
const EmergencyAction = require('./EmergencyAction');
const AdoptionHistory = require('./AdoptionHistory');
const UserProfile = require('./UserProfile');
const VerificationRequest = require('./VerificationRequest');

// Model validation and initialization
const initializeModels = () => {
  console.log('Initializing PetPal database models...');
  
  const models = {
    User,
    Pet,
    Shelter,
    Application,
    Message,
    Notification,
    Reminder,
    CareEntry,
    LostPet,
    GPSTracking,
    Analytics,
    EmergencyAction,
    AdoptionHistory,
    UserProfile,
    VerificationRequest
  };

  // Validate that all models are properly defined
  Object.entries(models).forEach(([name, model]) => {
    if (!model || typeof model.find !== 'function') {
      console.error(`❌ Model ${name} is not properly defined`);
    } else {
      console.log(`✅ Model ${name} initialized successfully`);
    }
  });

  console.log('Model initialization complete!');
  return models;
};

// Export individual models
module.exports = {
  User,
  Pet,
  Shelter,
  Application,
  Message,
  Notification,
  Reminder,
  CareEntry,
  LostPet,
  GPSTracking,
  Analytics,
  EmergencyAction,
  AdoptionHistory,
  UserProfile,
  VerificationRequest,
  initializeModels,
  
  // Utility functions
  async createIndexes() {
    console.log('Creating database indexes...');
    
    try {
      // Ensure indexes are created for all models
      await Promise.all([
        User.createIndexes(),
        Pet.createIndexes(),
        Shelter.createIndexes(),
        Application.createIndexes(),
        Message.createIndexes(),
        Notification.createIndexes(),
        Reminder.createIndexes(),
        CareEntry.createIndexes(),
        LostPet.createIndexes(),
        GPSTracking.createIndexes(),
        Analytics.createIndexes(),
        EmergencyAction.createIndexes()
      ]);
      
      console.log('✅ All database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  },

  async validateModels() {
    console.log('Validating model schemas...');
    
    const validationResults = {};
    const models = { User, Pet, Shelter, Application, Message, Notification, Reminder, CareEntry, LostPet, GPSTracking, Analytics, EmergencyAction };
    
    for (const [name, Model] of Object.entries(models)) {
      try {
        // Test model creation with minimal valid data
        const testDoc = new Model({});
        const validationError = testDoc.validateSync();
        
        if (validationError) {
          validationResults[name] = {
            valid: false,
            errors: validationError.errors
          };
        } else {
          validationResults[name] = { valid: true };
        }
      } catch (error) {
        validationResults[name] = {
          valid: false,
          error: error.message
        };
      }
    }
    
    return validationResults;
  },

  // Database utilities
  async clearAllCollections() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear collections in production environment');
    }
    
    console.log('⚠️ Clearing all collections (development only)...');
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('✅ All collections cleared');
  },

  async seedDatabase() {
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping database seeding in production');
      return;
    }
    
    console.log('🌱 Seeding database with sample data...');
    
    try {
      // Create sample admin user
      const adminExists = await User.findOne({ userType: 'admin' });
      if (!adminExists) {
        await User.create({
          name: { first: 'Admin', last: 'User' },
          email: 'admin@petpal.com',
          password: 'admin123',
          userType: 'admin',
          isVerified: true,
          verification: {
            emailVerified: true,
            phoneVerified: true
          }
        });
        console.log('✅ Admin user created');
      }

      // Create sample shelter
      const shelterExists = await Shelter.findOne({});
      if (!shelterExists) {
        await Shelter.create({
          name: 'Happy Paws Animal Shelter',
          description: 'A loving shelter dedicated to finding homes for all pets',
          type: 'private_nonprofit',
          contactInfo: {
            phone: '+1-555-0123',
            email: 'info@happypaws.com'
          },
          location: {
            address: '123 Pet Street',
            city: 'Pet City',
            state: 'CA',
            zipCode: '90210'
          },
          verificationStatus: 'verified'
        });
        console.log('✅ Sample shelter created');
      }

      console.log('🌱 Database seeding complete');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  },

  // Model relationship helpers
  getModelRelationships() {
    return {
      User: {
        hasMany: ['Pet', 'Application', 'Message', 'Notification', 'Reminder', 'CareEntry'],
        belongsTo: ['Shelter']
      },
      Pet: {
        belongsTo: ['User', 'Shelter'],
        hasMany: ['Application', 'CareEntry', 'Reminder', 'GPSTracking']
      },
      Shelter: {
        hasMany: ['User', 'Pet', 'Application'],
        belongsTo: []
      },
      Application: {
        belongsTo: ['User', 'Pet', 'Shelter'],
        hasMany: ['Message']
      },
      Message: {
        belongsTo: ['User', 'Pet', 'Application'],
        hasMany: []
      },
      CareEntry: {
        belongsTo: ['User', 'Pet'],
        hasMany: []
      },
      GPSTracking: {
        belongsTo: ['Pet', 'User'],
        hasMany: []
      }
    };
  }
};