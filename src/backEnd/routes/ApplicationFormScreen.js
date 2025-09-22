const express = require('express');
const router = express.Router();

// In-memory storage for applications and related data (in production, use a database)
let applications = [
  {
    id: "app-001",
    petId: "pet-001",
    userId: "user-001",
    status: "pending",
    submittedAt: "2025-09-20T10:30:00Z",
    reviewedAt: null,
    reviewedBy: null,
    
    // Personal Information
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 111-2222",
    dateOfBirth: "05/15/1985",

    // Address Information
    address: "123 Main Street",
    city: "Pet City",
    state: "CA",
    zipCode: "12345",
    housingType: "house",
    ownRent: "own",
    hasYard: true,
    yardFenced: true,
    landlordsName: "",
    landlordsPhone: "",

    // Pet Experience
    previousPets: "I had a Golden Retriever named Max for 12 years until he passed away last year.",
    currentPets: "Currently no pets",
    veterinarian: "Dr. Sarah Johnson",
    vetPhone: "+1 (555) 999-8888",
    petExperience: "Extensive experience with large breed dogs. Trained Max from puppy to senior age.",

    // Lifestyle
    workSchedule: "Monday-Friday 9 AM to 5 PM, work from home 3 days a week",
    hoursAlone: "4",
    exerciseCommitment: "high",
    travelFrequency: "Rarely, maybe 2-3 times per year for short trips",
    familyMembers: "Married couple, no children currently but planning to start a family",
    allergies: false,

    // References
    reference1Name: "Mike Johnson",
    reference1Phone: "+1 (555) 777-1111",
    reference1Relation: "Best friend and neighbor",
    reference2Name: "Lisa Chen",
    reference2Phone: "+1 (555) 888-2222",
    reference2Relation: "Coworker and friend",

    // Additional Information
    whyAdopt: "We're ready to provide a loving home to a dog in need and have the time and resources to commit.",
    expectations: "Looking for a loyal companion who will be part of our family. We understand training takes time and patience.",
    trainingPlan: "Positive reinforcement training, possibly professional classes if needed for specific behaviors.",
    healthCareCommitment: "Regular vet checkups, emergency care budget, pet insurance consideration.",
    financialPreparation: "Set aside $2000 annually for pet care, emergency fund of $5000 for unexpected medical needs.",
    additionalComments: "We have a large fenced yard and live in a pet-friendly neighborhood with walking trails."
  },
  {
    id: "app-002",
    petId: "pet-002",
    userId: "user-002",
    status: "approved",
    submittedAt: "2025-09-18T14:15:00Z",
    reviewedAt: "2025-09-19T09:30:00Z",
    reviewedBy: "admin-001",
    
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 333-4444",
    dateOfBirth: "03/22/1990",

    address: "456 Oak Avenue",
    city: "Animal City",
    state: "NY",
    zipCode: "54321",
    housingType: "apartment",
    ownRent: "rent",
    hasYard: false,
    yardFenced: false,
    landlordsName: "Property Management Co",
    landlordsPhone: "+1 (555) 666-7777",

    previousPets: "Had cats growing up, recently lost my Border Collie mix after 10 wonderful years.",
    currentPets: "One cat named Whiskers, very social and good with dogs",
    veterinarian: "City Animal Hospital",
    vetPhone: "+1 (555) 444-5555",
    petExperience: "15+ years with dogs, experienced with herding breeds and their energy needs.",

    workSchedule: "Flexible schedule, work from home most days",
    hoursAlone: "2",
    exerciseCommitment: "high",
    travelFrequency: "Minimal, prefer staycations",
    familyMembers: "Single, active lifestyle, dog park regular",
    allergies: false,

    reference1Name: "Tom Wilson",
    reference1Phone: "+1 (555) 222-3333",
    reference1Relation: "Veterinarian and family friend",
    reference2Name: "Emma Davis",
    reference2Phone: "+1 (555) 555-6666",
    reference2Relation: "Dog park friend and neighbor",

    whyAdopt: "Luna reminds me of my previous Border Collie. I have experience with the breed and miss having an active dog companion.",
    expectations: "I understand Border Collies need mental and physical stimulation. I'm prepared for training and exercise needs.",
    trainingPlan: "Agility training, daily mental exercises, consistent positive reinforcement training routine.",
    healthCareCommitment: "Excellent vet relationship established, budget for premium care and regular checkups.",
    financialPreparation: "Stable income, pet emergency fund, experience budgeting for high-energy breed needs.",
    additionalComments: "I have agility equipment and live near dog parks. Ready to provide the active lifestyle Luna needs."
  }
];

