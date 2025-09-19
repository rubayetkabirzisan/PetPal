const express = require('express');
const router = express.Router();

// Mock data - In a real app, this would come from a database
const mockPets = [
  {
    id: 'pet-001',
    name: 'Buddy',
    breed: 'Golden Retriever',
    type: 'dog',
    age: '2 years',
    size: 'Large',
    location: 'Downtown Animal Shelter',
    distance: '2.3 miles away',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
    vaccinated: true,
    neutered: true,
    adoptionFee: 150,
    status: 'Available'
  },
  {
    id: 'pet-002',
    name: 'Whiskers',
    breed: 'Persian',
    type: 'cat',
    age: '1 year',
    size: 'Small',
    location: 'City Cat Rescue',
    distance: '1.8 miles away',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
    vaccinated: true,
    neutered: false,
    adoptionFee: 100,
    status: 'Available'
  },
  {
    id: 'pet-003',
    name: 'Max',
    breed: 'Labrador Mix',
    type: 'dog',
    age: '3 years',
    size: 'Large',
    location: 'Happy Tails Shelter',
    distance: '4.2 miles away',
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'],
    vaccinated: true,
    neutered: true,
    adoptionFee: 125,
    status: 'Available'
  }
];

const mockApplications = [
  {
    id: 'app-001',
    petId: 'pet-001',
    petName: 'Buddy',
    status: 'pending',
    submittedAt: '2025-01-15T10:30:00Z',
    scheduledVisit: '2025-01-20T14:00:00Z'
  },
  {
    id: 'app-002',
    petId: 'pet-002',
    petName: 'Whiskers',
    status: 'approved',
    submittedAt: '2025-01-10T09:15:00Z',
    scheduledVisit: '2025-01-18T11:00:00Z'
  },
  {
    id: 'app-003',
    petId: 'pet-003',
    petName: 'Max',
    status: 'under_review',
    submittedAt: '2025-01-12T16:45:00Z',
    scheduledVisit: null
  }
];

const mockMessages = [
  {
    id: 'msg-001',
    senderId: 'admin-001',
    senderName: 'Sarah Johnson',
    senderRole: 'shelter_admin',
    content: 'Thank you for your interest in Buddy! We\'d love to schedule a meet and greet.',
    timestamp: '2025-01-15T11:30:00Z',
    petId: 'pet-001',
    read: false
  },
  {
    id: 'msg-002',
    senderId: 'admin-002',
    senderName: 'Mike Davis',
    senderRole: 'volunteer',
    content: 'Your application for Whiskers has been approved! Please check your email for next steps.',
    timestamp: '2025-01-14T14:20:00Z',
    petId: 'pet-002',
    read: true
  },
  {
    id: 'msg-003',
    senderId: 'admin-001',
    senderName: 'Sarah Johnson',
    senderRole: 'shelter_admin',
    content: 'We have some questions about your living situation. Could you give us a call?',
    timestamp: '2025-01-13T09:15:00Z',
    petId: 'pet-003',
    read: false
  },
  {
    id: 'msg-004',
    senderId: 'system',
    senderName: 'PetPal System',
    senderRole: 'system',
    content: 'Reminder: Your scheduled visit with Max is tomorrow at 2:00 PM.',
    timestamp: '2025-01-12T18:00:00Z',
    petId: 'pet-003',
    read: false
  },
  {
    id: 'msg-005',
    senderId: 'admin-003',
    senderName: 'Lisa Chen',
    senderRole: 'vet',
    content: 'Buddy just received his updated vaccinations and is ready for adoption!',
    timestamp: '2025-01-11T16:30:00Z',
    petId: 'pet-001',
    read: true
  }
];

const mockAdoptedPets = [
  {
    id: 'adopted-001',
    name: 'Charlie',
    breed: 'Beagle',
    type: 'dog',
    adoptedAt: '2024-12-15T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400'
  },
  {
    id: 'adopted-002',
    name: 'Luna',
    breed: 'Siamese',
    type: 'cat',
    adoptedAt: '2024-11-20T15:30:00Z',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'
  }
];

const mockReminders = [
  {
    id: 'reminder-001',
    title: 'Vet Appointment',
    description: 'Charlie\'s annual checkup',
    dueDate: '2025-01-25T09:00:00Z',
    petId: 'adopted-001',
    completed: false,
    type: 'medical'
  },
  {
    id: 'reminder-002',
    title: 'Grooming Session',
    description: 'Luna needs nail trimming',
    dueDate: '2025-01-22T14:00:00Z',
    petId: 'adopted-002',
    completed: false,
    type: 'grooming'
  },
  {
    id: 'reminder-003',
    title: 'Vaccination Booster',
    description: 'Charlie needs rabies booster',
    dueDate: '2025-02-01T10:00:00Z',
    petId: 'adopted-001',
    completed: false,
    type: 'medical'
  },
  {
    id: 'reminder-004',
    title: 'Training Session',
    description: 'Weekly obedience training',
    dueDate: '2025-01-20T16:00:00Z',
    petId: 'adopted-001',
    completed: true,
    type: 'training'
  }
];

