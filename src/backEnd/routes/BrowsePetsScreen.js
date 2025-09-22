const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Shelter = require('../models/Shelter');
const User = require('../models/User');

// Input validation middleware
const validateBrowseParams = (req, res, next) => {
  const { page, limit, minAge, maxAge, maxFee } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  if (minAge && isNaN(minAge)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum age must be a number'
    });
  }
  
  if (maxAge && isNaN(maxAge)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum age must be a number'
    });
  }
  
  if (maxFee && isNaN(maxFee)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum fee must be a number'
    });
  }
  
  next();
};

// Enhanced mock pet data with more variety for browsing (fallback)
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
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 150,
    status: 'Available',
    description: 'Friendly and energetic golden retriever who loves to play fetch.',
    temperament: ['Friendly', 'Active', 'Loyal'],
    goodWith: ['Children', 'Other Dogs'],
    specialNeeds: false
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
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'
    ],
    vaccinated: true,
    neutered: false,
    adoptionFee: 100,
    status: 'Available',
    description: 'Beautiful Persian cat with a calm and gentle personality.',
    temperament: ['Calm', 'Gentle', 'Independent'],
    goodWith: ['Adults', 'Quiet Homes'],
    specialNeeds: false
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
    images: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 125,
    status: 'Available',
    description: 'Intelligent and trainable Labrador mix, great for active families.',
    temperament: ['Intelligent', 'Active', 'Trainable'],
    goodWith: ['Children', 'Other Dogs', 'Active Families'],
    specialNeeds: false
  },
  {
    id: 'pet-004',
    name: 'Luna',
    breed: 'Siamese',
    type: 'cat',
    age: '2 years',
    size: 'Small',
    location: 'Feline Friends Rescue',
    distance: '3.1 miles away',
    images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 75,
    status: 'Available',
    description: 'Vocal and social Siamese cat who loves attention.',
    temperament: ['Social', 'Vocal', 'Affectionate'],
    goodWith: ['Adults', 'Other Cats'],
    specialNeeds: false
  },
  {
    id: 'pet-005',
    name: 'Charlie',
    breed: 'Beagle',
    type: 'dog',
    age: '1 year',
    size: 'Medium',
    location: 'Rescue Paws',
    distance: '5.7 miles away',
    images: [
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'
    ],
    vaccinated: true,
    neutered: false,
    adoptionFee: 200,
    status: 'Available',
    description: 'Young beagle with lots of energy and a great nose for adventure.',
    temperament: ['Energetic', 'Curious', 'Friendly'],
    goodWith: ['Children', 'Other Dogs'],
    specialNeeds: false
  },
  {
    id: 'pet-006',
    name: 'Mittens',
    breed: 'Domestic Shorthair',
    type: 'cat',
    age: '4 years',
    size: 'Small',
    location: 'Safe Haven Animal Shelter',
    distance: '2.9 miles away',
    images: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400',
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 50,
    status: 'Available',
    description: 'Sweet older cat perfect for a quiet, loving home.',
    temperament: ['Gentle', 'Quiet', 'Loving'],
    goodWith: ['Adults', 'Seniors'],
    specialNeeds: false
  },
  {
    id: 'pet-007',
    name: 'Rocky',
    breed: 'German Shepherd Mix',
    type: 'dog',
    age: '5 years',
    size: 'Large',
    location: 'Second Chance Shelter',
    distance: '6.2 miles away',
    images: [
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400',
      'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 175,
    status: 'Available',
    description: 'Loyal and protective German Shepherd mix, needs experienced owner.',
    temperament: ['Loyal', 'Protective', 'Intelligent'],
    goodWith: ['Experienced Owners', 'Adults'],
    specialNeeds: true
  },
  {
    id: 'pet-008',
    name: 'Bella',
    breed: 'Maine Coon',
    type: 'cat',
    age: '1.5 years',
    size: 'Large',
    location: 'Whiskers & Tails Rescue',
    distance: '4.8 miles away',
    images: [
      'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400'
    ],
    vaccinated: true,
    neutered: true,
    adoptionFee: 120,
    status: 'Available',
    description: 'Majestic Maine Coon with a gentle giant personality.',
    temperament: ['Gentle', 'Calm', 'Majestic'],
    goodWith: ['Children', 'Other Cats', 'Dogs'],
    specialNeeds: false
  }
];

