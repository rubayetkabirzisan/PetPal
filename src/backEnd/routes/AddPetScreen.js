const express = require('express');
const router = express.Router();

// In-memory storage for pet data (replace with MongoDB in production)
let pets = new Map();
let petDrafts = new Map();
let shelters = new Map();
let petCategories = new Map();

// Initialize sample data
function initializeAddPetData() {
  // Sample shelters
  const sampleShelters = [
    {
      id: 'shelter-001',
      name: 'Austin Animal Center',
      contact: '(512) 978-0500',
      email: 'info@austintexas.gov',
      address: '7201 Levander Loop, Austin, TX 78702',
      website: 'www.austintexas.gov/department/austin-animal-center',
      licenseNumber: 'TX-AAC-001',
      capacity: 500,
      currentOccupancy: 342,
      established: '1997-03-15',
      specialties: ['dogs', 'cats', 'rabbits', 'birds']
    },
    {
      id: 'shelter-002',
      name: 'Hill Country SPCA',
      contact: '(512) 488-7722',
      email: 'info@hillcountryspca.org',
      address: '5434 Hwy 290 W, Dripping Springs, TX 78620',
      website: 'www.hillcountryspca.org',
      licenseNumber: 'TX-HCSPCA-002',
      capacity: 200,
      currentOccupancy: 156,
      established: '1998-06-20',
      specialties: ['dogs', 'cats', 'farm animals']
    }
  ];

  // Sample pet categories and breeds
  const categoriesData = {
    Dog: {
      breeds: [
        'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
        'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
        'Siberian Husky', 'Boxer', 'Border Collie', 'Chihuahua', 'Australian Shepherd',
        'Shih Tzu', 'Boston Terrier', 'Pomeranian', 'Australian Cattle Dog',
        'Cocker Spaniel', 'Mixed Breed'
      ],
      sizes: ['Small', 'Medium', 'Large'],
      energyLevels: ['Low', 'Medium', 'High']
    },
    Cat: {
      breeds: [
        'Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Persian',
        'Maine Coon', 'British Shorthair', 'Ragdoll', 'Abyssinian',
        'Russian Blue', 'Sphynx', 'Bengal', 'Scottish Fold',
        'American Shorthair', 'Birman', 'Oriental Shorthair', 'Mixed Breed'
      ],
      sizes: ['Small', 'Medium', 'Large'],
      energyLevels: ['Low', 'Medium', 'High']
    }
  };

  // Sample pets
  const samplePets = [
    {
      id: 'pet-add-001',
      name: 'Buddy',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: '2 years',
      gender: 'Male',
      size: 'Large',
      weight: '65 lbs',
      color: 'Golden',
      description: 'Buddy is a friendly and energetic dog who loves to play fetch and swim.',
      personality: ['Friendly', 'Energetic', 'Loyal', 'Playful'],
      vaccinated: true,
      neutered: true,
      microchipped: true,
      houseTrained: true,
      goodWithKids: true,
      goodWithPets: true,
      energyLevel: 'High',
      medicalHistory: 'No significant medical issues. Regular checkups up to date.',
      specialNeeds: 'None',
      images: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
      ],
      location: 'Austin, TX',
      adoptionFee: 150,
      status: 'Available',
      shelterId: 'shelter-001',
      shelterName: 'Austin Animal Center',
      dateAdded: '2025-09-20T10:30:00Z',
      lastUpdated: '2025-09-22T08:15:00Z',
      viewCount: 45,
      favoriteCount: 12,
      applicationCount: 3,
      featured: false
    }
  ];

  // Initialize data
  sampleShelters.forEach(shelter => shelters.set(shelter.id, shelter));
  samplePets.forEach(pet => pets.set(pet.id, pet));
  petCategories.set('categories', categoriesData);
}

// Initialize data
initializeAddPetData();

