const express = require('express');
const router = express.Router();

// In-memory storage for tracked pets (in production, this would be a database)
let trackedPets = [
  {
    id: "1",
    name: "Buddy",
    ownerName: "John Smith",
    ownerId: "owner-001",
    ownerPhone: "+1-555-0101",
    ownerEmail: "john.smith@email.com",
    status: "Safe",
    lastLocation: "Home - 123 Main St",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    batteryLevel: 85,
    lastUpdate: "2 minutes ago",
    deviceId: "GPS001",
    safeZones: [
      {
        name: "Home",
        center: { latitude: 37.7749, longitude: -122.4194 },
        radius: 100
      }
    ],
    trackingHistory: [
      {
        timestamp: new Date().toISOString(),
        location: "Home - 123 Main St",
        coordinates: { latitude: 37.7749, longitude: -122.4194 }
      }
    ],
    emergencyContacts: [
      { name: "John Smith", phone: "+1-555-0101", relationship: "Owner" },
      { name: "Jane Smith", phone: "+1-555-0102", relationship: "Emergency Contact" }
    ]
  },
  {
    id: "2",
    name: "Luna",
    ownerName: "Sarah Johnson",
    ownerId: "owner-002",
    ownerPhone: "+1-555-0201",
    ownerEmail: "sarah.johnson@email.com",
    status: "Alert",
    lastLocation: "Outside safe zone - Central Park",
    coordinates: {
      latitude: 37.7849,
      longitude: -122.4094
    },
    batteryLevel: 45,
    lastUpdate: "5 minutes ago",
    deviceId: "GPS002",
    safeZones: [
      {
        name: "Home",
        center: { latitude: 37.7849, longitude: -122.4094 },
        radius: 150
      },
      {
        name: "Park",
        center: { latitude: 37.7849, longitude: -122.4194 },
        radius: 200
      }
    ],
    trackingHistory: [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        location: "Outside safe zone - Central Park",
        coordinates: { latitude: 37.7849, longitude: -122.4094 }
      }
    ],
    emergencyContacts: [
      { name: "Sarah Johnson", phone: "+1-555-0201", relationship: "Owner" },
      { name: "Mike Johnson", phone: "+1-555-0202", relationship: "Spouse" }
    ]
  },
  {
    id: "3",
    name: "Max",
    ownerName: "Mike Wilson",
    ownerId: "owner-003",
    ownerPhone: "+1-555-0301",
    ownerEmail: "mike.wilson@email.com",
    status: "Lost",
    lastLocation: "Unknown - Last seen Downtown",
    coordinates: {
      latitude: 37.7649,
      longitude: -122.4294
    },
    batteryLevel: 15,
    lastUpdate: "2 hours ago",
    deviceId: "GPS003",
    safeZones: [
      {
        name: "Home",
        center: { latitude: 37.7649, longitude: -122.4294 },
        radius: 100
      }
    ],
    trackingHistory: [
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        location: "Unknown - Last seen Downtown",
        coordinates: { latitude: 37.7649, longitude: -122.4294 }
      }
    ],
    emergencyContacts: [
      { name: "Mike Wilson", phone: "+1-555-0301", relationship: "Owner" }
    ]
  }
];

// System status data
let systemStatus = {
  gpsNetwork: {
    status: "Online",
    lastCheck: new Date().toISOString(),
    activeDevices: 3,
    signalStrength: 95
  },
  trackingServer: {
    status: "Active", 
    uptime: "99.9%",
    lastRestart: new Date(Date.now() - 86400000).toISOString(),
    activeConnections: 3
  },
  alertSystem: {
    status: "Operational",
    alertsProcessed: 127,
    averageResponseTime: "30 seconds",
    lastAlert: new Date(Date.now() - 300000).toISOString()
  }
};

// Emergency alerts log
let emergencyAlerts = [];
let alertIdCounter = 1;

