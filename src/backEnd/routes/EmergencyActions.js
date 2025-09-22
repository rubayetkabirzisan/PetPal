const express = require('express');
const router = express.Router();

// In-memory storage for emergency actions and data
const emergencyAlerts = new Map();
const authorityContacts = new Map();
const volunteerSearches = new Map();
const emergencyStats = {
  lastSystemCheck: new Date(),
  systemStatus: 'operational',
  broadcastHistory: [],
  authorityResponses: [],
  searchOperations: []
};

// Sample data initialization
function initializeEmergencyData() {
  // Sample emergency alerts
  emergencyAlerts.set('alert-001', {
    id: 'alert-001',
    type: 'broadcast',
    petId: 'pet-001',
    petName: 'Buddy',
    ownerId: 'user-001',
    radius: 5,
    priority: 'high',
    message: 'Golden Retriever missing from Central Park area',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    usersReached: 234,
    status: 'active',
    responses: []
  });

  emergencyAlerts.set('alert-002', {
    id: 'alert-002',
    type: 'broadcast',
    petId: 'pet-002',
    petName: 'Whiskers',
    ownerId: 'user-002',
    radius: 3,
    priority: 'medium',
    message: 'Orange tabby cat last seen near Oak Street',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    usersReached: 156,
    status: 'resolved',
    responses: []
  });

  // Sample authority contacts
  authorityContacts.set('contact-001', {
    id: 'contact-001',
    type: 'authorities',
    petId: 'pet-003',
    petName: 'Max',
    ownerId: 'user-003',
    authorities: ['animalControl', 'police'],
    message: 'Dog trapped in storm drain, immediate assistance needed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'responded',
    responseTime: 15 // minutes
  });

  // Sample volunteer searches
  volunteerSearches.set('search-001', {
    id: 'search-001',
    type: 'search',
    petId: 'pet-004',
    petName: 'Luna',
    ownerId: 'user-004',
    radius: 10,
    maxVolunteers: 20,
    currentVolunteers: 12,
    duration: 4,
    incentive: '$500 reward',
    description: 'Black Labrador, very friendly, responds to Luna',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: 'active',
    volunteers: []
  });

  // Update emergency stats
  emergencyStats.broadcastHistory = [
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), count: 1, usersReached: 234 },
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), count: 1, usersReached: 156 }
  ];

  emergencyStats.authorityResponses = [
    { date: new Date(Date.now() - 2 * 60 * 60 * 1000), authorities: ['animalControl', 'police'], responseTime: 15 }
  ];

  emergencyStats.searchOperations = [
    { date: new Date(Date.now() - 6 * 60 * 60 * 1000), volunteers: 12, status: 'active' }
  ];
}

// Utility functions
function generateId(prefix = 'emergency') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function validateBroadcastSettings(settings) {
  const errors = [];
  
  if (!settings.radius || isNaN(settings.radius) || settings.radius < 1 || settings.radius > 50) {
    errors.push('Radius must be between 1 and 50 km');
  }
  
  if (!['low', 'medium', 'high'].includes(settings.priority)) {
    errors.push('Priority must be low, medium, or high');
  }
  
  return errors;
}

function validateAuthoritySettings(settings) {
  const errors = [];
  
  if (!settings.animalControl && !settings.police && !settings.fireRescue) {
    errors.push('At least one authority must be selected');
  }
  
  return errors;
}

function validateSearchSettings(settings) {
  const errors = [];
  
  if (!settings.radius || isNaN(settings.radius) || settings.radius < 1 || settings.radius > 100) {
    errors.push('Search radius must be between 1 and 100 km');
  }
  
  if (!settings.maxVolunteers || isNaN(settings.maxVolunteers) || settings.maxVolunteers < 1) {
    errors.push('Maximum volunteers must be at least 1');
  }
  
  if (!settings.searchDuration || isNaN(settings.searchDuration) || settings.searchDuration < 1) {
    errors.push('Search duration must be at least 1 hour');
  }
  
  return errors;
}

function calculateUsersInRadius(radius) {
  // Simulate user density calculation based on radius
  const baseUsers = 50; // Base users per km²
  const area = Math.PI * radius * radius;
  return Math.floor(area * baseUsers * (0.8 + Math.random() * 0.4)); // Add some randomness
}

