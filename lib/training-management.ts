import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrainingSession {
  id: string;
  petId: string;
  petName: string;
  trainerId?: string;
  trainerName?: string;
  sessionType: 'basic-obedience' | 'house-training' | 'behavioral' | 'agility' | 'socialization' | 'advanced' | 'therapy';
  sessionDate: string;
  duration: number; // in minutes
  location: 'shelter' | 'foster-home' | 'training-center' | 'outdoor' | 'virtual';
  objectives: string[];
  skillsWorkedOn: Skill[];
  progressNotes: string;
  behaviorObservations: BehaviorObservation[];
  challenges: string[];
  successes: string[];
  homeworkAssigned?: string;
  nextSessionPlanned?: string;
  rating: number; // 1-5 scale
  attachments: TrainingAttachment[];
  cost?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'basic' | 'intermediate' | 'advanced' | 'behavioral' | 'trick';
  description: string;
  currentLevel: 'not-started' | 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  practiceFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  lastPracticed?: string;
  masteryDate?: string;
  notes?: string;
}

export interface BehaviorObservation {
  id: string;
  behaviorType: 'positive' | 'concerning' | 'neutral';
  behavior: string;
  trigger?: string;
  intensity: 'low' | 'medium' | 'high';
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  context: string;
  interventionUsed?: string;
  outcome?: string;
  timestamp: string;
}

export interface TrainingAttachment {
  id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'document' | 'audio';
  fileUrl: string;
  description?: string;
  uploadDate: string;
}

export interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: string[];
  experience: number; // years
  rating: number;
  hourlyRate?: number;
  availability: {
    [key: string]: { start: string; end: string; }[];
  };
  bio: string;
  profileImage?: string;
  isActive: boolean;
}

export interface TrainingPlan {
  id: string;
  petId: string;
  petName: string;
  planName: string;
  description: string;
  startDate: string;
  endDate?: string;
  goals: TrainingGoal[];
  milestones: Milestone[];
  weeklySchedule: WeeklySchedule;
  estimatedDuration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cost?: number;
  assignedTrainer?: string;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface TrainingGoal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  skills: string[]; // skill IDs
  isCompleted: boolean;
  completedDate?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  week: number;
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
}

export interface WeeklySchedule {
  sessionsPerWeek: number;
  sessionDuration: number; // minutes
  preferredDays: string[];
  preferredTimes: string[];
}

const TRAINING_SESSIONS_KEY = 'petpal_training_sessions';
const TRAINERS_KEY = 'petpal_trainers';
const TRAINING_PLANS_KEY = 'petpal_training_plans';

