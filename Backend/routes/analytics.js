const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytics'); // Model to store analytics data

// Get analytics data
router.get('/view', async (req, res) => {
  try {
    const data = await Analytics.find();
    console.log(data); // Log the response to ensure data is being fetched
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Save analytics data
router.post('/save', async (req, res) => {
  try {
    const newData = new Analytics(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: 'Error saving analytics data', error: err.message });
  }
});

// Get dashboard overview with dummy data
router.get('/dashboard', async (req, res) => {
  try {
    // Generate realistic dummy analytics data
    const dashboardData = {
      analyticsData: [
        {
          title: "Total Pets Available",
          value: "142",
          icon: "🐕",
          color: "#3B82F6",
          trend: "+12%"
        },
        {
          title: "Successful Adoptions",
          value: "89",
          icon: "❤️",
          color: "#10B981",
          trend: "+8%"
        },
        {
          title: "Active Applications",
          value: "34",
          icon: "📋",
          color: "#F59E0B",
          trend: "+15%"
        },
        {
          title: "Registered Users",
          value: "567",
          icon: "👥",
          color: "#8B5CF6",
          trend: "+23%"
        },
        {
          title: "Shelter Partners",
          value: "28",
          icon: "🏠",
          color: "#EF4444",
          trend: "+3%"
        },
        {
          title: "Emergency Reports",
          value: "7",
          icon: "🚨",
          color: "#F97316",
          trend: "-5%"
        }
      ],
      recentMetrics: [
        {
          metric: "Daily Active Users",
          value: "245",
          trend: "up",
          percentage: "12%"
        },
        {
          metric: "Adoption Rate",
          value: "78%",
          trend: "up",
          percentage: "5%"
        },
        {
          metric: "Response Time",
          value: "2.3 hrs",
          trend: "down",
          percentage: "8%"
        },
        {
          metric: "User Satisfaction",
          value: "4.8/5",
          trend: "up",
          percentage: "3%"
        }
      ],
      chartData: {
        adoptionsPerMonth: [
          { month: "Jan", adoptions: 23, applications: 45 },
          { month: "Feb", adoptions: 31, applications: 52 },
          { month: "Mar", adoptions: 28, applications: 48 },
          { month: "Apr", adoptions: 35, applications: 58 },
          { month: "May", adoptions: 42, applications: 67 },
          { month: "Jun", adoptions: 38, applications: 61 }
        ],
        petTypeDistribution: [
          { type: "Dogs", count: 78, percentage: 55 },
          { type: "Cats", count: 45, percentage: 32 },
          { type: "Birds", count: 12, percentage: 8 },
          { type: "Rabbits", count: 5, percentage: 4 },
          { type: "Others", count: 2, percentage: 1 }
        ],
        userGrowth: [
          { month: "Jan", users: 234 },
          { month: "Feb", users: 267 },
          { month: "Mar", users: 298 },
          { month: "Apr", users: 332 },
          { month: "May", users: 378 },
          { month: "Jun", users: 567 }
        ]
      }
    };

    res.json(dashboardData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get pet statistics
router.get('/pets/stats', async (req, res) => {
  try {
    const petStats = {
      totalPets: 142,
      availablePets: 98,
      adoptedPets: 89,
      fosteredPets: 15,
      bySpecies: {
        dogs: 78,
        cats: 45,
        birds: 12,
        rabbits: 5,
        others: 2
      },
      byAge: {
        young: 56, // 0-2 years
        adult: 62, // 2-7 years
        senior: 24  // 7+ years
      },
      bySize: {
        small: 45,
        medium: 58,
        large: 39
      },
      averageAdoptionTime: 18, // days
      adoptionRate: 0.78
    };

    res.json(petStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const userStats = {
      totalUsers: 567,
      adopters: 489,
      shelters: 28,
      admins: 5,
      newUsersThisMonth: 67,
      activeUsers: 245,
      verifiedUsers: 234,
      userGrowthRate: 0.23
    };

    res.json(userStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get application statistics
router.get('/applications/stats', async (req, res) => {
  try {
    const applicationStats = {
      totalApplications: 156,
      pending: 34,
      approved: 89,
      rejected: 23,
      interviews: 10,
      averageProcessingTime: 5.2, // days
      approvalRate: 0.72
    };

    res.json(applicationStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Initialize dummy data (for testing)
router.post('/init-dummy-data', async (req, res) => {
  try {
    // Clear existing data
    await Analytics.deleteMany({});

    const dummyData = new Analytics({
      analyticsData: [
        {
          title: "Total Pets Available",
          value: "142",
          icon: "🐕",
          color: "#3B82F6"
        },
        {
          title: "Successful Adoptions",
          value: "89",
          icon: "❤️",
          color: "#10B981"
        },
        {
          title: "Active Applications",
          value: "34",
          icon: "📋",
          color: "#F59E0B"
        },
        {
          title: "Registered Users",
          value: "567",
          icon: "👥",
          color: "#8B5CF6"
        }
      ],
      recentMetrics: [
        {
          metric: "Daily Active Users",
          value: "245",
          trend: "up"
        },
        {
          metric: "Adoption Rate",
          value: "78%",
          trend: "up"
        },
        {
          metric: "Response Time",
          value: "2.3 hrs",
          trend: "down"
        }
      ]
    });

    await dummyData.save();
    res.status(201).json({
      message: 'Dummy analytics data initialized successfully',
      data: dummyData
    });
  } catch (err) {
    res.status(400).json({ message: 'Error initializing dummy data', error: err.message });
  }
});

module.exports = router;