const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import all models for testing
const User = require('../models/User');
const Pet = require('../models/Pet');
const Shelter = require('../models/Shelter');
const Application = require('../models/Application');
const LostPet = require('../models/LostPet');
const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');
const CareEntry = require('../models/careEntry');
// const Analytics = require('../models/Analytics');
const EmergencyAction = require('../models/EmergencyAction');
const GPSTracking = require('../models/GPSTracking');

// GET /api/backend-test/health - Overall system health check
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      database: 'disconnected',
      models: {},
      collections: {},
      environment: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };

    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    healthStatus.database = dbStates[dbState] || 'unknown';
    
    if (dbState === 1) {
      // Test each model
      const models = [
        { name: 'User', model: User },
        { name: 'Pet', model: Pet },
        { name: 'Shelter', model: Shelter },
        { name: 'Application', model: Application },
        { name: 'LostPet', model: LostPet },
        { name: 'Notification', model: Notification },
        { name: 'Reminder', model: Reminder },
        { name: 'CareEntry', model: CareEntry },
        { name: 'Analytics', model: Analytics },
        { name: 'EmergencyAction', model: EmergencyAction },
        { name: 'GPSTracking', model: GPSTracking }
      ];

      for (const { name, model } of models) {
        try {
          const count = await model.countDocuments();
          healthStatus.models[name] = {
            status: 'working',
            documentCount: count,
            collectionName: model.collection.name
          };
          healthStatus.collections[model.collection.name] = count;
        } catch (error) {
          healthStatus.models[name] = {
            status: 'error',
            error: error.message
          };
        }
      }
    }

    // Determine overall status
    const hasErrors = Object.values(healthStatus.models).some(model => model.status === 'error');
    if (dbState !== 1 || hasErrors) {
      healthStatus.status = 'unhealthy';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/backend-test/database - Database connection and stats
router.get('/database', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbInfo = {
      connectionState: dbState,
      connectionStateText: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }[dbState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      collections: []
    };

    if (dbState === 1) {
      // Get database statistics
      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      dbInfo.serverStats = {
        version: stats.version,
        uptime: stats.uptime,
        connections: stats.connections,
        memory: stats.mem,
        network: stats.network
      };

      // Get collection information
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const collection of collections) {
        try {
          const collStats = await mongoose.connection.db.collection(collection.name).stats();
          dbInfo.collections.push({
            name: collection.name,
            documentCount: collStats.count,
            size: collStats.size,
            avgObjSize: collStats.avgObjSize,
            indexes: collStats.nindexes
          });
        } catch (error) {
          dbInfo.collections.push({
            name: collection.name,
            error: error.message
          });
        }
      }
    }

    res.json({
      success: dbState === 1,
      data: dbInfo
    });

  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
});

// GET /api/backend-test/models/:modelName - Test specific model operations
router.get('/models/:modelName', async (req, res) => {
  try {
    const modelName = req.params.modelName;
    const models = {
      User,
      Pet,
      Shelter,
      Application,
      LostPet,
      Notification,
      Reminder,
      CareEntry,
      Analytics,
      EmergencyAction,
      GPSTracking
    };

    const Model = models[modelName];
    if (!Model) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found`,
        availableModels: Object.keys(models)
      });
    }

    const modelInfo = {
      modelName,
      collectionName: Model.collection.name,
      schema: {},
      operations: {}
    };

    // Get schema information
    const schema = Model.schema;
    modelInfo.schema = {
      paths: Object.keys(schema.paths),
      indexes: schema.indexes(),
      methods: Object.keys(schema.methods || {}),
      statics: Object.keys(schema.statics || {}),
      virtuals: Object.keys(schema.virtuals || {})
    };

    // Test basic operations
    try {
      modelInfo.operations.count = await Model.countDocuments();
      modelInfo.operations.countStatus = 'success';
    } catch (error) {
      modelInfo.operations.countStatus = 'error';
      modelInfo.operations.countError = error.message;
    }

    try {
      const sample = await Model.findOne().lean();
      modelInfo.operations.findOneStatus = 'success';
      modelInfo.operations.sampleDocument = sample ? {
        hasDocument: true,
        documentKeys: Object.keys(sample),
        documentId: sample._id
      } : { hasDocument: false };
    } catch (error) {
      modelInfo.operations.findOneStatus = 'error';
      modelInfo.operations.findOneError = error.message;
    }

    // Test validation
    try {
      const testDoc = new Model({});
      const validationResult = testDoc.validateSync();
      modelInfo.operations.validation = {
        status: validationResult ? 'has_requirements' : 'no_requirements',
        errors: validationResult ? validationResult.errors : null
      };
    } catch (error) {
      modelInfo.operations.validation = {
        status: 'error',
        error: error.message
      };
    }

    res.json({
      success: true,
      data: modelInfo
    });

  } catch (error) {
    console.error(`Model test error for ${req.params.modelName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Model test failed',
      error: error.message
    });
  }
});

