# PetPal Backend Models Documentation

## Overview

This document provides comprehensive information about the PetPal backend data models, their relationships, and how to use them in a professional environment.

## Models Architecture

### Core Models

1. **User** - User accounts (adopters, shelter staff, admins)
2. **Pet** - Animals available for adoption
3. **Shelter** - Organizations housing pets
4. **Application** - Adoption applications
5. **Message** - Communication between users
6. **Notification** - System notifications
7. **Reminder** - Care and appointment reminders
8. **CareEntry** - Pet care records
9. **GPSTracking** - Pet location tracking
10. **Analytics** - System analytics and metrics
11. **EmergencyAction** - Emergency situations and responses
12. **LostPet** - Lost pet reports (legacy/specialized)
13. **AdoptionHistory** - Adoption records
14. **UserProfile** - Extended user profiles
15. **VerificationRequest** - Identity verification requests

## Model Relationships

```
User (1:N) → Pet (adopted pets)
User (1:N) → Application (submitted applications)
User (1:N) → Message (sent messages)
User (1:N) → CareEntry (care records)
User (N:1) → Shelter (staff/volunteer association)

Pet (1:N) → Application (applications for pet)
Pet (1:N) → CareEntry (care records)
Pet (1:1) → GPSTracking (location tracking)
Pet (N:1) → Shelter (housing shelter)

Shelter (1:N) → Pet (housed pets)
Shelter (1:N) → User (staff/volunteers)
```

## Getting Started

### 1. Initialize Models

```javascript
const { initializeModels, createIndexes } = require('./models/index');

// Initialize all models
initializeModels();

// Create database indexes
await createIndexes();
```

### 2. Using Models in Routes

```javascript
const { Pet, User, Shelter, Application } = require('../models/index');

// Example: Get available pets
router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'Available' })
      .populate('shelter', 'name contactInfo')
      .limit(20)
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Model Detailed Documentation

### User Model

**Purpose**: Manages all user accounts in the system

**Key Features**:
- Multi-role support (adopter, shelter_staff, admin, etc.)
- Comprehensive verification system
- Address and preference management
- Security features (2FA, session management)
- Adoption history tracking

**Example Usage**:
```javascript
// Create new adopter
const user = new User({
  name: { first: 'John', last: 'Doe' },
  email: 'john@example.com',
  password: 'securepassword',
  userType: 'adopter',
  address: {
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  }
});
await user.save();

// Verify email
await user.verifyEmail();

// Add to favorites
await user.addFavorite(petId);
```

### Pet Model

**Purpose**: Manages pet information and adoption status

**Key Features**:
- Comprehensive pet information (health, behavior, media)
- GPS tracking integration
- Safe zone management
- Health records tracking
- Adoption workflow support

**Example Usage**:
```javascript
// Create new pet
const pet = new Pet({
  name: 'Buddy',
  type: 'dog',
  breed: 'Golden Retriever',
  age: '2 years',
  size: 'Large',
  vaccinated: true,
  neutered: true,
  description: 'Friendly and energetic dog...',
  adoptionFee: 150,
  shelter: {
    id: shelterId,
    name: 'Happy Paws Shelter'
  }
});
await pet.save();

// Update status when adopted
pet.status = 'Adopted';
pet.adoptedBy = userId;
pet.adoptionDate = new Date();
await pet.save();
```

### Application Model

**Purpose**: Handles adoption application workflow

**Key Features**:
- Multi-step application process
- Document management
- Status tracking and notifications
- Reference checking
- Interview scheduling

**Example Usage**:
```javascript
// Create application
const application = new Application({
  petId: petId,
  petName: 'Buddy',
  adopterId: userId,
  adopterName: 'John Doe',
  formData: {
    firstName: 'John',
    lastName: 'Doe',
    // ... other form fields
  },
  status: 'Pending'
});
await application.save();

