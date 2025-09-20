const express = require('express');
const router = express.Router();

// Mock database for demonstration - replace with actual database integration
let trackedPetsData = [
  {
    id: "1",
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    ownerId: "user-001",
    trackerId: "GPS001",
    isActive: true,
    lastLocation: "Home - 123 Main St",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5.2,
      timestamp: "2025-09-20T15:45:00Z"
    },
    lastUpdate: "2025-09-20T15:45:00Z",
    batteryLevel: 85,
    status: "Safe",
    safeZones: [
      {
        id: "zone1",
        name: "Home",
        centerLat: 37.7749,
        centerLng: -122.4194,
        radius: 100,
        isActive: true
      }
    ],
    locationHistory: [
      {
        timestamp: "2025-09-20T15:45:00Z",
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Main St, San Francisco, CA"
      },
      {
        timestamp: "2025-09-20T15:30:00Z",
        latitude: 37.7750,
        longitude: -122.4195,
        address: "Near 123 Main St, San Francisco, CA"
      }
    ],
    alerts: []
  },
  {
    id: "2",
    name: "Luna",
    type: "Cat",
    breed: "Siamese",
    ownerId: "user-001",
    trackerId: "GPS002",
    isActive: true,
    lastLocation: "Backyard - 123 Main St",
    coordinates: {
      latitude: 37.7748,
      longitude: -122.4193,
      accuracy: 3.1,
      timestamp: "2025-09-20T15:40:00Z"
    },
    lastUpdate: "2025-09-20T15:40:00Z",
    batteryLevel: 25,
    status: "Low Battery",
    safeZones: [
      {
        id: "zone2",
        name: "Home Area",
        centerLat: 37.7748,
        centerLng: -122.4193,
        radius: 50,
        isActive: true
      }
    ],
    locationHistory: [
      {
        timestamp: "2025-09-20T15:40:00Z",
        latitude: 37.7748,
        longitude: -122.4193,
        address: "Backyard - 123 Main St, San Francisco, CA"
      }
    ],
    alerts: [
      {
        id: "alert1",
        type: "Low Battery",
        message: "GPS tracker battery is below 30%",
        timestamp: "2025-09-20T15:35:00Z",
        isRead: false
      }
    ]
  },
  {
    id: "3",
    name: "Max",
    type: "Dog",
    breed: "German Shepherd",
    ownerId: "user-002",
    trackerId: "GPS003",
    isActive: false,
    lastLocation: "Dog Park - Central Ave",
    coordinates: {
      latitude: 37.7751,
      longitude: -122.4190,
      accuracy: 8.5,
      timestamp: "2025-09-20T14:30:00Z"
    },
    lastUpdate: "2025-09-20T14:30:00Z",
    batteryLevel: 0,
    status: "Alert",
    safeZones: [],
    locationHistory: [
      {
        timestamp: "2025-09-20T14:30:00Z",
        latitude: 37.7751,
        longitude: -122.4190,
        address: "Dog Park - Central Ave, San Francisco, CA"
      }
    ],
    alerts: [
      {
        id: "alert2",
        type: "Device Offline",
        message: "GPS tracker is offline - last seen 1 hour ago",
        timestamp: "2025-09-20T15:30:00Z",
        isRead: false
      }
    ]
  }
];

let gpsAlerts = [];
let nextAlertId = 1;

// GET /api/gps-tracking - Get all tracked pets for user
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Filter pets by owner
    const userPets = trackedPetsData.filter(pet => pet.ownerId === userId);
    
    // Calculate status and format response
    const formattedPets = userPets.map(pet => {
      const now = new Date();
      const lastUpdate = new Date(pet.lastUpdate);
      const minutesSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60));
      
      let timeDisplay;
      if (minutesSinceUpdate < 1) {
        timeDisplay = "Just now";
      } else if (minutesSinceUpdate < 60) {
        timeDisplay = `${minutesSinceUpdate} minute${minutesSinceUpdate === 1 ? '' : 's'} ago`;
      } else {
        const hoursSinceUpdate = Math.floor(minutesSinceUpdate / 60);
        timeDisplay = `${hoursSinceUpdate} hour${hoursSinceUpdate === 1 ? '' : 's'} ago`;
      }

      return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        lastLocation: pet.lastLocation,
        lastUpdate: timeDisplay,
        batteryLevel: pet.batteryLevel,
        status: pet.status,
        isActive: pet.isActive,
        coordinates: pet.coordinates,
        trackerId: pet.trackerId
      };
    });

    res.json({
      success: true,
      data: formattedPets,
      total: formattedPets.length
    });

  } catch (error) {
    console.error('Error fetching tracked pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracked pets',
      error: error.message
    });
  }
});

