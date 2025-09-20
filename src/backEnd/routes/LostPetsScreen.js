const express = require('express');
const router = express.Router();

// Mock database for demonstration - replace with actual database integration
let lostPetsData = [
  {
    id: "1",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    description: "Friendly golden retriever with a red collar. Very social and loves treats.",
    status: "lost",
    lastSeenLocation: "Central Park, Austin",
    lastSeenDate: "2025-09-18T10:30:00Z",
    ownerId: "user-001",
    photos: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"
    ],
    contactName: "Sarah Johnson",
    contactPhone: "+1-512-555-0123",
    contactEmail: "sarah.johnson@email.com",
    reward: 500,
    age: "3 years",
    weight: "65 lbs",
    microchipped: true,
    microchipId: "985112345678901",
    specialNeeds: "None",
    dateReported: "2025-09-18T15:45:00Z",
    sightings: [
      {
        id: "s1",
        location: "Riverside Park",
        date: "2025-09-19T08:15:00Z",
        description: "Spotted near the dog park entrance",
        reporterName: "Mike Chen",
        reporterPhone: "+1-512-555-0456",
        verified: false
      }
    ]
  },
  {
    id: "2",
    name: "Luna",
    species: "Cat",
    breed: "Siamese Mix",
    description: "Indoor cat that escaped. Very shy and may be hiding under porches or in garages.",
    status: "lost",
    lastSeenLocation: "Oak Hill Neighborhood",
    lastSeenDate: "2025-09-17T22:00:00Z",
    ownerId: "user-002",
    photos: [
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400"
    ],
    contactName: "David Rodriguez",
    contactPhone: "+1-512-555-0789",
    contactEmail: "david.r@email.com",
    reward: 200,
    age: "2 years",
    weight: "8 lbs",
    microchipped: true,
    microchipId: "985112345678902",
    specialNeeds: "Requires daily medication",
    dateReported: "2025-09-18T07:30:00Z",
    sightings: []
  },
  {
    id: "3",
    name: "Buddy",
    species: "Dog",
    breed: "Mixed Breed",
    description: "Found wandering near the highway. Appears well-fed and cared for.",
    status: "found",
    lastSeenLocation: "Highway 290 & Oak Hill",
    lastSeenDate: "2025-09-19T14:20:00Z",
    ownerId: "user-003",
    photos: [
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400"
    ],
    contactName: "Austin Animal Shelter",
    contactPhone: "+1-512-555-1000",
    contactEmail: "found@austinshelter.org",
    reward: 0,
    age: "Unknown",
    weight: "45 lbs",
    microchipped: false,
    microchipId: null,
    specialNeeds: "None observed",
    dateReported: "2025-09-19T16:00:00Z",
    sightings: []
  },
  {
    id: "4",
    name: "Whiskers",
    species: "Cat",
    breed: "Orange Tabby",
    description: "Very friendly orange tabby found in downtown area. No collar but appears to be someone's pet.",
    status: "found",
    lastSeenLocation: "Downtown Austin, 6th Street",
    lastSeenDate: "2025-09-19T11:45:00Z",
    ownerId: "user-001",
    photos: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400"
    ],
    contactName: "Emily Watson",
    contactPhone: "+1-512-555-2000",
    contactEmail: "emily.watson@email.com",
    reward: 0,
    age: "Adult",
    weight: "12 lbs",
    microchipped: false,
    microchipId: null,
    specialNeeds: "None",
    dateReported: "2025-09-19T12:30:00Z",
    sightings: []
  }
];

let sightingReports = [];
let nextSightingId = 1;

