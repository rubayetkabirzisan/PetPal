const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Pet = require('../models/Pet');

// GET /api/application-list - Get simplified list of applications (for demo/legacy purposes)
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
      page = 1,
      limit = 20,
      status = 'all'
    } = req.query;

    // Build filter
    const filter = { adopterId: userId };
    if (status !== 'all') {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, totalCount] = await Promise.all([
      Application.find(filter)
        .populate('petId', 'name breed age images status adoptionFee')
        .select('status submittedAt updatedAt petId')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(filter)
    ]);

    // Simplified application list format
    const simplifiedApplications = applications.map(app => ({
      id: app._id,
      petName: app.petId?.name || 'Unknown Pet',
      petBreed: app.petId?.breed || 'Unknown Breed',
      petAge: app.petId?.age,
      petImages: app.petId?.images || [],
      petStatus: app.petId?.status || 'unknown',
      adoptionFee: app.petId?.adoptionFee || 0,
      applicationStatus: app.status,
      statusDisplay: app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      statusColor: this.getStatusColor(app.status),
      submittedDate: app.submittedAt,
      lastUpdated: app.updatedAt,
      daysAgo: Math.floor((new Date() - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24)),
      canView: true,
      canEdit: app.status === 'pending',
      canWithdraw: ['pending', 'under_review'].includes(app.status)
    }));

    // Get quick statistics
    const statusCounts = await Application.aggregate([
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

    statusCounts.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        applications: simplifiedApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        summary: {
          totalApplications: totalCount,
          pendingApplications: stats.pending,
          approvedApplications: stats.approved,
          rejectedApplications: stats.rejected,
          withdrawnApplications: stats.withdrawn,
          activeApplications: stats.pending + stats.under_review
        },
        quickStats: [
          {
            label: 'Total Applied',
            value: totalCount,
            icon: 'file-text',
            color: '#3498db'
          },
          {
            label: 'Pending Review',
            value: stats.pending + stats.under_review,
            icon: 'clock',
            color: '#f39c12'
          },
          {
            label: 'Approved',
            value: stats.approved,
            icon: 'check-circle',
            color: '#27ae60'
          },
          {
            label: 'Need Action',
            value: stats.pending,
            icon: 'alert-circle',
            color: '#e74c3c'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching application list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get status color
function getStatusColor(status) {
  const colors = {
    pending: '#f39c12',      // Orange
    under_review: '#3498db', // Blue
    approved: '#27ae60',     // Green  
    rejected: '#e74c3c',     // Red
    withdrawn: '#95a5a6'     // Gray
  };
  return colors[status] || '#95a5a6';
}

// GET /api/application-list/summary - Get quick summary for dashboard
router.get('/summary', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get application counts by status
    const statusSummary = await Application.aggregate([
      { $match: { adopterId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          latestDate: { $max: '$submittedAt' }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await Application.find({ adopterId: userId })
      .populate('petId', 'name breed images')
      .select('status submittedAt petId')
      .sort({ submittedAt: -1 })
      .limit(5)
      .lean();

    const summary = {
      totalApplications: 0,
      statusBreakdown: {
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        withdrawn: 0
      },
      recentActivity: recentApplications.map(app => ({
        id: app._id,
        petName: app.petId?.name || 'Unknown Pet',
        petBreed: app.petId?.breed || 'Unknown Breed',
        petImage: app.petId?.images?.[0] || null,
        status: app.status,
        submittedAt: app.submittedAt,
        daysAgo: Math.floor((new Date() - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24))
      })),
      alerts: []
    };

    statusSummary.forEach(stat => {
      summary.totalApplications += stat.count;
      summary.statusBreakdown[stat._id] = stat.count;
    });

    // Generate alerts
    if (summary.statusBreakdown.pending > 0) {
      summary.alerts.push({
        type: 'info',
        message: `You have ${summary.statusBreakdown.pending} pending application${summary.statusBreakdown.pending > 1 ? 's' : ''} awaiting review`,
        action: 'View Applications',
        priority: 'medium'
      });
    }

    if (summary.statusBreakdown.approved > 0) {
      summary.alerts.push({
        type: 'success',
        message: `Congratulations! You have ${summary.statusBreakdown.approved} approved application${summary.statusBreakdown.approved > 1 ? 's' : ''}`,
        action: 'View Details',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      data: {
        summary,
        hasApplications: summary.totalApplications > 0,
        needsAttention: summary.statusBreakdown.approved > 0 || summary.statusBreakdown.rejected > 0
      }
    });
  } catch (error) {
    console.error('Error fetching application summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/application-list/:id - Get basic application info (simplified view)
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
      .populate('petId', 'name breed age images status adoptionFee description')
      .select('status submittedAt updatedAt reason experience livingSpace')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    const simplifiedApplication = {
      id: application._id,
      status: application.status,
      statusDisplay: application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      statusColor: getStatusColor(application.status),
      submittedAt: application.submittedAt,
      lastUpdated: application.updatedAt,
      pet: {
        id: application.petId._id,
        name: application.petId.name,
        breed: application.petId.breed,
        age: application.petId.age,
        images: application.petId.images || [],
        status: application.petId.status,
        adoptionFee: application.petId.adoptionFee,
        description: application.petId.description
      },
      basicInfo: {
        reason: application.reason,
        experience: application.experience,
        livingSpace: application.livingSpace
      },
      actions: {
        canView: true,
        canEdit: application.status === 'pending',
        canWithdraw: ['pending', 'under_review'].includes(application.status),
        canReapply: application.status === 'rejected'
      },
      timeline: {
        submitted: application.submittedAt,
        lastUpdate: application.updatedAt,
        estimatedResponse: this.calculateEstimatedResponse(application.submittedAt, application.status)
      }
    };

    res.json({
      success: true,
      data: {
        application: simplifiedApplication
      }
    });
  } catch (error) {
    console.error('Error fetching simple application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate estimated response time (simplified)
function calculateEstimatedResponse(submittedAt, status) {
  if (['approved', 'rejected', 'withdrawn'].includes(status)) {
    return null;
  }

  const daysSinceSubmission = Math.floor((new Date() - new Date(submittedAt)) / (1000 * 60 * 60 * 24));
  const averageResponseTime = 7;
  const estimatedDays = Math.max(0, averageResponseTime - daysSinceSubmission);

  if (estimatedDays === 0) {
    return 'Response expected soon';
  } else if (estimatedDays <= 2) {
    return `Response in 1-2 days`;
  } else {
    return `Response in ${estimatedDays} days`;
  }
}

// POST /api/application-list/filter - Filter applications with advanced criteria
router.post('/filter', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const {
      statuses = [],
      dateRange = {},
      petTypes = [],
      page = 1,
      limit = 20
    } = req.body;

    // Build filter
    const filter = { adopterId: userId };
    
    if (statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    if (dateRange.start || dateRange.end) {
      filter.submittedAt = {};
      if (dateRange.start) {
        filter.submittedAt.$gte = new Date(dateRange.start);
      }
      if (dateRange.end) {
        filter.submittedAt.$lte = new Date(dateRange.end);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Application.find(filter)
      .populate('petId', 'name breed species age images status')
      .select('status submittedAt updatedAt petId')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by pet types if specified
    if (petTypes.length > 0) {
      query = query.where('petId.species').in(petTypes);
    }

    const [applications, totalCount] = await Promise.all([
      query.lean(),
      Application.countDocuments(filter)
    ]);

    const filteredApplications = applications.map(app => ({
      id: app._id,
      petName: app.petId?.name || 'Unknown Pet',
      petBreed: app.petId?.breed || 'Unknown Breed',
      petSpecies: app.petId?.species || 'Unknown',
      petImages: app.petId?.images || [],
      status: app.status,
      statusDisplay: app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      submittedDate: app.submittedAt,
      lastUpdated: app.updatedAt
    }));

    res.json({
      success: true,
      data: {
        applications: filteredApplications,
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        appliedFilters: {
          statuses,
          dateRange,
          petTypes
        }
      }
    });
  } catch (error) {
    console.error('Error filtering applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;