import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdoptionApplication {
  id: string;
  applicantId: string;
  petId: string;
  petName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicationDate: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'withdrawn';
  priority: 'low' | 'medium' | 'high';
  
  // Personal Information
  personalInfo: {
    age: number;
    occupation: string;
    income: string;
    housingType: 'house' | 'apartment' | 'condo' | 'other';
    housingOwnership: 'own' | 'rent';
    landlordApproval?: boolean;
    householdSize: number;
    hasChildren: boolean;
    childrenAges?: number[];
    hasAllergies: boolean;
    allergyDetails?: string;
  };

  // Pet Experience
  petExperience: {
    previousPets: boolean;
    previousPetDetails?: string;
    currentPets: boolean;
    currentPetDetails?: string;
    veterinarianInfo?: {
      name: string;
      clinic: string;
      phone: string;
    };
    petPreferences?: string;
    reasonForAdoption: string;
  };

  // Lifestyle Information
  lifestyle: {
    workSchedule: string;
    exerciseCommitment: string;
    travelFrequency: string;
    petCareArrangements: string;
    budgetForPetCare: string;
    timeCommitment: string;
  };

  // References
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;

  // Admin Notes and Processing
  adminNotes?: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  score?: number; // Application scoring out of 100
  
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  authorName: string;
  note: string;
  timestamp: string;
  isInternal: boolean; // Internal notes vs. notes shared with applicant
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

const APPLICATION_PROCESSING_KEY = 'petpal_application_processing';
const APPLICATION_NOTES_KEY = 'petpal_application_notes';
const APPLICATION_STATUS_HISTORY_KEY = 'petpal_application_status_history';

// Mock applications data
const mockApplications: AdoptionApplication[] = [
  {
    id: 'app-1',
    applicantId: 'user-1',
    petId: 'pet-1',
    petName: 'Max',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.johnson@email.com',
    applicantPhone: '+1-555-123-4567',
    applicationDate: '2024-01-20T14:30:00Z',
    status: 'under-review',
    priority: 'high',
    personalInfo: {
      age: 29,
      occupation: 'Software Developer',
      income: '$75,000-$100,000',
      housingType: 'apartment',
      housingOwnership: 'rent',
      landlordApproval: true,
      householdSize: 2,
      hasChildren: false,
      hasAllergies: false,
    },
    petExperience: {
      previousPets: true,
      previousPetDetails: 'Had a golden retriever named Charlie for 8 years until he passed away last year',
      currentPets: false,
      veterinarianInfo: {
        name: 'Dr. Michael Smith',
        clinic: 'City Pet Hospital',
        phone: '+1-555-VET-CARE',
      },
      reasonForAdoption: 'Ready to open our home to another dog after grieving the loss of our previous pet',
    },
    lifestyle: {
      workSchedule: 'Remote work, home most days',
      exerciseCommitment: 'Daily walks and weekend hiking',
      travelFrequency: 'Rarely, mostly local trips',
      petCareArrangements: 'Pet sitter for emergencies, family nearby',
      budgetForPetCare: '$200-$300 per month',
      timeCommitment: '4-6 hours daily for exercise, training, and companionship',
    },
    references: [
      {
        name: 'Dr. Michael Smith',
        relationship: 'Veterinarian',
        phone: '+1-555-VET-CARE',
        email: 'dr.smith@citypet.com',
      },
      {
        name: 'Emily Davis',
        relationship: 'Friend and fellow dog owner',
        phone: '+1-555-DOG-FRIEND',
        email: 'emily.davis@email.com',
      },
    ],
    adminNotes: 'Excellent application with strong references. Previous pet lived to 12 years old.',
    reviewedBy: 'Jessica Williams',
    reviewDate: '2024-01-22T10:00:00Z',
    score: 92,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
  },
  {
    id: 'app-2',
    applicantId: 'user-2',
    petId: 'pet-2',
    petName: 'Luna',
    applicantName: 'Michael Chen',
    applicantEmail: 'michael.chen@email.com',
    applicantPhone: '+1-555-234-5678',
    applicationDate: '2024-01-18T11:15:00Z',
    status: 'approved',
    priority: 'medium',
    personalInfo: {
      age: 34,
      occupation: 'Teacher',
      income: '$50,000-$75,000',
      housingType: 'house',
      housingOwnership: 'own',
      householdSize: 1,
      hasChildren: false,
      hasAllergies: true,
      allergyDetails: 'Mild seasonal allergies, no pet allergies',
    },
    petExperience: {
      previousPets: true,
      previousPetDetails: 'Grew up with cats, had two cats in college',
      currentPets: false,
      veterinarianInfo: {
        name: 'Dr. Anna Wilson',
        clinic: 'Feline Health Center',
        phone: '+1-555-CAT-CARE',
      },
      reasonForAdoption: 'Love cats and want a companion in my new home',
    },
    lifestyle: {
      workSchedule: 'Standard school hours, summers off',
      exerciseCommitment: 'Indoor play and enrichment activities',
      travelFrequency: 'Occasional vacations during school breaks',
      petCareArrangements: 'Pet sitter service, reliable neighbors',
      budgetForPetCare: '$100-$150 per month',
      timeCommitment: '2-3 hours daily for play and care',
    },
    references: [
      {
        name: 'Dr. Anna Wilson',
        relationship: 'Veterinarian',
        phone: '+1-555-CAT-CARE',
      },
      {
        name: 'Jennifer Park',
        relationship: 'Colleague',
        phone: '+1-555-TEACHER',
        email: 'j.park@school.edu',
      },
    ],
    adminNotes: 'Great match for Luna. Quiet home environment perfect for shy cat.',
    reviewedBy: 'Mark Thompson',
    reviewDate: '2024-01-19T15:30:00Z',
    score: 88,
    createdAt: '2024-01-18T11:15:00Z',
    updatedAt: '2024-01-19T15:45:00Z',
  },
  {
    id: 'app-3',
    applicantId: 'user-3',
    petId: 'pet-3',
    petName: 'Buddy',
    applicantName: 'Jennifer Lopez',
    applicantEmail: 'jennifer.lopez@email.com',
    applicantPhone: '+1-555-345-6789',
    applicationDate: '2024-01-22T09:00:00Z',
    status: 'pending',
    priority: 'medium',
    personalInfo: {
      age: 26,
      occupation: 'Nurse',
      income: '$60,000-$75,000',
      housingType: 'apartment',
      housingOwnership: 'rent',
      landlordApproval: false,
      householdSize: 1,
      hasChildren: false,
      hasAllergies: false,
    },
    petExperience: {
      previousPets: false,
      currentPets: false,
      reasonForAdoption: 'First pet, want a loyal companion after long work days',
    },
    lifestyle: {
      workSchedule: '12-hour shifts, 3 days per week',
      exerciseCommitment: 'Morning jogs, evening walks',
      travelFrequency: 'Very rarely',
      petCareArrangements: 'Need to research pet sitting options',
      budgetForPetCare: '$150-$200 per month',
      timeCommitment: 'Full days off, several hours on work days',
    },
    references: [
      {
        name: 'Patricia Johnson',
        relationship: 'Supervisor at work',
        phone: '+1-555-HOSPITAL',
        email: 'p.johnson@hospital.com',
      },
    ],
    followUpRequired: true,
    followUpDate: '2024-01-25T00:00:00Z',
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
  },
];

// Mock notes data
const mockNotes: ApplicationNote[] = [
  {
    id: 'note-1',
    applicationId: 'app-1',
    authorName: 'Jessica Williams',
    note: 'Called veterinarian reference - Dr. Smith highly recommends applicant. Previous dog was well-cared for.',
    timestamp: '2024-01-21T14:00:00Z',
    isInternal: true,
  },
  {
    id: 'note-2',
    applicationId: 'app-1',
    authorName: 'Jessica Williams',
    note: 'Home visit scheduled for January 23rd at 2 PM.',
    timestamp: '2024-01-22T10:15:00Z',
    isInternal: false,
  },
];

/**
 * Initialize application processing data
 */
export async function initializeApplicationProcessingData(): Promise<void> {
  try {
    const existingApplications = await AsyncStorage.getItem(APPLICATION_PROCESSING_KEY);
    const existingNotes = await AsyncStorage.getItem(APPLICATION_NOTES_KEY);
    
    if (!existingApplications) {
      await AsyncStorage.setItem(APPLICATION_PROCESSING_KEY, JSON.stringify(mockApplications));
    }
    
    if (!existingNotes) {
      await AsyncStorage.setItem(APPLICATION_NOTES_KEY, JSON.stringify(mockNotes));
    }
    
    console.log('Application processing data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application processing data:', error);
  }
}

/**
 * Get all applications
 */
export async function getApplications(): Promise<AdoptionApplication[]> {
  try {
    const stored = await AsyncStorage.getItem(APPLICATION_PROCESSING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading applications:', error);
  }
  return mockApplications;
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: string): Promise<AdoptionApplication | undefined> {
  try {
    const applications = await getApplications();
    return applications.find(app => app.id === id);
  } catch (error) {
    console.error('Error finding application:', error);
    return undefined;
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: AdoptionApplication['status'],
  adminName: string,
  reason?: string
): Promise<AdoptionApplication | null> {
  try {
    const applications = await getApplications();
    const appIndex = applications.findIndex(app => app.id === applicationId);

    if (appIndex === -1) return null;

    const currentApp = applications[appIndex];
    
    // Record status change in history
    const statusHistory: ApplicationStatusHistory = {
      id: `history-${Date.now()}`,
      applicationId,
      previousStatus: currentApp.status,
      newStatus,
      changedBy: adminName,
      reason,
      timestamp: new Date().toISOString(),
    };

    const updatedApp = {
      ...currentApp,
      status: newStatus,
      reviewedBy: adminName,
      reviewDate: new Date().toISOString(),
      rejectionReason: newStatus === 'rejected' ? reason : undefined,
      updatedAt: new Date().toISOString(),
    };

    const updatedApplications = applications.map((app, index) =>
      index === appIndex ? updatedApp : app
    );

    await AsyncStorage.setItem(APPLICATION_PROCESSING_KEY, JSON.stringify(updatedApplications));
    
    // Save status history
    const existingHistory = await getApplicationStatusHistory();
    const updatedHistory = [statusHistory, ...existingHistory];
    await AsyncStorage.setItem(APPLICATION_STATUS_HISTORY_KEY, JSON.stringify(updatedHistory));

    return updatedApp;
  } catch (error) {
    console.error('Error updating application status:', error);
    return null;
  }
}

/**
 * Add note to application
 */
export async function addApplicationNote(
  applicationId: string,
  authorName: string,
  note: string,
  isInternal: boolean = true
): Promise<ApplicationNote> {
  const newNote: ApplicationNote = {
    id: `note-${Date.now()}`,
    applicationId,
    authorName,
    note,
    timestamp: new Date().toISOString(),
    isInternal,
  };

  try {
    const notes = await getApplicationNotes();
    const updatedNotes = [newNote, ...notes];
    await AsyncStorage.setItem(APPLICATION_NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Error adding application note:', error);
  }

  return newNote;
}

/**
 * Get application notes
 */
export async function getApplicationNotes(): Promise<ApplicationNote[]> {
  try {
    const stored = await AsyncStorage.getItem(APPLICATION_NOTES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading application notes:', error);
  }
  return mockNotes;
}

/**
 * Get notes for specific application
 */
export async function getNotesForApplication(applicationId: string): Promise<ApplicationNote[]> {
  try {
    const notes = await getApplicationNotes();
    return notes.filter(note => note.applicationId === applicationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error loading application notes:', error);
    return [];
  }
}

/**
 * Get application status history
 */
export async function getApplicationStatusHistory(): Promise<ApplicationStatusHistory[]> {
  try {
    const stored = await AsyncStorage.getItem(APPLICATION_STATUS_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading application status history:', error);
  }
  return [];
}

/**
 * Score application automatically
 */
export async function scoreApplication(applicationId: string): Promise<number> {
  try {
    const application = await getApplicationById(applicationId);
    if (!application) return 0;

    let score = 0;

    // Pet experience scoring (30 points)
    if (application.petExperience.previousPets) score += 20;
    if (application.petExperience.veterinarianInfo) score += 10;

    // Housing stability (25 points)
    if (application.personalInfo.housingOwnership === 'own') score += 15;
    else if (application.personalInfo.landlordApproval) score += 10;
    if (application.personalInfo.housingType === 'house') score += 10;

    // Financial stability (20 points)
    const incomeScore = application.personalInfo.income.includes('75,000') ? 20 : 
                       application.personalInfo.income.includes('50,000') ? 15 : 10;
    score += incomeScore;

    // Lifestyle compatibility (15 points)
    if (application.lifestyle.workSchedule.includes('Remote') || 
        application.lifestyle.workSchedule.includes('home')) score += 10;
    if (application.lifestyle.exerciseCommitment.includes('Daily')) score += 5;

    // References (10 points)
    score += Math.min(application.references.length * 3, 10);

    // Bonus points for specific commitments
    if (application.lifestyle.budgetForPetCare.includes('200') || 
        application.lifestyle.budgetForPetCare.includes('300')) score += 5;

    const finalScore = Math.min(score, 100);

    // Update application with score
    await updateApplication(applicationId, { score: finalScore });

    return finalScore;
  } catch (error) {
    console.error('Error scoring application:', error);
    return 0;
  }
}

/**
 * Update application
 */
export async function updateApplication(
  applicationId: string,
  updates: Partial<Omit<AdoptionApplication, 'id' | 'createdAt'>>
): Promise<AdoptionApplication | null> {
  try {
    const applications = await getApplications();
    const appIndex = applications.findIndex(app => app.id === applicationId);

    if (appIndex === -1) return null;

    const updatedApp = {
      ...applications[appIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedApplications = applications.map((app, index) =>
      index === appIndex ? updatedApp : app
    );

    await AsyncStorage.setItem(APPLICATION_PROCESSING_KEY, JSON.stringify(updatedApplications));
    return updatedApp;
  } catch (error) {
    console.error('Error updating application:', error);
    return null;
  }
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(status: AdoptionApplication['status']): Promise<AdoptionApplication[]> {
  try {
    const applications = await getApplications();
    return applications.filter(app => app.status === status);
  } catch (error) {
    console.error('Error loading applications by status:', error);
    return [];
  }
}

/**
 * Get applications requiring follow-up
 */
export async function getApplicationsRequiringFollowUp(): Promise<AdoptionApplication[]> {
  try {
    const applications = await getApplications();
    const today = new Date();
    
    return applications.filter(app => 
      app.followUpRequired && 
      app.followUpDate && 
      new Date(app.followUpDate) <= today
    );
  } catch (error) {
    console.error('Error loading applications requiring follow-up:', error);
    return [];
  }
}

/**
 * Get application processing statistics
 */
export async function getApplicationProcessingStats() {
  try {
    const applications = await getApplications();
    
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const underReview = applications.filter(app => app.status === 'under-review').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    
    const averageScore = applications.filter(app => app.score).length > 0 ?
      Math.round(applications.filter(app => app.score)
        .reduce((sum, app) => sum + (app.score || 0), 0) / 
        applications.filter(app => app.score).length) : 0;

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    const followUpRequired = applications.filter(app => app.followUpRequired).length;

    const processingTime = applications
      .filter(app => app.reviewDate && app.status !== 'pending')
      .map(app => {
        const applied = new Date(app.applicationDate);
        const reviewed = new Date(app.reviewDate!);
        return Math.round((reviewed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
      });

    const averageProcessingTime = processingTime.length > 0 ?
      Math.round(processingTime.reduce((sum, days) => sum + days, 0) / processingTime.length) : 0;

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      averageScore,
      approvalRate,
      followUpRequired,
      averageProcessingTime,
      byStatus: {
        pending,
        'under-review': underReview,
        approved,
        rejected,
        withdrawn: applications.filter(app => app.status === 'withdrawn').length,
      },
    };
  } catch (error) {
    console.error('Error calculating application processing statistics:', error);
    return {
      total: 0,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      averageScore: 0,
      approvalRate: 0,
      followUpRequired: 0,
      averageProcessingTime: 0,
      byStatus: {
        pending: 0,
        'under-review': 0,
        approved: 0,
        rejected: 0,
        withdrawn: 0,
      },
    };
  }
}

/**
 * Search applications
 */
export async function searchApplications(criteria: {
  query?: string;
  status?: AdoptionApplication['status'];
  priority?: AdoptionApplication['priority'];
  dateRange?: { from: string; to: string };
  scoreRange?: { min: number; max: number };
}): Promise<AdoptionApplication[]> {
  try {
    const applications = await getApplications();
    
    return applications.filter(app => {
      // Text search
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        const searchableText = [
          app.applicantName,
          app.applicantEmail,
          app.petName,
          app.personalInfo.occupation,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      // Status filter
      if (criteria.status && app.status !== criteria.status) return false;
      
      // Priority filter
      if (criteria.priority && app.priority !== criteria.priority) return false;
      
      // Date range filter
      if (criteria.dateRange) {
        const appDate = new Date(app.applicationDate);
        const fromDate = new Date(criteria.dateRange.from);
        const toDate = new Date(criteria.dateRange.to);
        
        if (appDate < fromDate || appDate > toDate) return false;
      }
      
      // Score range filter
      if (criteria.scoreRange && app.score) {
        if (app.score < criteria.scoreRange.min || app.score > criteria.scoreRange.max) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching applications:', error);
    return [];
  }
}
