const express = require('express');
const router = express.Router();

// In-memory storage for reminders (in production, use a database)
let reminders = [
  {
    id: "rem-001",
    title: "Vaccination Booster",
    description: "Annual rabies and distemper vaccination due",
    dueDate: "2025-10-15",
    completed: false,
    petId: "p-001",
    userId: "user-001",
    type: "vaccine",
    recurring: true,
    recurringInterval: "yearly",
    createdDate: "2025-08-15T09:00:00Z",
    completedDate: null
  },
  {
    id: "rem-002",
    title: "Grooming Appointment",
    description: "Monthly grooming session for coat maintenance",
    dueDate: "2025-09-25", 
    completed: false,
    petId: "p-002",
    userId: "user-001",
    type: "grooming",
    recurring: true,
    recurringInterval: "monthly",
    createdDate: "2025-08-25T14:30:00Z",
    completedDate: null
  },
  {
    id: "rem-003",
    title: "Heart Medication",
    description: "Daily heart medication - Enalapril 5mg",
    dueDate: "2025-09-22",
    completed: true,
    petId: "p-001", 
    userId: "user-001",
    type: "medication",
    recurring: true,
    recurringInterval: "daily",
    createdDate: "2025-09-20T08:00:00Z",
    completedDate: "2025-09-22T08:15:00Z"
  },
  {
    id: "rem-004",
    title: "Annual Checkup", 
    description: "Comprehensive health examination and blood work",
    dueDate: "2025-09-20",
    completed: false,
    petId: "p-002",
    userId: "user-001", 
    type: "checkup",
    recurring: true,
    recurringInterval: "yearly",
    createdDate: "2025-07-20T11:00:00Z",
    completedDate: null
  },
  {
    id: "rem-005",
    title: "Flea Prevention",
    description: "Monthly flea and tick prevention treatment",
    dueDate: "2025-09-18",
    completed: false,
    petId: "p-003",
    userId: "user-002",
    type: "medication", 
    recurring: true,
    recurringInterval: "monthly",
    createdDate: "2025-08-18T16:20:00Z",
    completedDate: null
  }
];

// Mock adopted pets data (in production, fetch from pets database)
const adoptedPets = [
  { id: "p-001", name: "Buddy", species: "Dog", adopterId: "user-001" },
  { id: "p-002", name: "Max", species: "Dog", adopterId: "user-001" },
  { id: "p-003", name: "Luna", species: "Cat", adopterId: "user-002" },
  { id: "p-004", name: "Rocky", species: "Dog", adopterId: "user-001" }
];

// Valid reminder types and recurring intervals
const validTypes = ["vaccine", "grooming", "checkup", "medication"];
const validIntervals = ["daily", "weekly", "monthly", "yearly"];

// Helper function to generate unique IDs
const generateId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `rem-${timestamp}-${random}`;
};

// Helper function to validate reminder data
const validateReminder = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.petId || data.petId.trim() === '') {
    errors.push('Pet ID is required');
  }

  if (!data.type || !validTypes.includes(data.type)) {
    errors.push('Valid reminder type is required (vaccine, grooming, checkup, medication)');
  }

  if (!data.dueDate) {
    errors.push('Due date is required');
  } else {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('Valid due date is required (YYYY-MM-DD format)');
    }
  }

  if (data.recurring && data.recurringInterval && !validIntervals.includes(data.recurringInterval)) {
    errors.push('Valid recurring interval is required (daily, weekly, monthly, yearly)');
  }

  return errors;
};