// Process application
await application.updateStatus('Under Review', reviewerId, 'Initial review completed');
```

### Message Model

**Purpose**: Facilitates communication between users

**Key Features**:
- Threaded conversations
- File attachments
- Read receipts
- Context linking (pet, application)
- Moderation capabilities

**Example Usage**:
```javascript
// Send message
const message = new Message({
  conversationId: 'conv_123',
  senderId: userId,
  senderName: 'John Doe',
  recipientId: shelterId,
  recipientName: 'Happy Paws Shelter',
  content: 'I would like to know more about Buddy',
  petContext: {
    petId: petId,
    petName: 'Buddy'
  }
});
await message.save();

// Mark as read
await message.markAsRead();
```

### CareEntry Model

**Purpose**: Tracks pet care activities and health records

**Key Features**:
- Multiple care types (medical, grooming, exercise, etc.)
- Medication tracking
- Veterinarian information
- Cost tracking
- Follow-up scheduling

**Example Usage**:
```javascript
// Add medical care entry
const careEntry = new CareEntry({
  petId: petId,
  petName: 'Buddy',
  type: 'medical',
  subType: 'vaccination',
  title: 'Annual Vaccinations',
  description: 'Rabies and DHPP boosters',
  date: new Date(),
  veterinarian: {
    name: 'Dr. Smith',
    clinic: 'Pet Health Clinic',
    phone: '555-0123'
  },
  cost: 85,
  createdBy: userId
});
await careEntry.save();
```

### GPSTracking Model

**Purpose**: Manages pet location tracking and safety

**Key Features**:
- Real-time location tracking
- Safe zone management
- Alert system for boundary violations
- Device management
- Activity monitoring

**Example Usage**:
```javascript
// Setup GPS tracking
const gpsTracking = new GPSTracking({
  petId: petId,
  petName: 'Buddy',
  ownerId: userId,
  device: {
    deviceId: 'GPS001',
    deviceType: 'collar',
    batteryLevel: 85
  },
  safeZones: [{
    name: 'Home',
    center: { latitude: 40.7128, longitude: -74.0060 },
    radius: 100
  }]
});
await gpsTracking.save();

// Add location point
await gpsTracking.addLocationPoint({
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5,
  timestamp: new Date()
});
```

## Database Connection and Setup

### Connection Configuration

```javascript
// server.js
require("dotenv").config();
const mongoose = require("mongoose");
const { initializeModels, createIndexes, seedDatabase } = require('./models/index');

const mongoUrl = process.env.MONGO_URI || "your_mongodb_connection_string";

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected successfully");
    
    // Initialize models
    initializeModels();
    
    // Create indexes for better performance
    await createIndexes();
    
    // Seed with sample data (development only)
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }
    
    console.log("Database setup complete!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
```

### Environment Variables

```bash
# .env file
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/petpal
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=12
```

## Query Examples

### Advanced Pet Search

```javascript
// Complex pet search with filters
const searchPets = async (filters) => {
  const query = {
    status: 'Available'
  };
  
  if (filters.type) query.type = filters.type;
  if (filters.breed) query.breed = new RegExp(filters.breed, 'i');
  if (filters.size) query.size = filters.size;
  if (filters.maxFee) query.adoptionFee = { $lte: filters.maxFee };
  
  const pets = await Pet.find(query)
    .populate('shelter', 'name contactInfo location')
    .sort({ createdAt: -1 })
    .limit(20);
    
  return pets;
};
```

### User Activity Dashboard

```javascript
// Get user dashboard data
const getUserDashboard = async (userId) => {
  const user = await User.findById(userId)
    .populate('favoritePets')
    .populate('applications');
    
  const recentMessages = await Message.find({
    $or: [{ senderId: userId }, { recipientId: userId }]
  })
    .sort({ createdAt: -1 })
    .limit(10);
    
  const upcomingReminders = await Reminder.find({
    userId: userId,
    completed: false,
    dueDate: { $gte: new Date() }
  })
    .sort({ dueDate: 1 })
    .limit(5);
    
  return {
    user,
    recentMessages,
    upcomingReminders,
    stats: {
      favoriteCount: user.favoritePets.length,
      applicationCount: user.applications.length
    }
  };
};
```

## Best Practices

### 1. Always Use Transactions for Related Operations

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Update pet status
  await Pet.findByIdAndUpdate(petId, { 
    status: 'Adopted',
    adoptedBy: userId,
    adoptionDate: new Date()
  }, { session });
  
  // Update application status
  await Application.findByIdAndUpdate(applicationId, {
    status: 'Approved'
  }, { session });
  
  // Create adoption history record
  await AdoptionHistory.create([{
    petId,
    adopterId: userId,
    adoptionDate: new Date(),
    shelterId
  }], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Use Proper Error Handling

```javascript
const createPet = async (petData) => {
  try {
    const pet = new Pet(petData);
    
    // Validate before saving
    await pet.validate();
    
    // Save with error handling
    const savedPet = await pet.save();
    
    return { success: true, pet: savedPet };
  } catch (error) {
    if (error.name === 'ValidationError') {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.errors 
      };
    }
    
    throw error; // Re-throw unexpected errors
  }
};
```

### 3. Implement Proper Indexing

```javascript
// The models already include proper indexes, but you can add custom ones:
await Pet.collection.createIndex({ 
  "location.city": 1, 
  "location.state": 1, 
  "status": 1 
});

