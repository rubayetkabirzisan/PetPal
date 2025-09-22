const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Shelter = require('../models/Shelter');
const Application = require('../models/Application');
const LostPet = require('../models/LostPet');
const Analytics = require('../models/analytics');

// GET /api/landing/stats - Get landing page statistics
router.get('/stats', async (req, res) => {
  try {
    // Get basic statistics for the landing page
    const [
      totalPets,
      availablePets,
      totalShelters,
      activeShelters,
      totalApplications,
      successfulAdoptions,
      recentAdoptions,
      lostPetsReunited
    ] = await Promise.all([
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'available' }),
      Shelter.countDocuments(),
      Shelter.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ 
        status: 'approved',
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      LostPet.countDocuments({ status: 'reunited' })
    ]);

    // Calculate success rate
    const successRate = totalApplications > 0 ? 
      Math.round((successfulAdoptions / totalApplications) * 100) : 0;

    // Get featured pets (recently added and available)
    const featuredPets = await Pet.find({ status: 'available' })
      .populate('shelter', 'name city state')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name breed age images size adoptionFee description temperament')
      .lean();

    // Get pet type distribution
    const petTypeStats = await Pet.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Format pet types for frontend
    const petTypes = petTypeStats.map(type => ({
      type: type._id,
      count: type.count,
      label: type._id.charAt(0).toUpperCase() + type._id.slice(1) + 's'
    }));

    // Get recent success stories
    const successStories = await Application.find({ status: 'approved' })
      .populate({
        path: 'petId',
        select: 'name breed images species'
      })
      .populate('adopterId', 'name')
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('petId adopterId updatedAt')
      .lean();

    const formattedSuccessStories = successStories
      .filter(story => story.petId && story.adopterId)
      .map(story => ({
        id: story._id,
        petName: story.petId.name,
        petBreed: story.petId.breed,
        petImage: story.petId.images?.[0] || null,
        petSpecies: story.petId.species,
        adopterName: story.adopterId.name,
        adoptedDate: story.updatedAt,
        daysAgo: Math.floor((new Date() - new Date(story.updatedAt)) / (1000 * 60 * 60 * 24))
      }));

    res.json({
      success: true,
      data: {
        statistics: {
          totalPets,
          availablePets,
          totalShelters,
          activeShelters,
          successfulAdoptions,
          recentAdoptions,
          lostPetsReunited,
          successRate
        },
        featuredPets: featuredPets.map(pet => ({
          id: pet._id,
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          images: pet.images || [],
          adoptionFee: pet.adoptionFee,
          description: pet.description,
          temperament: pet.temperament,
          shelter: pet.shelter ? {
            name: pet.shelter.name,
            location: `${pet.shelter.city}, ${pet.shelter.state}`
          } : null
        })),
        petTypes,
        successStories: formattedSuccessStories,
        highlights: [
          {
            title: 'Find Your Perfect Match',
            description: `${availablePets} pets are waiting for their forever homes`,
            icon: 'heart',
            color: '#e74c3c',
            value: availablePets
          },
          {
            title: 'Trusted Partners',
            description: `${activeShelters} verified shelters and rescue organizations`,
            icon: 'home',
            color: '#3498db',
            value: activeShelters
          },
          {
            title: 'Happy Endings',
            description: `${successRate}% success rate in pet adoptions`,
            icon: 'star',
            color: '#f39c12',
            value: `${successRate}%`
          },
          {
            title: 'Lives Saved',
            description: `${lostPetsReunited} lost pets reunited with families`,
            icon: 'shield',
            color: '#27ae60',
            value: lostPetsReunited
          }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching landing page stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing page statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/landing/featured-pets - Get featured pets with filters
router.get('/featured-pets', async (req, res) => {
  try {
    const {
      species = 'all',
      size = 'all',
      age = 'all',
      limit = 12
    } = req.query;

    // Build filter criteria
    const filter = { status: 'available' };

    if (species !== 'all') {
      filter.species = species;
    }

    if (size !== 'all') {
      filter.size = size;
    }

    if (age !== 'all') {
      const ageRanges = {
        young: { $lte: 2 },
        adult: { $gte: 3, $lte: 7 },
        senior: { $gte: 8 }
      };
      if (ageRanges[age]) {
        filter.age = ageRanges[age];
      }
    }

    const featuredPets = await Pet.find(filter)
      .populate('shelter', 'name city state phone email')
      .sort({ 
        isFeatured: -1, // Featured pets first
        createdAt: -1   // Then by newest
      })
      .limit(parseInt(limit))
      .lean();

    const formattedPets = featuredPets.map(pet => ({
      id: pet._id,
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      age: pet.age,
      size: pet.size,
      gender: pet.gender,
      images: pet.images || [],
      adoptionFee: pet.adoptionFee,
      description: pet.description,
      temperament: pet.temperament,
      isSpayedNeutered: pet.isSpayedNeutered,
      isVaccinated: pet.isVaccinated,
      isFeatured: pet.isFeatured || false,
      shelter: pet.shelter ? {
        id: pet.shelter._id,
        name: pet.shelter.name,
        location: `${pet.shelter.city}, ${pet.shelter.state}`,
        phone: pet.shelter.phone,
        email: pet.shelter.email
      } : null,
      badges: this.generatePetBadges(pet)
    }));

    res.json({
      success: true,
      data: {
        pets: formattedPets,
        totalCount: formattedPets.length,
        filters: {
          species,
          size,
          age,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching featured pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured pets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate pet badges
function generatePetBadges(pet) {
  const badges = [];

  if (pet.isFeatured) {
    badges.push({ text: 'Featured', color: '#e74c3c', icon: 'star' });
  }

  if (pet.isSpayedNeutered) {
    badges.push({ text: 'Spayed/Neutered', color: '#27ae60', icon: 'check' });
  }

  if (pet.isVaccinated) {
    badges.push({ text: 'Vaccinated', color: '#3498db', icon: 'shield' });
  }

  if (pet.temperament?.goodWithKids) {
    badges.push({ text: 'Kid Friendly', color: '#f39c12', icon: 'users' });
  }

  if (pet.temperament?.goodWithPets) {
    badges.push({ text: 'Pet Friendly', color: '#9b59b6', icon: 'heart' });
  }

  if (pet.age <= 1) {
    badges.push({ text: 'Puppy/Kitten', color: '#e67e22', icon: 'baby' });
  } else if (pet.age >= 8) {
    badges.push({ text: 'Senior', color: '#95a5a6', icon: 'clock' });
  }

  return badges;
}

// GET /api/landing/search - Quick search for pets
router.get('/search', async (req, res) => {
  try {
    const { 
      q = '', 
      species = 'all', 
      location = '', 
      limit = 20 
    } = req.query;

    const filter = { status: 'available' };
    const searchTerms = [];

    // Text search
    if (q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { breed: searchRegex },
        { description: searchRegex }
      ];
    }

    // Species filter
    if (species !== 'all') {
      filter.species = species;
    }

    let query = Pet.find(filter)
      .populate('shelter', 'name city state')
      .select('name breed species age size images adoptionFee shelter')
      .limit(parseInt(limit));

    // Location filter (if provided)
    if (location.trim()) {
      // This is a simplified location search
      // In production, you'd want to use proper geolocation
      query = query.populate({
        path: 'shelter',
        match: {
          $or: [
            { city: { $regex: location.trim(), $options: 'i' } },
            { state: { $regex: location.trim(), $options: 'i' } }
          ]
        },
        select: 'name city state'
      });
    }

    const pets = await query.lean();

    // Filter out pets with no matching shelters if location was specified
    const filteredPets = location.trim() ? 
      pets.filter(pet => pet.shelter) : pets;

    const searchResults = filteredPets.map(pet => ({
      id: pet._id,
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      age: pet.age,
      size: pet.size,
      images: pet.images || [],
      adoptionFee: pet.adoptionFee,
      shelter: pet.shelter ? {
        name: pet.shelter.name,
        location: `${pet.shelter.city}, ${pet.shelter.state}`
      } : null
    }));

    res.json({
      success: true,
      data: {
        results: searchResults,
        totalResults: searchResults.length,
        query: {
          searchTerm: q,
          species,
          location,
          limit: parseInt(limit)
        },
        suggestions: searchResults.length === 0 ? [
          'Try broadening your search criteria',
          'Check spelling of breed names',
          'Try searching in nearby cities',
          'Consider different pet types'
        ] : []
      }
    });

  } catch (error) {
    console.error('Error performing pet search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/landing/shelters - Get featured shelters
router.get('/shelters', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const shelters = await Shelter.find({ status: 'active' })
      .sort({ 
        isFeatured: -1, // Featured shelters first
        createdAt: -1   // Then by newest
      })
      .limit(parseInt(limit))
      .lean();

    // Get pet counts for each shelter
    const shelterIds = shelters.map(shelter => shelter._id);
    const petCounts = await Pet.aggregate([
      {
        $match: {
          shelter: { $in: shelterIds },
          status: 'available'
        }
      },
      {
        $group: {
          _id: '$shelter',
          count: { $sum: 1 }
        }
      }
    ]);

    const petCountMap = {};
    petCounts.forEach(count => {
      petCountMap[count._id.toString()] = count.count;
    });

    const formattedShelters = shelters.map(shelter => ({
      id: shelter._id,
      name: shelter.name,
      description: shelter.description,
      images: shelter.images || [],
      address: shelter.address,
      phone: shelter.phone,
      email: shelter.email,
      website: shelter.website,
      availablePets: petCountMap[shelter._id.toString()] || 0,
      services: shelter.services || [],
      isFeatured: shelter.isFeatured || false,
      rating: shelter.rating || 0,
      operatingHours: shelter.operatingHours
    }));

    res.json({
      success: true,
      data: {
        shelters: formattedShelters,
        totalCount: formattedShelters.length
      }
    });

  } catch (error) {
    console.error('Error fetching shelters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shelters',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/landing/testimonials - Get success story testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get recent successful adoptions with rich data
    const testimonials = await Application.find({ 
      status: 'approved',
      'feedback.testimonial': { $exists: true, $ne: '' }
    })
      .populate({
        path: 'petId',
        select: 'name breed images species'
      })
      .populate('adopterId', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedTestimonials = testimonials
      .filter(app => app.petId && app.adopterId && app.feedback?.testimonial)
      .map(app => ({
        id: app._id,
        testimonial: app.feedback.testimonial,
        rating: app.feedback.rating || 5,
        adopter: {
          name: app.adopterId.name,
          initials: app.adopterId.name.split(' ').map(n => n[0]).join('')
        },
        pet: {
          name: app.petId.name,
          breed: app.petId.breed,
          species: app.petId.species,
          image: app.petId.images?.[0] || null
        },
        adoptedDate: app.updatedAt,
        daysAgo: Math.floor((new Date() - new Date(app.updatedAt)) / (1000 * 60 * 60 * 24))
      }));

    // If no real testimonials, provide some sample ones
    if (formattedTestimonials.length === 0) {
      const sampleTestimonials = [
        {
          id: 'sample1',
          testimonial: 'PetPal helped us find the perfect companion. The process was smooth and the staff was incredibly helpful!',
          rating: 5,
          adopter: { name: 'Sarah Johnson', initials: 'SJ' },
          pet: { name: 'Max', breed: 'Golden Retriever', species: 'dog' },
          daysAgo: 15
        },
        {
          id: 'sample2',
          testimonial: 'Thanks to PetPal, we found our beautiful cat Luna. She has brought so much joy to our family!',
          rating: 5,
          adopter: { name: 'Mike Chen', initials: 'MC' },
          pet: { name: 'Luna', breed: 'Domestic Shorthair', species: 'cat' },
          daysAgo: 23
        }
      ];

      res.json({
        success: true,
        data: {
          testimonials: sampleTestimonials.slice(0, parseInt(limit)),
          totalCount: sampleTestimonials.length,
          isSample: true
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          testimonials: formattedTestimonials,
          totalCount: formattedTestimonials.length,
          isSample: false
        }
      });
    }

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;