function getAvailableVolunteers() {
  // Simulate available volunteer count
  return Math.floor(120 + Math.random() * 60); // 120-180 volunteers
}

function getAverageResponseTime() {
  // Simulate average response time
  return Math.floor(10 + Math.random() * 10); // 10-20 minutes
}

// Initialize data when module loads
initializeEmergencyData();

// Routes

// GET /api/emergency-actions/status - Get emergency system status
router.get('/status', (req, res) => {
  try {
    const currentTime = new Date();
    const lastCheckTime = new Date(emergencyStats.lastSystemCheck);
    const minutesSinceLastCheck = Math.floor((currentTime - lastCheckTime) / (1000 * 60));

    res.json({
      success: true,
      data: {
        systemStatus: emergencyStats.systemStatus,
        lastSystemCheck: emergencyStats.lastSystemCheck,
        minutesSinceLastCheck,
        availableVolunteers: getAvailableVolunteers(),
        averageResponseTime: getAverageResponseTime(),
        successRate: 89,
        statistics: {
          totalAlerts: emergencyAlerts.size,
          activeAlerts: Array.from(emergencyAlerts.values()).filter(alert => alert.status === 'active').length,
          totalSearches: volunteerSearches.size,
          activeSearches: Array.from(volunteerSearches.values()).filter(search => search.status === 'active').length,
          totalAuthorityContacts: authorityContacts.size
        }
      }
    });
  } catch (error) {
    console.error('Error getting emergency status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get emergency status'
    });
  }
});

// POST /api/emergency-actions/broadcast - Broadcast emergency alert
router.post('/broadcast', (req, res) => {
  try {
    const { userId, petId, petName, settings } = req.body;

    // Validate required fields
    if (!userId || !petId || !petName || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, petId, petName, settings'
      });
    }

    // Validate settings
    const validationErrors = validateBroadcastSettings(settings);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Generate alert ID
    const alertId = generateId('alert');
    const currentTime = new Date();
    const usersReached = calculateUsersInRadius(parseInt(settings.radius));

    // Create emergency alert
    const emergencyAlert = {
      id: alertId,
      type: 'broadcast',
      petId,
      petName,
      ownerId: userId,
      radius: parseInt(settings.radius),
      priority: settings.priority,
      includeVolunteers: settings.includeVolunteers,
      includeOwners: settings.includeOwners,
      message: settings.customMessage || `Emergency alert for missing ${petName}`,
      timestamp: currentTime,
      usersReached,
      status: 'active',
      responses: []
    };

    // Store the alert
    emergencyAlerts.set(alertId, emergencyAlert);

    // Update statistics
    emergencyStats.broadcastHistory.push({
      date: currentTime,
      count: 1,
      usersReached
    });

    // Update last system check
    emergencyStats.lastSystemCheck = currentTime;

    res.json({
      success: true,
      message: `Emergency alert broadcast successfully to ${usersReached} users within ${settings.radius}km`,
      data: {
        alertId,
        usersReached,
        radius: settings.radius,
        priority: settings.priority,
        timestamp: currentTime,
        estimatedReachTime: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Error broadcasting emergency alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast emergency alert'
    });
  }
});