// Text search index
await Pet.collection.createIndex({ 
  name: "text", 
  description: "text", 
  breed: "text" 
});
```

### 4. Use Aggregation for Complex Queries

```javascript
// Get shelter statistics
const getShelterStats = async (shelterId) => {
  return await Pet.aggregate([
    { $match: { 'shelter.id': shelterId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDays: { $avg: '$daysInShelter' }
      }
    }
  ]);
};
```

## Testing the Models

### Unit Tests Example

```javascript
// tests/models/pet.test.js
const { Pet } = require('../src/models/index');
const mongoose = require('mongoose');

describe('Pet Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGO_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  test('should create a pet successfully', async () => {
    const petData = {
      name: 'Test Pet',
      type: 'dog',
      breed: 'Test Breed',
      age: '2 years',
      shelter: {
        id: new mongoose.Types.ObjectId(),
        name: 'Test Shelter'
      }
    };
    
    const pet = new Pet(petData);
    const savedPet = await pet.save();
    
    expect(savedPet._id).toBeDefined();
    expect(savedPet.name).toBe('Test Pet');
    expect(savedPet.status).toBe('Available'); // Default value
  });
  
  test('should validate required fields', async () => {
    const pet = new Pet({});
    
    await expect(pet.save()).rejects.toThrow();
  });
});
```

## Performance Optimization

### 1. Use Lean Queries When Possible

```javascript
// Faster for read-only operations
const pets = await Pet.find({ status: 'Available' })
  .lean()
  .limit(20);
```

### 2. Implement Proper Pagination

```javascript
const getPaginatedPets = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [pets, total] = await Promise.all([
    Pet.find({ status: 'Available' })
      .skip(skip)
      .limit(limit)
      .lean(),
    Pet.countDocuments({ status: 'Available' })
  ]);
  
  return {
    pets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
```

## Security Considerations

1. **Password Hashing**: Automatic bcrypt hashing in User model
2. **Input Validation**: Mongoose schema validation
3. **Data Sanitization**: Use express-validator
4. **Authorization**: Check user permissions before operations
5. **Rate Limiting**: Implement for API endpoints

## Monitoring and Maintenance

### Health Checks

```javascript
// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping();
    
    // Get basic stats
    const stats = {
      database: 'connected',
      totalPets: await Pet.countDocuments(),
      availablePets: await Pet.countDocuments({ status: 'Available' }),
      totalUsers: await User.countDocuments({ isActive: true })
    };
    
    res.json({ status: 'healthy', stats });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

This documentation provides a comprehensive guide for using the PetPal backend models in a professional environment. The models are designed to be scalable, maintainable, and feature-rich for a complete pet adoption platform.