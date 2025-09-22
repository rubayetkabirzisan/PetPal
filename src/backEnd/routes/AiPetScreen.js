const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const User = require('../models/User');
const Application = require('../models/Application');

// Mock AI service (in production, this would call actual AI APIs)
class AIMatchingService {
  static async getPersonalityMatch(userPreferences, petData) {
    // Simulate AI personality matching
    const compatibility = Math.random() * 100;
    const traits = ['friendly', 'energetic', 'calm', 'playful', 'loyal', 'gentle', 'intelligent'];
    const matchedTraits = traits.slice(0, Math.floor(Math.random() * 4) + 2);
    
    return {
      compatibilityScore: Math.round(compatibility),
      matchedTraits,
      recommendations: [
        'This pet matches your preference for active lifestyle',
        'Great choice for families with children',
        'Low maintenance grooming requirements'
      ]
    };
  }

  static async generatePetRecommendations(userId, preferences = {}) {
    const {
      activityLevel = 'moderate',
      livingSpace = 'apartment',
      experience = 'beginner',
      timeAvailable = 'moderate',
      allergies = false,
      children = false,
      otherPets = false
    } = preferences;

    // Build matching criteria based on preferences
    const matchCriteria = {
      status: 'available',
      $and: []
    };

    // Activity level matching
    if (activityLevel === 'low') {
      matchCriteria.$and.push({
        $or: [
          { 'temperament.energyLevel': { $lte: 3 } },
          { age: { $gte: 7 } }
        ]
      });
    } else if (activityLevel === 'high') {
      matchCriteria.$and.push({
        'temperament.energyLevel': { $gte: 4 }
      });
    }

    // Size matching for living space
    if (livingSpace === 'apartment') {
      matchCriteria.$and.push({
        size: { $in: ['small', 'medium'] }
      });
    }

    // Good with children filter
    if (children) {
      matchCriteria.$and.push({
        'temperament.goodWithKids': true
      });
    }

    // Good with other pets filter
    if (otherPets) {
      matchCriteria.$and.push({
        'temperament.goodWithPets': true
      });
    }

    return matchCriteria;
  }

  static async analyzePetBehavior(petId) {
    // Simulate behavioral analysis
    const behaviors = [
      { trait: 'Sociability', score: Math.floor(Math.random() * 10) + 1, description: 'How well the pet interacts with people' },
      { trait: 'Energy Level', score: Math.floor(Math.random() * 10) + 1, description: 'Activity and exercise needs' },
      { trait: 'Trainability', score: Math.floor(Math.random() * 10) + 1, description: 'How easily the pet learns commands' },
      { trait: 'Independence', score: Math.floor(Math.random() * 10) + 1, description: 'Comfort level when alone' },
      { trait: 'Playfulness', score: Math.floor(Math.random() * 10) + 1, description: 'Interest in games and toys' }
    ];

    const overallScore = Math.round(behaviors.reduce((sum, b) => sum + b.score, 0) / behaviors.length);
    
    return {
      overallScore,
      behaviors,
      insights: [
        'This pet would thrive in an active household',
        'Regular socialization recommended',
        'Benefits from consistent training routines'
      ]
    };
  }
}

