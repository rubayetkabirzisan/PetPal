const express = require('express');
const router = express.Router();

// In-memory storage for applications (in production, this would be a database)
let applications = [
  {
    id: "app-1",
    petId: "pet-1",
    petName: "Buddy",
    petType: "Dog",
    petBreed: "Golden Retriever",
    adopterName: "Sarah Johnson",
    adopterEmail: "sarah.j@email.com",
    adopterPhone: "(555) 123-4567",
    status: "Pending",
    submittedDate: "2024-01-15",
    priority: "High",
    notes: "First-time adopter, seems very enthusiastic",
    lastUpdated: new Date().toISOString(),
    adminId: null,
    notificationHistory: [],
    formData: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      dateOfBirth: "03/15/1990",
      address: "123 Oak Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      housingType: "apartment",
      ownRent: "rent",
      hasYard: false,
      yardFenced: false,
      landlordsName: "John Smith",
      landlordsPhone: "(555) 111-2222",
      previousPets: "Had a cat for 5 years in college",
      currentPets: "None currently",
      veterinarian: "Dr. Maria Rodriguez",
      vetPhone: "(555) 333-4444",
      petExperience: "I grew up with dogs and cats, and have experience with basic training and care",
      workSchedule: "9-5 Monday to Friday, work from home 2 days per week",
      hoursAlone: "6",
      exerciseCommitment: "high",
      travelFrequency: "2-3 times per year for vacation",
      familyMembers: "Single, no children",
      allergies: false,
      reference1Name: "Jessica Miller",
      reference1Phone: "(555) 555-6666",
      reference1Relation: "Best friend",
      reference2Name: "Tom Wilson",
      reference2Phone: "(555) 777-8888",
      reference2Relation: "Coworker",
      whyAdopt: "I've always loved dogs and feel ready to provide a loving home. Buddy seems like a perfect match for my lifestyle.",
      expectations: "I expect an active, friendly companion who enjoys walks and playing fetch in the park.",
      trainingPlan: "I plan to enroll in basic obedience classes and use positive reinforcement training methods.",
      healthCareCommitment: "I will provide regular vet checkups, vaccinations, and any necessary medical care without hesitation.",
      financialPreparation: "I have a steady income and have budgeted $200/month for pet expenses, plus emergency fund.",
      additionalComments: "I work close to home and can come back during lunch breaks if needed."
    }
  },
  {
    id: "app-2",
    petId: "pet-2",
    petName: "Luna",
    petType: "Cat",
    petBreed: "Siamese",
    adopterName: "Michael Chen",
    adopterEmail: "m.chen@email.com",
    adopterPhone: "(555) 987-6543",
    status: "Under Review",
    submittedDate: "2024-01-14",
    priority: "Medium",
    notes: "Has experience with cats, good references",
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    adminId: "admin-001",
    notificationHistory: [
      {
        timestamp: "2024-01-14T10:30:00Z",
        type: 'status_update',
        status: 'Under Review',
        messageId: 'msg_1234567890',
        success: true,
        adminId: "admin-001"
      }
    ],
    formData: {
      firstName: "Michael",
      lastName: "Chen",
      email: "m.chen@email.com",
      phone: "(555) 987-6543",
      dateOfBirth: "07/22/1985",
      address: "456 Pine Avenue",
      city: "Oakland",
      state: "CA",
      zipCode: "94610",
      housingType: "house",
      ownRent: "own",
      hasYard: true,
      yardFenced: true,
      landlordsName: "",
      landlordsPhone: "",
      previousPets: "Had two cats for 8 years, both lived full lives",
      currentPets: "None currently, my last cat passed away 6 months ago",
      veterinarian: "Dr. Sarah Kim",
      vetPhone: "(555) 444-5555",
      petExperience: "Extensive experience with cats, including seniors and special needs",
      workSchedule: "Software engineer, mostly remote work with flexible hours",
      hoursAlone: "4",
      exerciseCommitment: "medium",
      travelFrequency: "Rarely, maybe once per year",
      familyMembers: "Married, wife also loves cats, no children yet",
      allergies: false,
      reference1Name: "Anna Chen",
      reference1Phone: "(555) 666-7777",
      reference1Relation: "Wife",
      reference2Name: "Dr. Sarah Kim",
      reference2Phone: "(555) 444-5555",
      reference2Relation: "Veterinarian",
      whyAdopt: "Luna reminds me of my previous cat, and we're ready to open our hearts to another feline friend.",
      expectations: "A calm, affectionate companion who enjoys indoor life and gentle play.",
      trainingPlan: "Siamese cats are intelligent, I plan to provide mental stimulation and interactive toys.",
      healthCareCommitment: "Regular vet visits, high-quality food, and immediate attention to any health concerns.",
      financialPreparation: "We have pet insurance and a dedicated savings account for pet expenses.",
      additionalComments: "We have cat-proofed our home and have all necessary supplies ready."
    }
  },
  {
    id: "app-3",
    petId: "pet-3",
    petName: "Max",
    petType: "Dog",
    petBreed: "Labrador Mix",
    adopterName: "Emma Williams",
    adopterEmail: "emma.w@email.com",
    adopterPhone: "(555) 456-7890",
    status: "Approved",
    submittedDate: "2024-01-10",
    priority: "Medium",
    notes: "Excellent application, approved for adoption",
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    adminId: "admin-002",
    notificationHistory: [
      {
        timestamp: "2024-01-12T14:20:00Z",
        type: 'approval',
        status: 'Approved',
        messageId: 'msg_9876543210',
        success: true,
        adminId: "admin-002"
      }
    ],
    formData: {
      firstName: "Emma",
      lastName: "Williams",
      email: "emma.w@email.com",
      phone: "(555) 456-7890",
      dateOfBirth: "11/08/1992",
      address: "789 Maple Drive",
      city: "Berkeley",
      state: "CA",
      zipCode: "94720",
      housingType: "house",
      ownRent: "own",
      hasYard: true,
      yardFenced: true,
      landlordsName: "",
      landlordsPhone: "",
      previousPets: "Grew up with family dogs, had a rescue dog for 3 years",
      currentPets: "None currently",
      veterinarian: "Dr. James Park",
      vetPhone: "(555) 222-3333",
      petExperience: "15+ years of experience with dogs of all sizes",
      workSchedule: "Teacher, home by 4 PM, summers off",
      hoursAlone: "5",
      exerciseCommitment: "high",
      travelFrequency: "Occasional family visits, 2-3 times per year",
      familyMembers: "Married with 2 children (ages 8 and 12), all love dogs",
      allergies: false,
      reference1Name: "Dr. James Park",
      reference1Phone: "(555) 222-3333",
      reference1Relation: "Veterinarian",
      reference2Name: "Susan Brown",
      reference2Phone: "(555) 888-9999",
      reference2Relation: "Neighbor and friend",
      whyAdopt: "Our family is ready for a four-legged member. Max seems perfect for our active lifestyle.",
      expectations: "A friendly, energetic companion for our family and children.",
      trainingPlan: "Positive reinforcement training, potentially group classes for socialization.",
      healthCareCommitment: "Full veterinary care, preventive medicine, and emergency fund available.",
      financialPreparation: "Budgeted $300/month for pet expenses, established emergency fund.",
      additionalComments: "Large fenced yard, experience with rescue dogs, children are very excited."
    }
  }
];

