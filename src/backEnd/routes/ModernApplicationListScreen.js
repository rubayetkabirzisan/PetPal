const express = require('express');
const router = express.Router();

// In-memory storage for applications and pets (in production, this would be a database)
let applications = [
  {
    id: 'app-1',
    petId: 'pet-1',
    userId: 'user-001',
    status: 'Under Review',
    submittedDate: '2025-07-10',
    lastUpdated: new Date().toISOString(),
    completionPercentage: 40,
    currentStep: 'Background Check',
    priority: 'Medium',
    notes: 'Application progressing normally. Background check in progress.',
    timeline: [
      { 
        id: 'step-1', 
        status: 'Application Submitted', 
        description: 'Your application has been submitted successfully', 
        completed: true, 
        date: '2025-07-10',
        completedAt: '2025-07-10T09:30:00Z'
      },
      { 
        id: 'step-2', 
        status: 'Initial Review', 
        description: 'Shelter staff is reviewing your application', 
        completed: true, 
        date: '2025-07-12',
        completedAt: '2025-07-12T14:20:00Z'
      },
      { 
        id: 'step-3', 
        status: 'Background Check', 
        description: 'Verifying provided information and references', 
        completed: false, 
        date: '2025-07-15',
        estimatedCompletion: '2025-07-18'
      },
      { 
        id: 'step-4', 
        status: 'Home Visit', 
        description: 'A shelter representative will visit your home', 
        completed: false, 
        date: null,
        estimatedCompletion: null
      },
      { 
        id: 'step-5', 
        status: 'Final Decision', 
        description: 'Shelter makes the final adoption decision', 
        completed: false, 
        date: null,
        estimatedCompletion: null
      }
    ],
    petInfo: {
      name: 'Max',
      breed: 'Golden Retriever',
      type: 'Dog',
      age: '2 years',
      gender: 'Male',
      size: 'Large',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29sZGVuJTIwcmV0cmlldmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Happy Paws Shelter',
      shelterContact: {
        phone: '(555) 123-4567',
        email: 'contact@happypaws.com',
        address: '123 Main St, Springfield, IL'
      },
      description: 'Max is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks.',
      adoptionFee: 250,
      vaccinated: true,
      neutered: true,
      location: 'Springfield, IL',
      distance: '2 miles away'
    }
  },
  {
    id: 'app-2',
    petId: 'pet-2',
    userId: 'user-001',
    status: 'Approved',
    submittedDate: '2025-06-25',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    completionPercentage: 100,
    currentStep: 'Final Decision',
    priority: 'High',
    notes: 'Congratulations! Your application for Bella has been approved. Please contact the shelter to arrange pick-up details and finalize the adoption process.',
    timeline: [
      { 
        id: 'step-1', 
        status: 'Application Submitted', 
        description: 'Your application has been submitted successfully', 
        completed: true, 
        date: '2025-06-25',
        completedAt: '2025-06-25T10:15:00Z'
      },
      { 
        id: 'step-2', 
        status: 'Initial Review', 
        description: 'Shelter staff is reviewing your application', 
        completed: true, 
        date: '2025-06-26',
        completedAt: '2025-06-26T15:30:00Z'
      },
      { 
        id: 'step-3', 
        status: 'Background Check', 
        description: 'Verifying provided information and references', 
        completed: true, 
        date: '2025-06-28',
        completedAt: '2025-06-28T11:45:00Z'
      },
      { 
        id: 'step-4', 
        status: 'Home Visit', 
        description: 'A shelter representative will visit your home', 
        completed: true, 
        date: '2025-07-05',
        completedAt: '2025-07-05T16:20:00Z'
      },
      { 
        id: 'step-5', 
        status: 'Final Decision', 
        description: 'Shelter makes the final adoption decision', 
        completed: true, 
        date: '2025-07-10',
        completedAt: '2025-07-10T09:00:00Z'
      }
    ],
    petInfo: {
      name: 'Bella',
      breed: 'Siamese Cat',
      type: 'Cat',
      age: '3 years',
      gender: 'Female',
      size: 'Medium',
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lhbWVzZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Feline Friends Rescue',
      shelterContact: {
        phone: '(555) 987-6543',
        email: 'info@felinefriends.org',
        address: '456 Cat Lane, Springfield, IL'
      },
      description: 'Bella is a calm and affectionate Siamese cat who enjoys quiet companionship and gentle play.',
      adoptionFee: 150,
      vaccinated: true,
      neutered: true,
      location: 'Springfield, IL',
      distance: '1.5 miles away'
    }
  },
  {
    id: 'app-3',
    petId: 'pet-3',
    userId: 'user-001',
    status: 'Pending',
    submittedDate: '2025-07-15',
    lastUpdated: new Date(Date.now() - 43200000).toISOString(),
    completionPercentage: 20,
    currentStep: 'Initial Review',
    priority: 'Low',
    notes: 'Application recently submitted. Currently in initial review phase.',
    timeline: [
      { 
        id: 'step-1', 
        status: 'Application Submitted', 
        description: 'Your application has been submitted successfully', 
        completed: true, 
        date: '2025-07-15',
        completedAt: '2025-07-15T14:30:00Z'
      },
      { 
        id: 'step-2', 
        status: 'Initial Review', 
        description: 'Shelter staff is reviewing your application', 
        completed: false, 
        date: null,
        estimatedCompletion: '2025-07-18'
      },
      { 
        id: 'step-3', 
        status: 'Background Check', 
        description: 'Verifying provided information and references', 
        completed: false, 
        date: null,
        estimatedCompletion: null
      },
      { 
        id: 'step-4', 
        status: 'Home Visit', 
        description: 'A shelter representative will visit your home', 
        completed: false, 
        date: null,
        estimatedCompletion: null
      },
      { 
        id: 'step-5', 
        status: 'Final Decision', 
        description: 'Shelter makes the final adoption decision', 
        completed: false, 
        date: null,
        estimatedCompletion: null
      }
    ],
    petInfo: {
      name: 'Charlie',
      breed: 'Beagle',
      type: 'Dog',
      age: '1 year',
      gender: 'Male',
      size: 'Medium',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhZ2xlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Pawsome Adoptions',
      shelterContact: {
        phone: '(555) 456-7890',
        email: 'adopt@pawsome.com',
        address: '789 Dog Street, Springfield, IL'
      },
      description: 'Charlie is a young, energetic Beagle who loves to explore and is great with children.',
      adoptionFee: 200,
      vaccinated: true,
      neutered: false,
      location: 'Springfield, IL',
      distance: '3 miles away'
    }
  },
  {
    id: 'app-4',
    petId: 'pet-4',
    userId: 'user-001',
    status: 'Rejected',
    submittedDate: '2025-06-15',
    lastUpdated: new Date(Date.now() - 2592000000).toISOString(),
    completionPercentage: 100,
    currentStep: 'Application Denied',
    priority: 'Low',
    notes: "We're sorry, but your application for Luna has been rejected. The shelter has determined that their current needs don't align with your living situation. Please contact us for more information.",
    timeline: [
      { 
        id: 'step-1', 
        status: 'Application Submitted', 
        description: 'Your application has been submitted successfully', 
        completed: true, 
        date: '2025-06-15',
        completedAt: '2025-06-15T12:00:00Z'
      },
      { 
        id: 'step-2', 
        status: 'Initial Review', 
        description: 'Shelter staff is reviewing your application', 
        completed: true, 
        date: '2025-06-17',
        completedAt: '2025-06-17T10:30:00Z'
      },
      { 
        id: 'step-3', 
        status: 'Application Denied', 
        description: 'Your application has been denied', 
        completed: true, 
        date: '2025-06-20',
        completedAt: '2025-06-20T16:45:00Z'
      }
    ],
    rejectionReason: 'Living situation not suitable for this specific pet\'s needs.',
    petInfo: {
      name: 'Luna',
      breed: 'Persian Cat',
      type: 'Cat',
      age: '5 years',
      gender: 'Female',
      size: 'Medium',
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lhbWVzZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Cat Haven',
      shelterContact: {
        phone: '(555) 321-9876',
        email: 'help@cathaven.org',
        address: '321 Feline Ave, Springfield, IL'
      },
      description: 'Luna is a mature Persian cat who requires special care and a quiet environment.',
      adoptionFee: 100,
      vaccinated: true,
      neutered: true,
      location: 'Springfield, IL',
      distance: '4 miles away'
    }
  }
];