// GET /api/ai-pet/recommendations - Get AI-powered pet recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const preferences = {
      activityLevel: req.query.activityLevel || 'moderate',
      livingSpace: req.query.livingSpace || 'apartment',
      experience: req.query.experience || 'beginner',
      timeAvailable: req.query.timeAvailable || 'moderate',
      allergies: req.query.allergies === 'true',
      children: req.query.children === 'true',
      otherPets: req.query.otherPets === 'true'
    };

    // Get matching criteria from AI service
    const matchCriteria = await AIMatchingService.generatePetRecommendations(userId, preferences);

    // If no specific criteria, remove empty $and array
    if (matchCriteria.$and.length === 0) {
      delete matchCriteria.$and;
    }

    // Fetch matching pets
    const pets = await Pet.find(matchCriteria)
      .populate('shelter', 'name address phone email')
      .limit(20)
      .lean();

    // Generate AI compatibility scores for each pet
    const petsWithAI = await Promise.all(pets.map(async (pet) => {
      const aiMatch = await AIMatchingService.getPersonalityMatch(preferences, pet);
      
      return {
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        size: pet.size,
        images: pet.images || [],
        description: pet.description,
        temperament: pet.temperament,
        adoptionFee: pet.adoptionFee,
        shelter: pet.shelter,
        aiMatch: {
          compatibilityScore: aiMatch.compatibilityScore,
          matchedTraits: aiMatch.matchedTraits,
          recommendations: aiMatch.recommendations
        },
        matchReasons: this.generateMatchReasons(pet, preferences)
      };
    }));

    // Sort by compatibility score
    petsWithAI.sort((a, b) => b.aiMatch.compatibilityScore - a.aiMatch.compatibilityScore);

    res.json({
      success: true,
      data: {
        recommendations: petsWithAI,
        preferences,
        totalMatches: petsWithAI.length,
        aiInsights: {
          topMatch: petsWithAI.length > 0 ? petsWithAI[0] : null,
          averageCompatibility: petsWithAI.length > 0 
            ? Math.round(petsWithAI.reduce((sum, pet) => sum + pet.aiMatch.compatibilityScore, 0) / petsWithAI.length)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate match reasons
function generateMatchReasons(pet, preferences) {
  const reasons = [];
  
  if (preferences.children && pet.temperament?.goodWithKids) {
    reasons.push('Great with children');
  }
  
  if (preferences.otherPets && pet.temperament?.goodWithPets) {
    reasons.push('Gets along with other pets');
  }
  
  if (preferences.livingSpace === 'apartment' && ['small', 'medium'].includes(pet.size)) {
    reasons.push('Perfect size for apartment living');
  }
  
  if (preferences.activityLevel === 'low' && (pet.temperament?.energyLevel <= 3 || pet.age >= 7)) {
    reasons.push('Low energy, perfect for relaxed lifestyle');
  }
  
  if (preferences.activityLevel === 'high' && pet.temperament?.energyLevel >= 4) {
    reasons.push('High energy, great for active owners');
  }
  
  return reasons;
}

// GET /api/ai-pet/compatibility/:petId - Get AI compatibility analysis for specific pet
router.get('/compatibility/:petId', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const pet = await Pet.findById(req.params.petId)
      .populate('shelter', 'name address phone email')
      .lean();

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Get user preferences (in production, this would be from user profile)
    const userPreferences = {
      activityLevel: req.query.activityLevel || 'moderate',
      livingSpace: req.query.livingSpace || 'apartment',
      experience: req.query.experience || 'beginner',
      timeAvailable: req.query.timeAvailable || 'moderate',
      allergies: req.query.allergies === 'true',
      children: req.query.children === 'true',
      otherPets: req.query.otherPets === 'true'
    };

    // Generate AI compatibility analysis
    const aiMatch = await AIMatchingService.getPersonalityMatch(userPreferences, pet);
    const behaviorAnalysis = await AIMatchingService.analyzePetBehavior(pet._id);

    res.json({
      success: true,
      data: {
        pet: {
          id: pet._id,
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          size: pet.size,
          images: pet.images || [],
          description: pet.description,
          temperament: pet.temperament,
          shelter: pet.shelter
        },
        compatibility: {
          score: aiMatch.compatibilityScore,
          level: aiMatch.compatibilityScore >= 80 ? 'Excellent' : 
                 aiMatch.compatibilityScore >= 60 ? 'Good' : 
                 aiMatch.compatibilityScore >= 40 ? 'Fair' : 'Low',
          matchedTraits: aiMatch.matchedTraits,
          recommendations: aiMatch.recommendations,
          matchReasons: generateMatchReasons(pet, userPreferences)
        },
        behaviorAnalysis: {
          overallScore: behaviorAnalysis.overallScore,
          behaviors: behaviorAnalysis.behaviors,
          insights: behaviorAnalysis.insights
        },
        userPreferences
      }
    });
  } catch (error) {
    console.error('Error analyzing pet compatibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze pet compatibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/ai-pet/preferences - Update user preferences for AI matching
router.post('/preferences', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const {
      activityLevel,
      livingSpace,
      experience,
      timeAvailable,
      allergies,
      children,
      otherPets,
      preferredSize,
      preferredAge,
      preferredBreeds
    } = req.body;

    // Update user's AI preferences
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.ai': {
            activityLevel,
            livingSpace,
            experience,
            timeAvailable,
            allergies,
            children,
            otherPets,
            preferredSize,
            preferredAge,
            preferredBreeds,
            updatedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    ).select('preferences');

    res.json({
      success: true,
      message: 'AI preferences updated successfully',
      data: {
        preferences: user.preferences.ai
      }
    });
  } catch (error) {
    console.error('Error updating AI preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ai-pet/insights - Get AI insights and analytics
router.get('/insights', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;

    // Get trending pets based on applications
    const trendingPets = await Application.aggregate([
      {
        $group: {
          _id: '$petId',
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: '_id',
          as: 'pet'
        }
      },
      { $unwind: '$pet' },
      {
        $project: {
          name: '$pet.name',
          breed: '$pet.breed',
          images: '$pet.images',
          applicationCount: 1
        }
      }
    ]);

    // Get breed popularity
    const breedStats = await Pet.aggregate([
      {
        $group: {
          _id: '$breed',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
          avgFee: { $avg: '$adoptionFee' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        insights: {
          trendingPets,
          breedStats,
          recommendations: [
            'Mixed breeds have 15% higher adoption rates',
            'Pets aged 2-5 years are adopted fastest',
            'Indoor cats are most popular in urban areas'
          ]
        },
        metrics: {
          totalPetsAnalyzed: await Pet.countDocuments(),
          averageMatchScore: 75,
          successfulMatches: 142
        }
      }
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;