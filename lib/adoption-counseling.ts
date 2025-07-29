import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdoptionCounselorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  experience: number; // years
  languages: string[];
  certifications: string[];
  availability: {
    [key: string]: { start: string; end: string; }[];
  };
  rating: number;
  totalCounseling: number;
  successfulPlacements: number;
  bio: string;
  isActive: boolean;
  profileImage?: string;
}

export interface CounselingSession {
  id: string;
  counselorId: string;
  counselorName: string;
  applicantId: string;
  applicantName: string;
  petId?: string;
  petName?: string;
  sessionType: 'initial-consultation' | 'pet-matching' | 'pre-adoption' | 'post-adoption' | 'behavioral-guidance' | 'crisis-intervention';
  sessionDate: string;
  duration: number; // minutes
  location: 'in-person' | 'phone' | 'video-call' | 'home-visit';
  agenda: string[];
  discussionPoints: DiscussionPoint[];
  recommendations: string[];
  actionItems: ActionItem[];
  followUpRequired: boolean;
  followUpDate?: string;
  satisfactionRating?: number; // 1-5 scale from applicant
  notes: string;
  attachments: CounselingAttachment[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionPoint {
  id: string;
  topic: string;
  category: 'lifestyle' | 'housing' | 'experience' | 'expectations' | 'concerns' | 'preferences';
  details: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: 'applicant' | 'counselor' | 'shelter';
  dueDate?: string;
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
}

export interface CounselingAttachment {
  id: string;
  fileName: string;
  fileType: 'document' | 'image' | 'video' | 'audio';
  fileUrl: string;
  description?: string;
  uploadDate: string;
}

export interface PetMatchingProfile {
  id: string;
  applicantId: string;
  applicantName: string;
  createdBy: string; // counselor
  lifestyle: LifestyleAssessment;
  preferences: PetPreferences;
  compatibility: CompatibilityFactors;
  dealBreakers: string[];
  idealPetDescription: string;
  matchingAlgorithmScore?: number;
  recommendedPets: RecommendedPet[];
  status: 'draft' | 'active' | 'matched' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface LifestyleAssessment {
  housingType: 'apartment' | 'house' | 'condo' | 'farm' | 'other';
  hasYard: boolean;
  yardSize?: 'small' | 'medium' | 'large';
  isFenced: boolean;
  housingOwnership: 'own' | 'rent';
  landlordApproval?: boolean;
  householdSize: number;
  hasChildren: boolean;
  childrenAges?: number[];
  workSchedule: string;
  travelFrequency: string;
  activityLevel: 'low' | 'moderate' | 'high' | 'very-high';
  experienceLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: string; // hours per day
  budgetRange: string;
}

export interface PetPreferences {
  species: ('dog' | 'cat' | 'rabbit' | 'bird' | 'other')[];
  sizePreference: ('small' | 'medium' | 'large' | 'extra-large')[];
  agePreference: 'puppy-kitten' | 'young' | 'adult' | 'senior' | 'no-preference';
  genderPreference: 'male' | 'female' | 'no-preference';
  energyLevelPreference: ('low' | 'medium' | 'high')[];
  trainingLevel: ('untrained' | 'basic' | 'intermediate' | 'advanced')[];
  temperamentPreferences: string[];
  specialNeedsAcceptance: boolean;
  groomingCommitment: 'low' | 'medium' | 'high';
}

export interface CompatibilityFactors {
  goodWithKidsRequired?: boolean;
  goodWithDogsRequired?: boolean;
  goodWithCatsRequired?: boolean;
  mustBeSpayedNeutered: boolean;
  mustBeVaccinated: boolean;
  allowsBehavioralIssues: boolean;
  allowsMedicalIssues: boolean;
  maxAdoptionFee?: number;
}

export interface RecommendedPet {
  petId: string;
  petName: string;
  matchScore: number; // percentage
  matchReasons: string[];
  potentialConcerns: string[];
  counselorNotes: string;
  status: 'recommended' | 'viewed' | 'interested' | 'meeting-scheduled' | 'adopted' | 'passed';
  interactionDate?: string;
}

export interface CounselingPlan {
  id: string;
  applicantId: string;
  applicantName: string;
  counselorId: string;
  planType: 'pre-adoption' | 'post-adoption' | 'behavioral-support' | 'crisis-intervention';
  goals: CounselingGoal[];
  sessions: PlannedSession[];
  timeline: string; // e.g., "4 weeks", "3 months"
  estimatedCost?: number;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // percentage
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CounselingGoal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
  metrics?: string[];
}

export interface PlannedSession {
  sessionNumber: number;
  title: string;
  objectives: string[];
  estimatedDuration: number;
  sessionType: CounselingSession['sessionType'];
  isCompleted: boolean;
  actualSessionId?: string;
}

const COUNSELORS_KEY = 'petpal_counselors';
const COUNSELING_SESSIONS_KEY = 'petpal_counseling_sessions';
const MATCHING_PROFILES_KEY = 'petpal_matching_profiles';
const COUNSELING_PLANS_KEY = 'petpal_counseling_plans';

// Mock counselors data
const mockCounselors: AdoptionCounselorProfile[] = [
  {
    id: 'counselor-1',
    name: 'Dr. Jennifer Martinez',
    email: 'jennifer.martinez@petpal.com',
    phone: '+1-555-COUNSEL-1',
    specializations: ['Pet Behavior', 'Family Matching', 'First-Time Adopters'],
    experience: 8,
    languages: ['English', 'Spanish'],
    certifications: ['Certified Animal Behavior Consultant', 'Pet Adoption Counselor Certification'],
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
    },
    rating: 4.9,
    totalCounseling: 245,
    successfulPlacements: 187,
    bio: 'Passionate about creating perfect matches between pets and families. Specializes in behavioral assessments and first-time adopter guidance.',
    isActive: true,
  },
  {
    id: 'counselor-2',
    name: 'Michael Thompson',
    email: 'michael.thompson@petpal.com',
    phone: '+1-555-COUNSEL-2',
    specializations: ['Senior Pet Placement', 'Special Needs Animals', 'Crisis Intervention'],
    experience: 12,
    languages: ['English'],
    certifications: ['Licensed Clinical Social Worker', 'Animal-Assisted Therapy Specialist'],
    availability: {
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '18:00' }],
      saturday: [{ start: '09:00', end: '13:00' }],
    },
    rating: 4.8,
    totalCounseling: 312,
    successfulPlacements: 256,
    bio: 'Experienced counselor with expertise in placing special needs animals and supporting adopters through challenging situations.',
    isActive: true,
  },
];

