const express = require('express');
const router = express.Router();

// In-memory storage for care entries (in production, use a database)
let careEntries = [
  {
    id: "ce-001",
    petId: "p-001",
    petName: "Buddy",
    type: "medical",
    title: "Vaccination",
    description: "Rabies and distemper boosters",
    date: "2025-06-05",
    createdAt: "2025-06-05T10:30:00Z",
    updatedAt: "2025-06-05T10:30:00Z"
  },
  {
    id: "ce-002",
    petId: "p-002", 
    petName: "Max",
    type: "grooming",
    title: "Nail Trimming",
    description: "Regular nail maintenance",
    date: "2025-06-20",
    createdAt: "2025-06-20T14:45:00Z",
    updatedAt: "2025-06-22T11:30:00Z"
  },
  {
    id: "ce-003",
    petId: "p-003",
    petName: "Luna",
    type: "feeding",
    title: "Diet Change",
    description: "Switched to grain-free food for better digestion",
    date: "2025-07-15",
    createdAt: "2025-07-15T09:20:00Z",
    updatedAt: "2025-07-15T09:20:00Z"
  },
  {
    id: "ce-004",
    petId: "p-001",
    petName: "Buddy",
    type: "exercise",
    title: "Daily Walk",
    description: "30-minute walk in the park, good energy level",
    date: "2025-08-10",
    createdAt: "2025-08-10T18:00:00Z",
    updatedAt: "2025-08-10T18:00:00Z"
  },
  {
    id: "ce-005",
    petId: "p-002",
    petName: "Max", 
    type: "vet_visit",
    title: "Annual Checkup",
    description: "Routine examination, all vitals normal, weight stable",
    date: "2025-09-01",
    createdAt: "2025-09-01T11:15:00Z",
    updatedAt: "2025-09-01T11:15:00Z"
  }
];

// Mock adopted pets data (in production, fetch from pets database)
const adoptedPets = [
  { id: "p-001", name: "Buddy", breed: "Golden Retriever", adopterId: "user-001" },
  { id: "p-002", name: "Max", breed: "German Shepherd", adopterId: "user-001" },
  { id: "p-003", name: "Luna", breed: "Border Collie", adopterId: "user-002" },
  { id: "p-004", name: "Rocky", breed: "Bulldog", adopterId: "user-001" }
];

// Valid care entry types
const validTypes = ["medical", "feeding", "grooming", "exercise", "training", "vet_visit", "general", "other"];

