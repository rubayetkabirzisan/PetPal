const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const User = require('../models/User');
const Application = require('../models/Application');
const Shelter = require('../models/Shelter');
const LostPet = require('../models/LostPet');
// const Analytics = require('../models/Analytics');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  req.userId = userId;
  next();
};

// Role verification middleware
const requireAdminRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed'
    });
  }
};

// Input validation middleware
const validateDateRange = (req, res, next) => {
  const { startDate, endDate, period = '30d' } = req.query;
  
  if (startDate && !Date.parse(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format'
    });
  }
  
  if (endDate && !Date.parse(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format'
    });
  }
  
  if (!['7d', '30d', '90d', '1y'].includes(period)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid period. Must be one of: 7d, 30d, 90d, 1y'
    });
  }
  
  next();
};

// Error handling middleware
const handleError = (res, error, message = 'Internal server error') => {
  console.error('Admin Dashboard Error:', error);
  res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Mock database for demonstration - Fallback data
let dashboardData = {
  stats: {
    availablePets: 24,
    pendingApplications: 8,
    successfulAdoptions: 156,
    lostPetReports: 3,
    totalPets: 180,
    totalUsers: 245,
    monthlyAdoptions: 12,
    activeVolunteers: 15
  },
  recentActivity: [
    {
      id: "activity-001",
      type: "application",
      message: "New adoption application for Buddy",
      time: "2 hours ago",
      timestamp: "2025-09-21T17:00:00Z",
      petId: "pet-1",
      applicationId: "app-101",
      userId: "user-001",
      priority: "medium"
    },
    {
      id: "activity-002",
      type: "pet",
      message: "Luna was successfully adopted",
      time: "5 hours ago",
      timestamp: "2025-09-21T14:00:00Z",
      petId: "pet-2",
      adopterId: "user-002",
      priority: "high"
    },
    {
      id: "activity-003",
      type: "lost",
      message: "Lost pet report: Max (German Shepherd)",
      time: "1 day ago",
      timestamp: "2025-09-20T19:00:00Z",
      reportId: "lost-1",
      reporterId: "user-003",
      priority: "high"
    },
    {
      id: "activity-004",
      type: "application",
      message: "Application approved for Bella",
      time: "2 days ago",
      timestamp: "2025-09-19T15:30:00Z",
      petId: "pet-3",
      applicationId: "app-102",
      userId: "user-004",
      priority: "low"
    },
    {
      id: "activity-005",
      type: "verification",
      message: "New user verification request from Sarah",
      time: "3 hours ago",
      timestamp: "2025-09-21T16:00:00Z",
      userId: "user-005",
      priority: "medium"
    },
    {
      id: "activity-006",
      type: "health",
      message: "Health check completed for Charlie",
      time: "6 hours ago",
      timestamp: "2025-09-21T13:00:00Z",
      petId: "pet-4",
      vetId: "vet-001",
      priority: "low"
    }
  ],
  alerts: [
    {
      id: "alert-001",
      type: "verification",
      title: "Pending Verifications",
      message: "5 adopter profiles need verification review",
      count: 5,
      priority: "high",
      icon: "warning-outline",
      color: "#FF9500",
      actionText: "Review",
      actionRoute: "Applications",
      createdAt: "2025-09-21T08:00:00Z"
    },
    {
      id: "alert-002",
      type: "health",
      title: "Overdue Health Checks",
      message: "3 pets need scheduled health checkups",
      count: 3,
      priority: "medium",
      icon: "time-outline",
      color: "#007AFF",
      actionText: "Schedule",
      actionRoute: "Analytics",
      createdAt: "2025-09-21T07:00:00Z"
    },
    {
      id: "alert-003",
      type: "supplies",
      title: "Low Inventory",
      message: "Pet food and medical supplies running low",
      count: 2,
      priority: "medium",
      icon: "cube-outline",
      color: "#FF3B30",
      actionText: "Order",
      actionRoute: "Inventory",
      createdAt: "2025-09-21T06:00:00Z"
    }
  ],
  quickActions: [
    {
      id: "action-001",
      title: "Add New Pet",
      icon: "add-circle-outline",
      route: "AddPet",
      description: "Register a new pet for adoption",
      isActive: true
    },
    {
      id: "action-002",
      title: "Review Applications",
      icon: "document-text-outline",
      route: "Applications",
      description: "Process pending adoption applications",
      isActive: true
    },
    {
      id: "action-003",
      title: "Manage Lost Pets",
      icon: "alert-circle-outline",
      route: "LostPets",
      description: "Handle lost and found pet reports",
      isActive: true
    },
    {
      id: "action-004",
      title: "View Analytics",
      icon: "bar-chart-outline",
      route: "Analytics",
      description: "Review shelter performance metrics",
      isActive: true
    }
  ]
};

// GET /api/admin-dashboard - Get complete dashboard data
router.get('/', authenticateAdmin, requireAdminRole, validateDateRange, async (req, res) => {
  try {
    const { includeActivity = true, includeAlerts = true, activityLimit = 10, period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
    }

    // Get real-time statistics from database
    const [
      totalPets,
      availablePets,
      adoptedPets,
      pendingApplications,
      totalUsers,
      totalShelters,
      lostPetReports,
      recentApplications
    ] = await Promise.all([
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'available' }),
      Pet.countDocuments({ status: 'adopted', adoptionDate: { $gte: startDate } }),
      Application.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $in: ['adopter', 'volunteer'] } }),
      Shelter.countDocuments({ status: 'active' }),
      LostPet.countDocuments({ status: 'missing', reportDate: { $gte: startDate } }),
      Application.find({ createdAt: { $gte: startDate } })
        .populate('petId', 'name breed')
        .populate('adopterId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(activityLimit))
        .lean()
    ]);

    const stats = {
      totalPets,
      availablePets,
      adoptedPets,
      pendingApplications,
      successfulAdoptions: adoptedPets,
      totalUsers,
      totalShelters,
      lostPetReports,
      adoptionRate: totalPets > 0 ? ((adoptedPets / totalPets) * 100).toFixed(1) : '0',
      averageAdoptionTime: '14 days' // Could calculate from actual data
    };

    let responseData = {
      stats,
      admin: {
        name: req.user.name,
        role: req.user.role,
        lastLogin: req.user.lastLogin
      },
      period: {
        label: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    };

    if (includeActivity === 'true') {
      responseData.recentActivity = recentApplications.map(app => ({
        id: app._id,
        type: 'application',
        message: `New adoption application for ${app.petId?.name || 'Unknown Pet'}`,
        timestamp: app.createdAt,
        formattedTime: formatTimeAgo(app.createdAt),
        petId: app.petId?._id,
        userId: app.adopterId?._id,
        priority: app.status === 'pending' ? 'high' : 'medium',
        details: {
          petName: app.petId?.name,
          petBreed: app.petId?.breed,
          adopterName: app.adopterId?.name,
          status: app.status
        }
      }));
    }

    if (includeAlerts === 'true') {
      // Get recent alerts from lost pets and urgent applications
      const urgentLostPets = await LostPet.find({ 
        status: 'missing',
        reportDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).limit(5).lean();
      
      responseData.alerts = urgentLostPets.map(lostPet => ({
        id: lostPet._id,
        type: 'lost_pet',
        priority: 'high',
        message: `Urgent: ${lostPet.name} reported missing`,
        createdAt: lostPet.reportDate,
        formattedTime: formatTimeAgo(lostPet.reportDate),
        resolved: false
      }));
    }

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleError(res, error, 'Failed to fetch dashboard data');
  }
});