// GET /api/lost-pets - Get all lost and found pets with filtering
router.get('/', (req, res) => {
  try {
    const {
      status,        // 'lost' or 'found'
      search,        // Search query for name, breed, description, location
      petType,       // Species filter (dog, cat, etc.)
      location,      // Location filter
      dateRange,     // 'week', 'month', 'all'
      page = 1,
      limit = 20
    } = req.query;

    let filteredPets = [...lostPetsData];

    // Status filter (lost/found)
    if (status && (status === 'lost' || status === 'found')) {
      filteredPets = filteredPets.filter(pet => pet.status === status);
    }

    // Search filter
    if (search && search.trim()) {
      const searchTerms = search.toLowerCase().trim().split(' ');
      filteredPets = filteredPets.filter(pet => 
        searchTerms.some(term => 
          pet.name.toLowerCase().includes(term) ||
          pet.breed.toLowerCase().includes(term) ||
          pet.description.toLowerCase().includes(term) ||
          pet.lastSeenLocation.toLowerCase().includes(term)
        )
      );
    }

    // Pet type filter
    if (petType && petType.trim()) {
      filteredPets = filteredPets.filter(pet => 
        pet.species.toLowerCase() === petType.toLowerCase()
      );
    }

    // Location filter
    if (location && location.trim()) {
      filteredPets = filteredPets.filter(pet => 
        pet.lastSeenLocation.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (dateRange === 'week') {
        cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (dateRange === 'month') {
        cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      }

      if (cutoffDate) {
        filteredPets = filteredPets.filter(pet => 
          new Date(pet.lastSeenDate) >= cutoffDate
        );
      }
    }

    // Sort by most recent first
    filteredPets.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPets = filteredPets.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedPets,
      pagination: {
        total: filteredPets.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredPets.length / parseInt(limit))
      },
      filters: {
        status,
        search,
        petType,
        location,
        dateRange
      }
    });

  } catch (error) {
    console.error('Error fetching lost pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost pets',
      error: error.message
    });
  }
});

// GET /api/lost-pets/stats/overview - Get overview statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalLost = lostPetsData.filter(pet => pet.status === 'lost').length;
    const totalFound = lostPetsData.filter(pet => pet.status === 'found').length;
    const totalReunited = lostPetsData.filter(pet => pet.status === 'reunited').length;
    const totalSightings = sightingReports.length;

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReports = lostPetsData.filter(pet => 
      new Date(pet.dateReported) >= weekAgo
    ).length;
    const recentSightings = sightingReports.filter(sighting => 
      new Date(sighting.dateReported) >= weekAgo
    ).length;

    // Pet type breakdown
    const petTypes = lostPetsData.reduce((acc, pet) => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totals: {
          lost: totalLost,
          found: totalFound,
          reunited: totalReunited,
          sightings: totalSightings
        },
        recent: {
          reports: recentReports,
          sightings: recentSightings
        },
        petTypes,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// GET /api/lost-pets/resources - Get helpful resources and tips
router.get('/resources', (req, res) => {
  try {
    const resources = {
      tips: [
        {
          category: "Search Tips",
          items: [
            "Search during dawn and dusk when pets are most active",
            "Check under porches, in garages, and other hiding spots",
            "Bring familiar scents like their favorite toy or blanket",
            "Walk slowly and call their name softly",
            "Ask neighbors to check their garages and sheds"
          ]
        },
        {
          category: "Prevention",
          items: [
            "Always keep ID tags updated with current phone number",
            "Microchip your pet and keep registration current",
            "Take recent, clear photos of your pet",
            "Keep pets indoors during fireworks and storms",
            "Secure fencing and check for escape routes regularly"
          ]
        },
        {
          category: "Social Media",
          items: [
            "Post on local Facebook lost pet groups",
            "Use Nextdoor app to alert neighbors",
            "Share on Pawboost and Finding Rover apps",
            "Include clear photos and detailed description",
            "Update posts regularly with new information"
          ]
        }
      ],
      organizations: [
        {
          name: "Austin Animal Center",
          phone: "(512) 978-0500",
          website: "austintexas.gov/department/animal-center",
          services: "Lost pet intake, adoption services"
        },
        {
          name: "Austin Pets Alive!",
          phone: "(512) 961-6519",
          website: "austinpetsalive.org",
          services: "Rescue services, lost pet assistance"
        },
        {
          name: "TLAC (Town Lake Animal Center)",
          phone: "(512) 961-6519",
          website: "tlac.org",
          services: "Animal shelter, lost pet reunification"
        }
      ],
      emergencyContacts: [
        {
          name: "24/7 Animal Emergency Services",
          phone: "(512) 343-2273",
          type: "Emergency Vet"
        },
        {
          name: "Austin Animal Control",
          phone: "311",
          type: "Animal Control"
        }
      ]
    };

    res.json({
      success: true,
      data: resources
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
});

// GET /api/lost-pets/:id - Get specific pet details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const pet = lostPetsData.find(p => p.id === id);

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

// POST /api/lost-pets - Report a lost pet
router.post('/', (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      description,
      lastSeenLocation,
      lastSeenDate,
      photos,
      contactName,
      contactPhone,
      contactEmail,
      reward = 0,
      age,
      weight,
      microchipped = false,
      microchipId,
      specialNeeds,
      userId
    } = req.body;

    // Validation
    if (!name || !species || !breed || !lastSeenLocation || !contactName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, species, breed, lastSeenLocation, contactName, contactPhone'
      });
    }

    const newPet = {
      id: String(Date.now()),
      name,
      species,
      breed,
      description: description || '',
      status: 'lost',
      lastSeenLocation,
      lastSeenDate: lastSeenDate || new Date().toISOString(),
      ownerId: userId || 'anonymous',
      photos: photos || [],
      contactName,
      contactPhone,
      contactEmail: contactEmail || '',
      reward: parseInt(reward) || 0,
      age: age || 'Unknown',
      weight: weight || 'Unknown',
      microchipped: Boolean(microchipped),
      microchipId: microchipId || null,
      specialNeeds: specialNeeds || 'None',
      dateReported: new Date().toISOString(),
      sightings: []
    };

    lostPetsData.push(newPet);

    res.status(201).json({
      success: true,
      message: 'Lost pet reported successfully',
      data: newPet
    });

  } catch (error) {
    console.error('Error reporting lost pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report lost pet',
      error: error.message
    });
  }
});