// Helper function to generate unique IDs
const generateId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ce-${timestamp}-${random}`;
};

// Helper function to validate care entry data
const validateCareEntry = (data) => {
  const errors = [];

  if (!data.petName || data.petName.trim() === '') {
    errors.push('Pet name is required');
  }

  if (!data.type || !validTypes.includes(data.type)) {
    errors.push('Valid entry type is required');
  }

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Description is required');
  }

  if (!data.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Valid date is required');
    }
  }

  return errors;
};

// GET /api/care-journal - Get all care entries for a user
router.get('/', (req, res) => {
  try {
    const { userId, petId, type, limit = 50, offset = 0, sortBy = 'date', sortOrder = 'desc' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);
    const userPetNames = userPets.map(pet => pet.name);

    // Filter entries for user's pets
    let filteredEntries = careEntries.filter(entry => 
      userPetNames.includes(entry.petName) || userPetIds.includes(entry.petId)
    );

    // Apply additional filters
    if (petId) {
      filteredEntries = filteredEntries.filter(entry => entry.petId === petId);
    }

    if (type && validTypes.includes(type)) {
      filteredEntries = filteredEntries.filter(entry => entry.type === type);
    }

    // Sort entries
    filteredEntries.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const total = filteredEntries.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      totalEntries: total,
      byType: {}
    };

    validTypes.forEach(type => {
      stats.byType[type] = filteredEntries.filter(entry => entry.type === type).length;
    });

    res.json({
      success: true,
      data: {
        entries: paginatedEntries,
        pagination: {
          total,
          offset: startIndex,
          limit: parseInt(limit),
          hasMore: endIndex < total
        },
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error fetching care entries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/care-journal/adopted-pets - Get adopted pets for a user
router.get('/adopted-pets', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);

    res.json({
      success: true,
      data: {
        pets: userPets
      }
    });

  } catch (error) {
    console.error('Error fetching adopted pets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/care-journal/:id - Get specific care entry
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const entry = careEntries.find(entry => entry.id === id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Care entry not found'
      });
    }

    // Check if user owns this pet
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetNames = userPets.map(pet => pet.name);
    const userPetIds = userPets.map(pet => pet.id);

    if (!userPetNames.includes(entry.petName) && !userPetIds.includes(entry.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your pet'
      });
    }

    res.json({
      success: true,
      data: {
        entry
      }
    });

  } catch (error) {
    console.error('Error fetching care entry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/care-journal - Create new care entry
router.post('/', (req, res) => {
  try {
    const { userId, petName, type, title, description, date } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate input data
    const validationErrors = validateCareEntry({ petName, type, title, description, date });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if user owns this pet
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPet = userPets.find(pet => pet.name === petName);

    if (!userPet) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - pet not found or not owned by user'
      });
    }

    // Create new care entry
    const newEntry = {
      id: generateId(),
      petId: userPet.id,
      petName: petName.trim(),
      type,
      title: title.trim(),
      description: description.trim(),
      date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    careEntries.push(newEntry);

    res.status(201).json({
      success: true,
      message: 'Care entry created successfully',
      data: {
        entry: newEntry
      }
    });

  } catch (error) {
    console.error('Error creating care entry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/care-journal/:id - Update care entry
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, petName, type, title, description, date } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const entryIndex = careEntries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Care entry not found'
      });
    }

    // Check if user owns this pet
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetNames = userPets.map(pet => pet.name);
    const userPetIds = userPets.map(pet => pet.id);

    const currentEntry = careEntries[entryIndex];
    if (!userPetNames.includes(currentEntry.petName) && !userPetIds.includes(currentEntry.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your pet'
      });
    }

    // Validate input data if provided
    const updateData = {};
    if (petName !== undefined) updateData.petName = petName;
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;

    if (Object.keys(updateData).length > 0) {
      const validationErrors = validateCareEntry({
        petName: updateData.petName || currentEntry.petName,
        type: updateData.type || currentEntry.type,
        title: updateData.title || currentEntry.title,
        description: updateData.description || currentEntry.description,
        date: updateData.date || currentEntry.date
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
    }

    // Update entry
    careEntries[entryIndex] = {
      ...currentEntry,
      ...updateData,
      petName: updateData.petName ? updateData.petName.trim() : currentEntry.petName,
      title: updateData.title ? updateData.title.trim() : currentEntry.title,
      description: updateData.description ? updateData.description.trim() : currentEntry.description,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Care entry updated successfully',
      data: {
        entry: careEntries[entryIndex]
      }
    });

  } catch (error) {
    console.error('Error updating care entry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/care-journal/:id - Delete care entry
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const entryIndex = careEntries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Care entry not found'
      });
    }

    // Check if user owns this pet
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetNames = userPets.map(pet => pet.name);
    const userPetIds = userPets.map(pet => pet.id);

    const entry = careEntries[entryIndex];
    if (!userPetNames.includes(entry.petName) && !userPetIds.includes(entry.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your pet'
      });
    }

    // Delete entry
    const deletedEntry = careEntries.splice(entryIndex, 1)[0];

    res.json({
      success: true,
      message: 'Care entry deleted successfully',
      data: {
        deletedEntry
      }
    });

  } catch (error) {
    console.error('Error deleting care entry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/care-journal/statistics/:userId - Get care statistics for a user
router.get('/statistics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { petId, startDate, endDate } = req.query;

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetNames = userPets.map(pet => pet.name);
    const userPetIds = userPets.map(pet => pet.id);

    // Filter entries for user's pets
    let filteredEntries = careEntries.filter(entry => 
      userPetNames.includes(entry.petName) || userPetIds.includes(entry.petId)
    );

    // Apply filters
    if (petId) {
      filteredEntries = filteredEntries.filter(entry => entry.petId === petId);
    }

    if (startDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) <= new Date(endDate)
      );
    }

    // Calculate statistics
    const stats = {
      totalEntries: filteredEntries.length,
      totalPets: userPets.length,
      byType: {},
      byPet: {},
      recentActivity: {
        thisWeek: 0,
        thisMonth: 0,
        last30Days: 0
      }
    };

    // Count by type
    validTypes.forEach(type => {
      stats.byType[type] = filteredEntries.filter(entry => entry.type === type).length;
    });

    // Count by pet
    userPets.forEach(pet => {
      stats.byPet[pet.name] = filteredEntries.filter(entry => 
        entry.petName === pet.name || entry.petId === pet.id
      ).length;
    });

    // Calculate recent activity
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    stats.recentActivity.thisWeek = filteredEntries.filter(entry => 
      new Date(entry.createdAt) >= oneWeekAgo
    ).length;

    stats.recentActivity.thisMonth = filteredEntries.filter(entry => 
      new Date(entry.createdAt) >= oneMonthAgo
    ).length;

    stats.recentActivity.last30Days = stats.recentActivity.thisMonth;

    res.json({
      success: true,
      data: {
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error fetching care statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/care-journal/bulk-delete - Delete multiple care entries
router.post('/bulk-delete', (req, res) => {
  try {
    const { userId, entryIds } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Entry IDs array is required'
      });
    }

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetNames = userPets.map(pet => pet.name);
    const userPetIds = userPets.map(pet => pet.id);

    const deletedEntries = [];
    const notFoundIds = [];
    const accessDeniedIds = [];

    entryIds.forEach(id => {
      const entryIndex = careEntries.findIndex(entry => entry.id === id);
      
      if (entryIndex === -1) {
        notFoundIds.push(id);
        return;
      }

      const entry = careEntries[entryIndex];
      
      // Check if user owns this pet
      if (!userPetNames.includes(entry.petName) && !userPetIds.includes(entry.petId)) {
        accessDeniedIds.push(id);
        return;
      }

      // Delete entry
      const deletedEntry = careEntries.splice(entryIndex, 1)[0];
      deletedEntries.push(deletedEntry);
    });

    res.json({
      success: true,
      message: `Successfully deleted ${deletedEntries.length} entries`,
      data: {
        deletedEntries,
        deletedCount: deletedEntries.length,
        notFound: notFoundIds,
        accessDenied: accessDeniedIds
      }
    });

  } catch (error) {
    console.error('Error bulk deleting care entries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/care-journal/types - Get valid care entry types
router.get('/config/types', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        types: validTypes.map(type => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching care types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