// GET /api/admin-dashboard/stats - Get dashboard statistics only
router.get('/stats', (req, res) => {
  try {
    const stats = {
      ...dashboardData.stats,
      lastUpdated: new Date().toISOString(),
      trends: {
        adoptionsThisMonth: {
          current: dashboardData.stats.monthlyAdoptions,
          previous: 8,
          percentageChange: 50
        },
        applicationsThisWeek: {
          current: dashboardData.stats.pendingApplications,
          previous: 12,
          percentageChange: -33
        },
        newPetsThisWeek: {
          current: 6,
          previous: 4,
          percentageChange: 50
        }
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// GET /api/admin-dashboard/recent-activity - Get recent activity feed
router.get('/recent-activity', (req, res) => {
  try {
    const { limit = 10, type, priority } = req.query;

    let activities = [...dashboardData.recentActivity];

    // Filter by type if specified
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }

    // Filter by priority if specified
    if (priority) {
      activities = activities.filter(activity => activity.priority === priority);
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    activities = activities.slice(0, parseInt(limit));

    // Add formatted time
    const formattedActivities = activities.map(activity => ({
      ...activity,
      formattedTime: formatTimeAgo(activity.timestamp)
    }));

    res.json({
      success: true,
      data: {
        activities: formattedActivities,
        total: formattedActivities.length,
        filters: { type, priority, limit }
      }
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
});

// GET /api/admin-dashboard/alerts - Get system alerts
router.get('/alerts', (req, res) => {
  try {
    const { priority, type } = req.query;

    let alerts = [...dashboardData.alerts];

    // Filter by priority if specified
    if (priority) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }

    // Filter by type if specified
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // Sort by priority and creation time
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Add formatted time
    const formattedAlerts = alerts.map(alert => ({
      ...alert,
      formattedTime: formatTimeAgo(alert.createdAt)
    }));

    const alertCounts = {
      high: alerts.filter(a => a.priority === 'high').length,
      medium: alerts.filter(a => a.priority === 'medium').length,
      low: alerts.filter(a => a.priority === 'low').length,
      total: alerts.length
    };

    res.json({
      success: true,
      data: {
        alerts: formattedAlerts,
        counts: alertCounts,
        filters: { priority, type }
      }
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// POST /api/admin-dashboard/alerts/:alertId/dismiss - Dismiss an alert
router.post('/alerts/:alertId/dismiss', (req, res) => {
  try {
    const { alertId } = req.params;

    const alertIndex = dashboardData.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Remove the alert
    const dismissedAlert = dashboardData.alerts.splice(alertIndex, 1)[0];

    res.json({
      success: true,
      message: 'Alert dismissed successfully',
      data: dismissedAlert
    });

  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert',
      error: error.message
    });
  }
});

// POST /api/admin-dashboard/activity - Add new activity (for system events)
router.post('/activity', (req, res) => {
  try {
    const {
      type,
      message,
      petId,
      applicationId,
      userId,
      priority = 'medium'
    } = req.body;

    // Validation
    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type and message are required fields'
      });
    }

    const newActivity = {
      id: `activity-${Date.now()}`,
      type,
      message,
      time: formatTimeAgo(new Date().toISOString()),
      timestamp: new Date().toISOString(),
      petId,
      applicationId,
      userId,
      priority
    };

    // Add to beginning of activities array
    dashboardData.recentActivity.unshift(newActivity);

    // Keep only last 50 activities
    if (dashboardData.recentActivity.length > 50) {
      dashboardData.recentActivity = dashboardData.recentActivity.slice(0, 50);
    }

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: newActivity
    });

  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add activity',
      error: error.message
    });
  }
});

// PUT /api/admin-dashboard/stats - Update dashboard statistics
router.put('/stats', (req, res) => {
  try {
    const {
      availablePets,
      pendingApplications,
      successfulAdoptions,
      lostPetReports,
      totalPets,
      totalUsers,
      monthlyAdoptions,
      activeVolunteers
    } = req.body;

    // Update stats (only update provided values)
    if (availablePets !== undefined) dashboardData.stats.availablePets = parseInt(availablePets);
    if (pendingApplications !== undefined) dashboardData.stats.pendingApplications = parseInt(pendingApplications);
    if (successfulAdoptions !== undefined) dashboardData.stats.successfulAdoptions = parseInt(successfulAdoptions);
    if (lostPetReports !== undefined) dashboardData.stats.lostPetReports = parseInt(lostPetReports);
    if (totalPets !== undefined) dashboardData.stats.totalPets = parseInt(totalPets);
    if (totalUsers !== undefined) dashboardData.stats.totalUsers = parseInt(totalUsers);
    if (monthlyAdoptions !== undefined) dashboardData.stats.monthlyAdoptions = parseInt(monthlyAdoptions);
    if (activeVolunteers !== undefined) dashboardData.stats.activeVolunteers = parseInt(activeVolunteers);

    res.json({
      success: true,
      message: 'Statistics updated successfully',
      data: dashboardData.stats
    });

  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update statistics',
      error: error.message
    });
  }
});

// GET /api/admin-dashboard/quick-actions - Get available quick actions
router.get('/quick-actions', (req, res) => {
  try {
    const { activeOnly = true } = req.query;

    let actions = [...dashboardData.quickActions];

    if (activeOnly === 'true') {
      actions = actions.filter(action => action.isActive);
    }

    res.json({
      success: true,
      data: {
        actions,
        total: actions.length
      }
    });

  } catch (error) {
    console.error('Error fetching quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick actions',
      error: error.message
    });
  }
});

// GET /api/admin-dashboard/summary - Get dashboard summary for widgets
router.get('/summary', (req, res) => {
  try {
    const summary = {
      criticalAlerts: dashboardData.alerts.filter(alert => alert.priority === 'high').length,
      todayActivity: dashboardData.recentActivity.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const today = new Date();
        return activityDate.toDateString() === today.toDateString();
      }).length,
      pendingActions: dashboardData.stats.pendingApplications + 
                     dashboardData.alerts.filter(alert => alert.type === 'verification').length,
      successRate: Math.round((dashboardData.stats.successfulAdoptions / 
                              (dashboardData.stats.successfulAdoptions + dashboardData.stats.availablePets)) * 100),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message
    });
  }
});

// Helper function to format time ago
function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
}

module.exports = router;
