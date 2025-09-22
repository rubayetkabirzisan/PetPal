const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Pet = require('../models/Pet');
const Notification = require('../models/Notification');

// GET /api/application-tracker/:id - Track specific application progress
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
        select: 'name breed age images status shelter',
        populate: {
          path: 'shelter',
          select: 'name phone email address'
        }
      })
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    // Create detailed tracking information
    const trackingStages = [
      {
        stage: 'submitted',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted',
        status: 'completed',
        date: application.submittedAt,
        icon: 'file-plus',
        color: '#27ae60'
      },
      {
        stage: 'under_review',
        title: 'Under Review',
        description: 'Shelter staff is reviewing your application',
        status: ['under_review', 'approved', 'rejected'].includes(application.status) ? 'completed' : 
                application.status === 'pending' ? 'current' : 'pending',
        date: application.reviewStartedAt || (application.status === 'under_review' ? application.updatedAt : null),
        icon: 'search',
        color: '#3498db'
      },
      {
        stage: 'background_check',
        title: 'Background Verification',
        description: 'Verifying references and background information',
        status: this.getBackgroundCheckStatus(application),
        date: application.backgroundCheckDate || null,
        icon: 'shield-check',
        color: '#9b59b6'
      },
      {
        stage: 'meet_greet',
        title: 'Meet & Greet',
        description: 'Schedule a meeting with the pet',
        status: this.getMeetGreetStatus(application),
        date: application.meetGreetDate || null,
        icon: 'heart',
        color: '#e67e22'
      },
      {
        stage: 'final_decision',
        title: 'Final Decision',
        description: 'Final approval or rejection decision',
        status: ['approved', 'rejected'].includes(application.status) ? 'completed' : 'pending',
        date: application.finalDecisionDate || (
          ['approved', 'rejected'].includes(application.status) ? application.updatedAt : null
        ),
        icon: application.status === 'approved' ? 'check-circle' : 
              application.status === 'rejected' ? 'x-circle' : 'clock',
        color: application.status === 'approved' ? '#27ae60' : 
               application.status === 'rejected' ? '#e74c3c' : '#95a5a6'
      }
    ];

    // Calculate progress percentage
    const completedStages = trackingStages.filter(stage => stage.status === 'completed').length;
    const progressPercentage = (completedStages / trackingStages.length) * 100;

    // Get estimated timeline
    const estimatedTimeline = this.calculateEstimatedTimeline(application);

    // Get next steps
    const nextSteps = this.getNextSteps(application);

    // Get communication history
    const communications = [
      ...(application.timeline || []),
      ...(application.messages || [])
    ].sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

    res.json({
      success: true,
      data: {
        application: {
          id: application._id,
          status: application.status,
          statusDisplay: application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          submittedAt: application.submittedAt,
          lastUpdated: application.updatedAt
        },
        pet: application.petId ? {
          id: application.petId._id,
          name: application.petId.name,
          breed: application.petId.breed,
          age: application.petId.age,
          images: application.petId.images || [],
          shelter: application.petId.shelter
        } : null,
        tracking: {
          stages: trackingStages,
          currentStage: trackingStages.find(stage => stage.status === 'current')?.stage || application.status,
          progressPercentage: Math.round(progressPercentage),
          estimatedCompletion: estimatedTimeline.estimatedCompletion,
          daysRemaining: estimatedTimeline.daysRemaining
        },
        nextSteps,
        communications: communications.slice(0, 10), // Last 10 communications
        alerts: this.generateAlerts(application, trackingStages),
        canWithdraw: ['pending', 'under_review'].includes(application.status)
      }
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get background check status
function getBackgroundCheckStatus(application) {
  if (application.backgroundCheckCompleted) return 'completed';
  if (application.backgroundCheckStarted || application.status === 'under_review') return 'current';
  return 'pending';
}

// Helper function to get meet & greet status
function getMeetGreetStatus(application) {
  if (application.meetGreetCompleted) return 'completed';
  if (application.meetGreetScheduled) return 'current';
  if (['under_review', 'approved'].includes(application.status)) return 'current';
  return 'pending';
}

// Helper function to calculate estimated timeline
function calculateEstimatedTimeline(application) {
  const daysSinceSubmission = Math.floor((new Date() - new Date(application.submittedAt)) / (1000 * 60 * 60 * 24));
  
  // Standard timeline: 7-14 days for complete process
  const averageProcessTime = 10;
  const remainingDays = Math.max(0, averageProcessTime - daysSinceSubmission);
  
  let estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + remainingDays);

  return {
    daysRemaining: remainingDays,
    estimatedCompletion: estimatedCompletion.toISOString().split('T')[0], // YYYY-MM-DD format
    isOverdue: remainingDays === 0 && !['approved', 'rejected', 'withdrawn'].includes(application.status)
  };
}

// Helper function to get next steps
function getNextSteps(application) {
  const steps = [];

  switch (application.status) {
    case 'pending':
      steps.push({
        action: 'Wait for initial review',
        description: 'Shelter staff will begin reviewing your application within 2-3 business days',
        timeframe: '2-3 days',
        priority: 'high'
      });
      break;

    case 'under_review':
      if (!application.backgroundCheckStarted) {
        steps.push({
          action: 'Background check in progress',
          description: 'References are being contacted and verified',
          timeframe: '3-5 days',
          priority: 'high'
        });
      }
      
      if (!application.meetGreetScheduled) {
        steps.push({
          action: 'Schedule meet & greet',
          description: 'You may be contacted to schedule a meeting with the pet',
          timeframe: '1-2 weeks',
          priority: 'medium'
        });
      }
      break;

    case 'approved':
      steps.push({
        action: 'Complete adoption process',
        description: 'Contact the shelter to finalize adoption paperwork and pickup',
        timeframe: 'ASAP',
        priority: 'urgent'
      });
      break;

    case 'rejected':
      steps.push({
        action: 'Consider feedback',
        description: 'Review rejection reasons and consider applying for other pets',
        timeframe: 'Anytime',
        priority: 'low'
      });
      break;

    default:
      steps.push({
        action: 'Monitor application',
        description: 'Check back regularly for updates on your application status',
        timeframe: 'Daily',
        priority: 'medium'
      });
  }

  return steps;
}

// Helper function to generate alerts
function generateAlerts(application, trackingStages) {
  const alerts = [];
  const daysSinceSubmission = Math.floor((new Date() - new Date(application.submittedAt)) / (1000 * 60 * 60 * 24));

  // Overdue alerts
  if (daysSinceSubmission > 14 && application.status === 'pending') {
    alerts.push({
      type: 'warning',
      title: 'Application Delayed',
      message: 'Your application has been pending for over 2 weeks. Consider contacting the shelter.',
      action: 'Contact Shelter',
      priority: 'high'
    });
  }

  // Status-specific alerts
  if (application.status === 'approved') {
    alerts.push({
      type: 'success',
      title: 'Application Approved!',
      message: 'Congratulations! Your application has been approved. Contact the shelter to proceed.',
      action: 'Contact Shelter',
      priority: 'urgent'
    });
  }

  if (application.status === 'rejected') {
    alerts.push({
      type: 'error',
      title: 'Application Not Approved',
      message: 'Unfortunately, your application was not approved. See details for more information.',
      action: 'View Details',
      priority: 'medium'
    });
  }

  // Missing information alerts
  if (application.status === 'under_review' && !application.references?.length) {
    alerts.push({
      type: 'info',
      title: 'References Needed',
      message: 'The shelter may need additional references to complete the review.',
      action: 'Add References',
      priority: 'medium'
    });
  }

  return alerts;
}

// GET /api/application-tracker - Get tracking summary for all user applications
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const applications = await Application.find({ adopterId: userId })
      .populate('petId', 'name breed images')
      .select('status submittedAt updatedAt petId')
      .sort({ submittedAt: -1 })
      .lean();

    const trackedApplications = applications.map(app => {
      const daysSinceSubmission = Math.floor((new Date() - new Date(app.submittedAt)) / (1000 * 60 * 60 * 24));
      const timeline = calculateEstimatedTimeline(app);
      
      return {
        id: app._id,
        pet: {
          name: app.petId?.name || 'Unknown Pet',
          breed: app.petId?.breed || 'Unknown Breed',
          image: app.petId?.images?.[0] || null
        },
        status: app.status,
        statusDisplay: app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        submittedAt: app.submittedAt,
        daysSinceSubmission,
        progressPercentage: this.calculateProgress(app.status),
        estimatedCompletion: timeline.estimatedCompletion,
        isOverdue: timeline.isOverdue,
        needsAction: ['approved'].includes(app.status)
      };
    });

    const summary = {
      totalApplications: applications.length,
      activeApplications: applications.filter(app => 
        ['pending', 'under_review'].includes(app.status)
      ).length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      needingAction: applications.filter(app => 
        ['approved'].includes(app.status)
      ).length
    };

    res.json({
      success: true,
      data: {
        applications: trackedApplications,
        summary,
        hasActiveApplications: summary.activeApplications > 0
      }
    });
  } catch (error) {
    console.error('Error fetching application tracking summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate progress percentage by status
function calculateProgress(status) {
  const progressMap = {
    pending: 20,
    under_review: 50,
    approved: 100,
    rejected: 100,
    withdrawn: 0
  };
  return progressMap[status] || 0;
}

// POST /api/application-tracker/:id/notifications - Subscribe to application notifications
router.post('/:id/notifications', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { notificationTypes = ['status_change', 'message', 'reminder'] } = req.body;

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

    // Update notification preferences for this application
    await Application.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'notificationPreferences': {
            types: notificationTypes,
            enabled: true,
            updatedAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: {
        notificationTypes,
        enabled: true
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;