// POST /api/backend-test/seed - Seed database with test data
router.post('/seed', async (req, res) => {
  try {
    const { confirm = false, models = [] } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Seeding requires confirmation. Set confirm: true in request body.',
        warning: 'This will create test data in your database'
      });
    }

    const seedResults = {
      timestamp: new Date().toISOString(),
      seeded: [],
      errors: []
    };

    // Seed Users
    if (models.length === 0 || models.includes('User')) {
      try {
        const existingUsers = await User.countDocuments();
        if (existingUsers === 0) {
          const testUsers = [
            {
              name: 'Test Adopter',
              email: 'adopter@petpal.test',
              password: '$2a$12$LQv3c1yqBwEHxE.dV/YMOuHxYG9A3k9C7X8J9J0E6M6I8k0K2L4M6', // password: "password"
              role: 'adopter',
              phone: '555-0101',
              status: 'active'
            },
            {
              name: 'Test Shelter Staff',
              email: 'shelter@petpal.test',
              password: '$2a$12$LQv3c1yqBwEHxE.dV/YMOuHxYG9A3k9C7X8J9J0E6M6I8k0K2L4M6',
              role: 'shelter_staff',
              phone: '555-0102',
              status: 'active'
            },
            {
              name: 'Test Admin',
              email: 'admin@petpal.test',
              password: '$2a$12$LQv3c1yqBwEHxE.dV/YMOuHxYG9A3k9C7X8J9J0E6M6I8k0K2L4M6',
              role: 'admin',
              phone: '555-0103',
              status: 'active'
            }
          ];
          
          await User.insertMany(testUsers);
          seedResults.seeded.push({ model: 'User', count: testUsers.length });
        } else {
          seedResults.seeded.push({ model: 'User', count: 0, message: 'Users already exist' });
        }
      } catch (error) {
        seedResults.errors.push({ model: 'User', error: error.message });
      }
    }

    // Seed Shelters
    if (models.length === 0 || models.includes('Shelter')) {
      try {
        const existingShelters = await Shelter.countDocuments();
        if (existingShelters === 0) {
          const testShelters = [
            {
              name: 'Happy Paws Shelter',
              email: 'contact@happypaws.test',
              phone: '555-0201',
              address: {
                street: '123 Pet Street',
                city: 'Pet City',
                state: 'PC',
                zipCode: '12345',
                country: 'Test Country'
              },
              license: 'TEST-001',
              status: 'active',
              capacity: {
                dogs: 50,
                cats: 30,
                others: 20
              }
            }
          ];
          
          await Shelter.insertMany(testShelters);
          seedResults.seeded.push({ model: 'Shelter', count: testShelters.length });
        } else {
          seedResults.seeded.push({ model: 'Shelter', count: 0, message: 'Shelters already exist' });
        }
      } catch (error) {
        seedResults.errors.push({ model: 'Shelter', error: error.message });
      }
    }

    // Add more seeding logic for other models as needed...

    const hasErrors = seedResults.errors.length > 0;
    res.status(hasErrors ? 207 : 200).json({
      success: !hasErrors,
      message: hasErrors ? 'Seeding completed with some errors' : 'Seeding completed successfully',
      data: seedResults
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  }
});

// DELETE /api/backend-test/cleanup - Clean up test data
router.delete('/cleanup', async (req, res) => {
  try {
    const { confirm = false, collections = [] } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Cleanup requires confirmation. Set confirm: true in request body.',
        warning: 'This will delete data from your database'
      });
    }

    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Cleanup is not allowed in production environment'
      });
    }

    const cleanupResults = {
      timestamp: new Date().toISOString(),
      cleaned: [],
      errors: []
    };

    const modelsToClean = collections.length > 0 ? collections : [
      'User', 'Pet', 'Shelter', 'Application', 'LostPet', 
      'Notification', 'Reminder', 'CareEntry', 'Analytics', 
      'EmergencyAction', 'GPSTracking'
    ];

    const models = {
      User, Pet, Shelter, Application, LostPet,
      Notification, Reminder, CareEntry, Analytics,
      EmergencyAction, GPSTracking
    };

    for (const modelName of modelsToClean) {
      if (models[modelName]) {
        try {
          const result = await models[modelName].deleteMany({});
          cleanupResults.cleaned.push({ 
            model: modelName, 
            deletedCount: result.deletedCount 
          });
        } catch (error) {
          cleanupResults.errors.push({ 
            model: modelName, 
            error: error.message 
          });
        }
      }
    }

    const hasErrors = cleanupResults.errors.length > 0;
    res.status(hasErrors ? 207 : 200).json({
      success: !hasErrors,
      message: hasErrors ? 'Cleanup completed with some errors' : 'Cleanup completed successfully',
      data: cleanupResults
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

// GET /api/backend-test/routes - List all available routes and endpoints
router.get('/routes', (req, res) => {
  try {
    const routes = {
      backendTest: {
        'GET /api/backend-test/health': 'Overall system health check',
        'GET /api/backend-test/database': 'Database connection and statistics',
        'GET /api/backend-test/models/:modelName': 'Test specific model operations',
        'POST /api/backend-test/seed': 'Seed database with test data',
        'DELETE /api/backend-test/cleanup': 'Clean up test data',
        'GET /api/backend-test/routes': 'List all available routes'
      },
      availableModels: [
        'User', 'Pet', 'Shelter', 'Application', 'LostPet',
        'Notification', 'Reminder', 'CareEntry', 'Analytics',
        'EmergencyAction', 'GPSTracking'
      ],
      examples: {
        healthCheck: 'GET /api/backend-test/health',
        testUserModel: 'GET /api/backend-test/models/User',
        seedDatabase: 'POST /api/backend-test/seed (with confirm: true)',
        cleanup: 'DELETE /api/backend-test/cleanup (with confirm: true)'
      }
    };

    res.json({
      success: true,
      data: routes
    });

  } catch (error) {
    console.error('Routes listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list routes',
      error: error.message
    });
  }
});

module.exports = router;