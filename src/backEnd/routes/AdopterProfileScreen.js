const express = require('express');
const router = express.Router();

// Mock database for demonstration - replace with actual database integration
let profilesData = [
  {
    id: "user-001",
    name: "Demo User",
    email: "demo@example.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    bio: "Animal lover looking for the perfect companion. I have experience with both dogs and cats.",
    profileImage: null,
    userType: "adopter", // adopter or admin/shelter
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-09-20T15:45:00Z",
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    },
    stats: {
      adoptedPets: 2,
      applications: 5,
      favoritesPets: 12,
      messages: 8
    }
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@shelter.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    bio: "Dedicated shelter manager with 10+ years of experience in animal rescue and rehabilitation.",
    profileImage: "https://example.com/profiles/sarah.jpg",
    userType: "admin",
    createdAt: "2024-06-10T08:15:00Z",
    updatedAt: "2025-09-20T12:30:00Z",
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: true
    },
    stats: {
      managedPets: 156,
      applications: 89,
      completedAdoptions: 67,
      messages: 234
    }
  },
  {
    id: "user-003",
    name: "Mike Chen",
    email: "mike.chen@example.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    bio: "First-time pet adopter excited to find a furry friend for my family.",
    profileImage: null,
    userType: "adopter",
    createdAt: "2025-08-05T14:20:00Z",
    updatedAt: "2025-09-19T09:15:00Z",
    preferences: {
      notifications: true,
      emailUpdates: false,
      smsUpdates: true
    },
    stats: {
      adoptedPets: 0,
      applications: 3,
      favoritesPets: 8,
      messages: 15
    }
  }
];

let notificationsData = [
  {
    id: "notif-001",
    userId: "user-001",
    type: "application_update",
    title: "Application Update",
    message: "Your adoption application for Luna has been approved!",
    timestamp: "2025-09-20T14:30:00Z",
    isRead: false,
    priority: "high"
  },
  {
    id: "notif-002",
    userId: "user-001",
    type: "new_message",
    title: "New Message",
    message: "You have a new message from Happy Paws Shelter",
    timestamp: "2025-09-20T10:15:00Z",
    isRead: false,
    priority: "medium"
  },
  {
    id: "notif-003",
    userId: "user-001",
    type: "pet_match",
    title: "Perfect Match Found",
    message: "We found a pet that matches your preferences!",
    timestamp: "2025-09-19T16:45:00Z",
    isRead: true,
    priority: "medium"
  }
];

