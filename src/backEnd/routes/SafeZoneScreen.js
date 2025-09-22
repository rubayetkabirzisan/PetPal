const express = require('express');
const router = express.Router();

// In-memory storage for safe zones and related data (in production, use a database)
let safeZones = [
  {
    id: "zone-001",
    petId: "pet-001",
    userId: "user-001",
    name: "Home",
    type: "home",
    radius: 200,
    active: true,
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    createdAt: "2025-09-15T10:00:00Z",
    updatedAt: "2025-09-20T14:30:00Z"
  },
  {
    id: "zone-002",
    petId: "pet-001",
    userId: "user-001",
    name: "Dog Park",
    type: "park",
    radius: 300,
    active: false,
    coordinates: {
      latitude: 37.7849,
      longitude: -122.4094
    },
    createdAt: "2025-09-16T11:15:00Z",
    updatedAt: "2025-09-18T09:45:00Z"
  },
  {
    id: "zone-003",
    petId: "pet-002",
    userId: "user-002",
    name: "Veterinary Clinic",
    type: "vet",
    radius: 150,
    active: true,
    coordinates: {
      latitude: 37.7649,
      longitude: -122.4294
    },
    createdAt: "2025-09-17T16:20:00Z",
    updatedAt: "2025-09-19T12:10:00Z"
  }
];

// Pet location data for tracking
let petLocations = [
  {
    petId: "pet-001",
    userId: "user-001",
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Main St, San Francisco, CA"
    },
    lastUpdated: "2025-09-22T01:00:00Z"
  },
  {
    petId: "pet-002", 
    userId: "user-002",
    currentLocation: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: "456 Oak Ave, San Francisco, CA"
    },
    lastUpdated: "2025-09-22T00:45:00Z"
  }
];

// Zone breach notifications
let breachNotifications = [
  {
    id: "breach-001",
    petId: "pet-001",
    userId: "user-001",
    zoneId: "zone-001",
    zoneName: "Home",
    breachType: "exit",
    timestamp: "2025-09-21T15:30:00Z",
    location: {
      latitude: 37.7850,
      longitude: -122.4100,
      address: "Near Golden Gate Park"
    },
    acknowledged: true
  },
  {
    id: "breach-002",
    petId: "pet-001", 
    userId: "user-001",
    zoneId: "zone-001",
    zoneName: "Home",
    breachType: "enter",
    timestamp: "2025-09-21T18:15:00Z",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Main St, San Francisco, CA"
    },
    acknowledged: true
  }
];

// User notification settings
let notificationSettings = [
  {
    userId: "user-001",
    petId: "pet-001",
    alertsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "07:00"
    }
  },
  {
    userId: "user-002",
    petId: "pet-002", 
    alertsEnabled: true,
    emailNotifications: false,
    pushNotifications: true,
    quietHours: {
      enabled: true,
      start: "23:00",
      end: "06:00"
    }
  }
];

