const express = require('express');
const router = express.Router();

// In-memory storage for adoption history (in production, this would be a database)
let adoptionHistory = [
  {
    id: "1",
    petId: "pet-101",
    userId: "user-001",
    petName: "Buddy",
    petBreed: "Golden Retriever",
    petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop",
    applicationId: "app-101",
    applicationDate: "2024-05-15",
    adoptionDate: "2024-06-01",
    status: "adopted",
    notes: "Buddy has adjusted well to his new home. He loves his daily walks in the park.",
    shelterName: "Happy Paws Shelter",
    shelterContact: "contact@happypaws.org",
    shelterId: "shelter-001",
    createdAt: "2024-05-15T10:00:00.000Z",
    updatedAt: "2024-06-01T14:30:00.000Z",
    adoptionFee: 150,
    petAge: "3 years",
    petSize: "Large",
    microchipId: "MC001234567",
    vetRecords: {
      vaccinated: true,
      spayedNeutered: true,
      lastCheckup: "2024-05-20",
      nextCheckup: "2024-12-01"
    },
    careJournalId: "journal-001",
    reminderIds: ["reminder-001", "reminder-002"]
  },
  {
    id: "2",
    petId: "pet-102",
    userId: "user-001",
    petName: "Luna",
    petBreed: "Persian Cat",
    petImage: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&h=500&fit=crop",
    applicationId: "app-102",
    applicationDate: "2024-04-20",
    adoptionDate: "2024-05-10",
    status: "adopted",
    notes: "Luna is very quiet and loves to curl up on the sofa. She's getting along well with the kids.",
    shelterName: "Feline Friends Rescue",
    shelterContact: "info@felinefriends.org",
    shelterId: "shelter-002",
    createdAt: "2024-04-20T09:15:00.000Z",
    updatedAt: "2024-05-10T16:45:00.000Z",
    adoptionFee: 75,
    petAge: "2 years",
    petSize: "Medium",
    microchipId: "MC987654321",
    vetRecords: {
      vaccinated: true,
      spayedNeutered: true,
      lastCheckup: "2024-04-25",
      nextCheckup: "2024-11-25"
    },
    careJournalId: "journal-002",
    reminderIds: ["reminder-003", "reminder-004", "reminder-005"]
  },
  {
    id: "3",
    petId: "pet-103",
    userId: "user-001",
    petName: "Max",
    petBreed: "Beagle",
    petImage: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=500&h=500&fit=crop",
    applicationId: "app-103",
    applicationDate: "2024-06-10",
    status: "approved",
    notes: "Your application for Max has been approved. Ready for pickup on July 25th.",
    shelterName: "Second Chance Shelter",
    shelterContact: "adopt@secondchance.org",
    shelterId: "shelter-003",
    createdAt: "2024-06-10T11:20:00.000Z",
    updatedAt: "2024-06-15T13:00:00.000Z",
    adoptionFee: 125,
    petAge: "1.5 years",
    petSize: "Medium",
    microchipId: "MC456789123",
    vetRecords: {
      vaccinated: true,
      spayedNeutered: true,
      lastCheckup: "2024-06-05",
      nextCheckup: "2024-12-05"
    },
    estimatedPickupDate: "2024-07-25",
    approvalDate: "2024-06-15"
  },
  {
    id: "4",
    petId: "pet-104",
    userId: "user-001",
    petName: "Bella",
    petBreed: "Labrador Mix",
    petImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop",
    applicationId: "app-104",
    applicationDate: "2024-07-01",
    status: "pending",
    notes: "Application is currently under review. We will contact you within 5-7 business days.",
    shelterName: "City Animal Rescue",
    shelterContact: "applications@cityrescue.org",
    shelterId: "shelter-004",
    createdAt: "2024-07-01T14:30:00.000Z",
    updatedAt: "2024-07-01T14:30:00.000Z",
    adoptionFee: 100,
    petAge: "4 years",
    petSize: "Large",
    microchipId: "MC789123456",
    vetRecords: {
      vaccinated: true,
      spayedNeutered: true,
      lastCheckup: "2024-06-28",
      nextCheckup: "2024-12-28"
    }
  },
  // Additional sample data for other users
  {
    id: "5",
    petId: "pet-201",
    userId: "user-002",
    petName: "Charlie",
    petBreed: "Golden Retriever",
    petImage: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500&h=500&fit=crop",
    applicationId: "app-201",
    applicationDate: "2024-03-15",
    adoptionDate: "2024-04-01",
    status: "adopted",
    notes: "Charlie is doing great! He's very energetic and loves playing fetch.",
    shelterName: "Happy Paws Shelter",
    shelterContact: "contact@happypaws.org",
    shelterId: "shelter-001",
    createdAt: "2024-03-15T10:00:00.000Z",
    updatedAt: "2024-04-01T12:00:00.000Z",
    adoptionFee: 150,
    petAge: "2 years",
    petSize: "Large",
    microchipId: "MC111222333",
    vetRecords: {
      vaccinated: true,
      spayedNeutered: true,
      lastCheckup: "2024-03-20",
      nextCheckup: "2024-10-20"
    },
    careJournalId: "journal-003"
  }
];

