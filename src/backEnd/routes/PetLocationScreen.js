const express = require('express');
const router = express.Router();

// In-memory storage for pet location data (in production, use a database)
let petLocations = [
  {
    id: "location-001",
    petId: "pet-001",
    userId: "user-001",
    petName: "Buddy",
    petType: "Dog",
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Main St, San Francisco, CA",
      accuracy: 5,
      lastUpdated: "2025-09-22T08:30:00Z"
    },
    locationHistory: [
      {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Main St, San Francisco, CA",
        timestamp: "2025-09-22T08:30:00Z",
        accuracy: 5
      },
      {
        latitude: 37.7849,
        longitude: -122.4094,
        address: "Golden Gate Park, San Francisco, CA",
        timestamp: "2025-09-22T07:45:00Z",
        accuracy: 8
      }
    ],
    trackerInfo: {
      batteryLevel: 85,
      signalStrength: "high",
      status: "active",
      lastPing: "2025-09-22T08:30:00Z"
    }
  },
  {
    id: "location-002",
    petId: "pet-002",
    userId: "user-002",
    petName: "Luna",
    petType: "Cat",
    currentLocation: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: "456 Oak Ave, San Francisco, CA",
      accuracy: 3,
      lastUpdated: "2025-09-22T08:15:00Z"
    },
    locationHistory: [
      {
        latitude: 37.7649,
        longitude: -122.4294,
        address: "456 Oak Ave, San Francisco, CA",
        timestamp: "2025-09-22T08:15:00Z",
        accuracy: 3
      },
      {
        latitude: 37.7629,
        longitude: -122.4314,
        address: "Near Veterinary Clinic, San Francisco, CA",
        timestamp: "2025-09-22T07:30:00Z",
        accuracy: 5
      }
    ],
    trackerInfo: {
      batteryLevel: 92,
      signalStrength: "excellent",
      status: "active",
      lastPing: "2025-09-22T08:15:00Z"
    }
  }
];

// Emergency contacts for pets
let emergencyContacts = [
  {
    petId: "pet-001",
    contacts: [
      {
        name: "John Doe",
        relationship: "Owner",
        phone: "+1234567890",
        email: "john@example.com",
        priority: 1
      },
      {
        name: "San Francisco Animal Hospital",
        relationship: "Veterinarian",
        phone: "+1987654321",
        email: "info@sfanimalhospital.com",
        priority: 2
      }
    ]
  },
  {
    petId: "pet-002",
    contacts: [
      {
        name: "Jane Smith",
        relationship: "Owner",
        phone: "+1555666777",
        email: "jane@example.com",
        priority: 1
      }
    ]
  }
];

// Geofence/Safe zone alerts
let geofenceAlerts = [
  {
    id: "alert-001",
    petId: "pet-001",
    userId: "user-001",
    alertType: "zone_exit",
    zoneName: "Home Safe Zone",
    timestamp: "2025-09-22T07:45:00Z",
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: "Golden Gate Park, San Francisco, CA"
    },
    acknowledged: true
  }
];