// Store favorites per user (in production, this would be in a database)
const userFavorites = new Map();

// GET /api/browse/pets - Get available pets for browsing with advanced filtering
router.get('/pets', validateBrowseParams, async (req, res) => {
  try {
    const {
      search,
      filter,
      sortBy = 'name',
      sortOrder = 'asc',
      limit = 20,
      offset = 0,
      minFee,
      maxFee,
      size,
      temperament,
      goodWith,
      specialNeeds,
      location
    } = req.query;

    let filteredPets = mockPets.filter(pet => pet.status === 'Available');

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPets = filteredPets.filter(pet =>
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower) ||
        pet.location.toLowerCase().includes(searchLower) ||
        pet.description.toLowerCase().includes(searchLower) ||
        pet.temperament.some(t => t.toLowerCase().includes(searchLower))
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
        case 'medium':
          filteredPets = filteredPets.filter(pet => pet.size === 'Medium');
          break;
        case 'large':
          filteredPets = filteredPets.filter(pet => pet.size === 'Large');
          break;
        case 'young':
          filteredPets = filteredPets.filter(pet =>
            pet.age.includes('1') || pet.age.includes('2')
          );
          break;
      }
    }

    // Apply size filter
    if (size) {
      filteredPets = filteredPets.filter(pet =>
        pet.size.toLowerCase() === size.toLowerCase()
      );
    }

    // Apply adoption fee range filter
    if (minFee) {
      filteredPets = filteredPets.filter(pet => pet.adoptionFee >= parseInt(minFee));
    }
    if (maxFee) {
      filteredPets = filteredPets.filter(pet => pet.adoptionFee <= parseInt(maxFee));
    }

    // Apply temperament filter
    if (temperament) {
      filteredPets = filteredPets.filter(pet =>
        pet.temperament.some(t => t.toLowerCase().includes(temperament.toLowerCase()))
      );
    }

    // Apply "good with" filter
    if (goodWith) {
      filteredPets = filteredPets.filter(pet =>
        pet.goodWith.some(g => g.toLowerCase().includes(goodWith.toLowerCase()))
      );
    }

    // Apply special needs filter
    if (specialNeeds !== undefined) {
      const needsSpecialCare = specialNeeds === 'true';
      filteredPets = filteredPets.filter(pet => pet.specialNeeds === needsSpecialCare);
    }

    // Apply location filter
    if (location) {
      filteredPets = filteredPets.filter(pet =>
        pet.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply sorting
    filteredPets.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          // Extract numeric age for comparison
          const ageA = parseInt(a.age.split(' ')[0]);
          const ageB = parseInt(b.age.split(' ')[0]);
          comparison = ageA - ageB;
          break;
        case 'adoptionFee':
          comparison = a.adoptionFee - b.adoptionFee;
          break;
        case 'distance':
          // Extract numeric distance for comparison
          const distA = parseFloat(a.distance.split(' ')[0]);
          const distB = parseFloat(b.distance.split(' ')[0]);
          comparison = distA - distB;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

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
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        },
        filters: {
          availableFilters: {
            types: ['dog', 'cat'],
            sizes: ['Small', 'Medium', 'Large'],
            ageRanges: ['young', 'adult', 'senior'],
            temperaments: ['Friendly', 'Active', 'Calm', 'Gentle', 'Intelligent', 'Loyal'],
            goodWith: ['Children', 'Other Dogs', 'Other Cats', 'Adults', 'Seniors'],
            priceRanges: [
              { label: 'Under $75', min: 0, max: 75 },
              { label: '$75-$150', min: 75, max: 150 },
              { label: '$150+', min: 150, max: 500 }
            ]
          },
          applied: {
            search: search || null,
            filter: filter || 'all',
            sortBy,
            sortOrder,
            priceRange: { min: minFee, max: maxFee }
          }
        }
      }
    });
  } catch (error) {
    console.error('Browse pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets for browsing',
      error: error.message
    });
  }
});