// Counter for generating new IDs
let adoptionIdCounter = 6;

// Helper function to calculate days together
const calculateDaysTogether = (adoptionDate) => {
  if (!adoptionDate) return 0;
  return Math.floor((Date.now() - new Date(adoptionDate).getTime()) / (1000 * 60 * 60 * 24));
};

// Helper function to format dates for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to validate adoption data
const validateAdoptionData = (data) => {
  const required = ['petId', 'userId', 'petName', 'applicationId', 'applicationDate', 'status'];
  const validStatuses = ['pending', 'approved', 'adopted', 'rejected', 'cancelled'];
  
  for (const field of required) {
    if (!data[field]) {
      return { valid: false, error: `${field} is required` };
    }
  }
  
  if (!validStatuses.includes(data.status)) {
    return { valid: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }
  
  // Validate date format
  if (data.applicationDate && isNaN(Date.parse(data.applicationDate))) {
    return { valid: false, error: 'Invalid applicationDate format' };
  }
  
  if (data.adoptionDate && isNaN(Date.parse(data.adoptionDate))) {
    return { valid: false, error: 'Invalid adoptionDate format' };
  }
  
  return { valid: true };
};

// Helper function to calculate adoption statistics
const calculateAdoptionStats = (userHistory) => {
  const stats = {
    total: userHistory.length,
    adopted: userHistory.filter(h => h.status === 'adopted').length,
    approved: userHistory.filter(h => h.status === 'approved').length,
    pending: userHistory.filter(h => h.status === 'pending').length,
    rejected: userHistory.filter(h => h.status === 'rejected').length,
    cancelled: userHistory.filter(h => h.status === 'cancelled').length,
    totalDaysTogether: 0,
    averageDaysTogether: 0,
    totalAdoptionFees: 0,
    petTypes: {
      dogs: 0,
      cats: 0,
      others: 0
    },
    timeline: {
      thisMonth: 0,
      last3Months: 0,
      thisYear: 0
    }
  };
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  userHistory.forEach(adoption => {
    // Calculate days together for adopted pets
    if (adoption.status === 'adopted' && adoption.adoptionDate) {
      stats.totalDaysTogether += calculateDaysTogether(adoption.adoptionDate);
    }
    
    // Sum adoption fees
    if (adoption.adoptionFee) {
      stats.totalAdoptionFees += adoption.adoptionFee;
    }
    
    // Count pet types
    const breed = adoption.petBreed?.toLowerCase() || '';
    if (breed.includes('dog') || breed.includes('retriever') || breed.includes('beagle') || breed.includes('labrador')) {
      stats.petTypes.dogs++;
    } else if (breed.includes('cat') || breed.includes('persian') || breed.includes('siamese')) {
      stats.petTypes.cats++;
    } else {
      stats.petTypes.others++;
    }
    
    // Timeline statistics
    const applicationDate = new Date(adoption.applicationDate);
    if (applicationDate >= startOfMonth) {
      stats.timeline.thisMonth++;
    }
    if (applicationDate >= start3MonthsAgo) {
      stats.timeline.last3Months++;
    }
    if (applicationDate >= startOfYear) {
      stats.timeline.thisYear++;
    }
  });
  
  // Calculate average days together
  if (stats.adopted > 0) {
    stats.averageDaysTogether = Math.round(stats.totalDaysTogether / stats.adopted);
  }
  
  return stats;
};

// GET /api/adoption-history - Get adoption history for a user
router.get('/', (req, res) => {
  try {
    const { 
      userId, 
      status, 
      petType,
      shelterId,
      limit = 20, 
      offset = 0,
      sortBy = 'applicationDate',
      sortOrder = 'desc',
      includeStats = 'false'
    } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let userHistory = adoptionHistory.filter(adoption => 
      adoption.userId === userId
    );
    
    // Apply filters
    if (status) {
      userHistory = userHistory.filter(h => h.status === status);
    }
    
    if (petType) {
      userHistory = userHistory.filter(h => {
        const breed = h.petBreed?.toLowerCase() || '';
        if (petType === 'dog') {
          return breed.includes('dog') || breed.includes('retriever') || breed.includes('beagle') || breed.includes('labrador');
        } else if (petType === 'cat') {
          return breed.includes('cat') || breed.includes('persian') || breed.includes('siamese');
        }
        return true;
      });
    }
    
    if (shelterId) {
      userHistory = userHistory.filter(h => h.shelterId === shelterId);
    }
    
    // Sort adoption history
    userHistory.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'applicationDate' || sortBy === 'adoptionDate') {
        aValue = new Date(a[sortBy] || 0);
        bValue = new Date(b[sortBy] || 0);
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = userHistory.slice(startIndex, endIndex);
    
    // Format adoption entries with calculated fields
    const formattedHistory = paginatedHistory.map(adoption => ({
      ...adoption,
      applicationDateFormatted: formatDate(adoption.applicationDate),
      adoptionDateFormatted: adoption.adoptionDate ? formatDate(adoption.adoptionDate) : null,
      daysTogether: adoption.status === 'adopted' && adoption.adoptionDate ? 
        calculateDaysTogether(adoption.adoptionDate) : 0,
      statusDisplay: {
        adopted: "✅ Adopted",
        approved: "✅ Approved", 
        pending: "⏳ Pending",
        rejected: "❌ Rejected",
        cancelled: "🚫 Cancelled"
      }[adoption.status] || adoption.status
    }));
    
    const response = {
      success: true,
      data: {
        adoptionHistory: formattedHistory,
        pagination: {
          total: userHistory.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < userHistory.length
        }
      }
    };
    
    // Include statistics if requested
    if (includeStats === 'true') {
      response.data.statistics = calculateAdoptionStats(userHistory);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching adoption history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adoption history',
      error: error.message
    });
  }
});

