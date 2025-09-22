const express = require('express');
const router = express.Router();

// In-memory storage for settings data (replace with MongoDB in production)
let userSettings = new Map();
let userPreferences = new Map();
let appSettings = new Map();
let securitySettings = new Map();
let dataExportRequests = new Map();

// Initialize sample data
function initializeSettingsData() {
  // Sample user preferences
  const samplePreferences = {
    userId: 'user-001',
    petTypes: ['dog', 'cat'],
    lifestyle: 'active',
    housingType: 'house_with_yard',
    hasAllergies: false,
    experienceLevel: 'intermediate',
    maxAge: 5,
    preferredSizes: ['medium', 'large'],
    location: 'San Francisco, CA',
    maxDistance: 25,
    notifications: {
      newPets: true,
      applicationUpdates: true,
      messages: true
    }
  };

  // Sample app settings
  const sampleAppSettings = {
    userId: 'user-001',
    theme: 'light',
    language: 'en-US',
    textSize: 'medium',
    locationServices: true,
    dataSharing: false,
    autoSync: true,
    pushNotifications: true
  };

  // Sample security settings
  const sampleSecuritySettings = {
    userId: 'user-001',
    twoFactorEnabled: false,
    loginAlerts: true,
    dataEncryption: true,
    accountLocked: false,
    lastPasswordChange: '2025-08-15T10:30:00Z',
    privacyLevel: 'standard'
  };

  userPreferences.set('user-001', samplePreferences);
  appSettings.set('user-001', sampleAppSettings);
  securitySettings.set('user-001', sampleSecuritySettings);
}

// Initialize data
initializeSettingsData();

// Helper function to validate user preferences
function validateUserPreferences(preferences) {
  const errors = [];
  
  if (!preferences.userId) {
    errors.push('User ID is required');
  }
  
  if (!Array.isArray(preferences.petTypes)) {
    errors.push('Pet types must be an array');
  }
  
  if (!['active', 'calm', 'mixed'].includes(preferences.lifestyle)) {
    errors.push('Invalid lifestyle value');
  }
  
  if (!['apartment', 'house_no_yard', 'house_with_yard'].includes(preferences.housingType)) {
    errors.push('Invalid housing type');
  }
  
  if (!['beginner', 'intermediate', 'experienced'].includes(preferences.experienceLevel)) {
    errors.push('Invalid experience level');
  }
  
  if (typeof preferences.maxAge !== 'number' || preferences.maxAge < 0 || preferences.maxAge > 20) {
    errors.push('Max age must be between 0 and 20 years');
  }
  
  if (typeof preferences.maxDistance !== 'number' || preferences.maxDistance < 1 || preferences.maxDistance > 500) {
    errors.push('Max distance must be between 1 and 500 miles');
  }
  
  return errors;
}