// GET /api/admin-gps-tracking - Get all tracked pets with optional filtering
router.get('/', (req, res) => {
  try {
    const { status, lowBattery, petId, ownerId } = req.query;
    
    let filteredPets = [...trackedPets];
    
    // Apply filters
    if (status) {
      filteredPets = filteredPets.filter(pet => 
        pet.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (lowBattery === 'true') {
      filteredPets = filteredPets.filter(pet => pet.batteryLevel < 30);
    }
    
    if (petId) {
      filteredPets = filteredPets.filter(pet => pet.id === petId);
    }
    
    if (ownerId) {
      filteredPets = filteredPets.filter(pet => pet.ownerId === ownerId);
    }
    
    // Calculate statistics
    const stats = {
      total: trackedPets.length,
      safe: trackedPets.filter(p => p.status === 'Safe').length,
      alert: trackedPets.filter(p => p.status === 'Alert').length,
      lost: trackedPets.filter(p => p.status === 'Lost').length,
      lowBattery: trackedPets.filter(p => p.batteryLevel < 30).length
    };
    
    res.json({
      success: true,
      data: {
        pets: filteredPets,
        stats: stats,
        systemStatus: systemStatus
      }
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

// GET /api/admin-gps-tracking/:petId - Get specific pet details
router.get('/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const pet = trackedPets.find(p => p.id === petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
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

// GET /api/admin-gps-tracking/:petId/location-history - Get pet's location history
router.get('/:petId/location-history', (req, res) => {
  try {
    const { petId } = req.params;
    const { hours = 24, limit = 100 } = req.query;
    
    const pet = trackedPets.find(p => p.id === petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Filter history by time range
    const hoursAgo = new Date(Date.now() - (hours * 60 * 60 * 1000));
    let history = pet.trackingHistory.filter(record => 
      new Date(record.timestamp) > hoursAgo
    );
    
    // Limit results
    if (limit) {
      history = history.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        petId: pet.id,
        petName: pet.name,
        history: history,
        totalRecords: pet.trackingHistory.length
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

// PUT /api/admin-gps-tracking/:petId/status - Update pet status
router.put('/:petId/status', (req, res) => {
  try {
    const { petId } = req.params;
    const { status, reason, adminId } = req.body;
    
    // Validate status
    const validStatuses = ['Safe', 'Alert', 'Lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Safe, Alert, or Lost'
      });
    }
    
    const petIndex = trackedPets.findIndex(p => p.id === petId);
    
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    const oldStatus = trackedPets[petIndex].status;
    trackedPets[petIndex].status = status;
    trackedPets[petIndex].lastUpdate = "Just now";
    
    // Log status change
    console.log(`Status changed for ${trackedPets[petIndex].name}: ${oldStatus} -> ${status} by admin ${adminId}`);
    
    res.json({
      success: true,
      message: 'Pet status updated successfully',
      data: {
        pet: trackedPets[petIndex],
        previousStatus: oldStatus,
        updatedBy: adminId,
        timestamp: new Date().toISOString()
      }
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

// POST /api/admin-gps-tracking/:petId/emergency-alert - Send emergency alert
router.post('/:petId/emergency-alert', (req, res) => {
  try {
    const { petId } = req.params;
    const { alertType, message, adminId, notifyAuthorities = true, notifyVolunteers = false } = req.body;
    
    const pet = trackedPets.find(p => p.id === petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Create emergency alert
    const alert = {
      id: alertIdCounter++,
      petId: pet.id,
      petName: pet.name,
      ownerName: pet.ownerName,
      alertType: alertType || 'Emergency',
      message: message || `Emergency alert for ${pet.name} - ${pet.status}`,
      location: pet.lastLocation,
      coordinates: pet.coordinates,
      timestamp: new Date().toISOString(),
      adminId: adminId,
      notifyAuthorities: notifyAuthorities,
      notifyVolunteers: notifyVolunteers,
      status: 'Active'
    };
    
    emergencyAlerts.push(alert);
    
    // Update pet status if not already critical
    if (pet.status === 'Safe') {
      pet.status = 'Alert';
      pet.lastUpdate = "Just now";
    }
    
    // Simulate notifications (in production, this would send real notifications)
    const notifications = [];
    
    if (notifyAuthorities) {
      notifications.push('Local authorities notified');
    }
    
    if (notifyVolunteers) {
      notifications.push('Volunteer network activated');
    }
    
    // Always notify emergency contacts
    pet.emergencyContacts.forEach(contact => {
      notifications.push(`Notified ${contact.name} (${contact.relationship})`);
    });
    
    res.json({
      success: true,
      message: 'Emergency alert sent successfully',
      data: {
        alert: alert,
        notifications: notifications,
        estimatedResponseTime: '5-10 minutes'
      }
    });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency alert',
      error: error.message
    });
  }
});

// POST /api/admin-gps-tracking/:petId/contact-owner - Contact pet owner
router.post('/:petId/contact-owner', (req, res) => {
  try {
    const { petId } = req.params;
    const { method, message, adminId } = req.body; // method: 'call', 'sms', 'email'
    
    const pet = trackedPets.find(p => p.id === petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    // Validate contact method
    const validMethods = ['call', 'sms', 'email'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact method. Must be: call, sms, or email'
      });
    }
    
    // Simulate contact attempt (in production, this would use real communication services)
    const contactAttempt = {
      id: Date.now(),
      petId: pet.id,
      petName: pet.name,
      ownerName: pet.ownerName,
      method: method,
      message: message || `Contact regarding your pet ${pet.name}`,
      timestamp: new Date().toISOString(),
      adminId: adminId,
      status: 'Sent'
    };
    
    let contactInfo;
    switch (method) {
      case 'call':
        contactInfo = `Call initiated to ${pet.ownerPhone}`;
        break;
      case 'sms':
        contactInfo = `SMS sent to ${pet.ownerPhone}`;
        break;
      case 'email':
        contactInfo = `Email sent to ${pet.ownerEmail}`;
        break;
    }
    
    res.json({
      success: true,
      message: 'Contact attempt successful',
      data: {
        contactAttempt: contactAttempt,
        contactInfo: contactInfo
      }
    });
  } catch (error) {
    console.error('Error contacting owner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to contact owner',
      error: error.message
    });
  }
});

// GET /api/admin-gps-tracking/system-status - Get system status
router.get('/system/status', (req, res) => {
  try {
    // Update system status with current data
    systemStatus.gpsNetwork.activeDevices = trackedPets.length;
    systemStatus.trackingServer.activeConnections = trackedPets.filter(p => 
      p.batteryLevel > 0
    ).length;
    
    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status',
      error: error.message
    });
  }
});

// GET /api/admin-gps-tracking/emergency-alerts - Get emergency alerts
router.get('/emergency/alerts', (req, res) => {
  try {
    const { status = 'Active', limit = 50 } = req.query;
    
    let filteredAlerts = emergencyAlerts;
    
    if (status && status !== 'All') {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.status === status
      );
    }
    
    // Sort by timestamp (most recent first)
    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply limit
    if (limit) {
      filteredAlerts = filteredAlerts.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        totalAlerts: emergencyAlerts.length,
        activeAlerts: emergencyAlerts.filter(a => a.status === 'Active').length
      }
    });
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency alerts',
      error: error.message
    });
  }
});

// PUT /api/admin-gps-tracking/emergency-alerts/:alertId - Update emergency alert
router.put('/emergency/alerts/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, resolution, adminId } = req.body;
    
    const alertIndex = emergencyAlerts.findIndex(a => a.id === parseInt(alertId));
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Emergency alert not found'
      });
    }
    
    // Validate status
    const validStatuses = ['Active', 'Resolved', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Active, Resolved, or Cancelled'
      });
    }
    
    if (status) {
      emergencyAlerts[alertIndex].status = status;
    }
    
    if (resolution) {
      emergencyAlerts[alertIndex].resolution = resolution;
    }
    
    emergencyAlerts[alertIndex].resolvedBy = adminId;
    emergencyAlerts[alertIndex].resolvedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Emergency alert updated successfully',
      data: emergencyAlerts[alertIndex]
    });
  } catch (error) {
    console.error('Error updating emergency alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency alert',
      error: error.message
    });
  }
});