// Helper function to validate safe zone data
const validateSafeZone = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Zone name is required');
  }

  if (!data.type || !['home', 'work', 'park', 'vet', 'other'].includes(data.type)) {
    errors.push('Valid zone type is required (home, work, park, vet, other)');
  }

  if (!data.radius || data.radius < 50 || data.radius > 5000) {
    errors.push('Radius must be between 50 and 5000 meters');
  }

  if (!data.coordinates || !data.coordinates.latitude || !data.coordinates.longitude) {
    errors.push('Valid coordinates are required');
  } else {
    const lat = parseFloat(data.coordinates.latitude);
    const lng = parseFloat(data.coordinates.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  return errors;
};

// Helper function to generate unique IDs
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
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

// PUT /api/safe-zone/location/:petId - Update pet location
router.put('/location/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, latitude, longitude, address } = req.body;

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

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    // Find or create pet location record
    const locationIndex = petLocations.findIndex(loc => 
      loc.petId === petId && loc.userId === userId
    );

    const newLocation = {
      latitude: lat,
      longitude: lng,
      address: address || 'Unknown location'
    };

    if (locationIndex !== -1) {
      petLocations[locationIndex] = {
        ...petLocations[locationIndex],
        currentLocation: newLocation,
        lastUpdated: new Date().toISOString()
      };
    } else {
      petLocations.push({
        petId,
        userId,
        currentLocation: newLocation,
        lastUpdated: new Date().toISOString()
      });
    }

    // Check for zone breaches
    const petSafeZones = safeZones.filter(zone => 
      zone.petId === petId && zone.userId === userId && zone.active
    );

    const breaches = [];
    petSafeZones.forEach(zone => {
      const distance = calculateDistance(lat, lng, zone.coordinates.latitude, zone.coordinates.longitude);
      const isInside = distance <= zone.radius;
      
      // In a real implementation, you'd track previous location to determine entry/exit
      // For demo purposes, we'll just check current status
      if (!isInside) {
        breaches.push({
          zoneId: zone.id,
          zoneName: zone.name,
          distance: Math.round(distance),
          breachType: 'outside'
        });
      }
    });

    res.json({
      success: true,
      message: 'Pet location updated successfully',
      data: {
        location: petLocations.find(loc => loc.petId === petId && loc.userId === userId),
        breaches: breaches.length > 0 ? breaches : null
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

// PUT /api/safe-zone/notification-settings/:petId - Update notification settings
router.put('/notification-settings/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, alertsEnabled, emailNotifications, pushNotifications, quietHours } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find or create notification settings
    const settingsIndex = notificationSettings.findIndex(setting =>
      setting.petId === petId && setting.userId === userId
    );

    const updatedSettings = {
      userId,
      petId,
      alertsEnabled: alertsEnabled !== undefined ? Boolean(alertsEnabled) : true,
      emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
      pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : true,
      quietHours: quietHours || { enabled: false, start: "22:00", end: "07:00" }
    };

    if (settingsIndex !== -1) {
      notificationSettings[settingsIndex] = updatedSettings;
    } else {
      notificationSettings.push(updatedSettings);
    }

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        settings: updatedSettings
      }
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/safe-zone/:petId - Get all safe zones for a pet  
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

    // Get safe zones for the pet
    const petSafeZones = safeZones.filter(zone => 
      zone.petId === petId && zone.userId === userId
    );

    // Get pet location
    const petLocation = petLocations.find(loc => 
      loc.petId === petId && loc.userId === userId
    );

    // Get notification settings
    const settings = notificationSettings.find(setting =>
      setting.petId === petId && setting.userId === userId
    ) || {
      alertsEnabled: true,
      emailNotifications: true,
      pushNotifications: true,
      quietHours: { enabled: false, start: "22:00", end: "07:00" }
    };

    // Calculate zone status (whether pet is currently inside each zone)
    const zonesWithStatus = petSafeZones.map(zone => {
      let isInside = false;
      if (petLocation) {
        const distance = calculateDistance(
          petLocation.currentLocation.latitude,
          petLocation.currentLocation.longitude,
          zone.coordinates.latitude,
          zone.coordinates.longitude
        );
        isInside = distance <= zone.radius;
      }

      return {
        ...zone,
        isInside,
        lastBreach: breachNotifications
          .filter(breach => breach.zoneId === zone.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null
      };
    });

    res.json({
      success: true,
      data: {
        safeZones: zonesWithStatus,
        petLocation: petLocation || null,
        notificationSettings: settings,
        summary: {
          total: petSafeZones.length,
          active: petSafeZones.filter(zone => zone.active).length,
          inactive: petSafeZones.filter(zone => !zone.active).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching safe zones:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/safe-zone/:petId - Create a new safe zone
router.post('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, name, type, radius, coordinates, active = true } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate safe zone data
    const validationErrors = validateSafeZone({ name, type, radius, coordinates });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check for duplicate zone names for this pet
    const existingZone = safeZones.find(zone => 
      zone.petId === petId && 
      zone.userId === userId && 
      zone.name.toLowerCase() === name.toLowerCase()
    );

    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: 'A safe zone with this name already exists for this pet'
      });
    }

    // Create new safe zone
    const newZone = {
      id: generateId('zone'),
      petId,
      userId,
      name: name.trim(),
      type,
      radius: parseInt(radius),
      active: Boolean(active),
      coordinates: {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    safeZones.push(newZone);

    res.status(201).json({
      success: true,
      message: 'Safe zone created successfully',
      data: {
        safeZone: newZone
      }
    });

  } catch (error) {
    console.error('Error creating safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/safe-zone/:petId/:zoneId - Update a safe zone
router.put('/:petId/:zoneId', (req, res) => {
  try {
    const { petId, zoneId } = req.params;
    const { userId, name, type, radius, coordinates, active } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const zoneIndex = safeZones.findIndex(zone => 
      zone.id === zoneId && zone.petId === petId && zone.userId === userId
    );

    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safe zone not found'
      });
    }

    const currentZone = safeZones[zoneIndex];

    // Validate updated data if provided
    const updateData = {
      name: name !== undefined ? name : currentZone.name,
      type: type !== undefined ? type : currentZone.type,
      radius: radius !== undefined ? radius : currentZone.radius,
      coordinates: coordinates !== undefined ? coordinates : currentZone.coordinates
    };

    const validationErrors = validateSafeZone(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check for duplicate names (excluding current zone)
    if (name && name !== currentZone.name) {
      const duplicateZone = safeZones.find(zone => 
        zone.petId === petId && 
        zone.userId === userId && 
        zone.id !== zoneId &&
        zone.name.toLowerCase() === name.toLowerCase()
      );

      if (duplicateZone) {
        return res.status(400).json({
          success: false,
          message: 'A safe zone with this name already exists for this pet'
        });
      }
    }

    // Update safe zone
    safeZones[zoneIndex] = {
      ...currentZone,
      name: name !== undefined ? name.trim() : currentZone.name,
      type: type !== undefined ? type : currentZone.type,
      radius: radius !== undefined ? parseInt(radius) : currentZone.radius,
      coordinates: coordinates !== undefined ? {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude)
      } : currentZone.coordinates,
      active: active !== undefined ? Boolean(active) : currentZone.active,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Safe zone updated successfully',
      data: {
        safeZone: safeZones[zoneIndex]
      }
    });

  } catch (error) {
    console.error('Error updating safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/safe-zone/:petId/:zoneId - Delete a safe zone
router.delete('/:petId/:zoneId', (req, res) => {
  try {
    const { petId, zoneId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const zoneIndex = safeZones.findIndex(zone => 
      zone.id === zoneId && zone.petId === petId && zone.userId === userId
    );

    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safe zone not found'
      });
    }

    const deletedZone = safeZones.splice(zoneIndex, 1)[0];

    // Also remove related breach notifications
    breachNotifications = breachNotifications.filter(breach => breach.zoneId !== zoneId);

    res.json({
      success: true,
      message: 'Safe zone deleted successfully',
      data: {
        deletedZone
      }
    });

  } catch (error) {
    console.error('Error deleting safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/safe-zone/:petId/:zoneId/toggle - Toggle safe zone active status
router.post('/:petId/:zoneId/toggle', (req, res) => {
  try {
    const { petId, zoneId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const zoneIndex = safeZones.findIndex(zone => 
      zone.id === zoneId && zone.petId === petId && zone.userId === userId
    );

    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safe zone not found'
      });
    }

    // Toggle active status
    safeZones[zoneIndex].active = !safeZones[zoneIndex].active;
    safeZones[zoneIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Safe zone ${safeZones[zoneIndex].active ? 'activated' : 'deactivated'} successfully`,
      data: {
        safeZone: safeZones[zoneIndex]
      }
    });

  } catch (error) {
    console.error('Error toggling safe zone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/safe-zone/:petId/notifications - Get breach notifications
router.get('/:petId/notifications', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, limit = 10, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get notifications for the pet
    let petNotifications = breachNotifications.filter(breach => 
      breach.petId === petId && breach.userId === userId
    );

    // Sort by timestamp (newest first)
    petNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const total = petNotifications.length;
    const paginatedNotifications = petNotifications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        },
        summary: {
          total: petNotifications.length,
          unacknowledged: petNotifications.filter(n => !n.acknowledged).length,
          todayCount: petNotifications.filter(n => 
            new Date(n.timestamp).toDateString() === new Date().toDateString()
          ).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/safe-zone/:petId/simulate-breach - Simulate a zone breach (for testing)
router.post('/:petId/simulate-breach', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, zoneId, breachType = 'exit', location } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!zoneId) {
      return res.status(400).json({
        success: false,
        message: 'Zone ID is required'
      });
    }

    // Find the zone
    const zone = safeZones.find(z => z.id === zoneId && z.petId === petId && z.userId === userId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Safe zone not found'
      });
    }

    // Create breach notification
    const breach = {
      id: generateId('breach'),
      petId,
      userId,
      zoneId,
      zoneName: zone.name,
      breachType,
      timestamp: new Date().toISOString(),
      location: location || {
        latitude: zone.coordinates.latitude + 0.001,
        longitude: zone.coordinates.longitude + 0.001,
        address: "Simulated breach location"
      },
      acknowledged: false
    };

    breachNotifications.push(breach);

    res.status(201).json({
      success: true,
      message: 'Breach notification simulated successfully',
      data: {
        breach
      }
    });

  } catch (error) {
    console.error('Error simulating breach:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
