/**
 * ReportLostPetScreen API Routes
 * 
 * This file provides Express.js backend routes for the ReportLostPetScreen functionality
 * in the PetPal mobile application. It handles reporting lost pets, managing lost pet
 * data, image uploads, and notifications to the community to help find missing pets.
 * 
 * Available Routes:
 * - POST /api/report-lost-pet - Submit a lost pet report
 * - GET /api/report-lost-pet/reports - Get all lost pet reports
 * - GET /api/report-lost-pet/:id - Get specific lost pet report
 * - PUT /api/report-lost-pet/:id - Update lost pet report
 * - DELETE /api/report-lost-pet/:id - Delete/resolve lost pet report
 * - POST /api/report-lost-pet/:id/sighting - Report a sighting of a lost pet
 * - GET /api/report-lost-pet/search - Search lost pets by location/criteria
 * - POST /api/report-lost-pet/:id/contact - Contact pet owner about sighting
 * - GET /api/report-lost-pet/species - Get available pet species options
 * - POST /api/report-lost-pet/validate - Validate report data before submission
 * 
 * @author PetPal Development Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// In-memory storage for lost pet reports (replace with MongoDB in production)
let lostPets = new Map();
let sightings = new Map();
let petSpecies = new Map();
let notifications = new Map();

// Initialize sample data
function initializeLostPetData() {
  // Sample pet species and breeds
  const speciesData = {
    Dog: {
      breeds: [
        'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
        'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
        'Siberian Husky', 'Boxer', 'Border Collie', 'Chihuahua', 'Australian Shepherd',
        'Mixed Breed', 'Unknown'
      ],
      sizes: ['Small', 'Medium', 'Large']
    },
    Cat: {
      breeds: [
        'Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Persian',
        'Maine Coon', 'British Shorthair', 'Ragdoll', 'Abyssinian',
        'Russian Blue', 'Bengal', 'Mixed Breed', 'Unknown'
      ],
      sizes: ['Small', 'Medium', 'Large']
    },
    Other: {
      breeds: ['Bird', 'Rabbit', 'Ferret', 'Guinea Pig', 'Hamster', 'Reptile', 'Other'],
      sizes: ['Small', 'Medium', 'Large']
    }
  };

  // Sample lost pet reports
  const sampleLostPets = [
    {
      id: 'lost-pet-001',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: '3 years',
      color: 'Golden with white chest patch',
      size: 'Large',
      description: 'Max is a friendly golden retriever who escaped from our backyard during a thunderstorm. He is very social and may approach strangers. He was wearing a red collar with tags.',
      lastSeenLocation: '1234 Oak Street, Austin, TX 78701',
      lastSeenDate: '2025-09-20',
      contactName: 'Sarah Johnson',
      contactPhone: '(512) 555-0123',
      contactEmail: 'sarah.johnson@email.com',
      reward: '500',
      microchipped: true,
      photos: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
      ],
      status: 'Missing', // Missing, Found, Reunited
      reportedDate: '2025-09-20T14:30:00Z',
      lastUpdated: '2025-09-22T10:15:00Z',
      coordinates: {
        latitude: 30.2672,
        longitude: -97.7431
      },
      sightingsCount: 3,
      isActive: true,
      urgencyLevel: 'High', // Low, Medium, High
      specialInstructions: 'Please do not chase if spotted. Call immediately as he may be scared.',
      tags: ['friendly', 'microchipped', 'reward-offered']
    },
    {
      id: 'lost-pet-002',
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Domestic Shorthair',
      age: '5 years',
      color: 'Gray tabby with white paws',
      size: 'Medium',
      description: 'Indoor cat who got out through an open window. Very shy and may be hiding. Responds to name Whiskers and the sound of treats being shaken.',
      lastSeenLocation: '567 Elm Avenue, Austin, TX 78704',
      lastSeenDate: '2025-09-21',
      contactName: 'Michael Chen',
      contactPhone: '(512) 555-0456',
      contactEmail: 'mchen@email.com',
      reward: '200',
      microchipped: false,
      photos: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
      ],
      status: 'Missing',
      reportedDate: '2025-09-21T19:45:00Z',
      lastUpdated: '2025-09-22T08:30:00Z',
      coordinates: {
        latitude: 30.2500,
        longitude: -97.7500
      },
      sightingsCount: 1,
      isActive: true,
      urgencyLevel: 'Medium',
      specialInstructions: 'Very shy - may be hiding under porches or in garages. Bring treats.',
      tags: ['indoor-cat', 'shy', 'reward-offered']
    },
    {
      id: 'lost-pet-003',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Labrador Mix',
      age: '7 years',
      color: 'Black with brown markings',
      size: 'Large',
      description: 'Senior dog with slight limp in right hind leg. Very gentle and good with children. Last seen near the dog park.',
      lastSeenLocation: 'Zilker Park Dog Area, Austin, TX',
      lastSeenDate: '2025-09-19',
      contactName: 'Jennifer Martinez',
      contactPhone: '(512) 555-0789',
      contactEmail: 'j.martinez@email.com',
      reward: '300',
      microchipped: true,
      photos: [
        'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'
      ],
      status: 'Found', // This one was found
      reportedDate: '2025-09-19T16:20:00Z',
      lastUpdated: '2025-09-21T12:00:00Z',
      coordinates: {
        latitude: 30.2669,
        longitude: -97.7720
      },
      sightingsCount: 5,
      isActive: false,
      urgencyLevel: 'Low',
      specialInstructions: 'Senior dog - may be tired and moving slowly.',
      tags: ['senior-dog', 'gentle', 'found']
    }
  ];

  // Sample sightings
  const sampleSightings = [
    {
      id: 'sighting-001',
      lostPetId: 'lost-pet-001',
      reporterName: 'Anonymous',
      reporterPhone: '(512) 555-9999',
      reporterEmail: '',
      sightingLocation: '1300 Block of Oak Street, Austin, TX',
      sightingDate: '2025-09-21',
      sightingTime: '08:30',
      description: 'Saw a golden retriever matching the description running near the elementary school. Seemed friendly but wouldn\'t come when called.',
      confidence: 'High', // Low, Medium, High
      reportedAt: '2025-09-21T10:15:00Z',
      coordinates: {
        latitude: 30.2680,
        longitude: -97.7440
      },
      status: 'Unverified', // Unverified, Verified, False
      photos: []
    },
    {
      id: 'sighting-002',
      lostPetId: 'lost-pet-001',
      reporterName: 'David Wilson',
      reporterPhone: '(512) 555-7777',
      reporterEmail: 'dwilson@email.com',
      sightingLocation: 'Near Central Market on Lamar',
      sightingDate: '2025-09-22',
      sightingTime: '06:45',
      description: 'Golden retriever with red collar near the shopping center parking lot. Dog ran away when approached.',
      confidence: 'Medium',
      reportedAt: '2025-09-22T07:30:00Z',
      coordinates: {
        latitude: 30.2690,
        longitude: -97.7450
      },
      status: 'Unverified',
      photos: []
    }
  ];

  // Store sample data
  petSpecies.set('species', speciesData);
  sampleLostPets.forEach(pet => lostPets.set(pet.id, pet));
  sampleSightings.forEach(sighting => sightings.set(sighting.id, sighting));
}

// Initialize data on startup
initializeLostPetData();

// Helper function to generate unique IDs
function generateId() {
  return 'lost-pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function generateSightingId() {
  return 'sighting-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to validate lost pet report data
function validateLostPetData(petData) {
  const errors = [];
  
  // Required fields validation
  if (!petData.name || petData.name.trim().length === 0) {
    errors.push('Pet name is required');
  } else if (petData.name.length > 50) {
    errors.push('Pet name must be 50 characters or less');
  }
  
  if (!petData.species || !['Dog', 'Cat', 'Other'].includes(petData.species)) {
    errors.push('Pet species must be Dog, Cat, or Other');
  }
  
  if (!petData.description || petData.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (petData.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (!petData.lastSeenLocation || petData.lastSeenLocation.trim().length === 0) {
    errors.push('Last seen location is required');
  }
  
  if (!petData.lastSeenDate || petData.lastSeenDate.trim().length === 0) {
    errors.push('Last seen date is required');
  }
  
  if (!petData.contactName || petData.contactName.trim().length === 0) {
    errors.push('Contact name is required');
  }
  
  if (!petData.contactPhone || petData.contactPhone.trim().length === 0) {
    errors.push('Contact phone number is required');
  }
  
  // Optional field validation
  if (petData.contactEmail && petData.contactEmail.includes('@') === false) {
    errors.push('Invalid email format');
  }
  
  if (petData.reward && (isNaN(petData.reward) || petData.reward < 0)) {
    errors.push('Reward must be a valid positive number');
  }
  
  if (petData.size && !['Small', 'Medium', 'Large'].includes(petData.size)) {
    errors.push('Size must be Small, Medium, or Large');
  }
  
  if (petData.photos && !Array.isArray(petData.photos)) {
    errors.push('Photos must be an array');
  }
  
  return errors;
}

// Helper function to sanitize lost pet data
function sanitizeLostPetData(petData) {
  return {
    name: petData.name?.trim(),
    species: petData.species,
    breed: petData.breed?.trim() || 'Unknown',
    age: petData.age?.trim() || 'Unknown',
    color: petData.color?.trim() || '',
    size: petData.size || 'Medium',
    description: petData.description?.trim(),
    lastSeenLocation: petData.lastSeenLocation?.trim(),
    lastSeenDate: petData.lastSeenDate?.trim(),
    contactName: petData.contactName?.trim(),
    contactPhone: petData.contactPhone?.trim(),
    contactEmail: petData.contactEmail?.trim() || '',
    reward: petData.reward ? parseFloat(petData.reward) : 0,
    microchipped: Boolean(petData.microchipped),
    photos: Array.isArray(petData.photos) ? petData.photos.slice(0, 10) : [],
    specialInstructions: petData.specialInstructions?.trim() || '',
    urgencyLevel: petData.urgencyLevel || 'Medium'
  };
}

// Helper function to calculate distance between coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Routes

// GET /api/report-lost-pet/species - Get available pet species and breeds
router.get('/species', (req, res) => {
  try {
    const speciesData = petSpecies.get('species') || {};
    
    res.json({
      success: true,
      data: {
        species: speciesData,
        availableSpecies: Object.keys(speciesData)
      }
    });
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/report-lost-pet - Submit a lost pet report
router.post('/', (req, res) => {
  try {
    const { userId, petData } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!petData) {
      return res.status(400).json({
        success: false,
        message: 'Pet data is required'
      });
    }
    
    // Validate pet data
    const validationErrors = validateLostPetData(petData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Sanitize and prepare lost pet data
    const sanitizedData = sanitizeLostPetData(petData);
    
    // Generate report ID
    const reportId = generateId();
    
    // Create new lost pet report
    const newLostPet = {
      id: reportId,
      ...sanitizedData,
      status: 'Missing',
      reportedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      reportedBy: userId,
      coordinates: petData.coordinates || null,
      sightingsCount: 0,
      isActive: true,
      tags: [
        sanitizedData.species.toLowerCase(),
        sanitizedData.microchipped ? 'microchipped' : 'not-microchipped',
        sanitizedData.reward > 0 ? 'reward-offered' : 'no-reward'
      ].filter(Boolean)
    };
    
    // Store the report
    lostPets.set(reportId, newLostPet);
    
    res.status(201).json({
      success: true,
      message: `Lost pet report for ${newLostPet.name} has been submitted successfully. Our community has been notified to help find your pet.`,
      data: {
        report: newLostPet,
        reportId: reportId,
        estimatedReach: 1500 // Simulated community reach
      }
    });
    
  } catch (error) {
    console.error('Error creating lost pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit lost pet report',
      error: error.message
    });
  }
});

// GET /api/report-lost-pet/reports - Get all lost pet reports
router.get('/reports', (req, res) => {
  try {
    const { 
      status = 'all', 
      species, 
      location, 
      limit = 20, 
      offset = 0,
      sortBy = 'reportedDate',
      order = 'desc'
    } = req.query;
    
    let reports = Array.from(lostPets.values());
    
    // Filter by status
    if (status !== 'all') {
      reports = reports.filter(pet => pet.status.toLowerCase() === status.toLowerCase());
    }
    
    // Filter by species
    if (species) {
      reports = reports.filter(pet => pet.species.toLowerCase() === species.toLowerCase());
    }
    
    // Filter by location (basic text search)
    if (location) {
      const searchTerm = location.toLowerCase();
      reports = reports.filter(pet => 
        pet.lastSeenLocation.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort reports
    reports.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (order === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });
    
    // Apply pagination
    const total = reports.length;
    const paginatedReports = reports.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        pagination: {
          total: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (offset + parseInt(limit)) < total
        },
        summary: {
          totalReports: total,
          missingCount: reports.filter(p => p.status === 'Missing').length,
          foundCount: reports.filter(p => p.status === 'Found').length,
          reunitedCount: reports.filter(p => p.status === 'Reunited').length
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching lost pet reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/report-lost-pet/search - Search lost pets by location/criteria (must be before /:id route)
router.get('/search', (req, res) => {
  try {
    const { 
      q, // General search query
      lat, 
      lng, 
      radius = 10, // Search radius in kilometers
      species,
      size,
      color,
      limit = 20 
    } = req.query;
    
    let reports = Array.from(lostPets.values()).filter(pet => pet.isActive);
    
    // Text search in name, description, breed, color
    if (q) {
      const searchTerm = q.toLowerCase();
      reports = reports.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm) ||
        pet.description.toLowerCase().includes(searchTerm) ||
        pet.breed.toLowerCase().includes(searchTerm) ||
        pet.color.toLowerCase().includes(searchTerm) ||
        pet.lastSeenLocation.toLowerCase().includes(searchTerm)
      );
    }
    
    // Location-based search
    if (lat && lng) {
      const searchLat = parseFloat(lat);
      const searchLng = parseFloat(lng);
      const searchRadius = parseFloat(radius);
      
      reports = reports.filter(pet => {
        if (pet.coordinates) {
          const distance = calculateDistance(
            searchLat, searchLng,
            pet.coordinates.latitude, pet.coordinates.longitude
          );
          return distance <= searchRadius;
        }
        return false;
      });
      
      // Sort by distance
      reports.sort((a, b) => {
        const distanceA = calculateDistance(searchLat, searchLng, a.coordinates.latitude, a.coordinates.longitude);
        const distanceB = calculateDistance(searchLat, searchLng, b.coordinates.latitude, b.coordinates.longitude);
        return distanceA - distanceB;
      });
      
      // Add distance to each report
      reports = reports.map(pet => ({
        ...pet,
        distance: calculateDistance(searchLat, searchLng, pet.coordinates.latitude, pet.coordinates.longitude)
      }));
    }
    
    // Filter by species
    if (species) {
      reports = reports.filter(pet => pet.species.toLowerCase() === species.toLowerCase());
    }
    
    // Filter by size
    if (size) {
      reports = reports.filter(pet => pet.size.toLowerCase() === size.toLowerCase());
    }
    
    // Filter by color (partial match)
    if (color) {
      const colorTerm = color.toLowerCase();
      reports = reports.filter(pet => pet.color.toLowerCase().includes(colorTerm));
    }
    
    // Apply limit
    const limitedReports = reports.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        reports: limitedReports,
        total: reports.length,
        searchCriteria: {
          query: q,
          location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) } : null,
          filters: { species, size, color }
        }
      }
    });
    
  } catch (error) {
    console.error('Error searching lost pets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/report-lost-pet/statistics - Get lost pet statistics
router.get('/statistics', (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const allReports = Array.from(lostPets.values());
    const allSightings = Array.from(sightings.values());
    
    // Calculate statistics based on period
    let periodStart;
    switch (period) {
      case '7d':
        periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        periodStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const periodReports = allReports.filter(report => 
      new Date(report.reportedDate) >= periodStart
    );
    
    const statistics = {
      period: period,
      totalReports: allReports.length,
      periodReports: periodReports.length,
      statusBreakdown: {
        missing: allReports.filter(r => r.status === 'Missing').length,
        found: allReports.filter(r => r.status === 'Found').length,
        reunited: allReports.filter(r => r.status === 'Reunited').length
      },
      speciesBreakdown: {
        dogs: allReports.filter(r => r.species === 'Dog').length,
        cats: allReports.filter(r => r.species === 'Cat').length,
        other: allReports.filter(r => r.species === 'Other').length
      },
      sightingsTotal: allSightings.length,
      averageReunionTime: '2.3 days', // Simulated
      successRate: '78%' // Simulated
    };
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/report-lost-pet/:id - Get specific lost pet report
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    const report = lostPets.get(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }
    
    // Get associated sightings
    const reportSightings = Array.from(sightings.values())
      .filter(sighting => sighting.lostPetId === id)
      .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    
    res.json({
      success: true,
      data: {
        report: report,
        sightings: reportSightings,
        sightingsCount: reportSightings.length,
        lastSighting: reportSightings[0] || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching lost pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/report-lost-pet/:id - Update lost pet report
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, updateData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const existingReport = lostPets.get(id);
    
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }
    
    // Check if user has permission to update (basic check)
    if (existingReport.reportedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }
    
    // Validate update data if provided
    if (updateData && Object.keys(updateData).length > 0) {
      const validationErrors = validateLostPetData({ ...existingReport, ...updateData });
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
    }
    
    // Update the report
    const updatedReport = {
      ...existingReport,
      ...updateData,
      id: id, // Ensure ID doesn't change
      reportedBy: existingReport.reportedBy, // Ensure reporter doesn't change
      reportedDate: existingReport.reportedDate, // Preserve original date
      lastUpdated: new Date().toISOString()
    };
    
    lostPets.set(id, updatedReport);
    
    res.json({
      success: true,
      message: `Lost pet report for ${updatedReport.name} has been updated successfully`,
      data: {
        report: updatedReport,
        updatedFields: Object.keys(updateData || {}).length
      }
    });
    
  } catch (error) {
    console.error('Error updating lost pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lost pet report',
      error: error.message
    });
  }
});

// DELETE /api/report-lost-pet/:id - Delete/resolve lost pet report
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason = 'Pet found' } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const report = lostPets.get(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }
    
    // Check if user has permission to delete
    if (report.reportedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }
    
    // Mark as resolved instead of deleting
    const resolvedReport = {
      ...report,
      status: reason === 'Pet found' ? 'Found' : 'Resolved',
      isActive: false,
      resolvedAt: new Date().toISOString(),
      resolutionReason: reason,
      lastUpdated: new Date().toISOString()
    };
    
    lostPets.set(id, resolvedReport);
    
    res.json({
      success: true,
      message: `Lost pet report for ${report.name} has been resolved: ${reason}`,
      data: {
        report: resolvedReport,
        reason: reason
      }
    });
    
  } catch (error) {
    console.error('Error resolving lost pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve lost pet report',
      error: error.message
    });
  }
});

// POST /api/report-lost-pet/:id/sighting - Report a sighting of a lost pet
router.post('/:id/sighting', (req, res) => {
  try {
    const { id } = req.params;
    const { sightingData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Lost pet report ID is required'
      });
    }
    
    if (!sightingData) {
      return res.status(400).json({
        success: false,
        message: 'Sighting data is required'
      });
    }
    
    const lostPetReport = lostPets.get(id);
    
    if (!lostPetReport) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }
    
    // Validate sighting data
    const requiredFields = ['sightingLocation', 'sightingDate', 'description'];
    const missingFields = requiredFields.filter(field => !sightingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }
    
    // Create sighting report
    const sightingId = generateSightingId();
    const newSighting = {
      id: sightingId,
      lostPetId: id,
      reporterName: sightingData.reporterName || 'Anonymous',
      reporterPhone: sightingData.reporterPhone || '',
      reporterEmail: sightingData.reporterEmail || '',
      sightingLocation: sightingData.sightingLocation.trim(),
      sightingDate: sightingData.sightingDate.trim(),
      sightingTime: sightingData.sightingTime || '',
      description: sightingData.description.trim(),
      confidence: sightingData.confidence || 'Medium',
      reportedAt: new Date().toISOString(),
      coordinates: sightingData.coordinates || null,
      status: 'Unverified',
      photos: sightingData.photos || []
    };
    
    // Store the sighting
    sightings.set(sightingId, newSighting);
    
    // Update lost pet report sightings count
    const updatedReport = {
      ...lostPetReport,
      sightingsCount: (lostPetReport.sightingsCount || 0) + 1,
      lastUpdated: new Date().toISOString()
    };
    
    lostPets.set(id, updatedReport);
    
    res.status(201).json({
      success: true,
      message: `Sighting reported successfully. The pet owner has been notified.`,
      data: {
        sighting: newSighting,
        lostPetReport: updatedReport,
        totalSightings: updatedReport.sightingsCount
      }
    });
    
  } catch (error) {
    console.error('Error reporting sighting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report sighting',
      error: error.message
    });
  }
});

// POST /api/report-lost-pet/:id/contact - Contact pet owner about sighting
router.post('/:id/contact', (req, res) => {
  try {
    const { id } = req.params;
    const { contactData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Lost pet report ID is required'
      });
    }
    
    if (!contactData || !contactData.message) {
      return res.status(400).json({
        success: false,
        message: 'Contact message is required'
      });
    }
    
    const lostPetReport = lostPets.get(id);
    
    if (!lostPetReport) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }
    
    // Simulate sending notification to pet owner
    const notificationId = 'notif-' + Date.now();
    const notification = {
      id: notificationId,
      lostPetId: id,
      petName: lostPetReport.name,
      fromName: contactData.fromName || 'Anonymous',
      fromEmail: contactData.fromEmail || '',
      fromPhone: contactData.fromPhone || '',
      message: contactData.message,
      type: 'sighting_contact',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    notifications.set(notificationId, notification);
    
    res.json({
      success: true,
      message: `Your message has been sent to ${lostPetReport.contactName}. They will receive your contact information and message.`,
      data: {
        notification: notification,
        petOwnerContact: {
          name: lostPetReport.contactName,
          // Don't expose full contact details for privacy
          hasPhone: !!lostPetReport.contactPhone,
          hasEmail: !!lostPetReport.contactEmail
        }
      }
    });
    
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact message',
      error: error.message
    });
  }
});

// POST /api/report-lost-pet/validate - Validate report data before submission
router.post('/validate', (req, res) => {
  try {
    const { petData } = req.body;
    
    if (!petData) {
      return res.status(400).json({
        success: false,
        message: 'Pet data is required'
      });
    }
    
    // Validate pet data
    const validationErrors = validateLostPetData(petData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.json({
      success: true,
      message: 'Lost pet report data is valid',
      data: {
        validatedFields: Object.keys(petData).length,
        requiredFieldsComplete: true,
        estimatedReachRadius: '5 miles', // Simulated
        communitySize: 1500 // Simulated
      }
    });
    
  } catch (error) {
    console.error('Error validating lost pet data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