// Pet data for validation
let pets = [
  { id: "pet-001", name: "Buddy", breed: "Golden Retriever", status: "available" },
  { id: "pet-002", name: "Luna", breed: "Border Collie", status: "available" },
  { id: "pet-003", name: "Max", breed: "German Shepherd Mix", status: "available" }
];

// Application drafts storage (for saving progress)
let applicationDrafts = [
  {
    userId: "user-003",
    petId: "pet-001",
    currentStep: 2,
    formData: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@email.com",
      phone: "+1 (555) 987-6543",
      address: "789 Pine Street",
      city: "Pet Town"
    },
    lastSaved: "2025-09-21T15:45:00Z"
  }
];

// Helper function to validate required fields for each step
const validateStep = (stepIndex, formData) => {
  const errors = [];

  switch (stepIndex) {
    case 0: // Personal Information
      if (!formData.firstName || formData.firstName.trim() === '') {
        errors.push('First name is required');
      }
      if (!formData.lastName || formData.lastName.trim() === '') {
        errors.push('Last name is required');
      }
      if (!formData.email || formData.email.trim() === '') {
        errors.push('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push('Valid email address is required');
      }
      if (!formData.phone || formData.phone.trim() === '') {
        errors.push('Phone number is required');
      }
      if (!formData.dateOfBirth || formData.dateOfBirth.trim() === '') {
        errors.push('Date of birth is required');
      }
      break;

    case 1: // Address Information
      if (!formData.address || formData.address.trim() === '') {
        errors.push('Street address is required');
      }
      if (!formData.city || formData.city.trim() === '') {
        errors.push('City is required');
      }
      if (!formData.state || formData.state.trim() === '') {
        errors.push('State is required');
      }
      if (!formData.zipCode || formData.zipCode.trim() === '') {
        errors.push('ZIP code is required');
      }
      if (!formData.housingType || formData.housingType.trim() === '') {
        errors.push('Housing type is required');
      }
      if (!formData.ownRent || formData.ownRent.trim() === '') {
        errors.push('Own/rent status is required');
      }
      if (formData.ownRent === 'rent') {
        if (!formData.landlordsName || formData.landlordsName.trim() === '') {
          errors.push('Landlord name is required for renters');
        }
        if (!formData.landlordsPhone || formData.landlordsPhone.trim() === '') {
          errors.push('Landlord phone is required for renters');
        }
      }
      break;

    case 2: // Pet Experience
      if (!formData.petExperience || formData.petExperience.trim() === '') {
        errors.push('Pet experience description is required');
      }
      break;

    case 3: // Lifestyle
      if (!formData.workSchedule || formData.workSchedule.trim() === '') {
        errors.push('Work schedule is required');
      }
      if (!formData.hoursAlone || formData.hoursAlone.trim() === '') {
        errors.push('Hours alone per day is required');
      }
      if (!formData.exerciseCommitment || formData.exerciseCommitment.trim() === '') {
        errors.push('Exercise commitment level is required');
      }
      if (!formData.travelFrequency || formData.travelFrequency.trim() === '') {
        errors.push('Travel frequency is required');
      }
      if (!formData.familyMembers || formData.familyMembers.trim() === '') {
        errors.push('Family members information is required');
      }
      break;

    case 4: // References
      if (!formData.reference1Name || formData.reference1Name.trim() === '') {
        errors.push('First reference name is required');
      }
      if (!formData.reference1Phone || formData.reference1Phone.trim() === '') {
        errors.push('First reference phone is required');
      }
      if (!formData.reference1Relation || formData.reference1Relation.trim() === '') {
        errors.push('First reference relationship is required');
      }
      if (!formData.reference2Name || formData.reference2Name.trim() === '') {
        errors.push('Second reference name is required');
      }
      if (!formData.reference2Phone || formData.reference2Phone.trim() === '') {
        errors.push('Second reference phone is required');
      }
      if (!formData.reference2Relation || formData.reference2Relation.trim() === '') {
        errors.push('Second reference relationship is required');
      }
      break;

    case 5: // Additional Information
      if (!formData.whyAdopt || formData.whyAdopt.trim() === '') {
        errors.push('Reason for adoption is required');
      }
      if (!formData.expectations || formData.expectations.trim() === '') {
        errors.push('Expectations are required');
      }
      if (!formData.trainingPlan || formData.trainingPlan.trim() === '') {
        errors.push('Training plan is required');
      }
      if (!formData.healthCareCommitment || formData.healthCareCommitment.trim() === '') {
        errors.push('Healthcare commitment is required');
      }
      if (!formData.financialPreparation || formData.financialPreparation.trim() === '') {
        errors.push('Financial preparation details are required');
      }
      break;
  }

  return errors;
};

// Helper function to generate unique IDs
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Helper function to calculate application completeness
const calculateCompleteness = (formData) => {
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
    'address', 'city', 'state', 'zipCode', 'housingType', 'ownRent',
    'petExperience', 'workSchedule', 'hoursAlone', 'exerciseCommitment',
    'travelFrequency', 'familyMembers', 'reference1Name', 'reference1Phone',
    'reference1Relation', 'reference2Name', 'reference2Phone', 'reference2Relation',
    'whyAdopt', 'expectations', 'trainingPlan', 'healthCareCommitment', 'financialPreparation'
  ];

  const completedFields = requiredFields.filter(field => 
    formData[field] && formData[field].toString().trim() !== ''
  );

  return Math.round((completedFields.length / requiredFields.length) * 100);
};