// Helper function to determine if a reminder is overdue
const isOverdue = (dueDate, completed = false) => {
  if (completed) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

// Helper function to get reminder status
const getReminderStatus = (reminder) => {
  if (reminder.completed) return 'completed';
  return isOverdue(reminder.dueDate) ? 'overdue' : 'upcoming';
};

// Helper function to calculate next due date for recurring reminders
const calculateNextDueDate = (currentDate, interval) => {
  const date = new Date(currentDate);
  
  switch (interval) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
};

// GET /api/reminders - Get all reminders for a user
router.get('/', (req, res) => {
  try {
    const { userId, filter = 'all', petId, type, limit = 50, offset = 0, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    // Filter reminders for user's pets
    let filteredReminders = reminders.filter(reminder => 
      reminder.userId === userId || userPetIds.includes(reminder.petId)
    );

    // Apply status filter
    if (filter && filter !== 'all') {
      filteredReminders = filteredReminders.filter(reminder => 
        getReminderStatus(reminder) === filter
      );
    }

    // Apply additional filters
    if (petId) {
      filteredReminders = filteredReminders.filter(reminder => reminder.petId === petId);
    }

    if (type && validTypes.includes(type)) {
      filteredReminders = filteredReminders.filter(reminder => reminder.type === type);
    }

    // Sort reminders
    filteredReminders.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'created':
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
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
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const total = filteredReminders.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReminders = filteredReminders.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: filteredReminders.length,
      completed: filteredReminders.filter(r => r.completed).length,
      overdue: filteredReminders.filter(r => isOverdue(r.dueDate, r.completed)).length,
      upcoming: filteredReminders.filter(r => !r.completed && !isOverdue(r.dueDate)).length,
      byType: {},
      byPet: {}
    };

    validTypes.forEach(type => {
      stats.byType[type] = filteredReminders.filter(r => r.type === type).length;
    });

    userPets.forEach(pet => {
      stats.byPet[pet.name] = filteredReminders.filter(r => r.petId === pet.id).length;
    });

    // Add pet names to reminders
    const remindersWithPetNames = paginatedReminders.map(reminder => ({
      ...reminder,
      petName: userPets.find(pet => pet.id === reminder.petId)?.name || 'Unknown Pet'
    }));

    res.json({
      success: true,
      data: {
        reminders: remindersWithPetNames,
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
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/reminders/adopted-pets - Get adopted pets for a user
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

// GET /api/reminders/:id - Get specific reminder
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

    const reminder = reminders.find(r => r.id === id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user owns this reminder
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    if (reminder.userId !== userId && !userPetIds.includes(reminder.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your reminder'
      });
    }

    // Add pet name
    const pet = userPets.find(p => p.id === reminder.petId);
    const reminderWithPetName = {
      ...reminder,
      petName: pet?.name || 'Unknown Pet'
    };

    res.json({
      success: true,
      data: {
        reminder: reminderWithPetName
      }
    });

  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/reminders - Create new reminder
router.post('/', (req, res) => {
  try {
    const { userId, petId, type, title, description = '', dueDate, recurring = false, recurringInterval } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate input data
    const validationErrors = validateReminder({ petId, type, title, description, dueDate, recurring, recurringInterval });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if user owns this pet
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPet = userPets.find(pet => pet.id === petId);

    if (!userPet) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - pet not found or not owned by user'
      });
    }

    // Create new reminder
    const newReminder = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      completed: false,
      petId,
      userId,
      type,
      recurring,
      recurringInterval: recurring ? (recurringInterval || 'weekly') : null,
      createdDate: new Date().toISOString(),
      completedDate: null
    };

    reminders.push(newReminder);

    // Add pet name for response
    const reminderWithPetName = {
      ...newReminder,
      petName: userPet.name
    };

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: {
        reminder: reminderWithPetName
      }
    });

  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/reminders/:id - Update reminder
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, description, dueDate, type, recurring, recurringInterval } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const reminderIndex = reminders.findIndex(r => r.id === id);

    if (reminderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const reminder = reminders[reminderIndex];

    // Check if user owns this reminder
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    if (reminder.userId !== userId && !userPetIds.includes(reminder.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your reminder'
      });
    }

    // Validate updated data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (type !== undefined) updateData.type = type;
    if (recurring !== undefined) updateData.recurring = recurring;
    if (recurringInterval !== undefined) updateData.recurringInterval = recurringInterval;

    if (Object.keys(updateData).length > 0) {
      const validationErrors = validateReminder({
        title: updateData.title || reminder.title,
        description: updateData.description || reminder.description,
        dueDate: updateData.dueDate || reminder.dueDate,
        type: updateData.type || reminder.type,
        petId: reminder.petId,
        recurring: updateData.recurring !== undefined ? updateData.recurring : reminder.recurring,
        recurringInterval: updateData.recurringInterval || reminder.recurringInterval
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
    }

    // Update reminder
    reminders[reminderIndex] = {
      ...reminder,
      ...updateData,
      title: updateData.title ? updateData.title.trim() : reminder.title,
      description: updateData.description !== undefined ? updateData.description.trim() : reminder.description,
      recurringInterval: updateData.recurring === false ? null : (updateData.recurringInterval || reminder.recurringInterval)
    };

    // Add pet name
    const pet = userPets.find(p => p.id === reminder.petId);
    const updatedReminderWithPetName = {
      ...reminders[reminderIndex],
      petName: pet?.name || 'Unknown Pet'
    };

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: {
        reminder: updatedReminderWithPetName
      }
    });

  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/reminders/:id/complete - Toggle reminder completion status
router.put('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, completed } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const reminderIndex = reminders.findIndex(r => r.id === id);

    if (reminderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const reminder = reminders[reminderIndex];

    // Check if user owns this reminder
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    if (reminder.userId !== userId && !userPetIds.includes(reminder.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your reminder'
      });
    }

    const isCompleting = completed !== undefined ? completed : !reminder.completed;
    
    // Update completion status
    reminders[reminderIndex] = {
      ...reminder,
      completed: isCompleting,
      completedDate: isCompleting ? new Date().toISOString() : null
    };

    // If recurring and completing, create next reminder
    let nextReminder = null;
    if (isCompleting && reminder.recurring && reminder.recurringInterval) {
      const nextDueDate = calculateNextDueDate(reminder.dueDate, reminder.recurringInterval);
      
      nextReminder = {
        id: generateId(),
        title: reminder.title,
        description: reminder.description,
        dueDate: nextDueDate,
        completed: false,
        petId: reminder.petId,
        userId: reminder.userId,
        type: reminder.type,
        recurring: reminder.recurring,
        recurringInterval: reminder.recurringInterval,
        createdDate: new Date().toISOString(),
        completedDate: null
      };

      reminders.push(nextReminder);
    }

    // Add pet names
    const pet = userPets.find(p => p.id === reminder.petId);
    const updatedReminderWithPetName = {
      ...reminders[reminderIndex],
      petName: pet?.name || 'Unknown Pet'
    };

    const response = {
      success: true,
      message: `Reminder ${isCompleting ? 'completed' : 'marked as incomplete'} successfully`,
      data: {
        reminder: updatedReminderWithPetName
      }
    };

    if (nextReminder) {
      response.data.nextReminder = {
        ...nextReminder,
        petName: pet?.name || 'Unknown Pet'
      };
      response.message += ' and next reminder created';
    }

    res.json(response);

  } catch (error) {
    console.error('Error updating reminder completion:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/reminders/:id - Delete reminder
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

    const reminderIndex = reminders.findIndex(r => r.id === id);

    if (reminderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const reminder = reminders[reminderIndex];

    // Check if user owns this reminder
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    if (reminder.userId !== userId && !userPetIds.includes(reminder.petId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your reminder'
      });
    }

    // Delete reminder
    const deletedReminder = reminders.splice(reminderIndex, 1)[0];

    // Add pet name
    const pet = userPets.find(p => p.id === deletedReminder.petId);
    const deletedReminderWithPetName = {
      ...deletedReminder,
      petName: pet?.name || 'Unknown Pet'
    };

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
      data: {
        deletedReminder: deletedReminderWithPetName
      }
    });

  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/reminders/statistics/:userId - Get reminder statistics
router.get('/statistics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    // Filter reminders for user
    let userReminders = reminders.filter(reminder => 
      reminder.userId === userId || userPetIds.includes(reminder.petId)
    );

    // Apply date filters if provided
    if (startDate) {
      userReminders = userReminders.filter(reminder => 
        new Date(reminder.createdDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      userReminders = userReminders.filter(reminder => 
        new Date(reminder.createdDate) <= new Date(endDate)
      );
    }

    // Calculate comprehensive statistics
    const stats = {
      total: userReminders.length,
      completed: userReminders.filter(r => r.completed).length,
      overdue: userReminders.filter(r => isOverdue(r.dueDate, r.completed)).length,
      upcoming: userReminders.filter(r => !r.completed && !isOverdue(r.dueDate)).length,
      recurring: userReminders.filter(r => r.recurring).length,
      byType: {},
      byPet: {},
      recentActivity: {
        thisWeek: 0,
        thisMonth: 0,
        completedThisWeek: 0,
        completedThisMonth: 0
      }
    };

    // Count by type
    validTypes.forEach(type => {
      stats.byType[type] = userReminders.filter(r => r.type === type).length;
    });

    // Count by pet
    userPets.forEach(pet => {
      stats.byPet[pet.name] = userReminders.filter(r => r.petId === pet.id).length;
    });

    // Calculate recent activity
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    stats.recentActivity.thisWeek = userReminders.filter(r => 
      new Date(r.createdDate) >= oneWeekAgo
    ).length;

    stats.recentActivity.thisMonth = userReminders.filter(r => 
      new Date(r.createdDate) >= oneMonthAgo
    ).length;

    stats.recentActivity.completedThisWeek = userReminders.filter(r => 
      r.completed && r.completedDate && new Date(r.completedDate) >= oneWeekAgo
    ).length;

    stats.recentActivity.completedThisMonth = userReminders.filter(r => 
      r.completed && r.completedDate && new Date(r.completedDate) >= oneMonthAgo
    ).length;

    res.json({
      success: true,
      data: {
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error fetching reminder statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/reminders/bulk-complete - Complete multiple reminders
router.post('/bulk-complete', (req, res) => {
  try {
    const { userId, reminderIds, completed = true } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!reminderIds || !Array.isArray(reminderIds) || reminderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reminder IDs array is required'
      });
    }

    // Get user's adopted pets
    const userPets = adoptedPets.filter(pet => pet.adopterId === userId);
    const userPetIds = userPets.map(pet => pet.id);

    const updatedReminders = [];
    const nextReminders = [];
    const notFoundIds = [];
    const accessDeniedIds = [];

    reminderIds.forEach(id => {
      const reminderIndex = reminders.findIndex(r => r.id === id);
      
      if (reminderIndex === -1) {
        notFoundIds.push(id);
        return;
      }

      const reminder = reminders[reminderIndex];
      
      // Check if user owns this reminder
      if (reminder.userId !== userId && !userPetIds.includes(reminder.petId)) {
        accessDeniedIds.push(id);
        return;
      }

      // Update completion status
      reminders[reminderIndex] = {
        ...reminder,
        completed,
        completedDate: completed ? new Date().toISOString() : null
      };

      updatedReminders.push(reminders[reminderIndex]);

      // If recurring and completing, create next reminder
      if (completed && reminder.recurring && reminder.recurringInterval) {
        const nextDueDate = calculateNextDueDate(reminder.dueDate, reminder.recurringInterval);
        
        const nextReminder = {
          id: generateId(),
          title: reminder.title,
          description: reminder.description,
          dueDate: nextDueDate,
          completed: false,
          petId: reminder.petId,
          userId: reminder.userId,
          type: reminder.type,
          recurring: reminder.recurring,
          recurringInterval: reminder.recurringInterval,
          createdDate: new Date().toISOString(),
          completedDate: null
        };

        reminders.push(nextReminder);
        nextReminders.push(nextReminder);
      }
    });

    res.json({
      success: true,
      message: `Successfully ${completed ? 'completed' : 'marked as incomplete'} ${updatedReminders.length} reminders`,
      data: {
        updatedReminders,
        nextReminders,
        updatedCount: updatedReminders.length,
        nextReminderCount: nextReminders.length,
        notFound: notFoundIds,
        accessDenied: accessDeniedIds
      }
    });

  } catch (error) {
    console.error('Error bulk completing reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/reminders/config - Get reminder configuration (types, intervals)
router.get('/config/options', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        types: validTypes.map(type => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1)
        })),
        intervals: validIntervals.map(interval => ({
          value: interval,
          label: interval.charAt(0).toUpperCase() + interval.slice(1)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching reminder config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
