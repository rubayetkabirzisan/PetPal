require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import and initialize models
const { initializeModels, createIndexes, seedDatabase } = require('./models/index');
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
const emergencyActionsRoutes = require('./routes/EmergencyActions');
// New route imports for missing screens
const adminLostPetsRoutes = require('./routes/AdminLostPetsScreen');
const aiPetRoutes = require('./routes/AiPetScreen');
const applicationDetailsRoutes = require('./routes/ApplicationDetailsScreen');
const applicationListRoutes = require('./routes/ApplicationListScreen');
const applicationTrackerRoutes = require('./routes/ApplicationTrackerScreen');
const authRoutes = require('./routes/AuthScreen');
const backendTestRoutes = require('./routes/BackendTestScreen');
const landingRoutes = require('./routes/LandingScreen');

const app = express();


// Middleware
// Security Dependencies
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
// Note: xss-clean is deprecated, using helmet's XSS protection instead
const hpp = require('hpp');
const compression = require('compression');

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'exp://192.168.*',
      'exp://10.0.*',
      'https://petpal-app.com' // Add your production domain
    ];
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts to 5 per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/api/auth', authLimiter);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Security sanitization
// Note: Temporarily disabled mongo-sanitize due to Express v5 compatibility issues
// TODO: Re-enable when express-mongo-sanitize supports Express v5
// app.use(mongoSanitize()); // Prevent NoSQL injection attacks
// XSS protection is handled by helmet middleware above
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// Request logging and monitoring middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  res.setHeader('X-Request-Id', requestId);
  req.requestId = requestId;
  req.startTime = startTime;
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip} - ID: ${requestId}`);
  
  // Log response details when request completes
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms - ID: ${requestId}`);
    
    return originalSend.call(this, data);
  };
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Input validation and sanitization middleware
app.use('/api', (req, res, next) => {
  // Sanitize query parameters safely
  if (req.query && typeof req.query === 'object') {
    try {
      const sanitizedQuery = {};
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          sanitizedQuery[key] = req.query[key].trim().substring(0, 1000); // Limit length
        } else {
          sanitizedQuery[key] = req.query[key];
        }
      });
      // Replace the query object carefully
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, sanitizedQuery);
    } catch (queryError) {
      console.warn('Query sanitization warning:', queryError.message);
    }
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      try {
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim().substring(0, 10000); // Limit length
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        });
      } catch (sanitizeError) {
        console.warn('Body sanitization warning:', sanitizeError.message);
      }
    };
    sanitizeObject(req.body);
  }
  
  next();
});

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

// Enhanced MongoDB connection with monitoring
mongoose.connect(mongoUrl)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    
    // Initialize models and create indexes
    initializeModels();
    
    // Create indexes with error handling
    try {
      await createIndexes();
      console.log("✅ Database indexes created successfully");
    } catch (indexError) {
      console.warn("⚠️ Index creation warning (non-blocking):", indexError.message);
    }
    
    // Seed database if in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        await seedDatabase();
        console.log("✅ Database seeding complete");
      } catch (seedError) {
        console.warn("⚠️ Database seeding warning:", seedError.message);
      }
    }
    
    console.log("🚀 Database setup complete!");
  })
  .catch((e) => {
    console.error("❌ Error connecting to MongoDB:", e);
    process.exit(1);
  });

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server gracefully...');
  await mongoose.connection.close();
  console.log('📡 MongoDB connection closed');
  process.exit(0);
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
app.use('/api/emergency-actions', emergencyActionsRoutes);
// New route registrations
app.use('/api/admin-lost-pets', adminLostPetsRoutes);
app.use('/api/ai-pet', aiPetRoutes);
app.use('/api/application-details', applicationDetailsRoutes);
app.use('/api/application-list', applicationListRoutes);
app.use('/api/application-tracker', applicationTrackerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/backend-test', backendTestRoutes);
app.use('/api/landing', landingRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'PetPal API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - Must be before error handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// Global Error Handler - Must be last middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  
  // Handle specific error types
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.message && err.message !== 'Internal server error') {
    message = err.message;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`📊 Rate limiting active`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
