const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Shelter = require('../models/Shelter');

// GET /api/application-details - Get all applications for a user with detailed info
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { 
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { adopterId: userId };
    if (status !== 'all') {
      filter.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, totalCount] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'petId',
          select: 'name breed age size images status adoptionFee description temperament',
          populate: {
            path: 'shelter',
            select: 'name address phone email'
          }
        })
        .populate('adopterId', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Get status statistics
    const statusStats = await Application.aggregate([
      { $match: { adopterId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: totalCount,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0
    };

    statusStats.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    const formattedApplications = applications.map(app => ({
      id: app._id,
      status: app.status,
      statusDisplay: app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      submittedAt: app.submittedAt,
      lastUpdated: app.updatedAt,
      pet: app.petId ? {
        id: app.petId._id,
        name: app.petId.name,
        breed: app.petId.breed,
        age: app.petId.age,
        size: app.petId.size,
        images: app.petId.images || [],
        status: app.petId.status,
        adoptionFee: app.petId.adoptionFee,
        description: app.petId.description,
        temperament: app.petId.temperament,
        shelter: app.petId.shelter ? {
          id: app.petId.shelter._id,
          name: app.petId.shelter.name,
          address: app.petId.shelter.address,
          phone: app.petId.shelter.phone,
          email: app.petId.shelter.email
        } : null
      } : null,
      applicationDetails: {
        experience: app.experience,
        livingSpace: app.livingSpace,
        hasYard: app.hasYard,
        otherPets: app.otherPets,
        workSchedule: app.workSchedule,
        reason: app.reason,
        references: app.references || [],
        housingType: app.housingType,
        landlordPermission: app.landlordPermission,
        veterinarianInfo: app.veterinarianInfo,
        emergencyContact: app.emergencyContact
      },
      timeline: app.timeline || [],
      notes: app.notes || '',
      reviewNotes: app.reviewNotes || '',
      estimatedResponse: this.calculateEstimatedResponse(app.submittedAt, app.status)
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        statistics: stats,
        filters: {
          status,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate estimated response time
function calculateEstimatedResponse(submittedAt, status) {
  if (['approved', 'rejected', 'withdrawn'].includes(status)) {
    return null; // Application is completed
  }

  const daysSinceSubmission = Math.floor((new Date() - new Date(submittedAt)) / (1000 * 60 * 60 * 24));
  const averageResponseTime = 7; // 7 days average
  const estimatedDays = Math.max(0, averageResponseTime - daysSinceSubmission);

  return {
    days: estimatedDays,
    message: estimatedDays === 0 
      ? 'Response expected any day now'
      : `Estimated response in ${estimatedDays} ${estimatedDays === 1 ? 'day' : 'days'}`
  };
}

// GET /api/application-details/:id - Get specific application details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      adopterId: userId
    })
      .populate({
        path: 'petId',
        select: 'name breed age size images status adoptionFee description temperament healthRecords vaccinations',
        populate: {
          path: 'shelter',
          select: 'name address phone email website operatingHours'
        }
      })
      .populate('adopterId', 'name email phone address')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    const detailedApplication = {
      id: application._id,
      status: application.status,
      statusDisplay: application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      submittedAt: application.submittedAt,
      lastUpdated: application.updatedAt,
      pet: application.petId ? {
        id: application.petId._id,
        name: application.petId.name,
        breed: application.petId.breed,
        age: application.petId.age,
        size: application.petId.size,
        images: application.petId.images || [],
        status: application.petId.status,
        adoptionFee: application.petId.adoptionFee,
        description: application.petId.description,
        temperament: application.petId.temperament,
        healthRecords: application.petId.healthRecords || [],
        vaccinations: application.petId.vaccinations || [],
        shelter: application.petId.shelter
      } : null,
      adopter: {
        id: application.adopterId._id,
        name: application.adopterId.name,
        email: application.adopterId.email,
        phone: application.adopterId.phone,
        address: application.adopterId.address
      },
      applicationDetails: {
        experience: application.experience,
        livingSpace: application.livingSpace,
        hasYard: application.hasYard,
        yardSize: application.yardSize,
        yardFenced: application.yardFenced,
        otherPets: application.otherPets,
        otherPetsDetails: application.otherPetsDetails,
        workSchedule: application.workSchedule,
        reason: application.reason,
        references: application.references || [],
        housingType: application.housingType,
        ownRent: application.ownRent,
        landlordPermission: application.landlordPermission,
        landlordContact: application.landlordContact,
        veterinarianInfo: application.veterinarianInfo,
        emergencyContact: application.emergencyContact,
        allergies: application.allergies,
        children: application.children,
        childrenAges: application.childrenAges,
        activityLevel: application.activityLevel,
        timeCommitment: application.timeCommitment
      },
      timeline: application.timeline || [],
      notes: application.notes || '',
      reviewNotes: application.reviewNotes || '',
      documents: application.documents || [],
      estimatedResponse: calculateEstimatedResponse(application.submittedAt, application.status),
      canWithdraw: ['pending', 'under_review'].includes(application.status),
      canEdit: application.status === 'pending'
    };

    res.json({
      success: true,
      data: {
        application: detailedApplication
      }
    });
  } catch (error) {
    console.error('Error fetching specific application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/application-details/:id - Update application (only if status is pending)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // First check if application exists and belongs to user
    const existingApplication = await Application.findOne({
      _id: req.params.id,
      adopterId: userId
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    if (existingApplication.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application can only be edited when status is pending'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated by user
    delete updateData.adopterId;
    delete updateData.petId;
    delete updateData.status;
    delete updateData.submittedAt;
    delete updateData.timeline;
    delete updateData.reviewNotes;
    delete updateData.userId;

    // Add to timeline
    const timelineEntry = {
      action: 'updated',
      date: new Date(),
      actor: 'adopter',
      description: 'Application details updated by adopter'
    };

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        $push: { timeline: timelineEntry }
      },
      { new: true }
    ).populate('petId', 'name breed');

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: {
        application: {
          id: updatedApplication._id,
          status: updatedApplication.status,
          lastUpdated: updatedApplication.updatedAt,
          pet: updatedApplication.petId
        }
      }
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/application-details/:id/withdraw - Withdraw application
router.put('/:id/withdraw', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { reason = 'Withdrawn by adopter' } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      adopterId: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    if (!['pending', 'under_review'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be withdrawn at this stage'
      });
    }

    // Add timeline entry
    const timelineEntry = {
      action: 'withdrawn',
      date: new Date(),
      actor: 'adopter',
      description: `Application withdrawn: ${reason}`
    };

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: 'withdrawn',
        withdrawalReason: reason,
        withdrawnAt: new Date(),
        updatedAt: new Date(),
        $push: { timeline: timelineEntry }
      },
      { new: true }
    ).populate('petId', 'name breed');

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {
        application: {
          id: updatedApplication._id,
          status: updatedApplication.status,
          withdrawnAt: updatedApplication.withdrawnAt,
          pet: updatedApplication.petId
        }
      }
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/application-details/:id/messages - Add message to application
router.post('/:id/messages', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      adopterId: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    const messageEntry = {
      message: message.trim(),
      sender: 'adopter',
      senderId: userId,
      timestamp: new Date()
    };

    const timelineEntry = {
      action: 'message_added',
      date: new Date(),
      actor: 'adopter',
      description: 'Adopter added a message'
    };

    await Application.findByIdAndUpdate(
      req.params.id,
      {
        $push: { 
          messages: messageEntry,
          timeline: timelineEntry 
        },
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Message added successfully',
      data: {
        message: messageEntry
      }
    });
  } catch (error) {
    console.error('Error adding message to application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;