// GET /api/settings/preferences/:userId - Get user preferences
router.get('/preferences/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const preferences = userPreferences.get(userId);
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: { preferences }
    });
    
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/settings/preferences/:userId - Update user preferences
router.put('/preferences/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const existingPreferences = userPreferences.get(userId) || {};
    const updatedPreferences = { ...existingPreferences, ...updates, userId };
    
    // Validate preferences
    const validationErrors = validateUserPreferences(updatedPreferences);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    userPreferences.set(userId, updatedPreferences);
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: updatedPreferences }
    });
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/settings/notifications/:userId - Update notification preferences
router.put('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { notifications } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!notifications || typeof notifications !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Notifications object is required'
      });
    }
    
    const existingPreferences = userPreferences.get(userId) || {};
    const updatedPreferences = {
      ...existingPreferences,
      userId,
      notifications: {
        ...existingPreferences.notifications,
        ...notifications
      }
    };
    
    userPreferences.set(userId, updatedPreferences);
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { 
        preferences: updatedPreferences,
        notifications: updatedPreferences.notifications
      }
    });
    
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/settings/app/:userId - Get app settings
router.get('/app/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const settings = appSettings.get(userId) || {
      userId,
      theme: 'light',
      language: 'en-US',
      textSize: 'medium',
      locationServices: true,
      dataSharing: false,
      autoSync: true,
      pushNotifications: true
    };
    
    res.json({
      success: true,
      message: 'App settings retrieved successfully',
      data: { settings }
    });
    
  } catch (error) {
    console.error('Error getting app settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/settings/app/:userId - Update app settings
router.put('/app/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const existingSettings = appSettings.get(userId) || {};
    const updatedSettings = { ...existingSettings, ...updates, userId };
    
    // Validate theme
    if (updates.theme && !['light', 'dark', 'auto'].includes(updates.theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme value'
      });
    }
    
    // Validate text size
    if (updates.textSize && !['small', 'medium', 'large', 'extra-large'].includes(updates.textSize)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid text size value'
      });
    }
    
    appSettings.set(userId, updatedSettings);
    
    res.json({
      success: true,
      message: 'App settings updated successfully',
      data: { settings: updatedSettings }
    });
    
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/settings/security/:userId - Get security settings
router.get('/security/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const settings = securitySettings.get(userId) || {
      userId,
      twoFactorEnabled: false,
      loginAlerts: true,
      dataEncryption: true,
      accountLocked: false,
      lastPasswordChange: new Date().toISOString(),
      privacyLevel: 'standard'
    };
    
    // Don't expose sensitive information
    const safeSettings = { ...settings };
    delete safeSettings.accountLocked;
    
    res.json({
      success: true,
      message: 'Security settings retrieved successfully',
      data: { settings: safeSettings }
    });
    
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/settings/security/:userId - Update security settings
router.put('/security/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const existingSettings = securitySettings.get(userId) || {};
    const updatedSettings = { ...existingSettings, ...updates, userId };
    
    // Validate privacy level
    if (updates.privacyLevel && !['minimal', 'standard', 'strict'].includes(updates.privacyLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid privacy level'
      });
    }
    
    securitySettings.set(userId, updatedSettings);
    
    // Don't expose sensitive information in response
    const safeSettings = { ...updatedSettings };
    delete safeSettings.accountLocked;
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: { settings: safeSettings }
    });
    
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/settings/password/:userId - Change password
router.post('/password/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // In production, verify current password against hashed password in database
    const existingSettings = securitySettings.get(userId) || {};
    const updatedSettings = {
      ...existingSettings,
      userId,
      lastPasswordChange: new Date().toISOString()
    };
    
    securitySettings.set(userId, updatedSettings);
    
    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        lastPasswordChange: updatedSettings.lastPasswordChange
      }
    });
    
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/settings/data-export/:userId - Request data export
router.post('/data-export/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { email, format = 'json' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    if (!['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: json, csv, pdf'
      });
    }
    
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const exportRequest = {
      exportId,
      userId,
      email,
      format,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    dataExportRequests.set(exportId, exportRequest);
    
    // In production, queue the export job here
    setTimeout(() => {
      const request = dataExportRequests.get(exportId);
      if (request) {
        request.status = 'completed';
        request.completedAt = new Date().toISOString();
        request.downloadUrl = `https://api.petpal.com/exports/${exportId}`;
        dataExportRequests.set(exportId, request);
      }
    }, 5000); // Simulate processing time
    
    res.json({
      success: true,
      message: 'Data export request submitted successfully',
      data: { exportRequest }
    });
    
  } catch (error) {
    console.error('Error requesting data export:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/settings/data-export/:userId/:exportId - Check export status
router.get('/data-export/:userId/:exportId', (req, res) => {
  try {
    const { userId, exportId } = req.params;
    
    if (!userId || !exportId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and export ID are required'
      });
    }
    
    const exportRequest = dataExportRequests.get(exportId);
    
    if (!exportRequest || exportRequest.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Export request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Export status retrieved successfully',
      data: { exportRequest }
    });
    
  } catch (error) {
    console.error('Error getting export status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/settings/clear-data/:userId - Clear user data
router.delete('/clear-data/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Clear all user data
    userPreferences.delete(userId);
    appSettings.delete(userId);
    securitySettings.delete(userId);
    
    // Clear export requests
    for (const [exportId, request] of dataExportRequests.entries()) {
      if (request.userId === userId) {
        dataExportRequests.delete(exportId);
      }
    }
    
    res.json({
      success: true,
      message: 'User data cleared successfully',
      data: {
        clearedAt: new Date().toISOString(),
        itemsCleared: ['preferences', 'app_settings', 'security_settings', 'export_requests']
      }
    });
    
  } catch (error) {
    console.error('Error clearing user data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/settings/account/:userId - Delete account (initiate deletion process)
router.delete('/account/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { confirmPassword } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required'
      });
    }
    
    // In production, verify password and initiate account deletion process
    // This would typically involve:
    // 1. Verify user password
    // 2. Mark account for deletion
    // 3. Send confirmation email
    // 4. Schedule data deletion after grace period
    
    const deletionId = `deletion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const gracePeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    res.json({
      success: true,
      message: 'Account deletion initiated successfully',
      data: {
        deletionId,
        gracePeriodEnd: gracePeriodEnd.toISOString(),
        message: 'Your account has been scheduled for deletion. You have 30 days to cancel this request.',
        supportContact: 'support@petpal.com'
      }
    });
    
  } catch (error) {
    console.error('Error initiating account deletion:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/settings/support/info - Get support information
router.get('/support/info', (req, res) => {
  try {
    const supportInfo = {
      email: 'support@petpal.com',
      phone: '+1-800-PET-PALS',
      hours: 'Monday-Friday: 9AM-6PM PST',
      website: 'https://petpal.com/support',
      faq: 'https://petpal.com/faq',
      status: 'https://status.petpal.com',
      version: '1.0.0',
      buildNumber: '2025092201',
      supportedPlatforms: ['iOS', 'Android'],
      minVersion: {
        ios: '14.0',
        android: '7.0'
      }
    };
    
    res.json({
      success: true,
      message: 'Support information retrieved successfully',
      data: supportInfo
    });
    
  } catch (error) {
    console.error('Error getting support info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/settings/feedback - Submit app feedback
router.post('/feedback', (req, res) => {
  try {
    const { userId, rating, comment, category, deviceInfo } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const feedback = {
      feedbackId,
      userId: userId || 'anonymous',
      rating,
      comment: comment || '',
      category: category || 'general',
      deviceInfo: deviceInfo || {},
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    // In production, store feedback in database and potentially send to analytics service
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedbackId,
        message: 'Thank you for your feedback! We appreciate your input.',
        estimatedResponse: category === 'bug' ? '2-3 business days' : '1-2 weeks'
      }
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