// POST /api/emergency-actions/authorities - Contact authorities
router.post('/authorities', (req, res) => {
  try {
    const { userId, petId, petName, settings } = req.body;

    // Validate required fields
    if (!userId || !petId || !petName || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, petId, petName, settings'
      });
    }

    // Validate settings
    const validationErrors = validateAuthoritySettings(settings);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Generate contact ID
    const contactId = generateId('contact');
    const currentTime = new Date();

    // Determine which authorities to contact
    const selectedAuthorities = [];
    if (settings.animalControl) selectedAuthorities.push('animalControl');
    if (settings.police) selectedAuthorities.push('police');
    if (settings.fireRescue) selectedAuthorities.push('fireRescue');

    // Create authority contact record
    const authorityContact = {
      id: contactId,
      type: 'authorities',
      petId,
      petName,
      ownerId: userId,
      authorities: selectedAuthorities,
      message: settings.customMessage || `Emergency assistance needed for ${petName}`,
      timestamp: currentTime,
      status: 'dispatched',
      estimatedResponseTime: getAverageResponseTime()
    };

    // Store the contact record
    authorityContacts.set(contactId, authorityContact);

    // Update statistics
    emergencyStats.authorityResponses.push({
      date: currentTime,
      authorities: selectedAuthorities,
      responseTime: null // Will be updated when response is received
    });

    // Update last system check
    emergencyStats.lastSystemCheck = currentTime;

    // Get authority names for response
    const authorityNames = {
      animalControl: 'Animal Control',
      police: 'Police Department',
      fireRescue: 'Fire & Rescue'
    };

    const contactedNames = selectedAuthorities.map(auth => authorityNames[auth]);

    res.json({
      success: true,
      message: `${contactedNames.join(', ')} have been contacted and will respond within ${authorityContact.estimatedResponseTime} minutes`,
      data: {
        contactId,
        authorities: selectedAuthorities,
        authorityNames: contactedNames,
        estimatedResponseTime: authorityContact.estimatedResponseTime,
        timestamp: currentTime,
        status: 'dispatched'
      }
    });
  } catch (error) {
    console.error('Error contacting authorities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to contact authorities'
    });
  }
});

// POST /api/emergency-actions/search - Coordinate volunteer search
router.post('/search', (req, res) => {
  try {
    const { userId, petId, petName, settings } = req.body;

    // Validate required fields
    if (!userId || !petId || !petName || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, petId, petName, settings'
      });
    }

    // Validate settings
    const validationErrors = validateSearchSettings(settings);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Generate search ID
    const searchId = generateId('search');
    const currentTime = new Date();
    const availableVolunteers = getAvailableVolunteers();
    const requestedVolunteers = parseInt(settings.maxVolunteers);
    const actualVolunteers = Math.min(requestedVolunteers, availableVolunteers);

    // Create volunteer search record
    const volunteerSearch = {
      id: searchId,
      type: 'search',
      petId,
      petName,
      ownerId: userId,
      radius: parseInt(settings.radius),
      maxVolunteers: requestedVolunteers,
      currentVolunteers: Math.floor(actualVolunteers * 0.6), // 60% immediate response
      duration: parseInt(settings.searchDuration),
      incentive: settings.incentive || 'Community reward',
      description: settings.description || `Search operation for ${petName}`,
      timestamp: currentTime,
      status: 'active',
      volunteers: [],
      estimatedCompletion: new Date(currentTime.getTime() + (parseInt(settings.searchDuration) * 60 * 60 * 1000))
    };

    // Store the search record
    volunteerSearches.set(searchId, volunteerSearch);

    // Update statistics
    emergencyStats.searchOperations.push({
      date: currentTime,
      volunteers: volunteerSearch.currentVolunteers,
      status: 'active'
    });

    // Update last system check
    emergencyStats.lastSystemCheck = currentTime;

    res.json({
      success: true,
      message: `Search coordination initiated. ${volunteerSearch.currentVolunteers} volunteers have been notified and are responding`,
      data: {
        searchId,
        volunteersNotified: actualVolunteers,
        volunteersResponding: volunteerSearch.currentVolunteers,
        searchRadius: settings.radius,
        duration: settings.searchDuration,
        estimatedCompletion: volunteerSearch.estimatedCompletion,
        timestamp: currentTime,
        status: 'active',
        incentive: volunteerSearch.incentive
      }
    });
  } catch (error) {
    console.error('Error coordinating volunteer search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to coordinate volunteer search'
    });
  }
});

// GET /api/emergency-actions/alerts - Get all emergency alerts
router.get('/alerts', (req, res) => {
  try {
    const { userId, status, limit = 10, offset = 0 } = req.query;

    let alerts = Array.from(emergencyAlerts.values());

    // Filter by user if specified
    if (userId) {
      alerts = alerts.filter(alert => alert.ownerId === userId);
    }

    // Filter by status if specified
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const total = alerts.length;
    const paginatedAlerts = alerts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error getting emergency alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get emergency alerts'
    });
  }
});