// Helper function to generate pet ID
function generatePetId() {
  return `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
  
  // Optional field validation
  if (petData.weight && !/^\d+(\.\d+)?\s*(lbs?|kg|pounds?|kilograms?)$/i.test(petData.weight)) {
    errors.push('Weight format is invalid (e.g., "25 lbs", "11.3 kg")');
  }
  
  if (petData.energyLevel && !['Low', 'Medium', 'High'].includes(petData.energyLevel)) {
    errors.push('Energy level must be Low, Medium, or High');
  }
  
  if (petData.description && petData.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (petData.medicalHistory && petData.medicalHistory.length > 500) {
    errors.push('Medical history must be 500 characters or less');
  }
  
  if (petData.specialNeeds && petData.specialNeeds.length > 500) {
    errors.push('Special needs must be 500 characters or less');
  }
  
  if (petData.adoptionFee && (isNaN(petData.adoptionFee) || petData.adoptionFee < 0 || petData.adoptionFee > 10000)) {
    errors.push('Adoption fee must be a number between 0 and 10000');
  }
  
  return errors;
}

// GET /api/add-pet/categories - Get pet categories and breeds
router.get('/categories', (req, res) => {
  try {
    const categories = petCategories.get('categories');
    
    res.json({
      success: true,
      message: 'Pet categories retrieved successfully',
      data: {
        categories,
        personalityTraits: [
          'Friendly', 'Energetic', 'Calm', 'Playful', 'Loyal', 'Independent',
          'Gentle', 'Protective', 'Social', 'Quiet', 'Active', 'Affectionate'
        ]
      }
    });
    
  } catch (error) {
    console.error('Error getting pet categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/add-pet/shelters/:userId - Get shelters for user
router.get('/shelters/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Convert Map to Array for response
    const shelterList = Array.from(shelters.values());
    
    res.json({
      success: true,
      message: 'Shelters retrieved successfully',
      data: {
        shelters: shelterList,
        totalShelters: shelterList.length
      }
    });
    
  } catch (error) {
    console.error('Error getting shelters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/add-pet/draft - Save pet as draft
router.post('/draft', (req, res) => {
  try {
    const { userId, petData } = req.body;
    
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
    
    const draftId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const draft = {
      id: draftId,
      userId,
      petData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    petDrafts.set(draftId, draft);
    
    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: { draft }
    });
    
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/add-pet/drafts/:userId - Get user's drafts
router.get('/drafts/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userDrafts = Array.from(petDrafts.values())
      .filter(draft => draft.userId === userId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({
      success: true,
      message: 'Drafts retrieved successfully',
      data: {
        drafts: userDrafts,
        totalDrafts: userDrafts.length
      }
    });
    
  } catch (error) {
    console.error('Error getting drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/add-pet/draft/:draftId - Update draft
router.put('/draft/:draftId', (req, res) => {
  try {
    const { draftId } = req.params;
    const { userId, petData } = req.body;
    
    if (!draftId) {
      return res.status(400).json({
        success: false,
        message: 'Draft ID is required'
      });
    }
    
    const existingDraft = petDrafts.get(draftId);
    
    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    if (existingDraft.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this draft'
      });
    }
    
    const updatedDraft = {
      ...existingDraft,
      petData,
      updatedAt: new Date().toISOString()
    };
    
    petDrafts.set(draftId, updatedDraft);
    
    res.json({
      success: true,
      message: 'Draft updated successfully',
      data: { draft: updatedDraft }
    });
    
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/add-pet/draft/:draftId - Delete draft
router.delete('/draft/:draftId', (req, res) => {
  try {
    const { draftId } = req.params;
    const { userId } = req.query;
    
    if (!draftId) {
      return res.status(400).json({
        success: false,
        message: 'Draft ID is required'
      });
    }
    
    const existingDraft = petDrafts.get(draftId);
    
    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    if (existingDraft.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this draft'
      });
    }
    
    petDrafts.delete(draftId);
    
    res.json({
      success: true,
      message: 'Draft deleted successfully',
      data: { deletedDraft: existingDraft }
    });
    
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/add-pet/images/upload - Upload pet images
router.post('/images/upload', (req, res) => {
  try {
    console.log('Image upload request received:', { body: req.body });
    const { userId, images, petId } = req.body;
    
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
    
    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed'
      });
    }
    
    // Validate image data
    const validationErrors = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    images.forEach((image, index) => {
      if (!image.name || !image.type || !image.data) {
        validationErrors.push(`Image ${index + 1}: Missing required fields (name, type, data)`);
      } else {
        if (!allowedTypes.includes(image.type)) {
          validationErrors.push(`Image ${index + 1}: Invalid file type. Only JPEG, PNG, and WebP allowed`);
        }
        if (image.size && image.size > maxSize) {
          validationErrors.push(`Image ${index + 1}: File size exceeds 10MB limit`);
        }
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Image validation failed',
        errors: validationErrors
      });
    }
    
    // Simulate image processing and upload
    const processedImages = images.map((image, index) => {
      const fileName = `pet_${Date.now()}_${index + 1}_${image.name}`;
      const fileExtension = image.type.split('/')[1];
      
      return {
        id: `img-${Date.now()}-${index}`,
        fileName: fileName,
        originalName: image.name,
        url: `/uploads/pets/${fileName}`,
        thumbnailUrl: `/uploads/pets/thumbs/${fileName}`,
        mediumUrl: `/uploads/pets/medium/${fileName}`,
        uploadedAt: new Date().toISOString(),
        size: image.size || Math.floor(Math.random() * 2000000) + 500000,
        format: fileExtension,
        width: 800,
        height: 600,
        userId: userId
      };
    });
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: processedImages,
        uploaded: processedImages.length,
        total: images.length
      }
    });
    
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/add-pet/validate - Validate pet data without saving
router.post('/validate', (req, res) => {
  try {
    const petData = req.body;
    
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

// POST /api/add-pet - Add new pet
router.post('/', (req, res) => {
  try {
    const { userId, petData, shelterId, draftId } = req.body;
    
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
    
    // Validate pet data
    const validationErrors = validatePetData(petData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Get shelter information
    const shelter = shelters.get(shelterId || 'shelter-001');
    
    // Generate pet ID
    const petId = generatePetId();
    
    // Create new pet object
    const newPet = {
      id: petId,
      name: petData.name.trim(),
      type: petData.type,
      breed: petData.breed.trim(),
      age: petData.age.trim(),
      gender: petData.gender,
      size: petData.size,
      weight: petData.weight?.trim() || '',
      color: petData.color?.trim() || '',
      description: petData.description?.trim() || '',
      personality: petData.personality || [],
      vaccinated: Boolean(petData.vaccinated),
      neutered: Boolean(petData.neutered),
      microchipped: Boolean(petData.microchipped),
      houseTrained: Boolean(petData.houseTrained),
      goodWithKids: Boolean(petData.goodWithKids),
      goodWithPets: Boolean(petData.goodWithPets),
      energyLevel: petData.energyLevel || 'Medium',
      medicalHistory: petData.medicalHistory?.trim() || '',
      specialNeeds: petData.specialNeeds?.trim() || '',
      images: petData.images && petData.images.length > 0 ? petData.images : [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'
      ],
      location: shelter ? `${shelter.address.split(',').slice(-2).join(',').trim()}` : 'Austin, TX',
      adoptionFee: petData.adoptionFee || 150,
      status: 'Available',
      shelterId: shelterId || 'shelter-001',
      shelterName: shelter ? shelter.name : 'Local Animal Shelter',
      shelter: {
        name: shelter ? shelter.name : 'Local Animal Shelter',
        contact: shelter ? shelter.contact : '(555) 123-4567',
        email: shelter ? shelter.email : 'info@shelter.com',
        address: shelter ? shelter.address : '123 Pet Street, Austin, TX 78701'
      },
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      addedBy: userId,
      viewCount: 0,
      favoriteCount: 0,
      applicationCount: 0,
      featured: false,
      healthRecords: []
    };
    
    // Save pet
    pets.set(petId, newPet);
    
    // Delete draft if provided
    if (draftId && petDrafts.has(draftId)) {
      petDrafts.delete(draftId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: { 
        pet: newPet,
        petId: petId
      }
    });
    
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/add-pet/my-pets/:userId - Get pets added by user
router.get('/my-pets/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let userPets = Array.from(pets.values())
      .filter(pet => pet.addedBy === userId);
    
    // Filter by status if provided
    if (status && status !== 'all') {
      userPets = userPets.filter(pet => pet.status.toLowerCase() === status.toLowerCase());
    }
    
    // Sort by date added (newest first)
    userPets.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    // Pagination
    const total = userPets.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPets = userPets.slice(startIndex, endIndex);
    
    // Calculate statistics
    const stats = {
      total,
      available: userPets.filter(pet => pet.status === 'Available').length,
      pending: userPets.filter(pet => pet.status === 'Pending').length,
      adopted: userPets.filter(pet => pet.status === 'Adopted').length,
      totalViews: userPets.reduce((sum, pet) => sum + pet.viewCount, 0),
      totalApplications: userPets.reduce((sum, pet) => sum + pet.applicationCount, 0)
    };
    
    res.json({
      success: true,
      message: 'User pets retrieved successfully',
      data: {
        pets: paginatedPets,
        statistics: stats,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < total
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting user pets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/add-pet/:petId - Update pet
router.put('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, petData } = req.body;
    
    if (!petId) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    const existingPet = pets.get(petId);
    
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    if (existingPet.addedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }
    
    // Validate updated pet data
    const validationErrors = validatePetData(petData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Update pet
    const updatedPet = {
      ...existingPet,
      ...petData,
      id: petId, // Ensure ID doesn't change
      addedBy: existingPet.addedBy, // Ensure original user doesn't change
      dateAdded: existingPet.dateAdded, // Preserve original date
      lastUpdated: new Date().toISOString()
    };
    
    pets.set(petId, updatedPet);
    
    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet: updatedPet }
    });
    
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/add-pet/:petId/status - Update pet status
router.put('/:petId/status', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, status, reason } = req.body;
    
    if (!petId) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    if (!status || !['Available', 'Pending', 'Adopted', 'Hold', 'Unavailable'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (Available, Pending, Adopted, Hold, Unavailable)'
      });
    }
    
    const existingPet = pets.get(petId);
    
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    if (existingPet.addedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet status'
      });
    }
    
    const previousStatus = existingPet.status;
    
    // Update pet status
    const updatedPet = {
      ...existingPet,
      status,
      lastUpdated: new Date().toISOString(),
      statusHistory: [
        ...(existingPet.statusHistory || []),
        {
          status: previousStatus,
          changedTo: status,
          changedAt: new Date().toISOString(),
          reason: reason || '',
          changedBy: userId
        }
      ]
    };
    
    pets.set(petId, updatedPet);
    
    res.json({
      success: true,
      message: 'Pet status updated successfully',
      data: { 
        pet: updatedPet,
        statusChange: {
          from: previousStatus,
          to: status,
          changedAt: updatedPet.lastUpdated
        }
      }
    });
    
  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/add-pet/:petId - Delete pet
router.delete('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;
    
    if (!petId) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }
    
    const existingPet = pets.get(petId);
    
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    if (existingPet.addedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pet'
      });
    }
    
    // Check if pet has active applications
    if (existingPet.applicationCount > 0 && existingPet.status !== 'Adopted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete pet with active applications'
      });
    }
    
    pets.delete(petId);
    
    res.json({
      success: true,
      message: 'Pet deleted successfully',
      data: { deletedPet: existingPet }
    });
    
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/add-pet/analytics/:userId - Get user's pet management analytics
router.get('/analytics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userPets = Array.from(pets.values())
      .filter(pet => pet.addedBy === userId);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const periodPets = userPets.filter(pet => 
      new Date(pet.dateAdded) >= startDate
    );
    
    // Calculate analytics
    const analytics = {
      summary: {
        totalPets: userPets.length,
        petsAdded: periodPets.length,
        totalViews: userPets.reduce((sum, pet) => sum + pet.viewCount, 0),
        totalApplications: userPets.reduce((sum, pet) => sum + pet.applicationCount, 0),
        averageViewsPerPet: userPets.length > 0 ? Math.round(userPets.reduce((sum, pet) => sum + pet.viewCount, 0) / userPets.length) : 0,
        adoptionRate: userPets.length > 0 ? Math.round((userPets.filter(pet => pet.status === 'Adopted').length / userPets.length) * 100) : 0
      },
      statusBreakdown: {
        available: userPets.filter(pet => pet.status === 'Available').length,
        pending: userPets.filter(pet => pet.status === 'Pending').length,
        adopted: userPets.filter(pet => pet.status === 'Adopted').length,
        hold: userPets.filter(pet => pet.status === 'Hold').length,
        unavailable: userPets.filter(pet => pet.status === 'Unavailable').length
      },
      typeBreakdown: {
        dogs: userPets.filter(pet => pet.type === 'Dog').length,
        cats: userPets.filter(pet => pet.type === 'Cat').length
      },
      topPerformingPets: userPets
        .sort((a, b) => (b.viewCount + b.applicationCount) - (a.viewCount + a.applicationCount))
        .slice(0, 5)
        .map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          views: pet.viewCount,
          applications: pet.applicationCount,
          status: pet.status
        })),
      period
    };
    
    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