// POST /api/admin-gps-tracking/bulk-actions - Perform bulk actions on pets
router.post('/bulk-actions', (req, res) => {
  try {
    const { action, petIds, data, adminId } = req.body;
    
    if (!action || !petIds || !Array.isArray(petIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and petIds array are required'
      });
    }
    
    const results = [];
    const errors = [];
    
    petIds.forEach(petId => {
      const petIndex = trackedPets.findIndex(p => p.id === petId);
      
      if (petIndex === -1) {
        errors.push(`Pet with ID ${petId} not found`);
        return;
      }
      
      const pet = trackedPets[petIndex];
      
      switch (action) {
        case 'updateStatus':
          if (data && data.status) {
            const validStatuses = ['Safe', 'Alert', 'Lost'];
            if (validStatuses.includes(data.status)) {
              pet.status = data.status;
              pet.lastUpdate = "Just now";
              results.push(`Updated ${pet.name} status to ${data.status}`);
            } else {
              errors.push(`Invalid status for ${pet.name}`);
            }
          }
          break;
          
        case 'sendAlert':
          // Create emergency alert for each pet
          const alert = {
            id: alertIdCounter++,
            petId: pet.id,
            petName: pet.name,
            ownerName: pet.ownerName,
            alertType: data?.alertType || 'Bulk Alert',
            message: data?.message || `Bulk alert for ${pet.name}`,
            location: pet.lastLocation,
            coordinates: pet.coordinates,
            timestamp: new Date().toISOString(),
            adminId: adminId,
            status: 'Active'
          };
          
          emergencyAlerts.push(alert);
          results.push(`Emergency alert sent for ${pet.name}`);
          break;
          
        default:
          errors.push(`Unknown action: ${action} for ${pet.name}`);
      }
    });
    
    res.json({
      success: errors.length === 0,
      message: `Bulk action completed. ${results.length} successful, ${errors.length} errors.`,
      data: {
        successful: results,
        errors: errors,
        processedCount: petIds.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions',
      error: error.message
    });
  }
});

