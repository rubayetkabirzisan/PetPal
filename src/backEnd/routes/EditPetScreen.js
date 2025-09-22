/**
 * EditPetScreen API Routes
 * 
 * This file provides Express.js backend routes for the EditPetScreen functionality
 * in the PetPal mobile application. It handles CRUD operations for pet editing,
 * including updating basic information, managing images, health records, and validation.
 * 
 * Available Routes:
 * - GET /api/edit-pet/breeds - Get breed options by pet type
 * - GET /api/edit-pet/shelters - Get list of available shelters
 * - GET /api/edit-pet/:id - Get specific pet by ID for editing
 * - PUT /api/edit-pet/:id - Update pet information
 * - POST /api/edit-pet/:id/images - Update pet images
 * - POST /api/edit-pet/:id/health-records - Add health record
 * - DELETE /api/edit-pet/:id/health-records - Remove health record
 * - POST /api/edit-pet/:id/location - Update pet location with coordinates
 * - POST /api/edit-pet/validate - Validate pet data before saving
 * - GET /api/edit-pet/:id/history - Get pet update history
 * 
 * @author PetPal Development Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// In-memory storage for pet data (replace with MongoDB in production)
let pets = new Map();
let shelters = new Map();
let breeds = new Map();
let petImages = new Map();

// Initialize sample data
function initializeEditPetData() {
  // Sample shelters
  const sampleShelters = [
    {
      id: 'shelter-001',
      name: 'Austin Animal Center',
      contact: '(512) 978-0500',
      email: 'info@austintexas.gov',
      address: '7201 Levander Loop, Austin, TX 78702'
    },
    {
      id: 'shelter-002',
      name: 'Hill Country SPCA',
      contact: '(512) 488-7722',
      email: 'info@hillcountryspca.org',
      address: '5434 Hwy 290 W, Dripping Springs, TX 78620'
    }
  ];

  // Sample breeds data
  const breedsData = {
    Dog: [
      'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
      'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
      'Siberian Husky', 'Boxer', 'Border Collie', 'Chihuahua', 'Australian Shepherd',
      'Shih Tzu', 'Boston Terrier', 'Pomeranian', 'Mixed Breed'
    ],
    Cat: [
      'Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Persian',
      'Maine Coon', 'British Shorthair', 'Ragdoll', 'Abyssinian',
      'Russian Blue', 'Sphynx', 'Bengal', 'Scottish Fold', 'Mixed Breed'
    ]
  };

  // Sample pets for editing
  const samplePets = [
    {
      id: 'pet-001',
      name: 'Buddy',
      type: 'Dog',
      species: 'Canine',
      breed: 'Golden Retriever',
      age: '2 years',
      gender: 'Male',
      size: 'Large',
      color: 'Golden',
      location: 'Austin, TX',
      distance: '2.5 miles',
      description: 'Buddy is a friendly and energetic dog who loves to play fetch and swim. He gets along well with children and other pets.',
      personality: ['Friendly', 'Energetic', 'Loyal', 'Playful'],
      images: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      vaccinated: true,
      neutered: true,
      microchipped: true,
      goodWithKids: true,
      goodWithPets: true,
      energyLevel: 'High',
      activityLevel: 'High',
      hypoallergenic: false,
      adoptionFee: 150,
      status: 'Available',
      dateAdded: '2025-09-20T10:30:00Z',
      shelter: {
        name: 'Austin Animal Center',
        contact: '(512) 978-0500',
        email: 'info@austintexas.gov',
        address: '7201 Levander Loop, Austin, TX 78702'
      },
      healthRecords: [
        {
          date: '2025-09-15',
          type: 'Vaccination',
          description: 'Annual vaccinations including rabies, DHPP'
        },
        {
          date: '2025-08-01',
          type: 'Health Check',
          description: 'Routine health examination - all normal'
        }
      ],
      coordinates: {
        latitude: 30.2672,
        longitude: -97.7431
      }
    },
    {
      id: 'pet-002',
      name: 'Luna',
      type: 'Cat',
      species: 'Feline',
      breed: 'Domestic Shorthair',
      age: '1.5 years',
      gender: 'Female',
      size: 'Medium',
      color: 'Gray and White',
      location: 'Austin, TX',
      distance: '3.1 miles',
      description: 'Luna is a calm and affectionate cat who enjoys quiet companionship. She is perfect for a peaceful home environment.',
      personality: ['Calm', 'Affectionate', 'Independent', 'Gentle'],
      images: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      vaccinated: true,
      neutered: true,
      microchipped: false,
      goodWithKids: true,
      goodWithPets: false,
      energyLevel: 'Low',
      activityLevel: 'Low',
      hypoallergenic: false,
      adoptionFee: 75,
      status: 'Available',
      dateAdded: '2025-09-18T14:20:00Z',
      shelter: {
        name: 'Hill Country SPCA',
        contact: '(512) 488-7722',
        email: 'info@hillcountryspca.org',
        address: '5434 Hwy 290 W, Dripping Springs, TX 78620'
      },
      healthRecords: [
        {
          date: '2025-09-10',
          type: 'Vaccination',
          description: 'FVRCP vaccine administered'
        }
      ],
      coordinates: {
        latitude: 30.1896,
        longitude: -98.0877
      }
    }
  ];

  // Store sample data
  sampleShelters.forEach(shelter => shelters.set(shelter.id, shelter));
  breeds.set('breeds', breedsData);
  samplePets.forEach(pet => pets.set(pet.id, pet));
}

// Initialize data on startup
initializeEditPetData();

// Helper function to generate unique IDs
function generateId() {
  return 'pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to validate pet data
function validatePetData(petData) {
  const errors = [];
  
  // Required fields validation
  if (!petData.name || petData.name.trim().length === 0) {
    errors.push('Pet name is required');
  } else if (petData.name.length > 50) {
    errors.push('Pet name must be 50 characters or less');
  }
  
  if (!petData.type || !['Dog', 'Cat'].includes(petData.type)) {
    errors.push('Pet type must be Dog or Cat');
  }
  
  if (!petData.breed || petData.breed.trim().length === 0) {
    errors.push('Pet breed is required');
  }
  
  if (!petData.age || petData.age.trim().length === 0) {
    errors.push('Pet age is required');
  }
  
  if (!petData.gender || !['Male', 'Female'].includes(petData.gender)) {
    errors.push('Pet gender must be Male or Female');
  }
  
  if (!petData.size || !['Small', 'Medium', 'Large'].includes(petData.size)) {
    errors.push('Pet size must be Small, Medium, or Large');
  }
  
  if (!petData.status || !['Available', 'Pending', 'Adopted', 'Medical Hold'].includes(petData.status)) {
    errors.push('Pet status must be Available, Pending, Adopted, or Medical Hold');
  }
  
  if (!petData.location || petData.location.trim().length === 0) {
    errors.push('Pet location is required');
  }
  
  if (!petData.description || petData.description.trim().length < 10) {
    errors.push('Pet description must be at least 10 characters');
  } else if (petData.description.length > 1000) {
    errors.push('Pet description must be 1000 characters or less');
  }
  
  if (!petData.shelter || !petData.shelter.name || petData.shelter.name.trim().length === 0) {
    errors.push('Shelter name is required');
  }
  
  // Optional field validation
  if (petData.adoptionFee && (isNaN(petData.adoptionFee) || petData.adoptionFee < 0)) {
    errors.push('Adoption fee must be a valid positive number');
  }
  
  if (petData.energyLevel && !['Low', 'Medium', 'High'].includes(petData.energyLevel)) {
    errors.push('Energy level must be Low, Medium, or High');
  }
  
  if (petData.personality && !Array.isArray(petData.personality)) {
    errors.push('Personality traits must be an array');
  }
  
  if (petData.images && !Array.isArray(petData.images)) {
    errors.push('Images must be an array');
  }
  
  return errors;
}

// Helper function to sanitize pet data
function sanitizePetData(petData) {
  return {
    name: petData.name?.trim(),
    type: petData.type,
    species: petData.type === 'Dog' ? 'Canine' : 'Feline',
    breed: petData.breed?.trim(),
    age: petData.age?.trim(),
    gender: petData.gender,
    size: petData.size,
    color: petData.color?.trim() || '',
    location: petData.location?.trim(),
    description: petData.description?.trim(),
    personality: Array.isArray(petData.personality) ? petData.personality : [],
    images: Array.isArray(petData.images) ? petData.images.slice(0, 5) : [],
    imageUrl: petData.imageUrl || petData.images?.[0] || '',
    vaccinated: Boolean(petData.vaccinated),
    neutered: Boolean(petData.neutered),
    microchipped: Boolean(petData.microchipped),
    goodWithKids: Boolean(petData.goodWithKids),
    goodWithPets: Boolean(petData.goodWithPets),
    energyLevel: petData.energyLevel || 'Medium',
    activityLevel: petData.activityLevel || 'Medium',
    hypoallergenic: Boolean(petData.hypoallergenic),
    adoptionFee: parseFloat(petData.adoptionFee) || 0,
    status: petData.status || 'Available',
    shelter: {
      name: petData.shelter?.name?.trim() || '',
      contact: petData.shelter?.contact?.trim() || '',
      email: petData.shelter?.email?.trim() || '',
      address: petData.shelter?.address?.trim() || ''
    },
    healthRecords: Array.isArray(petData.healthRecords) ? petData.healthRecords : [],
    coordinates: petData.coordinates || null
  };
}

// Routes

// GET /api/edit-pet/breeds - Get breed options by pet type
router.get('/breeds', (req, res) => {
  try {
    const { type } = req.query;
    const breedsData = breeds.get('breeds') || {};
    
    if (type && breedsData[type]) {
      return res.json({
        success: true,
        data: {
          breeds: breedsData[type]
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        breeds: breedsData
      }
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/edit-pet/shelters - Get list of shelters
router.get('/shelters', (req, res) => {
  try {
    const sheltersList = Array.from(shelters.values());
    
    res.json({
      success: true,
      data: {
        shelters: sheltersList,
        total: sheltersList.length
      }
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/edit-pet/:id - Get pet by ID for editing
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Pet retrieved successfully',
      data: {
        pet: pet,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/edit-pet/:id - Update pet information
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, petData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!petData) {
      return res.status(400).json({
        success: false,
        message: 'Pet data is required'
      });
    }
    
    const existingPet = pets.get(id);
    
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Validate pet data
    const validationErrors = validatePetData(petData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Sanitize and prepare updated pet data
    const sanitizedData = sanitizePetData(petData);
    
    // Update pet with new data while preserving some original fields
    const updatedPet = {
      ...existingPet,
      ...sanitizedData,
      id: id, // Ensure ID doesn't change
      dateAdded: existingPet.dateAdded, // Preserve original date
      lastUpdated: new Date().toISOString()
    };
    
    // Store updated pet
    pets.set(id, updatedPet);
    
    res.json({
      success: true,
      message: `${updatedPet.name}'s profile has been updated successfully`,
      data: {
        pet: updatedPet,
        updatedFields: Object.keys(sanitizedData).length,
        timestamp: updatedPet.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet information',
      error: error.message
    });
  }
});

// POST /api/edit-pet/:id/images - Upload/update pet images
router.post('/:id/images', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, images } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Limit to 5 images maximum
    const limitedImages = images.slice(0, 5);
    
    // Update pet with new images
    const updatedPet = {
      ...pet,
      images: limitedImages,
      imageUrl: limitedImages[0] || pet.imageUrl,
      lastUpdated: new Date().toISOString()
    };
    
    pets.set(id, updatedPet);
    
    res.json({
      success: true,
      message: 'Pet images updated successfully',
      data: {
        pet: updatedPet,
        imagesCount: limitedImages.length
      }
    });
    
  } catch (error) {
    console.error('Error updating pet images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet images',
      error: error.message
    });
  }
});

// POST /api/edit-pet/:id/health-records - Add health record
router.post('/:id/health-records', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, healthRecord } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!healthRecord || !healthRecord.date || !healthRecord.type || !healthRecord.description) {
      return res.status(400).json({
        success: false,
        message: 'Health record must include date, type, and description'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Add new health record
    const updatedHealthRecords = [...(pet.healthRecords || []), healthRecord];
    
    const updatedPet = {
      ...pet,
      healthRecords: updatedHealthRecords,
      lastUpdated: new Date().toISOString()
    };
    
    pets.set(id, updatedPet);
    
    res.json({
      success: true,
      message: 'Health record added successfully',
      data: {
        pet: updatedPet,
        healthRecord: healthRecord,
        totalRecords: updatedHealthRecords.length
      }
    });
    
  } catch (error) {
    console.error('Error adding health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add health record',
      error: error.message
    });
  }
});

// DELETE /api/edit-pet/:id/health-records - Remove health record
router.delete('/:id/health-records', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, recordIndex } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (recordIndex === undefined || recordIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid record index is required'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    const healthRecords = pet.healthRecords || [];
    
    if (recordIndex >= healthRecords.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record index'
      });
    }
    
    // Remove health record at specified index
    const removedRecord = healthRecords[recordIndex];
    const updatedHealthRecords = healthRecords.filter((_, index) => index !== recordIndex);
    
    const updatedPet = {
      ...pet,
      healthRecords: updatedHealthRecords,
      lastUpdated: new Date().toISOString()
    };
    
    pets.set(id, updatedPet);
    
    res.json({
      success: true,
      message: 'Health record removed successfully',
      data: {
        pet: updatedPet,
        removedRecord: removedRecord,
        remainingRecords: updatedHealthRecords.length
      }
    });
    
  } catch (error) {
    console.error('Error removing health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove health record',
      error: error.message
    });
  }
});

// POST /api/edit-pet/:id/location - Update pet location with coordinates
router.post('/:id/location', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, location, coordinates } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!location || location.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Location address is required'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Update pet location and coordinates
    const updatedPet = {
      ...pet,
      location: location.trim(),
      coordinates: coordinates || null,
      lastUpdated: new Date().toISOString()
    };
    
    pets.set(id, updatedPet);
    
    res.json({
      success: true,
      message: 'Pet location updated successfully',
      data: {
        pet: updatedPet,
        location: updatedPet.location,
        coordinates: updatedPet.coordinates
      }
    });
    
  } catch (error) {
    console.error('Error updating pet location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet location',
      error: error.message
    });
  }
});

// POST /api/edit-pet/validate - Validate pet data before saving
router.post('/validate', (req, res) => {
  try {
    const { petData } = req.body;
    
    if (!petData) {
      return res.status(400).json({
        success: false,
        message: 'Pet data is required'
      });
    }
    
    // Validate pet data
    const validationErrors = validatePetData(petData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.json({
      success: true,
      message: 'Pet data is valid',
      data: {
        validatedFields: Object.keys(petData).length,
        requiredFieldsComplete: true
      }
    });
    
  } catch (error) {
    console.error('Error validating pet data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/edit-pet/:id/history - Get pet update history
router.get('/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    const pet = pets.get(id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Mock update history (in production, this would come from a database)
    const history = [
      {
        date: pet.lastUpdated || pet.dateAdded,
        action: 'Profile Updated',
        user: 'Shelter Admin',
        changes: ['Basic Information', 'Health Records']
      },
      {
        date: pet.dateAdded,
        action: 'Pet Added',
        user: 'Shelter Admin',
        changes: ['Initial Profile Creation']
      }
    ];
    
    res.json({
      success: true,
      data: {
        petId: id,
        petName: pet.name,
        history: history,
        totalUpdates: history.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching pet history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