// GET /api/browse/pets/:id - Get detailed pet information
router.get('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pet = mockPets.find(p => p.id === id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Add additional details for pet profile
    const petDetails = {
      ...pet,
      additionalInfo: {
        weight: pet.size === 'Small' ? '5-15 lbs' : pet.size === 'Medium' ? '16-40 lbs' : '41+ lbs',
        activity: pet.temperament.includes('Active') ? 'High' : pet.temperament.includes('Calm') ? 'Low' : 'Medium',
        training: pet.temperament.includes('Intelligent') ? 'Easy to train' : 'Moderate training needed',
        grooming: pet.breed.includes('Persian') || pet.breed.includes('Maine Coon') ? 'High maintenance' : 'Low maintenance',
        medicalHistory: 'Up to date on all vaccinations, healthy',
        story: `${pet.name} came to us looking for a loving forever home. This wonderful ${pet.type} has been in our care and is ready to bring joy to the right family.`
      }
    };

    res.json({
      success: true,
      data: petDetails
    });
  } catch (error) {
    console.error('Pet details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet details',
      error: error.message
    });
  }
});

// POST /api/browse/favorites/:petId - Toggle pet as favorite
router.post('/favorites/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.id || 'anonymous-user';

    if (!userFavorites.has(userId)) {
      userFavorites.set(userId, new Set());
    }

    const userFavs = userFavorites.get(userId);
    let isFavorite;

    if (userFavs.has(petId)) {
      userFavs.delete(petId);
      isFavorite = false;
    } else {
      userFavs.add(petId);
      isFavorite = true;
    }

    res.json({
      success: true,
      data: {
        petId,
        isFavorite,
        message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
        totalFavorites: userFavs.size
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

// GET /api/browse/favorites - Get user's favorite pets
router.get('/favorites', async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous-user';
    const userFavs = userFavorites.get(userId) || new Set();
    
    const favoritePets = mockPets.filter(pet => userFavs.has(pet.id));

    res.json({
      success: true,
      data: {
        favorites: favoritePets,
        totalCount: favoritePets.length
      }
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

// GET /api/browse/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    // Calculate dynamic filter options based on available pets
    const availablePets = mockPets.filter(pet => pet.status === 'Available');
    
    const filterOptions = {
      types: [...new Set(availablePets.map(pet => pet.type))],
      breeds: [...new Set(availablePets.map(pet => pet.breed))].sort(),
      sizes: [...new Set(availablePets.map(pet => pet.size))],
      temperaments: [...new Set(availablePets.flatMap(pet => pet.temperament))].sort(),
      goodWith: [...new Set(availablePets.flatMap(pet => pet.goodWith))].sort(),
      locations: [...new Set(availablePets.map(pet => pet.location))].sort(),
      ageRanges: [
        { label: 'Young (1-2 years)', value: 'young' },
        { label: 'Adult (3-6 years)', value: 'adult' },
        { label: 'Senior (7+ years)', value: 'senior' }
      ],
      feeRanges: [
        { label: 'Under $75', min: 0, max: 75 },
        { label: '$75 - $150', min: 75, max: 150 },
        { label: 'Over $150', min: 150, max: 1000 }
      ],
      sortOptions: [
        { label: 'Name (A-Z)', value: 'name', order: 'asc' },
        { label: 'Name (Z-A)', value: 'name', order: 'desc' },
        { label: 'Age (Youngest)', value: 'age', order: 'asc' },
        { label: 'Age (Oldest)', value: 'age', order: 'desc' },
        { label: 'Price (Low to High)', value: 'adoptionFee', order: 'asc' },
        { label: 'Price (High to Low)', value: 'adoptionFee', order: 'desc' },
        { label: 'Distance (Nearest)', value: 'distance', order: 'asc' }
      ]
    };

    res.json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    console.error('Filters fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

// GET /api/browse/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
          message: 'Enter at least 2 characters for suggestions'
        }
      });
    }

    const query = q.toLowerCase();
    const availablePets = mockPets.filter(pet => pet.status === 'Available');
    
    const suggestions = new Set();
    
    // Add matching pet names, breeds, and locations
    availablePets.forEach(pet => {
      if (pet.name.toLowerCase().includes(query)) {
        suggestions.add({ type: 'name', value: pet.name, label: `${pet.name} (Pet Name)` });
      }
      if (pet.breed.toLowerCase().includes(query)) {
        suggestions.add({ type: 'breed', value: pet.breed, label: `${pet.breed} (Breed)` });
      }
      if (pet.location.toLowerCase().includes(query)) {
        suggestions.add({ type: 'location', value: pet.location, label: `${pet.location} (Location)` });
      }
      pet.temperament.forEach(temp => {
        if (temp.toLowerCase().includes(query)) {
          suggestions.add({ type: 'temperament', value: temp, label: `${temp} (Temperament)` });
        }
      });
    });

    res.json({
      success: true,
      data: {
        suggestions: Array.from(suggestions).slice(0, 8), // Limit to 8 suggestions
        query: q
      }
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions',
      error: error.message
    });
  }
});

// NEW ROUTE: Get pets from actual database
router.get('/pets/database', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      breed, 
      size, 
      age,
      location,
      maxDistance = 25,
      minFee,
      maxFee,
      vaccinated,
      neutered,
      specialNeeds,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query filters
    const filters = {
      status: 'Available', // Only show available pets
      isActive: { $ne: false } // Exclude deactivated pets
    };

    if (type) filters.type = type;
    if (breed) filters.breed = new RegExp(breed, 'i');
    if (size) filters.size = size;
    if (vaccinated !== undefined) filters.vaccinated = vaccinated === 'true';
    if (neutered !== undefined) filters.neutered = neutered === 'true';
    if (specialNeeds !== undefined) filters.specialNeeds = specialNeeds === 'true';

    // Age filtering
    if (age) {
      // This is simplified - in real implementation, you'd parse age ranges
      filters.age = new RegExp(age, 'i');
    }

    // Fee filtering
    if (minFee || maxFee) {
      filters.adoptionFee = {};
      if (minFee) filters.adoptionFee.$gte = parseFloat(minFee);
      if (maxFee) filters.adoptionFee.$lte = parseFloat(maxFee);
    }

    // Location filtering (basic city/state match)
    if (location) {
      filters.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.address': new RegExp(location, 'i') },
        { 'shelter.name': new RegExp(location, 'i') }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const pets = await Pet.find(filters)
      .populate('adoptedBy', 'name email')
      .populate('shelter', 'name contactInfo location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Pet.countDocuments(filters);

    // Transform data to match expected format
    const transformedPets = pets.map(pet => ({
      id: pet._id,
      name: pet.name,
      breed: pet.breed,
      type: pet.type,
      age: pet.age,
      size: pet.size,
      location: pet.shelter?.name || `${pet.location?.city}, ${pet.location?.state}`,
      images: pet.images || [],
      vaccinated: pet.vaccinated,
      neutered: pet.neutered,
      adoptionFee: pet.adoptionFee,
      status: pet.status,
      description: pet.description,
      temperament: pet.temperament || [],
      goodWith: pet.goodWith || [],
      specialNeeds: pet.specialNeeds,
      specialNeedsDescription: pet.specialNeedsDescription,
      viewCount: pet.viewCount || 0,
      favoriteCount: pet.favoriteCount || 0,
      daysInShelter: pet.daysInShelter,
      shelter: pet.shelter ? {
        id: pet.shelter._id,
        name: pet.shelter.name,
        phone: pet.shelter.contactInfo?.phone,
        email: pet.shelter.contactInfo?.email
      } : null
    }));

    res.json({
      success: true,
      data: {
        pets: transformedPets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + transformedPets.length < total,
          hasPrevPage: parseInt(page) > 1
        },
        filters: filters,
        summary: {
          totalAvailable: total,
          types: await Pet.distinct('type', { status: 'Available' }),
          breeds: await Pet.distinct('breed', { status: 'Available' }),
          sizes: await Pet.distinct('size', { status: 'Available' })
        }
      },
      message: `Found ${transformedPets.length} pets`
    });

  } catch (error) {
    console.error('Database pet search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets from database',
      error: error.message
    });
  }
});

// Get pet statistics for dashboard
router.get('/stats/database', async (req, res) => {
  try {
    const stats = await Pet.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeBreakdown = await Pet.aggregate([
      {
        $match: { status: 'Available' }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgFee: { $avg: '$adoptionFee' }
        }
      }
    ]);

    const recentAdoptions = await Pet.find({
      status: 'Adopted',
      adoptionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        typeBreakdown,
        recentAdoptions,
        totalPets: await Pet.countDocuments(),
        availablePets: await Pet.countDocuments({ status: 'Available' }),
        totalShelters: await Pet.distinct('shelter.id').length
      }
    });

  } catch (error) {
    console.error('Pet statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet statistics',
      error: error.message
    });
  }
});

module.exports = router;