// POST /api/application-form/validate-step - Validate a specific step
router.post('/validate-step', (req, res) => {
  try {
    const { stepIndex, formData, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (stepIndex === undefined || stepIndex < 0 || stepIndex > 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid step index is required (0-6)'
      });
    }

    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }

    // Validate the specific step
    const errors = validateStep(stepIndex, formData);
    const isValid = errors.length === 0;

    // Calculate overall completeness
    const completeness = calculateCompleteness(formData);

    res.json({
      success: true,
      data: {
        isValid,
        errors,
        completeness,
        step: stepIndex,
        nextStep: isValid && stepIndex < 6 ? stepIndex + 1 : stepIndex
      }
    });

  } catch (error) {
    console.error('Error validating application step:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/application-form/save-draft - Save application progress
router.post('/save-draft', (req, res) => {
  try {
    const { userId, petId, currentStep, formData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }

    if (currentStep === undefined || currentStep < 0 || currentStep > 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid current step is required (0-6)'
      });
    }

    // Check if pet exists and is available
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Pet is no longer available for adoption'
      });
    }

    // Find existing draft or create new one
    const existingDraftIndex = applicationDrafts.findIndex(
      draft => draft.userId === userId && draft.petId === petId
    );

    const draft = {
      userId,
      petId,
      currentStep,
      formData: formData || {},
      lastSaved: new Date().toISOString(),
      completeness: calculateCompleteness(formData || {})
    };

    if (existingDraftIndex !== -1) {
      applicationDrafts[existingDraftIndex] = draft;
    } else {
      applicationDrafts.push(draft);
    }

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        draft: {
          ...draft,
          petName: pet.name,
          petBreed: pet.breed
        }
      }
    });

  } catch (error) {
    console.error('Error saving application draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/application-form/draft/:petId - Get saved draft
router.get('/draft/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const draft = applicationDrafts.find(
      d => d.userId === userId && d.petId === petId
    );

    if (!draft) {
      return res.json({
        success: true,
        data: {
          hasDraft: false,
          draft: null
        }
      });
    }

    const pet = pets.find(p => p.id === petId);

    res.json({
      success: true,
      data: {
        hasDraft: true,
        draft: {
          ...draft,
          petName: pet ? pet.name : 'Unknown Pet',
          petBreed: pet ? pet.breed : 'Unknown Breed'
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving application draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/application-form/submit - Submit final application
router.post('/submit', (req, res) => {
  try {
    const { userId, petId, formData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID is required'
      });
    }

    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }

    // Check if pet exists and is available
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Pet is no longer available for adoption'
      });
    }

    // Check if user already has an application for this pet
    const existingApplication = applications.find(
      app => app.userId === userId && app.petId === petId && 
      ['pending', 'approved'].includes(app.status)
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active application for this pet'
      });
    }

    // Validate all steps
    const allErrors = [];
    for (let step = 0; step <= 5; step++) {
      const stepErrors = validateStep(step, formData);
      allErrors.push(...stepErrors);
    }

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Application validation failed',
        errors: allErrors
      });
    }

    // Create the application
    const newApplication = {
      id: generateId('app'),
      petId,
      userId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      ...formData,
      completeness: 100
    };

    applications.push(newApplication);

    // Remove draft after successful submission
    const draftIndex = applicationDrafts.findIndex(
      draft => draft.userId === userId && draft.petId === petId
    );
    if (draftIndex !== -1) {
      applicationDrafts.splice(draftIndex, 1);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          ...newApplication,
          petName: pet.name,
          petBreed: pet.breed
        },
        applicationId: newApplication.id
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/application-form/application/:applicationId - Get specific application
router.get('/application/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const application = applications.find(app => app.id === applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application or is admin
    if (application.userId !== userId && !req.query.userType === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pet = pets.find(p => p.id === application.petId);

    res.json({
      success: true,
      data: {
        application: {
          ...application,
          petName: pet ? pet.name : 'Unknown Pet',
          petBreed: pet ? pet.breed : 'Unknown Breed'
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/application-form/user-applications - Get user's applications
router.get('/user-applications', (req, res) => {
  try {
    const { userId, status, limit = 10, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let userApplications = applications.filter(app => app.userId === userId);

    // Filter by status if provided
    if (status) {
      userApplications = userApplications.filter(app => app.status === status);
    }

    // Sort by submission date (newest first)
    userApplications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Apply pagination
    const total = userApplications.length;
    const paginatedApplications = userApplications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    // Add pet information
    const applicationsWithPetInfo = paginatedApplications.map(app => {
      const pet = pets.find(p => p.id === app.petId);
      return {
        ...app,
        petName: pet ? pet.name : 'Unknown Pet',
        petBreed: pet ? pet.breed : 'Unknown Breed'
      };
    });

    res.json({
      success: true,
      data: {
        applications: applicationsWithPetInfo,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        },
        summary: {
          total: applications.filter(app => app.userId === userId).length,
          pending: applications.filter(app => app.userId === userId && app.status === 'pending').length,
          approved: applications.filter(app => app.userId === userId && app.status === 'approved').length,
          rejected: applications.filter(app => app.userId === userId && app.status === 'rejected').length
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/application-form/draft/:petId - Delete saved draft
router.delete('/draft/:petId', (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const draftIndex = applicationDrafts.findIndex(
      draft => draft.userId === userId && draft.petId === petId
    );

    if (draftIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    const deletedDraft = applicationDrafts.splice(draftIndex, 1)[0];

    res.json({
      success: true,
      message: 'Draft deleted successfully',
      data: {
        deletedDraft
      }
    });

  } catch (error) {
    console.error('Error deleting application draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/application-form/application/:applicationId/status - Update application status (admin only)
router.put('/application/:applicationId/status', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId, userType, status, reviewNotes } = req.body;

    if (!userId || userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin privileges required'
      });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, approved, rejected)'
      });
    }

    const applicationIndex = applications.findIndex(app => app.id === applicationId);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: userId,
      reviewNotes: reviewNotes || ''
    };

    const pet = pets.find(p => p.id === applications[applicationIndex].petId);

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: {
        application: {
          ...applications[applicationIndex],
          petName: pet ? pet.name : 'Unknown Pet',
          petBreed: pet ? pet.breed : 'Unknown Breed'
        }
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