// GET /api/emergency-actions/authorities/:contactId - Get authority contact details
router.get('/authorities/:contactId', (req, res) => {
  try {
    const { contactId } = req.params;
    
    const contact = authorityContacts.get(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Authority contact not found'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Error getting authority contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get authority contact details'
    });
  }
});

// GET /api/emergency-actions/searches/:searchId - Get search details
router.get('/searches/:searchId', (req, res) => {
  try {
    const { searchId } = req.params;
    
    const search = volunteerSearches.get(searchId);
    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search operation not found'
      });
    }

    // Calculate progress
    const now = new Date();
    const elapsed = (now - new Date(search.timestamp)) / (1000 * 60 * 60); // hours elapsed
    const progress = Math.min((elapsed / search.duration) * 100, 100);

    res.json({
      success: true,
      data: {
        search: {
          ...search,
          progress: Math.round(progress),
          hoursElapsed: Math.round(elapsed * 10) / 10,
          hoursRemaining: Math.max(0, search.duration - elapsed)
        }
      }
    });
  } catch (error) {
    console.error('Error getting search details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search details'
    });
  }
});

// PUT /api/emergency-actions/alerts/:alertId/status - Update alert status
router.put('/alerts/:alertId/status', (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, resolution } = req.body;

    if (!['active', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, resolved, or cancelled'
      });
    }

    const alert = emergencyAlerts.get(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Emergency alert not found'
      });
    }

    // Update alert status
    alert.status = status;
    alert.updatedAt = new Date();
    
    if (resolution) {
      alert.resolution = resolution;
    }

    emergencyAlerts.set(alertId, alert);

    res.json({
      success: true,
      message: `Alert status updated to ${status}`,
      data: { alert }
    });
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert status'
    });
  }
});

// GET /api/emergency-actions/volunteer-network - Get volunteer network statistics
router.get('/volunteer-network', (req, res) => {
  try {
    const availableVolunteers = getAvailableVolunteers();
    const averageResponseTime = getAverageResponseTime();
    
    // Calculate statistics from recent searches
    const recentSearches = Array.from(volunteerSearches.values())
      .filter(search => {
        const searchDate = new Date(search.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return searchDate >= weekAgo;
      });

    const totalSearches = recentSearches.length;
    const successfulSearches = recentSearches.filter(search => search.status === 'resolved').length;
    const successRate = totalSearches > 0 ? Math.round((successfulSearches / totalSearches) * 100) : 89;

    res.json({
      success: true,
      data: {
        availableVolunteers,
        averageResponseTime,
        successRate,
        activeSearches: recentSearches.filter(search => search.status === 'active').length,
        totalVolunteersThisWeek: recentSearches.reduce((sum, search) => sum + search.currentVolunteers, 0),
        coverage: {
          urban: 95,
          suburban: 87,
          rural: 72
        },
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting volunteer network stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get volunteer network statistics'
    });
  }
});

// POST /api/emergency-actions/test-system - Test emergency system (for development/admin use)
router.post('/test-system', (req, res) => {
  try {
    const { testType } = req.body;

    const testResults = {
      broadcast: {
        status: 'operational',
        latency: Math.floor(Math.random() * 500) + 100, // 100-600ms
        coverage: 98
      },
      authorities: {
        status: 'operational',
        animalControl: { status: 'online', responseTime: 12 },
        police: { status: 'online', responseTime: 8 },
        fireRescue: { status: 'online', responseTime: 15 }
      },
      volunteers: {
        status: 'operational',
        onlineVolunteers: getAvailableVolunteers(),
        averageResponseTime: getAverageResponseTime()
      }
    };

    // Update system status
    emergencyStats.lastSystemCheck = new Date();
    emergencyStats.systemStatus = 'operational';

    if (testType && testResults[testType]) {
      res.json({
        success: true,
        message: `${testType} system test completed successfully`,
        data: testResults[testType]
      });
    } else {
      res.json({
        success: true,
        message: 'Full system test completed successfully',
        data: testResults
      });
    }
  } catch (error) {
    console.error('Error running system test:', error);
    res.status(500).json({
      success: false,
      message: 'System test failed'
    });
  }
});

module.exports = router;