const mockCareJournalEntries = [
  {
    id: 'ce-001',
    petName: 'Buddy',
    petId: 'pet-001',
    type: 'medical',
    title: 'Vaccination',
    description: 'Rabies and distemper boosters administered. Pet showed no adverse reactions.',
    date: '2025-01-05T14:30:00Z',
    createdBy: 'vet-001',
    createdByName: 'Dr. Emily Rodriguez'
  },
  {
    id: 'ce-002',
    petName: 'Max',
    petId: 'pet-003',
    type: 'grooming',
    title: 'Nail Trimming',
    description: 'Regular nail maintenance completed. Nails were slightly overgrown but trimmed safely.',
    date: '2025-01-20T11:15:00Z',
    createdBy: 'groomer-001',
    createdByName: 'Tom Wilson'
  },
  {
    id: 'ce-003',
    petName: 'Charlie',
    petId: 'adopted-001',
    type: 'feeding',
    title: 'Diet Change',
    description: 'Switched to new premium food brand due to sensitive stomach issues.',
    date: '2025-01-18T08:00:00Z',
    createdBy: 'adopter-001',
    createdByName: 'Current Owner'
  },
  {
    id: 'ce-004',
    petName: 'Whiskers',
    petId: 'pet-002',
    type: 'vet_visit',
    title: 'Health Checkup',
    description: 'Annual wellness exam completed. All vitals normal, weight within healthy range.',
    date: '2025-01-16T13:45:00Z',
    createdBy: 'vet-002',
    createdByName: 'Dr. Sarah Kim'
  }
];

const mockGPSAlerts = [
  {
    id: 'gps-001',
    petId: 'adopted-001',
    petName: 'Charlie',
    alertType: 'safe_zone_exit',
    message: 'Charlie has left the designated safe zone',
    timestamp: '2025-01-19T15:30:00Z',
    location: { lat: 40.7128, lng: -74.0060 },
    resolved: false
  },
  {
    id: 'gps-002',
    petId: 'adopted-002',
    petName: 'Luna',
    alertType: 'low_battery',
    message: 'GPS collar battery is low (15% remaining)',
    timestamp: '2025-01-19T12:15:00Z',
    location: { lat: 40.7589, lng: -73.9851 },
    resolved: false
  },
  {
    id: 'gps-003',
    petId: 'adopted-001',
    petName: 'Charlie',
    alertType: 'rapid_movement',
    message: 'Unusual rapid movement detected',
    timestamp: '2025-01-18T18:45:00Z',
    location: { lat: 40.7505, lng: -73.9934 },
    resolved: true
  }
];