// GET /api/adoption-history/:adoptionId - Get specific adoption record
router.get('/:adoptionId', (req, res) => {
  try {
    const { adoptionId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const adoption = adoptionHistory.find(h => 
      h.id === adoptionId && h.userId === userId
    );
    
    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }
    
    // Format adoption entry with calculated fields
    const formattedAdoption = {
      ...adoption,
      applicationDateFormatted: formatDate(adoption.applicationDate),
      adoptionDateFormatted: adoption.adoptionDate ? formatDate(adoption.adoptionDate) : null,
      daysTogether: adoption.status === 'adopted' && adoption.adoptionDate ? 
        calculateDaysTogether(adoption.adoptionDate) : 0,
      statusDisplay: {
        adopted: "✅ Adopted",
        approved: "✅ Approved", 
        pending: "⏳ Pending",
        rejected: "❌ Rejected",
        cancelled: "🚫 Cancelled"
      }[adoption.status] || adoption.status
    };
    
    res.json({
      success: true,
      data: {
        adoption: formattedAdoption
      }
    });
  } catch (error) {
    console.error('Error fetching adoption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adoption record',
      error: error.message
    });
  }
});

// POST /api/adoption-history - Create new adoption record
router.post('/', (req, res) => {
  try {
    const {
      petId,
      userId,
      petName,
      petBreed,
      petImage,
      applicationId,
      applicationDate,
      adoptionDate = null,
      status = 'pending',
      notes = '',
      shelterName,
      shelterContact,
      shelterId,
      adoptionFee = 0,
      petAge,
      petSize,
      microchipId,
      vetRecords = {}
    } = req.body;
    
    // Validate required fields
    const validation = validateAdoptionData({
      petId, userId, petName, applicationId, applicationDate, status
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    // Check if adoption record already exists for this pet and user
    const existingAdoption = adoptionHistory.find(h => 
      h.petId === petId && h.userId === userId
    );
    
    if (existingAdoption) {
      return res.status(409).json({
        success: false,
        message: 'Adoption record already exists for this pet and user',
        data: { existingAdoptionId: existingAdoption.id }
      });
    }
    
    const now = new Date().toISOString();
    
    // Create new adoption record
    const newAdoption = {
      id: (adoptionIdCounter++).toString(),
      petId,
      userId,
      petName,
      petBreed,
      petImage,
      applicationId,
      applicationDate,
      adoptionDate,
      status,
      notes,
      shelterName,
      shelterContact,
      shelterId,
      createdAt: now,
      updatedAt: now,
      adoptionFee,
      petAge,
      petSize,
      microchipId,
      vetRecords
    };
    
    // Add status-specific fields
    if (status === 'approved') {
      newAdoption.approvalDate = now;
    } else if (status === 'adopted' && !adoptionDate) {
      newAdoption.adoptionDate = now;
    }
    
    adoptionHistory.push(newAdoption);
    
    // Format response with calculated fields
    const formattedAdoption = {
      ...newAdoption,
      applicationDateFormatted: formatDate(newAdoption.applicationDate),
      adoptionDateFormatted: newAdoption.adoptionDate ? formatDate(newAdoption.adoptionDate) : null,
      daysTogether: newAdoption.status === 'adopted' && newAdoption.adoptionDate ? 
        calculateDaysTogether(newAdoption.adoptionDate) : 0,
      statusDisplay: {
        adopted: "✅ Adopted",
        approved: "✅ Approved", 
        pending: "⏳ Pending",
        rejected: "❌ Rejected",
        cancelled: "🚫 Cancelled"
      }[newAdoption.status] || newAdoption.status
    };
    
    res.status(201).json({
      success: true,
      message: 'Adoption record created successfully',
      data: {
        adoption: formattedAdoption
      }
    });
  } catch (error) {
    console.error('Error creating adoption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create adoption record',
      error: error.message
    });
  }
});

// PUT /api/adoption-history/:adoptionId - Update adoption record
router.put('/:adoptionId', (req, res) => {
  try {
    const { adoptionId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const adoptionIndex = adoptionHistory.findIndex(h => 
      h.id === adoptionId && h.userId === userId
    );
    
    if (adoptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }
    
    const currentAdoption = adoptionHistory[adoptionIndex];
    const now = new Date().toISOString();
    
    // Update adoption record with provided fields
    const updatedAdoption = {
      ...currentAdoption,
      ...req.body,
      id: adoptionId, // Preserve ID
      userId: currentAdoption.userId, // Preserve userId
      updatedAt: now
    };
    
    // Add status-specific updates
    if (req.body.status && req.body.status !== currentAdoption.status) {
      if (req.body.status === 'approved' && !updatedAdoption.approvalDate) {
        updatedAdoption.approvalDate = now;
      } else if (req.body.status === 'adopted' && !updatedAdoption.adoptionDate) {
        updatedAdoption.adoptionDate = now;
      }
    }
    
    // Validate updated data
    const validation = validateAdoptionData(updatedAdoption);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    adoptionHistory[adoptionIndex] = updatedAdoption;
    
    // Format response with calculated fields
    const formattedAdoption = {
      ...updatedAdoption,
      applicationDateFormatted: formatDate(updatedAdoption.applicationDate),
      adoptionDateFormatted: updatedAdoption.adoptionDate ? formatDate(updatedAdoption.adoptionDate) : null,
      daysTogether: updatedAdoption.status === 'adopted' && updatedAdoption.adoptionDate ? 
        calculateDaysTogether(updatedAdoption.adoptionDate) : 0,
      statusDisplay: {
        adopted: "✅ Adopted",
        approved: "✅ Approved", 
        pending: "⏳ Pending",
        rejected: "❌ Rejected",
        cancelled: "🚫 Cancelled"
      }[updatedAdoption.status] || updatedAdoption.status
    };
    
    res.json({
      success: true,
      message: 'Adoption record updated successfully',
      data: {
        adoption: formattedAdoption
      }
    });
  } catch (error) {
    console.error('Error updating adoption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update adoption record',
      error: error.message
    });
  }
});

// GET /api/adoption-history/stats/overview - Get adoption statistics
router.get('/stats/overview', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userHistory = adoptionHistory.filter(h => h.userId === userId);
    const statistics = calculateAdoptionStats(userHistory);
    
    res.json({
      success: true,
      data: {
        statistics: statistics,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching adoption statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adoption statistics',
      error: error.message
    });
  }
});

// DELETE /api/adoption-history/:adoptionId - Delete adoption record
router.delete('/:adoptionId', (req, res) => {
  try {
    const { adoptionId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const adoptionIndex = adoptionHistory.findIndex(h => 
      h.id === adoptionId && h.userId === userId
    );
    
    if (adoptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }
    
    const deletedAdoption = adoptionHistory.splice(adoptionIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Adoption record deleted successfully',
      data: {
        deletedAdoption: deletedAdoption
      }
    });
  } catch (error) {
    console.error('Error deleting adoption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete adoption record',
      error: error.message
    });
  }
});

// POST /api/adoption-history/:adoptionId/notes - Add or update notes
router.post('/:adoptionId/notes', (req, res) => {
  try {
    const { adoptionId } = req.params;
    const { userId, notes } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Notes content is required'
      });
    }
    
    const adoptionIndex = adoptionHistory.findIndex(h => 
      h.id === adoptionId && h.userId === userId
    );
    
    if (adoptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }
    
    // Update notes
    adoptionHistory[adoptionIndex].notes = notes;
    adoptionHistory[adoptionIndex].updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        adoption: adoptionHistory[adoptionIndex]
      }
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes',
      error: error.message
    });
  }
});

module.exports = router;