// Mock counseling sessions data
const mockCounselingSessions: CounselingSession[] = [
  {
    id: 'session-1',
    counselorId: 'counselor-1',
    counselorName: 'Dr. Jennifer Martinez',
    applicantId: 'applicant-1',
    applicantName: 'Sarah Johnson',
    petId: 'pet-1',
    petName: 'Max',
    sessionType: 'pet-matching',
    sessionDate: '2024-01-20T14:00:00Z',
    duration: 60,
    location: 'in-person',
    agenda: [
      'Review application and lifestyle assessment',
      'Discuss pet preferences and expectations',
      'Meet potential matches',
      'Address concerns and questions',
    ],
    discussionPoints: [
      {
        id: 'point-1',
        topic: 'Exercise Requirements',
        category: 'lifestyle',
        details: 'Applicant enjoys daily walks and weekend hiking',
        resolution: 'Recommended active dog breeds',
        priority: 'high',
      },
      {
        id: 'point-2',
        topic: 'Separation Anxiety Concerns',
        category: 'concerns',
        details: 'Worried about leaving pet alone during work hours',
        resolution: 'Discussed crate training and gradual conditioning',
        priority: 'medium',
      },
    ],
    recommendations: [
      'Consider adult dogs (2-5 years) with established temperament',
      'Look for dogs with moderate to high energy levels',
      'Prioritize dogs that are already crate trained',
    ],
    actionItems: [
      {
        id: 'action-1',
        task: 'Visit Max for a meet-and-greet session',
        assignedTo: 'applicant',
        dueDate: '2024-01-25T00:00:00Z',
        isCompleted: true,
        completedDate: '2024-01-23T00:00:00Z',
      },
      {
        id: 'action-2',
        task: 'Prepare adoption packet for Max',
        assignedTo: 'counselor',
        dueDate: '2024-01-22T00:00:00Z',
        isCompleted: true,
        completedDate: '2024-01-21T00:00:00Z',
      },
    ],
    followUpRequired: true,
    followUpDate: '2024-01-27T00:00:00Z',
    satisfactionRating: 5,
    notes: 'Excellent session. Sarah showed great understanding of pet needs and responsibilities. Max seems like a perfect match.',
    attachments: [
      {
        id: 'att-session-1',
        fileName: 'max_behavior_profile.pdf',
        fileType: 'document',
        fileUrl: '/counseling-files/max_behavior_profile.pdf',
        description: 'Detailed behavior assessment for Max',
        uploadDate: '2024-01-20T14:30:00Z',
      },
    ],
    status: 'completed',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
];

// Mock matching profiles data
const mockMatchingProfiles: PetMatchingProfile[] = [
  {
    id: 'profile-1',
    applicantId: 'applicant-1',
    applicantName: 'Sarah Johnson',
    createdBy: 'counselor-1',
    lifestyle: {
      housingType: 'house',
      hasYard: true,
      yardSize: 'medium',
      isFenced: true,
      housingOwnership: 'own',
      householdSize: 2,
      hasChildren: false,
      workSchedule: 'Remote work, flexible hours',
      travelFrequency: 'Rarely, mostly local trips',
      activityLevel: 'high',
      experienceLevel: 'intermediate',
      timeAvailable: '4-6 hours daily',
      budgetRange: '$200-400 per month',
    },
    preferences: {
      species: ['dog'],
      sizePreference: ['medium', 'large'],
      agePreference: 'adult',
      genderPreference: 'no-preference',
      energyLevelPreference: ['medium', 'high'],
      trainingLevel: ['basic', 'intermediate'],
      temperamentPreferences: ['friendly', 'loyal', 'playful'],
      specialNeedsAcceptance: false,
      groomingCommitment: 'medium',
    },
    compatibility: {
      goodWithKidsRequired: false,
      goodWithDogsRequired: true,
      goodWithCatsRequired: false,
      mustBeSpayedNeutered: true,
      mustBeVaccinated: true,
      allowsBehavioralIssues: false,
      allowsMedicalIssues: false,
      maxAdoptionFee: 300,
    },
    dealBreakers: ['aggressive behavior', 'excessive barking', 'destructive tendencies'],
    idealPetDescription: 'A friendly, medium to large-sized dog that enjoys daily exercise and has basic training. Should be good with other dogs for park visits.',
    matchingAlgorithmScore: 92,
    recommendedPets: [
      {
        petId: 'pet-1',
        petName: 'Max',
        matchScore: 95,
        matchReasons: [
          'Perfect size match',
          'High energy level compatible with lifestyle',
          'Basic training already established',
          'Good with other dogs',
        ],
        potentialConcerns: ['Mild separation anxiety - manageable with training'],
        counselorNotes: 'Excellent match. Max would thrive in this environment.',
        status: 'interested',
        interactionDate: '2024-01-23T00:00:00Z',
      },
      {
        petId: 'pet-2',
        petName: 'Buddy',
        matchScore: 78,
        matchReasons: [
          'Good size match',
          'Friendly temperament',
          'Age appropriate',
        ],
        potentialConcerns: ['Lower energy level than preferred', 'Needs more training'],
        counselorNotes: 'Good backup option if Max doesn\'t work out.',
        status: 'recommended',
      },
    ],
    status: 'matched',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-23T00:00:00Z',
  },
];

/**
 * Initialize adoption counseling data
 */
export async function initializeAdoptionCounselingData(): Promise<void> {
  try {
    const existingCounselors = await AsyncStorage.getItem(COUNSELORS_KEY);
    const existingSessions = await AsyncStorage.getItem(COUNSELING_SESSIONS_KEY);
    const existingProfiles = await AsyncStorage.getItem(MATCHING_PROFILES_KEY);
    
    if (!existingCounselors) {
      await AsyncStorage.setItem(COUNSELORS_KEY, JSON.stringify(mockCounselors));
    }
    
    if (!existingSessions) {
      await AsyncStorage.setItem(COUNSELING_SESSIONS_KEY, JSON.stringify(mockCounselingSessions));
    }
    
    if (!existingProfiles) {
      await AsyncStorage.setItem(MATCHING_PROFILES_KEY, JSON.stringify(mockMatchingProfiles));
    }
    
    console.log('Adoption counseling data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize adoption counseling data:', error);
  }
}

/**
 * Get all counselors
 */
export async function getCounselors(): Promise<AdoptionCounselorProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(COUNSELORS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading counselors:', error);
  }
  return mockCounselors;
}