// GET /api/adopter-profile/:userId - Get user profile
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = profilesData.find(p => p.id === userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Don't expose sensitive information
    const safeProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      profileImage: profile.profileImage,
      userType: profile.userType,
      updatedAt: profile.updatedAt,
      stats: profile.stats
    };

    res.json({
      success: true,
      data: safeProfile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// PUT /api/adopter-profile/:userId - Update user profile
router.put('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      location,
      bio,
      profileImage
    } = req.body;

    const profileIndex = profilesData.findIndex(p => p.id === userId);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email is already used by another user
    const existingEmail = profilesData.find(p => p.email === email && p.id !== userId);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already in use'
      });
    }

    // Update profile
    const updatedProfile = {
      ...profilesData[profileIndex],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : profilesData[profileIndex].phone,
      location: location ? location.trim() : profilesData[profileIndex].location,
      bio: bio ? bio.trim() : profilesData[profileIndex].bio,
      profileImage: profileImage !== undefined ? profileImage : profilesData[profileIndex].profileImage,
      updatedAt: new Date().toISOString()
    };

    profilesData[profileIndex] = updatedProfile;

    // Return safe profile data
    const safeProfile = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      location: updatedProfile.location,
      bio: updatedProfile.bio,
      profileImage: updatedProfile.profileImage,
      userType: updatedProfile.userType,
      updatedAt: updatedProfile.updatedAt,
      stats: updatedProfile.stats
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: safeProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// POST /api/adopter-profile/:userId/upload-image - Upload profile image
router.post('/:userId/upload-image', (req, res) => {
  try {
    const { userId } = req.params;
    const { imageData, imageType = 'image/jpeg' } = req.body;

    const profileIndex = profilesData.findIndex(p => p.id === userId);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    // In a real implementation, you would:
    // 1. Validate image format and size
    // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Generate and return the public URL
    
    // For demo purposes, we'll simulate an uploaded image URL
    const mockImageUrl = `https://petpal-storage.com/profiles/${userId}_${Date.now()}.jpg`;

    // Update profile with new image URL
    profilesData[profileIndex] = {
      ...profilesData[profileIndex],
      profileImage: mockImageUrl,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: mockImageUrl
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// DELETE /api/adopter-profile/:userId/remove-image - Remove profile image
router.delete('/:userId/remove-image', (req, res) => {
  try {
    const { userId } = req.params;

    const profileIndex = profilesData.findIndex(p => p.id === userId);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Remove profile image
    profilesData[profileIndex] = {
      ...profilesData[profileIndex],
      profileImage: null,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Profile image removed successfully'
    });

  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove image',
      error: error.message
    });
  }
});

// GET /api/adopter-profile/:userId/notifications - Get user notifications
router.get('/:userId/notifications', (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly = false, limit = 20 } = req.query;

    // Check if user exists
    const userExists = profilesData.find(p => p.id === userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let userNotifications = notificationsData.filter(n => n.userId === userId);

    // Filter unread only if requested
    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(n => !n.isRead);
    }

    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    userNotifications = userNotifications.slice(0, parseInt(limit));

    const unreadCount = notificationsData.filter(n => n.userId === userId && !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount,
        total: userNotifications.length
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// PUT /api/adopter-profile/:userId/notifications/:notificationId/read - Mark notification as read
router.put('/:userId/notifications/:notificationId/read', (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    // Check if user exists
    const userExists = profilesData.find(p => p.id === userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const notificationIndex = notificationsData.findIndex(
      n => n.id === notificationId && n.userId === userId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Mark as read
    notificationsData[notificationIndex] = {
      ...notificationsData[notificationIndex],
      isRead: true
    };

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notificationsData[notificationIndex]
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// PUT /api/adopter-profile/:userId/notifications/mark-all-read - Mark all notifications as read
router.put('/:userId/notifications/mark-all-read', (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userExists = profilesData.find(p => p.id === userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark all user notifications as read
    let updatedCount = 0;
    notificationsData.forEach((notification, index) => {
      if (notification.userId === userId && !notification.isRead) {
        notificationsData[index] = { ...notification, isRead: true };
        updatedCount++;
      }
    });

    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      data: { updatedCount }
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// GET /api/adopter-profile/:userId/stats - Get user statistics
router.get('/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;

    const profile = profilesData.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const stats = {
      ...profile.stats,
      unreadNotifications: notificationsData.filter(n => n.userId === userId && !n.isRead).length,
      totalNotifications: notificationsData.filter(n => n.userId === userId).length,
      profileCompletion: calculateProfileCompletion(profile),
      memberSince: profile.createdAt,
      lastActive: profile.updatedAt
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

// GET /api/adopter-profile/search - Search profiles (admin only)
router.get('/search', (req, res) => {
  try {
    const { query, userType, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let results = profilesData.filter(profile => {
      const matchesQuery = 
        profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.email.toLowerCase().includes(query.toLowerCase()) ||
        profile.location.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = !userType || profile.userType === userType;
      
      return matchesQuery && matchesType;
    });

    // Limit results
    results = results.slice(0, parseInt(limit));

    // Return safe profile data
    const safeResults = results.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      location: profile.location,
      userType: profile.userType,
      profileImage: profile.profileImage,
      createdAt: profile.createdAt
    }));

    res.json({
      success: true,
      data: {
        profiles: safeResults,
        total: safeResults.length,
        query
      }
    });

  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search profiles',
      error: error.message
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile) {
  const fields = ['name', 'email', 'phone', 'location', 'bio', 'profileImage'];
  const completedFields = fields.filter(field => profile[field] && profile[field] !== null);
  return Math.round((completedFields.length / fields.length) * 100);
}

module.exports = router;