// Notification history log
let notificationLog = [];
let notificationIdCounter = 1;

// Helper function to simulate sending notifications
const sendNotification = async (application, type, status) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  const notification = {
    id: `msg_${Date.now()}_${notificationIdCounter++}`,
    applicationId: application.id,
    petName: application.petName,
    adopterEmail: application.adopterEmail,
    adopterName: application.adopterName,
    type: type,
    status: status,
    timestamp: new Date().toISOString(),
    success: Math.random() > 0.1, // 90% success rate
    subject: generateNotificationSubject(application, type, status),
    body: generateNotificationBody(application, type, status)
  };
  
  notificationLog.push(notification);
  return notification;
};

const generateNotificationSubject = (application, type, status) => {
  if (type === 'approval') {
    return `🎉 Great News! Your adoption application for ${application.petName} has been approved!`;
  } else if (type === 'status_update') {
    switch (status) {
      case 'Under Review':
        return `Application Update: ${application.petName} adoption application is under review`;
      case 'Rejected':
        return `Application Update: ${application.petName} adoption application`;
      default:
        return `Application Update: ${application.petName}`;
    }
  }
  return `Update on your application for ${application.petName}`;
};

const generateNotificationBody = (application, type, status) => {
  if (type === 'approval') {
    return `Dear ${application.adopterName},\n\nWe're thrilled to inform you that your adoption application for ${application.petName} has been approved!\n\nNext Steps:\n1. Contact us within 48 hours\n2. Schedule a meet-and-greet\n3. Complete final paperwork\n\nBest regards,\nPetPal Adoption Center`;
  } else if (type === 'status_update') {
    switch (status) {
      case 'Under Review':
        return `Dear ${application.adopterName},\n\nYour application for ${application.petName} is now under review. We'll contact you within 2-3 business days.\n\nBest regards,\nPetPal Adoption Center`;
      case 'Rejected':
        return `Dear ${application.adopterName},\n\nAfter careful consideration, we have decided to proceed with another applicant for ${application.petName}. We encourage you to browse our other available pets.\n\nBest regards,\nPetPal Adoption Center`;
      default:
        return `Dear ${application.adopterName},\n\nYour application status for ${application.petName} has been updated to: ${status}.\n\nBest regards,\nPetPal Adoption Center`;
    }
  }
  return `Your application for ${application.petName} has been updated.`;
};