/**
 * Get available counselors for specific date and time
 */
export async function getAvailableCounselors(date: string, time: string): Promise<AdoptionCounselorProfile[]> {
  try {
    const counselors = await getCounselors();
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return counselors.filter(counselor => {
      if (!counselor.isActive) return false;
      
      const dayAvailability = counselor.availability[dayName];
      if (!dayAvailability) return false;
      
      return dayAvailability.some(slot => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        return time >= slotStart && time <= slotEnd;
      });
    });
  } catch (error) {
    console.error('Error finding available counselors:', error);
    return [];
  }
}

/**
 * Get counseling sessions
 */
export async function getCounselingSessions(): Promise<CounselingSession[]> {
  try {
    const stored = await AsyncStorage.getItem(COUNSELING_SESSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading counseling sessions:', error);
  }
  return mockCounselingSessions;
}

/**
 * Get sessions for a specific counselor
 */
export async function getSessionsForCounselor(counselorId: string): Promise<CounselingSession[]> {
  try {
    const sessions = await getCounselingSessions();
    return sessions
      .filter(session => session.counselorId === counselorId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  } catch (error) {
    console.error('Error loading sessions for counselor:', error);
    return [];
  }
}

/**
 * Get sessions for a specific applicant
 */
export async function getSessionsForApplicant(applicantId: string): Promise<CounselingSession[]> {
  try {
    const sessions = await getCounselingSessions();
    return sessions
      .filter(session => session.applicantId === applicantId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  } catch (error) {
    console.error('Error loading sessions for applicant:', error);
    return [];
  }
}

/**
 * Add counseling session
 */
export async function addCounselingSession(session: Omit<CounselingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<CounselingSession> {
  const newSession: CounselingSession = {
    ...session,
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const sessions = await getCounselingSessions();
    const updatedSessions = [newSession, ...sessions];
    await AsyncStorage.setItem(COUNSELING_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error adding counseling session:', error);
  }

  return newSession;
}

/**
 * Update counseling session
 */
export async function updateCounselingSession(sessionId: string, updates: Partial<CounselingSession>): Promise<CounselingSession | null> {
  try {
    const sessions = await getCounselingSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);

    if (sessionIndex === -1) return null;

    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedSessions = sessions.map((session, index) =>
      index === sessionIndex ? updatedSession : session
    );

    await AsyncStorage.setItem(COUNSELING_SESSIONS_KEY, JSON.stringify(updatedSessions));
    return updatedSession;
  } catch (error) {
    console.error('Error updating counseling session:', error);
    return null;
  }
}

/**
 * Get matching profiles
 */
export async function getMatchingProfiles(): Promise<PetMatchingProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(MATCHING_PROFILES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading matching profiles:', error);
  }
  return mockMatchingProfiles;
}

/**
 * Create matching profile
 */
export async function createMatchingProfile(profile: Omit<PetMatchingProfile, 'id' | 'matchingAlgorithmScore' | 'recommendedPets' | 'createdAt' | 'updatedAt'>): Promise<PetMatchingProfile> {
  const newProfile: PetMatchingProfile = {
    ...profile,
    id: `profile-${Date.now()}`,
    matchingAlgorithmScore: 0,
    recommendedPets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const profiles = await getMatchingProfiles();
    const updatedProfiles = [newProfile, ...profiles];
    await AsyncStorage.setItem(MATCHING_PROFILES_KEY, JSON.stringify(updatedProfiles));
    
    // Generate pet recommendations
    await generatePetRecommendations(newProfile.id);
  } catch (error) {
    console.error('Error creating matching profile:', error);
  }

  return newProfile;
}

/**
 * Generate pet recommendations based on matching profile
 */
export async function generatePetRecommendations(profileId: string): Promise<void> {
  try {
    // This would typically integrate with the pet database and use a sophisticated matching algorithm
    // For now, we'll simulate the process
    
    const profiles = await getMatchingProfiles();
    const profileIndex = profiles.findIndex(p => p.id === profileId);
    
    if (profileIndex === -1) return;
    
    const profile = profiles[profileIndex];
    
    // Simulate matching algorithm with score calculation
    const algorithmScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
    
    // This would normally fetch from actual pet database and calculate real matches
    const sampleRecommendations: RecommendedPet[] = [
      {
        petId: 'pet-sample-1',
        petName: 'Recommended Pet',
        matchScore: algorithmScore,
        matchReasons: ['Size compatibility', 'Energy level match', 'Temperament alignment'],
        potentialConcerns: [],
        counselorNotes: 'Generated recommendation based on profile preferences',
        status: 'recommended',
      },
    ];
    
    const updatedProfile = {
      ...profile,
      matchingAlgorithmScore: algorithmScore,
      recommendedPets: sampleRecommendations,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProfiles = profiles.map((p, index) =>
      index === profileIndex ? updatedProfile : p
    );
    
    await AsyncStorage.setItem(MATCHING_PROFILES_KEY, JSON.stringify(updatedProfiles));
  } catch (error) {
    console.error('Error generating pet recommendations:', error);
  }
}

/**
 * Get counseling statistics
 */
export async function getCounselingStats() {
  try {
    const counselors = await getCounselors();
    const sessions = await getCounselingSessions();
    const profiles = await getMatchingProfiles();
    
    const totalCounselors = counselors.filter(c => c.isActive).length;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    
    const avgSessionRating = sessions.filter(s => s.satisfactionRating && s.status === 'completed').length > 0 ?
      Math.round((sessions.filter(s => s.satisfactionRating && s.status === 'completed')
        .reduce((sum, s) => sum + (s.satisfactionRating || 0), 0) / 
        sessions.filter(s => s.satisfactionRating && s.status === 'completed').length) * 10) / 10 : 0;

    const sessionsByType = sessions.reduce((acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeProfiles = profiles.filter(p => p.status === 'active').length;
    const matchedProfiles = profiles.filter(p => p.status === 'matched').length;
    
    const avgMatchingScore = profiles.filter(p => p.matchingAlgorithmScore).length > 0 ?
      Math.round(profiles.filter(p => p.matchingAlgorithmScore)
        .reduce((sum, p) => sum + (p.matchingAlgorithmScore || 0), 0) / 
        profiles.filter(p => p.matchingAlgorithmScore).length) : 0;

    const totalPlacements = counselors.reduce((sum, c) => sum + c.successfulPlacements, 0);
    const totalCounselingHours = counselors.reduce((sum, c) => sum + c.totalCounseling, 0);

    return {
      totalCounselors,
      totalSessions,
      completedSessions,
      avgSessionRating,
      sessionsByType,
      activeProfiles,
      matchedProfiles,
      avgMatchingScore,
      totalPlacements,
      totalCounselingHours,
    };
  } catch (error) {
    console.error('Error calculating counseling statistics:', error);
    return {
      totalCounselors: 0,
      totalSessions: 0,
      completedSessions: 0,
      avgSessionRating: 0,
      sessionsByType: {},
      activeProfiles: 0,
      matchedProfiles: 0,
      avgMatchingScore: 0,
      totalPlacements: 0,
      totalCounselingHours: 0,
    };
  }
}

/**
 * Search counseling sessions
 */
export async function searchCounselingSessions(criteria: {
  counselorId?: string;
  applicantId?: string;
  sessionType?: CounselingSession['sessionType'];
  dateRange?: { from: string; to: string };
  status?: CounselingSession['status'];
  query?: string;
}): Promise<CounselingSession[]> {
  try {
    const sessions = await getCounselingSessions();
    
    return sessions.filter(session => {
      if (criteria.counselorId && session.counselorId !== criteria.counselorId) return false;
      if (criteria.applicantId && session.applicantId !== criteria.applicantId) return false;
      if (criteria.sessionType && session.sessionType !== criteria.sessionType) return false;
      if (criteria.status && session.status !== criteria.status) return false;
      
      if (criteria.dateRange) {
        const sessionDate = new Date(session.sessionDate);
        const fromDate = new Date(criteria.dateRange.from);
        const toDate = new Date(criteria.dateRange.to);
        
        if (sessionDate < fromDate || sessionDate > toDate) return false;
      }
      
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        const searchableText = [
          session.applicantName,
          session.counselorName,
          session.petName,
          session.notes,
          ...session.agenda,
          ...session.recommendations,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching counseling sessions:', error);
    return [];
  }
}