// Helper function to validate coordinates
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return { valid: false, error: 'Invalid latitude. Must be between -90 and 90.' };
  }
  
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return { valid: false, error: 'Invalid longitude. Must be between -180 and 180.' };
  }
  
  return { valid: true, lat, lng };
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Helper function to generate unique IDs
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// GET /api/pet-location/:petId - Get current location and details for a pet
router.get('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find pet location
    const petLocation = petLocations.find(location => 
      location.petId === petId && location.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet location not found'
      });
    }

    // Get emergency contacts
    const contacts = emergencyContacts.find(contact => 
      contact.petId === petId
    )?.contacts || [];

    // Get recent geofence alerts
    const recentAlerts = geofenceAlerts.filter(alert => 
      alert.petId === petId && alert.userId === userId
    ).slice(-5); // Last 5 alerts

    // Calculate time since last update
    const lastUpdate = new Date(petLocation.currentLocation.lastUpdated);
    const now = new Date();
    const minutesSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60));

    res.json({
      success: true,
      data: {
        pet: {
          id: petLocation.petId,
          name: petLocation.petName,
          type: petLocation.petType
        },
        currentLocation: {
          ...petLocation.currentLocation,
          minutesSinceUpdate
        },
        tracker: petLocation.trackerInfo,
        emergencyContacts: contacts,
        recentAlerts,
        mapUrls: {
          static: `https://staticmap.openstreetmap.de/staticmap.php?center=${petLocation.currentLocation.latitude},${petLocation.currentLocation.longitude}&zoom=15&size=600x400&markers=${petLocation.currentLocation.latitude},${petLocation.currentLocation.longitude},red-pushpin`,
          directions: {
            ios: `maps:?q=${encodeURIComponent(petLocation.petName + "'s location")}&ll=${petLocation.currentLocation.latitude},${petLocation.currentLocation.longitude}&dirflg=d`,
            android: `geo:0,0?q=${petLocation.currentLocation.latitude},${petLocation.currentLocation.longitude}(${encodeURIComponent(petLocation.petName + "'s location")})&dirflg=d`
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pet location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-location/:petId/update - Update pet location
router.post('/:petId/update', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, latitude, longitude, address, accuracy = 5 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Find existing location record
    const locationIndex = petLocations.findIndex(location => 
      location.petId === petId && location.userId === userId
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    const currentLocation = petLocations[locationIndex];
    const newLocationData = {
      latitude: validation.lat,
      longitude: validation.lng,
      address: address || 'Location updated',
      accuracy: parseInt(accuracy),
      timestamp: new Date().toISOString()
    };

    // Update current location
    currentLocation.currentLocation = {
      latitude: validation.lat,
      longitude: validation.lng,
      address: address || 'Location updated',
      accuracy: parseInt(accuracy),
      lastUpdated: new Date().toISOString()
    };

    // Add to location history
    currentLocation.locationHistory.push(newLocationData);
    
    // Keep only last 50 location history entries
    if (currentLocation.locationHistory.length > 50) {
      currentLocation.locationHistory = currentLocation.locationHistory.slice(-50);
    }

    // Update tracker ping time
    currentLocation.trackerInfo.lastPing = new Date().toISOString();

    res.json({
      success: true,
      message: 'Pet location updated successfully',
      data: {
        location: currentLocation.currentLocation,
        tracker: currentLocation.trackerInfo
      }
    });

  } catch (error) {
    console.error('Error updating pet location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-location/:petId/history - Get location history
router.get('/:petId/history', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, limit = 20, offset = 0, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find pet location
    const petLocation = petLocations.find(location => 
      location.petId === petId && location.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    let history = [...petLocation.locationHistory];

    // Filter by date range if provided
    if (startDate) {
      history = history.filter(location => 
        new Date(location.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      history = history.filter(location => 
        new Date(location.timestamp) <= new Date(endDate)
      );
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const total = history.length;
    const paginatedHistory = history.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        pet: {
          id: petLocation.petId,
          name: petLocation.petName,
          type: petLocation.petType
        },
        locationHistory: paginatedHistory,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-location/:petId/tracker/update - Update tracker information
router.post('/:petId/tracker/update', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, batteryLevel, signalStrength, status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find pet location
    const locationIndex = petLocations.findIndex(location => 
      location.petId === petId && location.userId === userId
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Update tracker information
    const currentLocation = petLocations[locationIndex];
    
    if (batteryLevel !== undefined) {
      const battery = parseInt(batteryLevel);
      if (battery >= 0 && battery <= 100) {
        currentLocation.trackerInfo.batteryLevel = battery;
      }
    }

    if (signalStrength !== undefined) {
      const validSignals = ['poor', 'fair', 'good', 'excellent'];
      if (validSignals.includes(signalStrength)) {
        currentLocation.trackerInfo.signalStrength = signalStrength;
      }
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'inactive', 'low_battery', 'offline'];
      if (validStatuses.includes(status)) {
        currentLocation.trackerInfo.status = status;
      }
    }

    currentLocation.trackerInfo.lastPing = new Date().toISOString();

    res.json({
      success: true,
      message: 'Tracker information updated successfully',
      data: {
        tracker: currentLocation.trackerInfo
      }
    });

  } catch (error) {
    console.error('Error updating tracker info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-location/:petId/emergency-contacts - Get emergency contacts
router.get('/:petId/emergency-contacts', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify pet belongs to user
    const petLocation = petLocations.find(location => 
      location.petId === petId && location.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Get emergency contacts
    const contacts = emergencyContacts.find(contact => 
      contact.petId === petId
    )?.contacts || [];

    res.json({
      success: true,
      data: {
        petId,
        emergencyContacts: contacts.sort((a, b) => a.priority - b.priority)
      }
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-location/:petId/emergency-alert - Send emergency alert
router.post('/:petId/emergency-alert', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, alertType, message, location } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!alertType) {
      return res.status(400).json({
        success: false,
        message: 'Alert type is required'
      });
    }

    // Verify pet belongs to user
    const petLocation = petLocations.find(loc => 
      loc.petId === petId && loc.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Get emergency contacts
    const contacts = emergencyContacts.find(contact => 
      contact.petId === petId
    )?.contacts || [];

    // Create alert record
    const alert = {
      id: generateId('alert'),
      petId,
      userId,
      alertType,
      message: message || `Emergency alert for ${petLocation.petName}`,
      location: location || petLocation.currentLocation,
      timestamp: new Date().toISOString(),
      contactsNotified: contacts.length,
      status: 'sent'
    };

    // In a real implementation, you would:
    // 1. Send SMS/email to emergency contacts
    // 2. Push notifications to mobile apps
    // 3. Log the alert in a persistent database
    
    console.log(`Emergency alert sent for pet ${petId}:`, alert);

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent successfully',
      data: {
        alert,
        contactsNotified: contacts.length
      }
    });

  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-location/:petId/nearby - Find nearby pets or points of interest
router.get('/:petId/nearby', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, radius = 1000, type = 'pets' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find pet location
    const petLocation = petLocations.find(location => 
      location.petId === petId && location.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    const { latitude, longitude } = petLocation.currentLocation;
    const searchRadius = parseInt(radius); // meters

    let nearbyItems = [];

    if (type === 'pets') {
      // Find other pets within radius (excluding current pet)
      nearbyItems = petLocations
        .filter(location => location.petId !== petId)
        .map(location => {
          const distance = calculateDistance(
            latitude, longitude,
            location.currentLocation.latitude,
            location.currentLocation.longitude
          );
          
          return {
            type: 'pet',
            id: location.petId,
            name: location.petName,
            petType: location.petType,
            distance: Math.round(distance),
            location: {
              latitude: location.currentLocation.latitude,
              longitude: location.currentLocation.longitude,
              address: location.currentLocation.address
            },
            lastSeen: location.currentLocation.lastUpdated
          };
        })
        .filter(item => item.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);
    } else if (type === 'services') {
      // Mock nearby pet services
      const mockServices = [
        {
          type: 'service',
          id: 'vet-001',
          name: 'San Francisco Animal Hospital',
          serviceType: 'veterinary',
          distance: 450,
          location: {
            latitude: latitude + 0.004,
            longitude: longitude - 0.002,
            address: '789 Pet Care Ave, San Francisco, CA'
          },
          phone: '+1987654321',
          hours: '8:00 AM - 8:00 PM',
          rating: 4.8
        },
        {
          type: 'service',
          id: 'park-001',
          name: 'Doggy Paradise Park',
          serviceType: 'dog_park',
          distance: 320,
          location: {
            latitude: latitude - 0.003,
            longitude: longitude + 0.001,
            address: '456 Park St, San Francisco, CA'
          },
          hours: '6:00 AM - 10:00 PM',
          amenities: ['Off-leash area', 'Water fountains', 'Agility course']
        }
      ];

      nearbyItems = mockServices.filter(service => service.distance <= searchRadius);
    }

    res.json({
      success: true,
      data: {
        pet: {
          id: petLocation.petId,
          name: petLocation.petName,
          location: petLocation.currentLocation
        },
        searchRadius: searchRadius,
        nearbyItems,
        total: nearbyItems.length
      }
    });

  } catch (error) {
    console.error('Error finding nearby items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/pet-location/:petId/share - Share pet location
router.post('/:petId/share', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, shareWith, duration = 60, message } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!shareWith) {
      return res.status(400).json({
        success: false,
        message: 'Share recipient is required'
      });
    }

    // Verify pet belongs to user
    const petLocation = petLocations.find(location => 
      location.petId === petId && location.userId === userId
    );

    if (!petLocation) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Create share link/token
    const shareToken = generateId('share');
    const expiresAt = new Date(Date.now() + (parseInt(duration) * 60 * 1000));

    // In a real implementation, store this in database
    const shareInfo = {
      id: shareToken,
      petId,
      petName: petLocation.petName,
      sharedBy: userId,
      sharedWith: shareWith,
      message: message || `${petLocation.petName}'s current location`,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      accessCount: 0
    };

    // Generate share URL
    const shareUrl = `https://petpal.app/shared-location/${shareToken}`;

    res.status(201).json({
      success: true,
      message: 'Location shared successfully',
      data: {
        shareInfo,
        shareUrl,
        expiresIn: `${duration} minutes`
      }
    });

  } catch (error) {
    console.error('Error sharing location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/pet-location/analytics/:userId - Get location analytics for user's pets
router.get('/analytics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '7d' } = req.query;

    // Get all pets for user
    const userPetLocations = petLocations.filter(location => 
      location.userId === userId
    );

    if (userPetLocations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pets found for user'
      });
    }

    // Calculate analytics
    let totalDistance = 0;
    let activeTrackers = 0;
    let lowBatteryTrackers = 0;
    let averageAccuracy = 0;

    const analytics = userPetLocations.map(petLocation => {
      const tracker = petLocation.trackerInfo;
      
      if (tracker.status === 'active') activeTrackers++;
      if (tracker.batteryLevel < 20) lowBatteryTrackers++;
      
      // Calculate distance traveled (from history)
      let petDistance = 0;
      const history = petLocation.locationHistory;
      
      for (let i = 1; i < history.length; i++) {
        const distance = calculateDistance(
          history[i-1].latitude, history[i-1].longitude,
          history[i].latitude, history[i].longitude
        );
        petDistance += distance;
      }
      
      totalDistance += petDistance;
      averageAccuracy += petLocation.currentLocation.accuracy;

      return {
        petId: petLocation.petId,
        petName: petLocation.petName,
        distanceTraveled: Math.round(petDistance),
        batteryLevel: tracker.batteryLevel,
        signalStrength: tracker.signalStrength,
        lastUpdate: petLocation.currentLocation.lastUpdated,
        locationCount: history.length
      };
    });

    averageAccuracy = Math.round(averageAccuracy / userPetLocations.length);

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalPets: userPetLocations.length,
          activeTrackers,
          lowBatteryTrackers,
          totalDistanceTraveled: Math.round(totalDistance),
          averageAccuracy: `±${averageAccuracy}m`
        },
        petAnalytics: analytics
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