// GET /api/admin-applications - Get all applications with filtering and search
router.get('/', (req, res) => {
  try {
    const { status, priority, petType, search, limit = 50, offset = 0 } = req.query;
    
    let filteredApplications = [...applications];
    
    // Apply filters
    if (status && status !== 'All') {
      filteredApplications = filteredApplications.filter(app => 
        app.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (priority && priority !== 'All') {
      filteredApplications = filteredApplications.filter(app => 
        app.priority.toLowerCase() === priority.toLowerCase()
      );
    }
    
    if (petType && petType !== 'All') {
      filteredApplications = filteredApplications.filter(app => 
        app.petType.toLowerCase() === petType.toLowerCase()
      );
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = filteredApplications.filter(app =>
        app.petName.toLowerCase().includes(searchLower) ||
        app.adopterName.toLowerCase().includes(searchLower) ||
        app.adopterEmail.toLowerCase().includes(searchLower) ||
        app.petBreed.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by submission date (most recent first)
    filteredApplications.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
    
    // Calculate statistics
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'Pending').length,
      underReview: applications.filter(app => app.status === 'Under Review').length,
      approved: applications.filter(app => app.status === 'Approved').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
      highPriority: applications.filter(app => app.priority === 'High').length,
      mediumPriority: applications.filter(app => app.priority === 'Medium').length,
      lowPriority: applications.filter(app => app.priority === 'Low').length
    };
    
    res.json({
      success: true,
      data: {
        applications: paginatedApplications,
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

// GET /api/admin-applications/:applicationId - Get specific application details
router.get('/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
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

// PUT /api/admin-applications/:applicationId/status - Update application status
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminId, reason, sendNotification: shouldSendNotification = true } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: Pending, Under Review, Approved, or Rejected'
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
    
    // Update application
    applications[applicationIndex] = {
      ...application,
      status: status,
      lastUpdated: new Date().toISOString(),
      adminId: adminId
    };
    
    let notificationResult = null;
    
    // Send notification if requested
    if (shouldSendNotification) {
      const notificationType = status === 'Approved' ? 'approval' : 'status_update';
      notificationResult = await sendNotification(application, notificationType, status);
      
      // Add notification to application history
      const notificationRecord = {
        timestamp: new Date().toISOString(),
        type: notificationType,
        status: status,
        messageId: notificationResult.id,
        success: notificationResult.success,
        adminId: adminId
      };
      
      applications[applicationIndex].notificationHistory.push(notificationRecord);
    }
    
    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: {
        application: applications[applicationIndex],
        previousStatus: previousStatus,
        notification: notificationResult,
        updatedBy: adminId,
        timestamp: new Date().toISOString()
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

// PUT /api/admin-applications/:applicationId/priority - Update application priority
router.put('/:applicationId/priority', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { priority, adminId } = req.body;
    
    // Validate priority
    const validPriorities = ['High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be: High, Medium, or Low'
      });
    }
    
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const previousPriority = applications[applicationIndex].priority;
    
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      priority: priority,
      lastUpdated: new Date().toISOString(),
      adminId: adminId
    };
    
    res.json({
      success: true,
      message: `Application priority updated to ${priority}`,
      data: {
        application: applications[applicationIndex],
        previousPriority: previousPriority,
        updatedBy: adminId
      }
    });
  } catch (error) {
    console.error('Error updating application priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application priority',
      error: error.message
    });
  }
});

// PUT /api/admin-applications/:applicationId/notes - Update application notes
router.put('/:applicationId/notes', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes, adminId } = req.body;
    
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      notes: notes || '',
      lastUpdated: new Date().toISOString(),
      adminId: adminId
    };
    
    res.json({
      success: true,
      message: 'Application notes updated successfully',
      data: {
        application: applications[applicationIndex],
        updatedBy: adminId
      }
    });
  } catch (error) {
    console.error('Error updating application notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application notes',
      error: error.message
    });
  }
});