// GET /api/adopter/dashboard - Get dashboard overview data
router.get('/dashboard', async (req, res) => {
  try {
    const adopterId = req.user?.id; // Assuming user auth middleware provides this

    // Get available pets
    const availablePets = mockPets.filter(pet => pet.status === 'Available');
    
    // Get adopter's applications
    const applications = mockApplications;
    
    // Get unread messages count
    const unreadMessages = mockMessages.filter(msg => !msg.read);
    
    // Get adopted pets for this adopter
    const adoptedPets = mockAdoptedPets;
    
    // Get pending reminders
    const pendingReminders = mockReminders.filter(reminder => !reminder.completed);
    
    // Get recent care journal entries
    const recentCareEntries = mockCareJournalEntries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Get GPS alerts
    const activeGPSAlerts = mockGPSAlerts.filter(alert => !alert.resolved);

    const dashboardData = {
      quickStats: {
        applicationsCount: applications.length,
        unreadMessagesCount: unreadMessages.length,
        adoptedPetsCount: adoptedPets.length,
        pendingRemindersCount: pendingReminders.length,
        gpsAlertsCount: activeGPSAlerts.length
      },
      pets: availablePets,
      recentCareEntries,
      gpsAlerts: activeGPSAlerts
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// GET /api/adopter/pets - Get available pets with filtering
router.get('/pets', async (req, res) => {
  try {
    const { search, filter, limit = 20, offset = 0 } = req.query;
    
    let filteredPets = mockPets.filter(pet => pet.status === 'Available');
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPets = filteredPets.filter(pet => 
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower) ||
        pet.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filter && filter !== 'all') {
      switch (filter) {
        case 'dog':
          filteredPets = filteredPets.filter(pet => pet.type.toLowerCase() === 'dog');
          break;
        case 'cat':
          filteredPets = filteredPets.filter(pet => pet.type.toLowerCase() === 'cat');
          break;
        case 'small':
          filteredPets = filteredPets.filter(pet => pet.size === 'Small');
          break;
        case 'young':
          filteredPets = filteredPets.filter(pet => 
            pet.age.includes('1') || pet.age.includes('2')
          );
          break;
      }
    }
    
    // Apply pagination
    const total = filteredPets.length;
    const paginatedPets = filteredPets.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        pets: paginatedPets,
        total,
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Pets fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets',
      error: error.message
    });
  }
});

// GET /api/adopter/applications - Get adopter's applications
router.get('/applications', async (req, res) => {
  try {
    const applications = mockApplications.map(app => ({
      ...app,
      pet: mockPets.find(pet => pet.id === app.petId)
    }));
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/adopter/messages - Get adopter's messages
router.get('/messages', async (req, res) => {
  try {
    const { unread_only = false } = req.query;
    
    let messages = mockMessages;
    if (unread_only === 'true') {
      messages = messages.filter(msg => !msg.read);
    }
    
    // Sort by timestamp, newest first
    messages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// GET /api/adopter/adopted-pets - Get adopter's adopted pets
router.get('/adopted-pets', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAdoptedPets
    });
  } catch (error) {
    console.error('Adopted pets fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adopted pets',
      error: error.message
    });
  }
});

// GET /api/adopter/reminders - Get adopter's reminders
router.get('/reminders', async (req, res) => {
  try {
    const { pending_only = false } = req.query;
    
    let reminders = mockReminders;
    if (pending_only === 'true') {
      reminders = reminders.filter(reminder => !reminder.completed);
    }
    
    // Sort by due date
    reminders = reminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Reminders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders',
      error: error.message
    });
  }
});

// GET /api/adopter/care-journal - Get care journal entries
router.get('/care-journal', async (req, res) => {
  try {
    const { pet_id, limit = 10 } = req.query;
    
    let entries = mockCareJournalEntries;
    
    if (pet_id) {
      entries = entries.filter(entry => entry.petId === pet_id);
    }
    
    // Sort by date, newest first
    entries = entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Care journal fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch care journal entries',
      error: error.message
    });
  }
});

// POST /api/adopter/care-journal - Add new care journal entry
router.post('/care-journal', async (req, res) => {
  try {
    const { petId, petName, type, title, description } = req.body;
    
    if (!petId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID, type, and title are required'
      });
    }
    
    const newEntry = {
      id: `ce-${Date.now()}`,
      petId,
      petName,
      type,
      title,
      description: description || '',
      date: new Date().toISOString(),
      createdBy: req.user?.id || 'adopter-unknown',
      createdByName: req.user?.name || 'Adopter'
    };
    
    mockCareJournalEntries.push(newEntry);
    
    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error) {
    console.error('Care journal create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create care journal entry',
      error: error.message
    });
  }
});

// GET /api/adopter/gps-alerts - Get GPS alerts
router.get('/gps-alerts', async (req, res) => {
  try {
    const { resolved = false } = req.query;
    
    let alerts = mockGPSAlerts;
    if (resolved === 'false') {
      alerts = alerts.filter(alert => !alert.resolved);
    }
    
    // Sort by timestamp, newest first
    alerts = alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('GPS alerts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GPS alerts',
      error: error.message
    });
  }
});

// POST /api/adopter/favorites/:petId - Toggle pet as favorite
router.post('/favorites/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const adopterId = req.user?.id;
    
    if (!adopterId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // In a real app, this would update the database
    // For now, just return success with mock data
    const isFavorite = Math.random() > 0.5; // Mock toggle
    
    res.json({
      success: true,
      data: {
        petId,
        isFavorite,
        message: isFavorite ? 'Added to favorites' : 'Removed from favorites'
      }
    });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
});

// GET /api/adopter/favorites - Get adopter's favorite pets
router.get('/favorites', async (req, res) => {
  try {
    // Mock favorite pet IDs for demonstration
    const favoritePetIds = ['pet-001', 'pet-002'];
    const favoritePets = mockPets.filter(pet => 
      favoritePetIds.includes(pet.id)
    );
    
    res.json({
      success: true,
      data: favoritePets
    });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite pets',
      error: error.message
    });
  }
});

module.exports = router;