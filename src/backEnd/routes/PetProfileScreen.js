const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const User = require('../models/User');
const Application = require('../models/Application');
const Shelter = require('../models/Shelter');
// const Analytics = require('../models/Analytics');

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  req.userId = userId;
  next();
};

// Pet ID validation middleware
const validatePetId = (req, res, next) => {
  const { petId } = req.params;
  if (!petId || !petId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pet ID format'
    });
  }
  next();
};

// Input validation middleware for actions
const validateAction = (req, res, next) => {
  const { action } = req.body;
  const validActions = ['favorite', 'unfavorite', 'share', 'report', 'inquire'];
  
  if (action && !validActions.includes(action)) {
    return res.status(400).json({
      success: false,
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`
    });
  }
  
  next();
};

// Error handling middleware
const handleError = (res, error, message = 'Internal server error') => {
  console.error('Pet Profile Error:', error);
  res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// In-memory storage for pets and related data (fallback data)
let pets = [
  {
    id: "pet-001",
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    gender: "Male",
    size: "Large",
    color: "Golden",
    energyLevel: "High",
    distance: "2.3 miles away",
    description: "Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He's great with children and other dogs, making him the perfect family companion. Buddy has been well-socialized and knows basic commands like sit, stay, and come. He would thrive in an active household that can provide him with plenty of exercise and mental stimulation.",
    personality: ["Friendly", "Energetic", "Loyal", "Playful", "Smart"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
    ],
    healthRecords: [
      {
        type: "Vaccination",
        date: "2025-08-15",
        description: "Annual vaccinations including rabies, DHPP, and bordetella"
      },
      {
        type: "Health Checkup",
        date: "2025-07-20",
        description: "Comprehensive health examination - all vitals normal"
      },
      {
        type: "Dental Cleaning",
        date: "2025-06-10",
        description: "Professional dental cleaning and oral health assessment"
      }
    ],
    shelter: {
      id: "shelter-001",
      name: "Happy Paws Animal Shelter",
      contact: "+1 (555) 123-4567",
      email: "info@happypaws.org",
      address: "123 Animal Lane, Pet City, PC 12345"
    },
    status: "available",
    adoptionFee: 350,
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-09-15T14:30:00Z"
  },
  {
    id: "pet-002",
    name: "Luna",
    breed: "Border Collie",
    age: "2 years",
    gender: "Female", 
    size: "Medium",
    color: "Black & White",
    energyLevel: "Very High",
    distance: "1.7 miles away",
    description: "Luna is an intelligent and athletic Border Collie who excels at agility and loves learning new tricks. She's highly trainable and forms strong bonds with her family. Luna needs an experienced owner who can provide mental challenges and plenty of physical exercise. She would do best in a home without small children due to her herding instincts.",
    personality: ["Intelligent", "Athletic", "Focused", "Protective", "Independent"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    images: [
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=500",
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500"
    ],
    healthRecords: [
      {
        type: "Spay Surgery",
        date: "2025-09-01",
        description: "Successful spay surgery with no complications - recovery complete"
      },
      {
        type: "Vaccination",
        date: "2025-08-20",
        description: "Up-to-date on all required vaccinations"
      }
    ],
    shelter: {
      id: "shelter-002", 
      name: "City Animal Rescue",
      contact: "+1 (555) 987-6543",
      email: "adopt@cityrescue.org",
      address: "456 Rescue Road, Animal City, AC 54321"
    },
    status: "available",
    adoptionFee: 300,
    createdAt: "2025-08-10T09:00:00Z",
    updatedAt: "2025-09-10T16:45:00Z"
  },
  {
    id: "pet-003",
    name: "Max",
    breed: "German Shepherd Mix",
    age: "4 years",
    gender: "Male",
    size: "Large", 
    color: "Brown & Black",
    energyLevel: "Medium",
    distance: "3.1 miles away",
    description: "Max is a gentle giant who loves people and is great with kids. He's calm, well-mannered, and already house-trained. Max enjoys moderate exercise like daily walks and occasional hikes. He's looking for a loving family who can appreciate his loyal and protective nature while providing him with the companionship he craves.",
    personality: ["Gentle", "Protective", "Calm", "Loyal", "Patient"],
    vaccinated: true,
    neutered: true,
    microchipped: false,
    images: [
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500"
    ],
    healthRecords: [
      {
        type: "Health Checkup",
        date: "2025-09-05",
        description: "Annual wellness exam - excellent health status"
      }
    ],
    shelter: {
      id: "shelter-001",
      name: "Happy Paws Animal Shelter",
      contact: "+1 (555) 123-4567", 
      email: "info@happypaws.org",
      address: "123 Animal Lane, Pet City, PC 12345"
    },
    status: "available",
    adoptionFee: 275,
    createdAt: "2025-07-25T14:20:00Z",
    updatedAt: "2025-09-05T11:15:00Z"
  }
];

// User favorites storage
let userFavorites = [
  { userId: "user-001", petId: "pet-002" },
  { userId: "user-001", petId: "pet-001" },
  { userId: "user-002", petId: "pet-003" }
];

// Applications storage  
let applications = [
  {
    id: "app-001",
    petId: "pet-001",
    userId: "user-001",
    applicantName: "John Smith",
    applicantEmail: "john.smith@email.com",
    applicantPhone: "+1 (555) 111-2222",
    status: "pending",
    submittedAt: "2025-09-20T10:30:00Z",
    notes: "Experienced dog owner with a large fenced yard"
  },
  {
    id: "app-002", 
    petId: "pet-001",
    userId: "user-003",
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah.j@email.com",
    applicantPhone: "+1 (555) 333-4444",
    status: "approved",
    submittedAt: "2025-09-18T14:15:00Z",
    notes: "Perfect match - active family with children"
  }
];

// Pet interaction logs
let interactions = [
  {
    id: "int-001",
    petId: "pet-001",
    userId: "user-001", 
    type: "view",
    timestamp: "2025-09-22T09:15:00Z"
  },
  {
    id: "int-002",
    petId: "pet-002",
    userId: "user-001",
    type: "favorite",
    timestamp: "2025-09-21T16:30:00Z"
  }
];

// Helper function to validate pet data
const validatePetData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Pet name is required');
  }

  if (!data.breed || data.breed.trim() === '') {
    errors.push('Breed is required');
  }

  if (!data.age || data.age.trim() === '') {
    errors.push('Age is required');
  }

  if (!data.gender || !['Male', 'Female'].includes(data.gender)) {
    errors.push('Valid gender is required (Male/Female)');
  }

  if (!data.size || !['Small', 'Medium', 'Large', 'Extra Large'].includes(data.size)) {
    errors.push('Valid size is required (Small/Medium/Large/Extra Large)');
  }

  return errors;
};

// Helper function to generate unique IDs
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// GET /api/pet-profile/:petId - Get specific pet details
router.get('/:petId', validatePetId, authenticateUser, async (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req;

    // Find pet with populated shelter information
    const pet = await Pet.findById(petId)
      .populate('shelter', 'name contact email address')
      .lean();

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Verify user exists
    const user = await User.findById(userId).select('favorites');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has favorited this pet
    const isFavorited = user.favorites ? user.favorites.includes(petId) : false;

    // Log the view interaction and update analytics
    try {
      await Analytics.findOneAndUpdate(
        { petId: petId, date: new Date().toISOString().split('T')[0] },
        { 
          $inc: { views: 1 },
          $setOnInsert: { 
            petId: petId,
            date: new Date().toISOString().split('T')[0]
          }
        },
        { upsert: true, new: true }
      );
    } catch (analyticsError) {
      console.warn('Analytics update failed:', analyticsError);
      // Don't fail the request if analytics fails
    }

    // Get application count for this pet
    const applicationCount = await Application.countDocuments({ petId: petId });

    // Get total view count from analytics
    const analyticsData = await Analytics.aggregate([
      { $match: { petId: petId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = analyticsData.length > 0 ? analyticsData[0].totalViews : 0;

    // Calculate compatibility score if user preferences exist
    let compatibilityScore = null;
    if (user.preferences) {
      compatibilityScore = calculateCompatibilityScore(pet, user.preferences);
    }

    const petData = {
      id: pet._id,
      name: pet.name,
      breed: pet.breed,
      type: pet.type,
      age: pet.age,
      gender: pet.gender,
      size: pet.size,
      color: pet.color,
      energyLevel: pet.energyLevel,
      description: pet.description,
      personality: pet.personality || [],
      vaccinated: pet.vaccinated || false,
      neutered: pet.neutered || false,
      microchipped: pet.microchipped || false,
      images: pet.images || [],
      healthRecords: pet.healthRecords || [],
      shelter: pet.shelter,
      status: pet.status,
      adoptionFee: pet.adoptionFee,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      isFavorited,
      applicationCount,
      viewCount: totalViews,
      compatibilityScore
    };

    res.json({
      success: true,
      data: {
        pet: petData
      }
    });

  } catch (error) {
    console.error('Error fetching pet profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-profile/:petId/favorite - Toggle favorite status
router.post('/:petId/favorite', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if already favorited
    const existingFavoriteIndex = userFavorites.findIndex(fav => 
      fav.userId === userId && fav.petId === petId
    );

    let isFavorited;

    if (existingFavoriteIndex !== -1) {
      // Remove from favorites
      userFavorites.splice(existingFavoriteIndex, 1);
      isFavorited = false;

      // Log unfavorite interaction
      const interaction = {
        id: generateId('int'),
        petId,
        userId,
        type: 'unfavorite',
        timestamp: new Date().toISOString()
      };
      interactions.push(interaction);
    } else {
      // Add to favorites
      userFavorites.push({ userId, petId });
      isFavorited = true;

      // Log favorite interaction
      const interaction = {
        id: generateId('int'),
        petId,
        userId,
        type: 'favorite',
        timestamp: new Date().toISOString()
      };
      interactions.push(interaction);
    }

    res.json({
      success: true,
      message: isFavorited ? 'Pet added to favorites' : 'Pet removed from favorites',
      data: {
        isFavorited,
        favoriteCount: userFavorites.filter(fav => fav.petId === petId).length
      }
    });

  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-profile/:petId/applications - Get applications for a pet (shelter admins only)
router.get('/:petId/applications', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, userType } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user is shelter admin
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - shelter admin access required'
      });
    }

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Get applications for this pet
    const petApplications = applications.filter(app => app.petId === petId);

    // Sort by submission date (newest first)
    petApplications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Add pet name to applications
    const applicationsWithPetInfo = petApplications.map(app => ({
      ...app,
      petName: pet.name,
      petBreed: pet.breed
    }));

    res.json({
      success: true,
      data: {
        applications: applicationsWithPetInfo,
        total: petApplications.length,
        petInfo: {
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          status: pet.status
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pet applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-profile/:petId/apply - Submit adoption application
router.post('/:petId/apply', (req, res) => {
  try {
    const { petId } = req.params;
    const { 
      userId, 
      applicantName, 
      applicantEmail, 
      applicantPhone, 
      experience, 
      livingArrangement, 
      otherPets, 
      notes 
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!applicantName || !applicantEmail || !applicantPhone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Pet is no longer available for adoption'
      });
    }

    // Check if user already has a pending/approved application for this pet
    const existingApplication = applications.find(app => 
      app.petId === petId && app.userId === userId && 
      ['pending', 'approved'].includes(app.status)
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active application for this pet'
      });
    }

    // Create new application
    const newApplication = {
      id: generateId('app'),
      petId,
      userId,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      applicantPhone: applicantPhone.trim(),
      experience: experience || '',
      livingArrangement: livingArrangement || '',
      otherPets: otherPets || '',
      notes: notes || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    applications.push(newApplication);

    // Log application interaction
    const interaction = {
      id: generateId('int'),
      petId,
      userId,
      type: 'application',
      timestamp: new Date().toISOString()
    };
    interactions.push(interaction);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          ...newApplication,
          petName: pet.name,
          petBreed: pet.breed
        }
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-profile/:petId/similar - Get similar pets
router.get('/:petId/similar', (req, res) => {
  try {
    const { petId } = req.params;
    const { limit = 4 } = req.query;

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Find similar pets based on breed, size, or age
    const similarPets = pets.filter(p => {
      if (p.id === petId || p.status !== 'available') return false;
      
      // Check similarity criteria
      const sameBreed = p.breed === pet.breed;
      const sameSize = p.size === pet.size;
      const similarAge = Math.abs(parseInt(p.age) - parseInt(pet.age)) <= 2;
      
      return sameBreed || (sameSize && similarAge);
    });

    // Sort by similarity score and limit results
    const limitedSimilar = similarPets
      .slice(0, parseInt(limit))
      .map(p => ({
        id: p.id,
        name: p.name,
        breed: p.breed,
        age: p.age,
        gender: p.gender,
        size: p.size,
        distance: p.distance,
        images: p.images,
        adoptionFee: p.adoptionFee,
        shelter: p.shelter
      }));

    res.json({
      success: true,
      data: {
        similarPets: limitedSimilar,
        total: similarPets.length
      }
    });

  } catch (error) {
    console.error('Error fetching similar pets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/pet-profile/:petId - Update pet information (shelter admins only)
router.put('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, userType, ...updateData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user is shelter admin
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - shelter admin access required'
      });
    }

    const petIndex = pets.findIndex(p => p.id === petId);
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Validate update data
    const currentPet = pets[petIndex];
    const validationErrors = validatePetData({
      name: updateData.name || currentPet.name,
      breed: updateData.breed || currentPet.breed,
      age: updateData.age || currentPet.age,
      gender: updateData.gender || currentPet.gender,
      size: updateData.size || currentPet.size
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Update pet
    pets[petIndex] = {
      ...currentPet,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Pet profile updated successfully',
      data: {
        pet: pets[petIndex]
      }
    });

  } catch (error) {
    console.error('Error updating pet profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-profile/:petId/analytics - Get pet analytics (shelter admins only)
router.get('/:petId/analytics', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, userType } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user is shelter admin
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - shelter admin access required'
      });
    }

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Calculate analytics
    const petInteractions = interactions.filter(int => int.petId === petId);
    const petApplications = applications.filter(app => app.petId === petId);

    const analytics = {
      totalViews: petInteractions.filter(int => int.type === 'view').length,
      totalFavorites: userFavorites.filter(fav => fav.petId === petId).length,
      totalApplications: petApplications.length,
      applicationsByStatus: {
        pending: petApplications.filter(app => app.status === 'pending').length,
        approved: petApplications.filter(app => app.status === 'approved').length,
        rejected: petApplications.filter(app => app.status === 'rejected').length
      },
      dailyViews: {},
      daysOnPlatform: Math.ceil((new Date() - new Date(pet.createdAt)) / (1000 * 60 * 60 * 24)),
      averageViewsPerDay: 0
    };

    // Calculate daily views for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      analytics.dailyViews[dateStr] = petInteractions.filter(int => 
        int.type === 'view' && int.timestamp.startsWith(dateStr)
      ).length;
    }

    analytics.averageViewsPerDay = analytics.daysOnPlatform > 0 ? 
      (analytics.totalViews / analytics.daysOnPlatform).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        analytics,
        petInfo: {
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          status: pet.status,
          createdAt: pet.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pet analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-profile/:petId/contact - Log shelter contact attempt
router.post('/:petId/contact', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, contactMethod } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Log contact interaction
    const interaction = {
      id: generateId('int'),
      petId,
      userId,
      type: `contact_${contactMethod || 'phone'}`,
      timestamp: new Date().toISOString()
    };
    interactions.push(interaction);

    res.json({
      success: true,
      message: 'Contact attempt logged successfully',
      data: {
        shelterInfo: pet.shelter
      }
    });

  } catch (error) {
    console.error('Error logging contact attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper function to calculate compatibility score
function calculateCompatibilityScore(pet, userPreferences) {
  let score = 0;
  let factors = 0;
  
  // Size preference match
  if (userPreferences.size && pet.size) {
    factors++;
    if (userPreferences.size.toLowerCase() === pet.size.toLowerCase()) {
      score += 25;
    }
  }
  
  // Energy level match
  if (userPreferences.energyLevel && pet.energyLevel) {
    factors++;
    if (userPreferences.energyLevel.toLowerCase() === pet.energyLevel.toLowerCase()) {
      score += 25;
    }
  }
  
  // Pet type match
  if (userPreferences.type && pet.type) {
    factors++;
    if (userPreferences.type.toLowerCase() === pet.type.toLowerCase()) {
      score += 25;
    }
  }
  
  // Age preference
  if (userPreferences.ageRange && pet.age) {
    factors++;
    // Simple age matching - could be enhanced
    const petAgeNum = parseInt(pet.age);
    if (!isNaN(petAgeNum) && petAgeNum >= userPreferences.ageRange.min && petAgeNum <= userPreferences.ageRange.max) {
      score += 25;
    }
  }
  
  return factors > 0 ? Math.round(score / factors) : null;
}

module.exports = router;