// Mock training sessions data
const mockTrainingSessions: TrainingSession[] = [
  {
    id: 'training-1',
    petId: 'pet-1',
    petName: 'Max',
    trainerId: 'trainer-1',
    trainerName: 'Sarah Johnson',
    sessionType: 'basic-obedience',
    sessionDate: '2024-01-15T10:00:00Z',
    duration: 60,
    location: 'training-center',
    objectives: ['Improve sit command', 'Work on stay command', 'Practice recall'],
    skillsWorkedOn: [
      {
        id: 'skill-1',
        name: 'Sit Command',
        category: 'basic',
        description: 'Dog sits on command and stays seated until released',
        currentLevel: 'intermediate',
        targetLevel: 'advanced',
        practiceFrequency: 'daily',
        lastPracticed: '2024-01-14T00:00:00Z',
        notes: 'Responding well to verbal cues, working on hand signals',
      },
      {
        id: 'skill-2',
        name: 'Stay Command',
        category: 'basic',
        description: 'Dog maintains position until given release command',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        practiceFrequency: 'daily',
        lastPracticed: '2024-01-14T00:00:00Z',
        notes: 'Can hold stay for 10 seconds, working toward 30 seconds',
      },
    ],
    progressNotes: 'Max showed excellent focus today. Sit command is becoming more reliable. Stay command needs more work but showing improvement.',
    behaviorObservations: [
      {
        id: 'obs-1',
        behaviorType: 'positive',
        behavior: 'Maintained eye contact during training',
        intensity: 'high',
        frequency: 'frequent',
        context: 'During command training exercises',
        timestamp: '2024-01-15T10:15:00Z',
      },
      {
        id: 'obs-2',
        behaviorType: 'concerning',
        behavior: 'Easily distracted by other dogs',
        trigger: 'Other dogs barking nearby',
        intensity: 'medium',
        frequency: 'occasional',
        context: 'When working on stay command',
        interventionUsed: 'Moved to quieter area',
        outcome: 'Improved focus immediately',
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
    challenges: ['Distraction from other dogs', 'Breaking stay command early'],
    successes: ['Excellent sit command response', 'Good food motivation', 'Eager to please attitude'],
    homeworkAssigned: 'Practice sit and stay commands 5 minutes twice daily. Gradually increase stay duration.',
    nextSessionPlanned: '2024-01-22T10:00:00Z',
    rating: 4,
    attachments: [
      {
        id: 'att-train-1',
        fileName: 'max_training_video_20240115.mp4',
        fileType: 'video',
        fileUrl: '/training-files/max_training_video_20240115.mp4',
        description: 'Video of sit and stay command practice',
        uploadDate: '2024-01-15T11:00:00Z',
      },
    ],
    cost: 75,
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T11:15:00Z',
  },
  {
    id: 'training-2',
    petId: 'pet-2',
    petName: 'Luna',
    sessionType: 'socialization',
    sessionDate: '2024-01-18T14:00:00Z',
    duration: 45,
    location: 'shelter',
    objectives: ['Reduce fear of new people', 'Improve comfort with handling', 'Build confidence'],
    skillsWorkedOn: [
      {
        id: 'skill-3',
        name: 'Human Socialization',
        category: 'behavioral',
        description: 'Comfortable interaction with unfamiliar people',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        practiceFrequency: 'daily',
        lastPracticed: '2024-01-17T00:00:00Z',
        notes: 'Still fearful but showing slight improvement with patient approach',
      },
    ],
    progressNotes: 'Luna was very timid initially but warmed up after 20 minutes. She allowed gentle petting and even approached for treats.',
    behaviorObservations: [
      {
        id: 'obs-3',
        behaviorType: 'positive',
        behavior: 'Approached volunteer for treats',
        intensity: 'low',
        frequency: 'rare',
        context: 'After 20 minutes of patient waiting',
        timestamp: '2024-01-18T14:20:00Z',
      },
    ],
    challenges: ['Initial extreme shyness', 'Hiding behavior'],
    successes: ['Eventually accepted treats', 'Allowed brief petting', 'Tail wagging observed'],
    homeworkAssigned: 'Continue positive associations with new people through treats and patient interaction.',
    rating: 3,
    attachments: [],
    status: 'completed',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T15:00:00Z',
  },
];

// Mock trainers data
const mockTrainers: TrainerProfile[] = [
  {
    id: 'trainer-1',
    name: 'Sarah Johnson',
    email: 'sarah@pettraining.com',
    phone: '+1-555-TRAIN-1',
    specializations: ['Basic Obedience', 'Behavioral Issues', 'Puppy Training'],
    certifications: ['CCPDT-KA', 'Fear Free Certified', 'Puppy Start Right Instructor'],
    experience: 8,
    rating: 4.9,
    hourlyRate: 75,
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
      saturday: [{ start: '10:00', end: '14:00' }],
    },
    bio: 'Passionate dog trainer with 8 years of experience specializing in positive reinforcement techniques.',
    isActive: true,
  },
  {
    id: 'trainer-2',
    name: 'Mike Rodriguez',
    email: 'mike@advancedcanine.com',
    phone: '+1-555-TRAIN-2',
    specializations: ['Advanced Training', 'Agility', 'Service Dog Preparation'],
    certifications: ['NADOI Certified', 'AKC CGC Evaluator'],
    experience: 12,
    rating: 4.8,
    hourlyRate: 90,
    availability: {
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      saturday: [{ start: '08:00', end: '16:00' }],
      sunday: [{ start: '10:00', end: '14:00' }],
    },
    bio: 'Advanced trainer specializing in competition-level obedience and agility training.',
    isActive: true,
  },
];

// Mock training plans data
const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'plan-1',
    petId: 'pet-1',
    petName: 'Max',
    planName: 'Basic Obedience Foundation',
    description: 'Comprehensive 8-week program covering essential commands and manners',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-03-11T00:00:00Z',
    goals: [
      {
        id: 'goal-1',
        title: 'Master Basic Commands',
        description: 'Reliably respond to sit, stay, come, down, and heel commands',
        priority: 'high',
        targetDate: '2024-02-26T00:00:00Z',
        skills: ['skill-1', 'skill-2'],
        isCompleted: false,
      },
      {
        id: 'goal-2',
        title: 'Improve Leash Manners',
        description: 'Walk calmly on leash without pulling',
        priority: 'medium',
        targetDate: '2024-03-11T00:00:00Z',
        skills: [],
        isCompleted: false,
      },
    ],
    milestones: [
      {
        id: 'milestone-1',
        title: 'Basic Sit and Stay',
        description: 'Reliable sit command and 30-second stay',
        week: 2,
        isCompleted: false,
      },
      {
        id: 'milestone-2',
        title: 'Recall Training',
        description: 'Come when called in controlled environment',
        week: 4,
        isCompleted: false,
      },
    ],
    weeklySchedule: {
      sessionsPerWeek: 2,
      sessionDuration: 60,
      preferredDays: ['Monday', 'Thursday'],
      preferredTimes: ['10:00', '14:00'],
    },
    estimatedDuration: 8,
    difficulty: 'beginner',
    cost: 600,
    assignedTrainer: 'trainer-1',
    status: 'active',
    progress: 15,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T11:15:00Z',
  },
];