// POST /api/lost-pets/:id/sighting - Report a sighting
router.post('/:id/sighting', (req, res) => {
  try {
    const { id } = req.params;
    const {
      location,
      description,
      reporterName,
      reporterPhone,
      reporterEmail,
      photos,
      coordinates,
      sightingDate
    } = req.body;

    // Find the pet
    const pet = lostPetsData.find(p => p.id === id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Validation
    if (!location || !reporterName || !reporterPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: location, reporterName, reporterPhone'
      });
    }

    const newSighting = {
      id: `s${nextSightingId++}`,
      petId: id,
      location,
      description: description || '',
      reporterName,
      reporterPhone,
      reporterEmail: reporterEmail || '',
      photos: photos || [],
      coordinates: coordinates || null,
      date: sightingDate || new Date().toISOString(),
      verified: false,
      dateReported: new Date().toISOString()
    };

    // Add sighting to pet
    pet.sightings.push(newSighting);
    
    // Also add to global sightings array
    sightingReports.push(newSighting);

    res.status(201).json({
      success: true,
      message: 'Sighting reported successfully',
      data: newSighting
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

// GET /api/lost-pets/:id/sightings - Get all sightings for a specific pet
router.get('/:id/sightings', (req, res) => {
  try {
    const { id } = req.params;
    const pet = lostPetsData.find(p => p.id === id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Sort sightings by date (most recent first)
    const sightings = pet.sightings.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.json({
      success: true,
      data: sightings,
      total: sightings.length
    });

  } catch (error) {
    console.error('Error fetching sightings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sightings',
      error: error.message
    });
  }
});

// PUT /api/lost-pets/:id/status - Update pet status (mark as found/reunited)
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, foundDate, foundLocation, notes } = req.body;

    const pet = lostPetsData.find(p => p.id === id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Validate status
    if (!['lost', 'found', 'reunited'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: lost, found, or reunited'
      });
    }

    pet.status = status;
    
    if (status === 'found' || status === 'reunited') {
      pet.foundDate = foundDate || new Date().toISOString();
      pet.foundLocation = foundLocation || pet.lastSeenLocation;
      pet.notes = notes || '';
    }

    res.json({
      success: true,
      message: `Pet status updated to ${status}`,
      data: pet
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

// DELETE /api/lost-pets/:id - Delete a pet report (user who posted only)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // User ID should be sent in request body
    
    const petIndex = lostPetsData.findIndex(p => p.id === id);

    if (petIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    const pet = lostPetsData[petIndex];

    // Check if the user is the owner of this pet report
    if (pet.ownerId && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own pet reports'
      });
    }

    const deletedPet = lostPetsData.splice(petIndex, 1)[0];

    // Also remove related sightings
    sightingReports = sightingReports.filter(s => s.petId !== id);

    res.json({
      success: true,
      message: 'Pet report deleted successfully',
      data: deletedPet
    });

  } catch (error) {
    console.error('Error deleting pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet report',
      error: error.message
    });
  }
});

module.exports = router;