// GET /api/gps-tracking/:id - Get specific pet tracking details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const pet = trackedPetsData.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own pets'
      });
    }

    res.json({
      success: true,
      data: pet
    });

  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet details',
      error: error.message
    });
  }
});

// POST /api/gps-tracking - Add new GPS tracker to pet
router.post('/', (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      trackerId,
      userId,
      initialCoordinates
    } = req.body;

    // Validation
    if (!name || !type || !trackerId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type, trackerId, userId'
      });
    }

    // Check if tracker ID already exists
    const existingTracker = trackedPetsData.find(pet => pet.trackerId === trackerId);
    if (existingTracker) {
      return res.status(409).json({
        success: false,
        message: 'GPS tracker ID already in use'
      });
    }

    const newTrackedPet = {
      id: String(Date.now()),
      name,
      type,
      breed: breed || 'Unknown',
      ownerId: userId,
      trackerId,
      isActive: true,
      lastLocation: initialCoordinates ? 'Current Location' : 'Location Unknown',
      coordinates: initialCoordinates || {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10.0,
        timestamp: new Date().toISOString()
      },
      lastUpdate: new Date().toISOString(),
      batteryLevel: 100,
      status: 'Safe',
      safeZones: [],
      locationHistory: [],
      alerts: []
    };

    trackedPetsData.push(newTrackedPet);

    res.status(201).json({
      success: true,
      message: 'GPS tracker added successfully',
      data: newTrackedPet
    });

  } catch (error) {
    console.error('Error adding GPS tracker:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add GPS tracker',
      error: error.message
    });
  }
});

// PUT /api/gps-tracking/:id/location - Update pet location (from GPS device)
router.put('/:id/location', (req, res) => {
  try {
    const { id } = req.params;
    const {
      latitude,
      longitude,
      accuracy,
      batteryLevel,
      address
    } = req.body;

    const petIndex = trackedPetsData.findIndex(p => p.id === id);
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    const pet = trackedPetsData[petIndex];
    const now = new Date().toISOString();

    // Update location
    pet.coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: parseFloat(accuracy) || 5.0,
      timestamp: now
    };

    pet.lastUpdate = now;
    pet.lastLocation = address || `${latitude}, ${longitude}`;
    pet.isActive = true;

    // Update battery if provided
    if (batteryLevel !== undefined) {
      pet.batteryLevel = parseInt(batteryLevel);
      
      // Update status based on battery
      if (pet.batteryLevel <= 20) {
        pet.status = 'Low Battery';
      } else if (pet.batteryLevel <= 5) {
        pet.status = 'Alert';
      } else {
        pet.status = 'Safe';
      }
    }

    // Add to location history
    pet.locationHistory.unshift({
      timestamp: now,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || `${latitude}, ${longitude}`
    });

    // Keep only last 100 locations
    if (pet.locationHistory.length > 100) {
      pet.locationHistory = pet.locationHistory.slice(0, 100);
    }

    // Check safe zones
    pet.safeZones.forEach(zone => {
      if (zone.isActive) {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          zone.centerLat,
          zone.centerLng
        );

        if (distance > zone.radius) {
          // Pet is outside safe zone - create alert
          const alert = {
            id: `alert${nextAlertId++}`,
            type: 'Safe Zone Violation',
            message: `${pet.name} has left the ${zone.name} safe zone`,
            timestamp: now,
            isRead: false
          };
          pet.alerts.unshift(alert);
          pet.status = 'Alert';
        }
      }
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: pet
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// GET /api/gps-tracking/:id/history - Get location history for pet
router.get('/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, limit = 50, startDate, endDate } = req.query;
    
    const pet = trackedPetsData.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own pets'
      });
    }

    let history = [...pet.locationHistory];

    // Filter by date range if provided
    if (startDate || endDate) {
      history = history.filter(location => {
        const locationDate = new Date(location.timestamp);
        if (startDate && locationDate < new Date(startDate)) return false;
        if (endDate && locationDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Limit results
    history = history.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        petId: id,
        petName: pet.name,
        history,
        total: history.length
      }
    });

  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location history',
      error: error.message
    });
  }
});