/**
 * Initialize training data
 */
export async function initializeTrainingData(): Promise<void> {
  try {
    const existingSessions = await AsyncStorage.getItem(TRAINING_SESSIONS_KEY);
    const existingTrainers = await AsyncStorage.getItem(TRAINERS_KEY);
    const existingPlans = await AsyncStorage.getItem(TRAINING_PLANS_KEY);
    
    if (!existingSessions) {
      await AsyncStorage.setItem(TRAINING_SESSIONS_KEY, JSON.stringify(mockTrainingSessions));
    }
    
    if (!existingTrainers) {
      await AsyncStorage.setItem(TRAINERS_KEY, JSON.stringify(mockTrainers));
    }
    
    if (!existingPlans) {
      await AsyncStorage.setItem(TRAINING_PLANS_KEY, JSON.stringify(mockTrainingPlans));
    }
    
    console.log('Training data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize training data:', error);
  }
}

/**
 * Get all training sessions
 */
export async function getTrainingSessions(): Promise<TrainingSession[]> {
  try {
    const stored = await AsyncStorage.getItem(TRAINING_SESSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading training sessions:', error);
  }
  return mockTrainingSessions;
}

/**
 * Get training sessions for a specific pet
 */
export async function getTrainingSessionsForPet(petId: string): Promise<TrainingSession[]> {
  try {
    const sessions = await getTrainingSessions();
    return sessions
      .filter(session => session.petId === petId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  } catch (error) {
    console.error('Error loading training sessions for pet:', error);
    return [];
  }
}

/**
 * Add new training session
 */
export async function addTrainingSession(session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingSession> {
  const newSession: TrainingSession = {
    ...session,
    id: `training-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const sessions = await getTrainingSessions();
    const updatedSessions = [newSession, ...sessions];
    await AsyncStorage.setItem(TRAINING_SESSIONS_KEY, JSON.stringify(updatedSessions));
    
    // Update training plan progress if applicable
    if (newSession.status === 'completed') {
      await updateTrainingPlanProgress(newSession.petId);
    }
  } catch (error) {
    console.error('Error adding training session:', error);
  }

  return newSession;
}

/**
 * Update training session
 */
export async function updateTrainingSession(sessionId: string, updates: Partial<TrainingSession>): Promise<TrainingSession | null> {
  try {
    const sessions = await getTrainingSessions();
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

    await AsyncStorage.setItem(TRAINING_SESSIONS_KEY, JSON.stringify(updatedSessions));
    return updatedSession;
  } catch (error) {
    console.error('Error updating training session:', error);
    return null;
  }
}

/**
 * Get trainers
 */
export async function getTrainers(): Promise<TrainerProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(TRAINERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading trainers:', error);
  }
  return mockTrainers;
}

/**
 * Get available trainers for a specific date and time
 */
export async function getAvailableTrainers(date: string, time: string): Promise<TrainerProfile[]> {
  try {
    const trainers = await getTrainers();
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return trainers.filter(trainer => {
      if (!trainer.isActive) return false;
      
      const dayAvailability = trainer.availability[dayName];
      if (!dayAvailability) return false;
      
      return dayAvailability.some(slot => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        return time >= slotStart && time <= slotEnd;
      });
    });
  } catch (error) {
    console.error('Error finding available trainers:', error);
    return [];
  }
}

/**
 * Get training plans
 */
export async function getTrainingPlans(): Promise<TrainingPlan[]> {
  try {
    const stored = await AsyncStorage.getItem(TRAINING_PLANS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading training plans:', error);
  }
  return mockTrainingPlans;
}

/**
 * Get training plan for a specific pet
 */
export async function getTrainingPlanForPet(petId: string): Promise<TrainingPlan | undefined> {
  try {
    const plans = await getTrainingPlans();
    return plans.find(plan => plan.petId === petId && plan.status === 'active');
  } catch (error) {
    console.error('Error loading training plan for pet:', error);
    return undefined;
  }
}

/**
 * Create training plan
 */
export async function createTrainingPlan(plan: Omit<TrainingPlan, 'id' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<TrainingPlan> {
  const newPlan: TrainingPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const plans = await getTrainingPlans();
    const updatedPlans = [newPlan, ...plans];
    await AsyncStorage.setItem(TRAINING_PLANS_KEY, JSON.stringify(updatedPlans));
  } catch (error) {
    console.error('Error creating training plan:', error);
  }

  return newPlan;
}

/**
 * Update training plan progress
 */
export async function updateTrainingPlanProgress(petId: string): Promise<void> {
  try {
    const plan = await getTrainingPlanForPet(petId);
    if (!plan) return;

    const completedMilestones = plan.milestones.filter(milestone => milestone.isCompleted).length;
    const totalMilestones = plan.milestones.length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const plans = await getTrainingPlans();
    const planIndex = plans.findIndex(p => p.id === plan.id);
    
    if (planIndex !== -1) {
      const updatedPlan = {
        ...plans[planIndex],
        progress,
        updatedAt: new Date().toISOString(),
      };

      const updatedPlans = plans.map((p, index) =>
        index === planIndex ? updatedPlan : p
      );

      await AsyncStorage.setItem(TRAINING_PLANS_KEY, JSON.stringify(updatedPlans));
    }
  } catch (error) {
    console.error('Error updating training plan progress:', error);
  }
}

/**
 * Complete milestone
 */
export async function completeMilestone(planId: string, milestoneId: string): Promise<boolean> {
  try {
    const plans = await getTrainingPlans();
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex === -1) return false;

    const plan = plans[planIndex];
    const milestoneIndex = plan.milestones.findIndex(milestone => milestone.id === milestoneId);
    
    if (milestoneIndex === -1) return false;

    const updatedMilestone = {
      ...plan.milestones[milestoneIndex],
      isCompleted: true,
      completedDate: new Date().toISOString(),
    };

    const updatedMilestones = plan.milestones.map((milestone, index) =>
      index === milestoneIndex ? updatedMilestone : milestone
    );

    const updatedPlan = {
      ...plan,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    };

    const updatedPlans = plans.map((p, index) =>
      index === planIndex ? updatedPlan : p
    );

    await AsyncStorage.setItem(TRAINING_PLANS_KEY, JSON.stringify(updatedPlans));
    
    // Update progress
    await updateTrainingPlanProgress(plan.petId);
    
    return true;
  } catch (error) {
    console.error('Error completing milestone:', error);
    return false;
  }
}

/**
 * Get training statistics
 */
export async function getTrainingStats() {
  try {
    const sessions = await getTrainingSessions();
    const plans = await getTrainingPlans();
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(session => session.status === 'completed').length;
    const avgSessionRating = sessions.filter(s => s.rating && s.status === 'completed').length > 0 ?
      Math.round((sessions.filter(s => s.rating && s.status === 'completed')
        .reduce((sum, s) => sum + s.rating, 0) / 
        sessions.filter(s => s.rating && s.status === 'completed').length) * 10) / 10 : 0;

    const sessionsByType = sessions.reduce((acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activePlans = plans.filter(plan => plan.status === 'active').length;
    const completedPlans = plans.filter(plan => plan.status === 'completed').length;
    
    const avgPlanProgress = plans.filter(plan => plan.status === 'active').length > 0 ?
      Math.round(plans.filter(plan => plan.status === 'active')
        .reduce((sum, plan) => sum + plan.progress, 0) / 
        plans.filter(plan => plan.status === 'active').length) : 0;

    const totalTrainingCost = sessions.filter(s => s.cost).reduce((sum, s) => sum + (s.cost || 0), 0);

    return {
      totalSessions,
      completedSessions,
      avgSessionRating,
      sessionsByType,
      activePlans,
      completedPlans,
      avgPlanProgress,
      totalTrainingCost: Math.round(totalTrainingCost * 100) / 100,
    };
  } catch (error) {
    console.error('Error calculating training statistics:', error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      avgSessionRating: 0,
      sessionsByType: {},
      activePlans: 0,
      completedPlans: 0,
      avgPlanProgress: 0,
      totalTrainingCost: 0,
    };
  }
}

/**
 * Search training sessions
 */
export async function searchTrainingSessions(criteria: {
  petId?: string;
  trainerId?: string;
  sessionType?: TrainingSession['sessionType'];
  dateRange?: { from: string; to: string };
  status?: TrainingSession['status'];
  query?: string;
}): Promise<TrainingSession[]> {
  try {
    const sessions = await getTrainingSessions();
    
    return sessions.filter(session => {
      if (criteria.petId && session.petId !== criteria.petId) return false;
      if (criteria.trainerId && session.trainerId !== criteria.trainerId) return false;
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
          session.petName,
          session.trainerName,
          session.progressNotes,
          ...session.objectives,
          ...session.challenges,
          ...session.successes,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching training sessions:', error);
    return [];
  }
}