// POST /api/admin-gps-tracking/simulate-update - Simulate GPS update (for testing)
router.post('/simulate-update', (req, res) => {
  try {
    const { petId, coordinates, batteryLevel, status } = req.body;
    
    const petIndex = trackedPets.findIndex(p => p.id === petId);
    
    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }
    
    const pet = trackedPets[petIndex];
    
    // Update coordinates if provided
    if (coordinates) {
      pet.coordinates = coordinates;
      pet.lastLocation = `GPS: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
      
      // Add to tracking history
      pet.trackingHistory.unshift({
        timestamp: new Date().toISOString(),
        location: pet.lastLocation,
        coordinates: coordinates
      });
      
      // Keep only last 100 records
      if (pet.trackingHistory.length > 100) {
        pet.trackingHistory = pet.trackingHistory.slice(0, 100);
      }
    }
    
    // Update battery level if provided
    if (batteryLevel !== undefined) {
      pet.batteryLevel = Math.max(0, Math.min(100, batteryLevel));
    }
    
    // Update status if provided
    if (status) {
      const validStatuses = ['Safe', 'Alert', 'Lost'];
      if (validStatuses.includes(status)) {
        pet.status = status;
      }
    }
    
    pet.lastUpdate = "Just now";
    
    res.json({
      success: true,
      message: 'GPS update simulated successfully',
      data: pet
    });
  } catch (error) {
    console.error('Error simulating GPS update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate GPS update',
      error: error.message
    });
  }
});

module.exports = router;