// POST /api/gps-tracking/:id/safe-zone - Create safe zone for pet
router.post('/:id/safe-zone', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      centerLat,
      centerLng,
      radius,
      userId
    } = req.body;

    const petIndex = trackedPetsData.findIndex(p => p.id === id);
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    const pet = trackedPetsData[petIndex];

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own pets'
      });
    }

    // Validation
    if (!name || !centerLat || !centerLng || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, centerLat, centerLng, radius'
      });
    }

    const newSafeZone = {
      id: `zone${Date.now()}`,
      name,
      centerLat: parseFloat(centerLat),
      centerLng: parseFloat(centerLng),
      radius: parseInt(radius),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    pet.safeZones.push(newSafeZone);

    res.status(201).json({
      success: true,
      message: 'Safe zone created successfully',
      data: newSafeZone
    });

  } catch (error) {
    console.error('Error creating safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create safe zone',
      error: error.message
    });
  }
});

// GET /api/gps-tracking/:id/safe-zones - Get all safe zones for pet
router.get('/:id/safe-zones', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const pet = trackedPetsData.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own pets'
      });
    }

    res.json({
      success: true,
      data: {
        petId: id,
        petName: pet.name,
        safeZones: pet.safeZones
      }
    });

  } catch (error) {
    console.error('Error fetching safe zones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safe zones',
      error: error.message
    });
  }
});

// DELETE /api/gps-tracking/:id/safe-zone/:zoneId - Delete safe zone
router.delete('/:id/safe-zone/:zoneId', (req, res) => {
  try {
    const { id, zoneId } = req.params;
    const { userId } = req.body;

    const petIndex = trackedPetsData.findIndex(p => p.id === id);
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    const pet = trackedPetsData[petIndex];

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own pets'
      });
    }

    const zoneIndex = pet.safeZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safe zone not found'
      });
    }

    const deletedZone = pet.safeZones.splice(zoneIndex, 1)[0];

    res.json({
      success: true,
      message: 'Safe zone deleted successfully',
      data: deletedZone
    });

  } catch (error) {
    console.error('Error deleting safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete safe zone',
      error: error.message
    });
  }
});

// GET /api/gps-tracking/:id/alerts - Get alerts for pet
router.get('/:id/alerts', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, unreadOnly = false } = req.query;
    
    const pet = trackedPetsData.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own pets'
      });
    }

    let alerts = pet.alerts;
    
    if (unreadOnly === 'true') {
      alerts = alerts.filter(alert => !alert.isRead);
    }

    res.json({
      success: true,
      data: {
        petId: id,
        petName: pet.name,
        alerts,
        total: alerts.length
      }
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// PUT /api/gps-tracking/:id/alerts/:alertId/read - Mark alert as read
router.put('/:id/alerts/:alertId/read', (req, res) => {
  try {
    const { id, alertId } = req.params;
    const { userId } = req.body;

    const pet = trackedPetsData.find(p => p.id === id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own pets'
      });
    }

    const alert = pet.alerts.find(a => a.id === alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.isRead = true;

    res.json({
      success: true,
      message: 'Alert marked as read',
      data: alert
    });

  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
});

// DELETE /api/gps-tracking/:id - Remove GPS tracker from pet
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const petIndex = trackedPetsData.findIndex(p => p.id === id);
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tracked pet not found'
      });
    }

    const pet = trackedPetsData[petIndex];

    // Check ownership
    if (pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own pets'
      });
    }

    const removedPet = trackedPetsData.splice(petIndex, 1)[0];

    res.json({
      success: true,
      message: 'GPS tracker removed successfully',
      data: removedPet
    });

  } catch (error) {
    console.error('Error removing GPS tracker:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove GPS tracker',
      error: error.message
    });
  }
});

// GET /api/gps-tracking/stats/overview - Get GPS tracking statistics
router.get('/stats/overview', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userPets = trackedPetsData.filter(pet => pet.ownerId === userId);
    
    const stats = {
      totalTrackedPets: userPets.length,
      activePets: userPets.filter(pet => pet.isActive).length,
      lowBatteryPets: userPets.filter(pet => pet.batteryLevel <= 20).length,
      alertPets: userPets.filter(pet => pet.status === 'Alert').length,
      totalSafeZones: userPets.reduce((sum, pet) => sum + pet.safeZones.length, 0),
      unreadAlerts: userPets.reduce((sum, pet) => 
        sum + pet.alerts.filter(alert => !alert.isRead).length, 0
      ),
      lastUpdate: userPets.length > 0 
        ? Math.max(...userPets.map(pet => new Date(pet.lastUpdate))) 
        : null
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching GPS stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GPS statistics',
      error: error.message
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Convert to meters
  return distance;
}

module.exports = router;