// Notification log for applications
let notifications = [];
let notificationIdCounter = 1;

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (timeline) => {
  if (!timeline || timeline.length === 0) return 0;
  const completedSteps = timeline.filter(step => step.completed).length;
  return Math.round((completedSteps / timeline.length) * 100);
};

// Helper function to get current step
const getCurrentStep = (timeline) => {
  if (!timeline || timeline.length === 0) return 'Not started';
  const currentStepIndex = timeline.findIndex(step => !step.completed);
  if (currentStepIndex === -1) {
    return timeline[timeline.length - 1].status; // All completed
  }
  return timeline[currentStepIndex].status;
};

// GET /api/modern-application-list - Get all applications for a user
router.get('/', (req, res) => {
  try {
    const { userId, status, search, limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    let filteredApplications = applications.filter(app => app.userId === userId);
    
    // Apply status filter
    if (status && status !== 'All') {
      filteredApplications = filteredApplications.filter(app => 
        app.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = filteredApplications.filter(app =>
        app.petInfo.name.toLowerCase().includes(searchLower) ||
        app.petInfo.breed.toLowerCase().includes(searchLower) ||
        app.petInfo.shelterName.toLowerCase().includes(searchLower) ||
        app.petInfo.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by submission date (most recent first)
    filteredApplications.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
    
    // Update completion percentage and current step for each application
    const applicationsWithUpdates = paginatedApplications.map(app => ({
      ...app,
      completionPercentage: calculateCompletionPercentage(app.timeline),
      currentStep: getCurrentStep(app.timeline)
    }));
    
    // Calculate statistics
    const stats = {
      total: applications.filter(app => app.userId === userId).length,
      pending: applications.filter(app => app.userId === userId && app.status === 'Pending').length,
      underReview: applications.filter(app => app.userId === userId && app.status === 'Under Review').length,
      approved: applications.filter(app => app.userId === userId && app.status === 'Approved').length,
      rejected: applications.filter(app => app.userId === userId && app.status === 'Rejected').length
    };
    
    res.json({
      success: true,
      data: {
        applications: applicationsWithUpdates,
        stats: stats,
        pagination: {
          total: filteredApplications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredApplications.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/modern-application-list/:applicationId - Get specific application details
router.get('/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const application = applications.find(app => 
      app.id === applicationId && app.userId === userId
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Update completion percentage and current step
    const updatedApplication = {
      ...application,
      completionPercentage: calculateCompletionPercentage(application.timeline),
      currentStep: getCurrentStep(application.timeline)
    };
    
    res.json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
});

// POST /api/modern-application-list - Submit a new application
router.post('/', (req, res) => {
  try {
    const { userId, petId, petInfo, formData } = req.body;
    
    if (!userId || !petId || !petInfo) {
      return res.status(400).json({
        success: false,
        message: 'User ID, pet ID, and pet info are required'
      });
    }
    
    // Check if user already has an application for this pet
    const existingApplication = applications.find(app => 
      app.userId === userId && app.petId === petId && 
      !['Rejected', 'Withdrawn'].includes(app.status)
    );
    
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending application for this pet'
      });
    }
    
    // Create new application
    const newApplication = {
      id: `app-${Date.now()}`,
      petId: petId,
      userId: userId,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      completionPercentage: 20,
      currentStep: 'Initial Review',
      priority: 'Medium',
      notes: 'Application recently submitted. Currently in initial review phase.',
      formData: formData || {},
      timeline: [
        { 
          id: 'step-1', 
          status: 'Application Submitted', 
          description: 'Your application has been submitted successfully', 
          completed: true, 
          date: new Date().toISOString().split('T')[0],
          completedAt: new Date().toISOString()
        },
        { 
          id: 'step-2', 
          status: 'Initial Review', 
          description: 'Shelter staff is reviewing your application', 
          completed: false, 
          date: null,
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        { 
          id: 'step-3', 
          status: 'Background Check', 
          description: 'Verifying provided information and references', 
          completed: false, 
          date: null,
          estimatedCompletion: null
        },
        { 
          id: 'step-4', 
          status: 'Home Visit', 
          description: 'A shelter representative will visit your home', 
          completed: false, 
          date: null,
          estimatedCompletion: null
        },
        { 
          id: 'step-5', 
          status: 'Final Decision', 
          description: 'Shelter makes the final adoption decision', 
          completed: false, 
          date: null,
          estimatedCompletion: null
        }
      ],
      petInfo: petInfo
    };
    
    applications.push(newApplication);
    
    // Create notification
    const notification = {
      id: notificationIdCounter++,
      applicationId: newApplication.id,
      userId: userId,
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your adoption application for ${petInfo.name} has been submitted successfully.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// PUT /api/modern-application-list/:applicationId/status - Update application status (admin only)
router.put('/:applicationId/status', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminId, notes, stepUpdate } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Pending, Under Review, Approved, Rejected, or Withdrawn'
      });
    }
    
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const application = applications[applicationIndex];
    const previousStatus = application.status;
    
    // Update application status and timeline
    applications[applicationIndex] = {
      ...application,
      status: status,
      lastUpdated: new Date().toISOString(),
      notes: notes || application.notes
    };
    
    // Update timeline if stepUpdate is provided
    if (stepUpdate) {
      const timeline = [...application.timeline];
      const stepIndex = timeline.findIndex(step => step.id === stepUpdate.stepId);
      
      if (stepIndex !== -1) {
        timeline[stepIndex] = {
          ...timeline[stepIndex],
          completed: stepUpdate.completed,
          date: stepUpdate.completed ? new Date().toISOString().split('T')[0] : timeline[stepIndex].date,
          completedAt: stepUpdate.completed ? new Date().toISOString() : timeline[stepIndex].completedAt
        };
        
        applications[applicationIndex].timeline = timeline;
        applications[applicationIndex].completionPercentage = calculateCompletionPercentage(timeline);
        applications[applicationIndex].currentStep = getCurrentStep(timeline);
      }
    }
    
    // Create notification for status change
    const notification = {
      id: notificationIdCounter++,
      applicationId: applicationId,
      userId: application.userId,
      type: 'status_update',
      title: `Application ${status}`,
      message: `Your adoption application for ${application.petInfo.name} has been ${status.toLowerCase()}.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    
    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: {
        application: applications[applicationIndex],
        previousStatus: previousStatus,
        updatedBy: adminId,
        notification: notification
      }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// PUT /api/modern-application-list/:applicationId/timeline - Update timeline step
router.put('/:applicationId/timeline', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { stepId, completed, notes, adminId } = req.body;
    
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const application = applications[applicationIndex];
    const timeline = [...application.timeline];
    const stepIndex = timeline.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Timeline step not found'
      });
    }
    
    // Update the timeline step
    timeline[stepIndex] = {
      ...timeline[stepIndex],
      completed: completed,
      date: completed ? new Date().toISOString().split('T')[0] : timeline[stepIndex].date,
      completedAt: completed ? new Date().toISOString() : timeline[stepIndex].completedAt,
      notes: notes || timeline[stepIndex].notes
    };
    
    // Update application
    applications[applicationIndex] = {
      ...application,
      timeline: timeline,
      completionPercentage: calculateCompletionPercentage(timeline),
      currentStep: getCurrentStep(timeline),
      lastUpdated: new Date().toISOString()
    };
    
    // Create notification for timeline update
    const notification = {
      id: notificationIdCounter++,
      applicationId: applicationId,
      userId: application.userId,
      type: 'timeline_update',
      title: 'Application Progress Update',
      message: `${timeline[stepIndex].status} has been ${completed ? 'completed' : 'updated'} for your application for ${application.petInfo.name}.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    
    res.json({
      success: true,
      message: 'Timeline updated successfully',
      data: {
        application: applications[applicationIndex],
        updatedStep: timeline[stepIndex],
        updatedBy: adminId,
        notification: notification
      }
    });
  } catch (error) {
    console.error('Error updating timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timeline',
      error: error.message
    });
  }
});

// POST /api/modern-application-list/:applicationId/withdraw - Withdraw application
router.post('/:applicationId/withdraw', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const applicationIndex = applications.findIndex(app => 
      app.id === applicationId && app.userId === userId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const application = applications[applicationIndex];
    
    // Check if application can be withdrawn
    if (['Approved', 'Rejected', 'Withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with status: ${application.status}`
      });
    }
    
    // Update application status
    applications[applicationIndex] = {
      ...application,
      status: 'Withdrawn',
      lastUpdated: new Date().toISOString(),
      withdrawalReason: reason || 'No reason provided',
      withdrawnAt: new Date().toISOString()
    };
    
    // Create notification
    const notification = {
      id: notificationIdCounter++,
      applicationId: applicationId,
      userId: userId,
      type: 'application_withdrawn',
      title: 'Application Withdrawn',
      message: `You have successfully withdrawn your application for ${application.petInfo.name}.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    
    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {
        application: applications[applicationIndex],
        notification: notification
      }
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: error.message
    });
  }
});

// GET /api/modern-application-list/notifications/:userId - Get notifications for user
router.get('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    
    let userNotifications = notifications.filter(notif => notif.userId === userId);
    
    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(notif => !notif.read);
    }
    
    // Sort by timestamp (most recent first)
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        unreadCount: notifications.filter(notif => notif.userId === userId && !notif.read).length,
        pagination: {
          total: userNotifications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < userNotifications.length
        }
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

// PUT /api/modern-application-list/notifications/:notificationId/read - Mark notification as read
router.put('/notifications/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    const notificationIndex = notifications.findIndex(notif => 
      notif.id === parseInt(notificationId) && notif.userId === userId
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notifications[notificationIndex].read = true;
    notifications[notificationIndex].readAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notifications[notificationIndex]
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

// GET /api/modern-application-list/statistics/:userId - Get user's application statistics
router.get('/statistics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const userApplications = applications.filter(app => app.userId === userId);
    
    // Calculate date range based on timeframe
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const recentApplications = userApplications.filter(app =>
      new Date(app.submittedDate) >= startDate
    );
    
    const stats = {
      overview: {
        total: userApplications.length,
        recent: recentApplications.length,
        pending: userApplications.filter(app => app.status === 'Pending').length,
        underReview: userApplications.filter(app => app.status === 'Under Review').length,
        approved: userApplications.filter(app => app.status === 'Approved').length,
        rejected: userApplications.filter(app => app.status === 'Rejected').length,
        withdrawn: userApplications.filter(app => app.status === 'Withdrawn').length
      },
      petTypes: {
        dogs: userApplications.filter(app => app.petInfo.type === 'Dog').length,
        cats: userApplications.filter(app => app.petInfo.type === 'Cat').length,
        other: userApplications.filter(app => !['Dog', 'Cat'].includes(app.petInfo.type)).length
      },
      averageProcessingTime: '5-7 days',
      successRate: userApplications.length > 0 ? 
        (userApplications.filter(app => app.status === 'Approved').length / userApplications.length * 100).toFixed(1) + '%' : '0%',
      recentActivity: {
        lastApplication: userApplications.length > 0 ? 
          userApplications.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))[0].submittedDate : null,
        activeApplications: userApplications.filter(app => 
          ['Pending', 'Under Review'].includes(app.status)
        ).length
      }
    };
    
    res.json({
      success: true,
      data: {
        statistics: stats,
        timeframe: timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;