// POST /api/admin-applications/:applicationId/send-notification - Send custom notification
router.post('/:applicationId/send-notification', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { type, subject, body, adminId } = req.body;
    
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Validate type
    const validTypes = ['approval', 'status_update', 'custom'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type. Must be: approval, status_update, or custom'
      });
    }
    
    // Create custom notification
    const notification = {
      id: `msg_${Date.now()}_${notificationIdCounter++}`,
      applicationId: application.id,
      petName: application.petName,
      adopterEmail: application.adopterEmail,
      adopterName: application.adopterName,
      type: type,
      status: application.status,
      timestamp: new Date().toISOString(),
      success: Math.random() > 0.05, // 95% success rate for custom notifications
      subject: subject || `Update on your application for ${application.petName}`,
      body: body || `Dear ${application.adopterName},\n\nWe have an update regarding your application for ${application.petName}.\n\nBest regards,\nPetPal Adoption Center`,
      adminId: adminId
    };
    
    notificationLog.push(notification);
    
    // Add to application notification history
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    const notificationRecord = {
      timestamp: notification.timestamp,
      type: type,
      status: application.status,
      messageId: notification.id,
      success: notification.success,
      adminId: adminId
    };
    
    applications[applicationIndex].notificationHistory.push(notificationRecord);
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notification: notification,
        application: applications[applicationIndex]
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// GET /api/admin-applications/statistics/overview - Get application statistics
router.get('/statistics/overview', (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range based on timeframe
    let startDate;
    const endDate = new Date();
    
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
    
    // Filter applications by timeframe
    const filteredApps = applications.filter(app => 
      new Date(app.submittedDate) >= startDate
    );
    
    const stats = {
      overview: {
        total: applications.length,
        totalInTimeframe: filteredApps.length,
        pending: applications.filter(app => app.status === 'Pending').length,
        underReview: applications.filter(app => app.status === 'Under Review').length,
        approved: applications.filter(app => app.status === 'Approved').length,
        rejected: applications.filter(app => app.status === 'Rejected').length
      },
      priorities: {
        high: applications.filter(app => app.priority === 'High').length,
        medium: applications.filter(app => app.priority === 'Medium').length,
        low: applications.filter(app => app.priority === 'Low').length
      },
      petTypes: {
        dogs: applications.filter(app => app.petType === 'Dog').length,
        cats: applications.filter(app => app.petType === 'Cat').length,
        other: applications.filter(app => !['Dog', 'Cat'].includes(app.petType)).length
      },
      trends: {
        approvalRate: applications.length > 0 ? 
          (applications.filter(app => app.status === 'Approved').length / applications.length * 100).toFixed(1) : 0,
        averageProcessingTime: '2.5 days', // Mock data
        mostRequestedBreeds: [
          { breed: 'Golden Retriever', count: 1 },
          { breed: 'Siamese', count: 1 },
          { breed: 'Labrador Mix', count: 1 }
        ]
      },
      recentActivity: {
        todayApplications: filteredApps.filter(app => 
          new Date(app.submittedDate).toDateString() === new Date().toDateString()
        ).length,
        todayApprovals: applications.filter(app => 
          app.status === 'Approved' && 
          new Date(app.lastUpdated).toDateString() === new Date().toDateString()
        ).length,
        pendingReview: applications.filter(app => app.status === 'Pending').length
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

// POST /api/admin-applications/bulk-actions - Perform bulk actions on applications
router.post('/bulk-actions', async (req, res) => {
  try {
    const { action, applicationIds, data, adminId } = req.body;
    
    if (!action || !applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and applicationIds array are required'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const applicationId of applicationIds) {
      const applicationIndex = applications.findIndex(app => app.id === applicationId);
      
      if (applicationIndex === -1) {
        errors.push(`Application with ID ${applicationId} not found`);
        continue;
      }
      
      const application = applications[applicationIndex];
      
      try {
        switch (action) {
          case 'updateStatus':
            if (data && data.status) {
              const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
              if (validStatuses.includes(data.status)) {
                applications[applicationIndex].status = data.status;
                applications[applicationIndex].lastUpdated = new Date().toISOString();
                applications[applicationIndex].adminId = adminId;
                
                // Send notification if requested
                if (data.sendNotification) {
                  const notificationType = data.status === 'Approved' ? 'approval' : 'status_update';
                  const notificationResult = await sendNotification(application, notificationType, data.status);
                  
                  const notificationRecord = {
                    timestamp: new Date().toISOString(),
                    type: notificationType,
                    status: data.status,
                    messageId: notificationResult.id,
                    success: notificationResult.success,
                    adminId: adminId
                  };
                  
                  applications[applicationIndex].notificationHistory.push(notificationRecord);
                }
                
                results.push(`Updated ${application.adopterName}'s application status to ${data.status}`);
              } else {
                errors.push(`Invalid status for application ${applicationId}`);
              }
            } else {
              errors.push(`No status provided for application ${applicationId}`);
            }
            break;
            
          case 'updatePriority':
            if (data && data.priority) {
              const validPriorities = ['High', 'Medium', 'Low'];
              if (validPriorities.includes(data.priority)) {
                applications[applicationIndex].priority = data.priority;
                applications[applicationIndex].lastUpdated = new Date().toISOString();
                applications[applicationIndex].adminId = adminId;
                results.push(`Updated ${application.adopterName}'s application priority to ${data.priority}`);
              } else {
                errors.push(`Invalid priority for application ${applicationId}`);
              }
            } else {
              errors.push(`No priority provided for application ${applicationId}`);
            }
            break;
            
          case 'addNotes':
            if (data && data.notes) {
              const existingNotes = applications[applicationIndex].notes || '';
              const newNotes = existingNotes ? `${existingNotes}\n\n[${new Date().toISOString()}] ${data.notes}` : data.notes;
              applications[applicationIndex].notes = newNotes;
              applications[applicationIndex].lastUpdated = new Date().toISOString();
              applications[applicationIndex].adminId = adminId;
              results.push(`Added notes to ${application.adopterName}'s application`);
            } else {
              errors.push(`No notes provided for application ${applicationId}`);
            }
            break;
            
          case 'sendNotification':
            if (data && (data.subject || data.body)) {
              const notificationResult = {
                id: `msg_${Date.now()}_${notificationIdCounter++}`,
                applicationId: application.id,
                petName: application.petName,
                adopterEmail: application.adopterEmail,
                adopterName: application.adopterName,
                type: 'custom',
                status: application.status,
                timestamp: new Date().toISOString(),
                success: Math.random() > 0.05,
                subject: data.subject || `Update on your application for ${application.petName}`,
                body: data.body || `Dear ${application.adopterName},\n\nWe have an update regarding your application.\n\nBest regards,\nPetPal Adoption Center`,
                adminId: adminId
              };
              
              notificationLog.push(notificationResult);
              
              const notificationRecord = {
                timestamp: notificationResult.timestamp,
                type: 'custom',
                status: application.status,
                messageId: notificationResult.id,
                success: notificationResult.success,
                adminId: adminId
              };
              
              applications[applicationIndex].notificationHistory.push(notificationRecord);
              results.push(`Sent notification to ${application.adopterName}`);
            } else {
              errors.push(`No notification content provided for application ${applicationId}`);
            }
            break;
            
          default:
            errors.push(`Unknown action: ${action} for application ${applicationId}`);
        }
      } catch (actionError) {
        errors.push(`Error processing ${applicationId}: ${actionError.message}`);
      }
    }
    
    res.json({
      success: errors.length === 0,
      message: `Bulk action completed. ${results.length} successful, ${errors.length} errors.`,
      data: {
        successful: results,
        errors: errors,
        processedCount: applicationIds.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions',
      error: error.message
    });
  }
});

// GET /api/admin-applications/notifications/history - Get notification history
router.get('/notifications/history', (req, res) => {
  try {
    const { applicationId, limit = 50, offset = 0 } = req.query;
    
    let filteredNotifications = [...notificationLog];
    
    if (applicationId) {
      filteredNotifications = filteredNotifications.filter(notification =>
        notification.applicationId === applicationId
      );
    }
    
    // Sort by timestamp (most recent first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          total: filteredNotifications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredNotifications.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification history',
      error: error.message
    });
  }
});

// DELETE /api/admin-applications/:applicationId - Delete application (soft delete)
router.delete('/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId, reason } = req.body;
    
    const applicationIndex = applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const application = applications[applicationIndex];
    
    // Soft delete - mark as deleted instead of removing
    applications[applicationIndex] = {
      ...application,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: adminId,
      deletionReason: reason || 'No reason provided'
    };
    
    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: {
        applicationId: applicationId,
        deletedBy: adminId,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
});

module.exports = router;