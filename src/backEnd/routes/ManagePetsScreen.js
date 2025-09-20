const express = require('express');
const router = express.Router();

// In-memory storage for pets (replace with database in production)
let pets = [
  {
    id: '1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: '2 years',
    gender: 'Male',
    type: 'Dog',
    status: 'Available',
    location: 'New York, NY',
    images: ['https://example.com/buddy.jpg'],
    description: 'Friendly and energetic dog looking for a loving home.',
    adoptionFee: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Whiskers',
    breed: 'Persian',
    age: '1 year',
    gender: 'Female',
    type: 'Cat',
    status: 'Pending',
    location: 'Los Angeles, CA',
    images: ['https://example.com/whiskers.jpg'],
    description: 'Calm and affectionate cat, great with children.',
    adoptionFee: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Max',
    breed: 'German Shepherd',
    age: '3 years',
    gender: 'Male',
    type: 'Dog',
    status: 'Medical Hold',
    location: 'Chicago, IL',
    images: ['https://example.com/max.jpg'],
    description: 'Protective and loyal, needs experienced owner.',
    adoptionFee: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Luna',
    breed: 'Siamese',
    age: '6 months',
    gender: 'Female',
    type: 'Cat',
    status: 'Adopted',
    location: 'Miami, FL',
    images: ['https://example.com/luna.jpg'],
    description: 'Playful kitten, very social and curious.',
    adoptionFee: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// GET /api/manage-pets - Get all pets with optional filtering
router.get('/', (req, res) => {
  try {
    const { search, status } = req.query;
    
    let filteredPets = [...pets];
    
    // Filter by search query
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredPets = filteredPets.filter(pet => 
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower) ||
        pet.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by status
    if (status && status !== 'All') {
      filteredPets = filteredPets.filter(pet => pet.status === status);
    }
    
    res.status(200).json({
      success: true,
      data: {
        pets: filteredPets,
        totalCount: pets.length,
        filteredCount: filteredPets.length,
        statusCounts: {
          All: pets.length,
          Available: pets.filter(p => p.status === 'Available').length,
          Pending: pets.filter(p => p.status === 'Pending').length,
          Adopted: pets.filter(p => p.status === 'Adopted').length,
          'Medical Hold': pets.filter(p => p.status === 'Medical Hold').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets',
      error: error.message
    });
  }
});

// GET /api/manage-pets/:id - Get specific pet by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const pet = pets.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet',
      error: error.message
    });
  }
});

// POST /api/manage-pets - Add new pet
router.post('/', (req, res) => {
  try {
    const {
      name,
      breed,
      age,
      gender,
      type,
      status = 'Available',
      location,
      images = [],
      description,
      adoptionFee
    } = req.body;
    
    // Validation
    if (!name || !breed || !age || !gender || !type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, breed, age, gender, type, location'
      });
    }
    
    const newPet = {
      id: generateId(),
      name,
      breed,
      age,
      gender,
      type,
      status,
      location,
      images,
      description: description || '',
      adoptionFee: adoptionFee || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    pets.push(newPet);
    
    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: newPet
    });
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add pet',
      error: error.message
    });
  }
});

// PUT /api/manage-pets/:id - Update pet information
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const petIndex = pets.findIndex(p => p.id === id);
    
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    const {
      name,
      breed,
      age,
      gender,
      type,
      status,
      location,
      images,
      description,
      adoptionFee
    } = req.body;
    
    // Update pet with new data
    const updatedPet = {
      ...pets[petIndex],
      ...(name && { name }),
      ...(breed && { breed }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(type && { type }),
      ...(status && { status }),
      ...(location && { location }),
      ...(images && { images }),
      ...(description !== undefined && { description }),
      ...(adoptionFee !== undefined && { adoptionFee }),
      updatedAt: new Date().toISOString()
    };
    
    pets[petIndex] = updatedPet;
    
    res.status(200).json({
      success: true,
      message: 'Pet updated successfully',
      data: updatedPet
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet',
      error: error.message
    });
  }
});

// PUT /api/manage-pets/:id/status - Update pet status specifically
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const petIndex = pets.findIndex(p => p.id === id);
    
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Validate status
    const validStatuses = ['Available', 'Pending', 'Adopted', 'Medical Hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    pets[petIndex] = {
      ...pets[petIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: `Pet status updated to ${status}`,
      data: pets[petIndex]
    });
  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet status',
      error: error.message
    });
  }
});

// DELETE /api/manage-pets/:id - Delete pet
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const petIndex = pets.findIndex(p => p.id === id);
    
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    const deletedPet = pets[petIndex];
    pets.splice(petIndex, 1);
    
    res.status(200).json({
      success: true,
      message: `${deletedPet.name} has been removed successfully`,
      data: deletedPet
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error.message
    });
  }
});

// GET /api/manage-pets/stats/overview - Get statistics overview
router.get('/stats/overview', (req, res) => {
  try {
    const stats = {
      totalPets: pets.length,
      statusBreakdown: {
        Available: pets.filter(p => p.status === 'Available').length,
        Pending: pets.filter(p => p.status === 'Pending').length,
        Adopted: pets.filter(p => p.status === 'Adopted').length,
        'Medical Hold': pets.filter(p => p.status === 'Medical Hold').length
      },
      typeBreakdown: {
        Dogs: pets.filter(p => p.type.toLowerCase() === 'dog').length,
        Cats: pets.filter(p => p.type.toLowerCase() === 'cat').length,
        Other: pets.filter(p => !['dog', 'cat'].includes(p.type.toLowerCase())).length
      },
      recentlyAdded: pets
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          status: pet.status,
          createdAt: pet.createdAt
        }))
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// POST /api/manage-pets/bulk-update - Bulk update pet statuses
router.post('/bulk-update', (req, res) => {
  try {
    const { petIds, status } = req.body;
    
    if (!petIds || !Array.isArray(petIds) || petIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'petIds array is required'
      });
    }
    
    const validStatuses = ['Available', 'Pending', 'Adopted', 'Medical Hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    const updatedPets = [];
    const notFoundIds = [];
    
    petIds.forEach(id => {
      const petIndex = pets.findIndex(p => p.id === id);
      if (petIndex !== -1) {
        pets[petIndex] = {
          ...pets[petIndex],
          status,
          updatedAt: new Date().toISOString()
        };
        updatedPets.push(pets[petIndex]);
      } else {
        notFoundIds.push(id);
      }
    });
    
    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedPets.length} pets`,
      data: {
        updatedPets,
        notFoundIds,
        updatedCount: updatedPets.length,
        notFoundCount: notFoundIds.length
      }
    });
  } catch (error) {
    console.error('Error bulk updating pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update pets',
      error: error.message
    });
  }
});

module.exports = router;