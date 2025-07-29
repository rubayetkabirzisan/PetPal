import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  timeSlots: string[]; // e.g., ['morning', 'afternoon', 'evening']
  skills: string[];
  interests: string[];
  experience: string;
  backgroundCheckStatus: 'pending' | 'approved' | 'denied' | 'expired';
  backgroundCheckDate?: string;
  trainingCompleted: string[]; // Training modules completed
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  startDate: string;
  totalHours: number;
  lastActiveDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerShift {
  id: string;
  volunteerId: string;
  volunteerName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  activity: string;
  location: string;
  supervisorName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  checkInTime?: string;
  checkOutTime?: string;
  actualDuration?: number;
  notes?: string;
  feedback?: string;
  rating?: number; // 1-5 stars
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerActivity {
  id: string;
  name: string;
  description: string;
  category: 'animal-care' | 'administrative' | 'maintenance' | 'events' | 'education' | 'transport';
  requiredSkills: string[];
  trainingRequired: string[];
  minimumAge: number;
  maxVolunteersPerShift: number;
  isActive: boolean;
  createdAt: string;
}

const VOLUNTEERS_KEY = 'petpal_volunteers';
const VOLUNTEER_SHIFTS_KEY = 'petpal_volunteer_shifts';
const VOLUNTEER_ACTIVITIES_KEY = 'petpal_volunteer_activities';

// Mock volunteers data
const mockVolunteers: Volunteer[] = [
  {
    id: 'vol-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phoneNumber: '+1-555-123-4567',
    address: '123 Volunteer St, New York, NY 10001',
    dateOfBirth: '1990-05-15T00:00:00Z',
    emergencyContactName: 'Mike Johnson',
    emergencyContactPhone: '+1-555-123-4568',
    availability: {
      monday: false,
      tuesday: true,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: false,
    },
    timeSlots: ['morning', 'afternoon'],
    skills: ['animal handling', 'customer service', 'basic medical care'],
    interests: ['dog walking', 'puppy socialization', 'adoption events'],
    experience: '2 years of experience with animal rescue organizations',
    backgroundCheckStatus: 'approved',
    backgroundCheckDate: '2024-01-10T00:00:00Z',
    trainingCompleted: ['basic-animal-care', 'safety-protocols', 'customer-service'],
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    totalHours: 156,
    lastActiveDate: '2024-01-25T00:00:00Z',
    notes: 'Excellent with large dogs, great with adopters',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z',
  },
  {
    id: 'vol-2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phoneNumber: '+1-555-234-5678',
    dateOfBirth: '1985-08-22T00:00:00Z',
    emergencyContactName: 'Lisa Chen',
    emergencyContactPhone: '+1-555-234-5679',
    availability: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: true,
      friday: false,
      saturday: true,
      sunday: true,
    },
    timeSlots: ['evening', 'weekend'],
    skills: ['event planning', 'photography', 'social media'],
    interests: ['fundraising events', 'social media management', 'photography'],
    experience: 'Professional event coordinator, new to animal rescue',
    backgroundCheckStatus: 'approved',
    backgroundCheckDate: '2024-01-12T00:00:00Z',
    trainingCompleted: ['basic-animal-care', 'event-management'],
    status: 'active',
    startDate: '2024-01-18T00:00:00Z',
    totalHours: 72,
    lastActiveDate: '2024-01-24T00:00:00Z',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-24T18:45:00Z',
  },
  {
    id: 'vol-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phoneNumber: '+1-555-345-6789',
    dateOfBirth: '1992-03-10T00:00:00Z',
    emergencyContactName: 'Carlos Rodriguez',
    emergencyContactPhone: '+1-555-345-6780',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    timeSlots: ['morning'],
    skills: ['veterinary assistance', 'medical care', 'cat behavior'],
    interests: ['medical care', 'cat socialization', 'special needs animals'],
    experience: 'Veterinary technician student, 1 year volunteering',
    backgroundCheckStatus: 'approved',
    backgroundCheckDate: '2024-01-08T00:00:00Z',
    trainingCompleted: ['basic-animal-care', 'medical-assistance', 'cat-behavior'],
    status: 'active',
    startDate: '2024-01-12T00:00:00Z',
    totalHours: 124,
    lastActiveDate: '2024-01-25T00:00:00Z',
    notes: 'Great with cats, especially fearful or medical needs',
    createdAt: '2024-01-08T16:30:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
  },
];

// Mock shifts data
const mockShifts: VolunteerShift[] = [
  {
    id: 'shift-1',
    volunteerId: 'vol-1',
    volunteerName: 'Sarah Johnson',
    date: '2024-01-26T00:00:00Z',
    startTime: '09:00',
    endTime: '13:00',
    duration: 240,
    activity: 'Dog Walking and Exercise',
    location: 'Main Shelter - Dog Yard',
    supervisorName: 'Jessica Williams',
    status: 'scheduled',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'shift-2',
    volunteerId: 'vol-2',
    volunteerName: 'Michael Chen',
    date: '2024-01-25T00:00:00Z',
    startTime: '18:00',
    endTime: '21:00',
    duration: 180,
    activity: 'Adoption Event Photography',
    location: 'Community Center',
    status: 'completed',
    checkInTime: '18:05',
    checkOutTime: '21:10',
    actualDuration: 185,
    feedback: 'Great photos taken, very professional approach',
    rating: 5,
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-25T21:15:00Z',
  },
  {
    id: 'shift-3',
    volunteerId: 'vol-3',
    volunteerName: 'Emily Rodriguez',
    date: '2024-01-24T00:00:00Z',
    startTime: '08:00',
    endTime: '12:00',
    duration: 240,
    activity: 'Medical Care Assistance',
    location: 'Veterinary Clinic',
    supervisorName: 'Dr. Sarah Wilson',
    status: 'completed',
    checkInTime: '07:55',
    checkOutTime: '12:05',
    actualDuration: 250,
    notes: 'Assisted with 3 spay/neuter procedures',
    feedback: 'Excellent technical skills and animal handling',
    rating: 5,
    createdAt: '2024-01-21T09:30:00Z',
    updatedAt: '2024-01-24T12:10:00Z',
  },
];

// Mock activities data
const mockActivities: VolunteerActivity[] = [
  {
    id: 'activity-1',
    name: 'Dog Walking and Exercise',
    description: 'Take dogs for walks, provide exercise and outdoor time',
    category: 'animal-care',
    requiredSkills: ['animal handling', 'physical fitness'],
    trainingRequired: ['basic-animal-care', 'safety-protocols'],
    minimumAge: 16,
    maxVolunteersPerShift: 4,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'activity-2',
    name: 'Cat Socialization',
    description: 'Spend time with cats to improve social skills and adoptability',
    category: 'animal-care',
    requiredSkills: ['cat behavior knowledge', 'patience'],
    trainingRequired: ['basic-animal-care', 'cat-behavior'],
    minimumAge: 14,
    maxVolunteersPerShift: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'activity-3',
    name: 'Adoption Event Support',
    description: 'Assist with adoption events, help potential adopters',
    category: 'events',
    requiredSkills: ['customer service', 'communication'],
    trainingRequired: ['customer-service', 'adoption-process'],
    minimumAge: 18,
    maxVolunteersPerShift: 6,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Initialize volunteer data
 */
export async function initializeVolunteerData(): Promise<void> {
  try {
    const existingVolunteers = await AsyncStorage.getItem(VOLUNTEERS_KEY);
    const existingShifts = await AsyncStorage.getItem(VOLUNTEER_SHIFTS_KEY);
    const existingActivities = await AsyncStorage.getItem(VOLUNTEER_ACTIVITIES_KEY);
    
    if (!existingVolunteers) {
      await AsyncStorage.setItem(VOLUNTEERS_KEY, JSON.stringify(mockVolunteers));
    }
    
    if (!existingShifts) {
      await AsyncStorage.setItem(VOLUNTEER_SHIFTS_KEY, JSON.stringify(mockShifts));
    }
    
    if (!existingActivities) {
      await AsyncStorage.setItem(VOLUNTEER_ACTIVITIES_KEY, JSON.stringify(mockActivities));
    }
    
    console.log('Volunteer data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize volunteer data:', error);
  }
}

/**
 * Get all volunteers
 */
export async function getVolunteers(): Promise<Volunteer[]> {
  try {
    const stored = await AsyncStorage.getItem(VOLUNTEERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading volunteers:', error);
  }
  return mockVolunteers;
}

/**
 * Get volunteer by ID
 */
export async function getVolunteerById(id: string): Promise<Volunteer | undefined> {
  try {
    const volunteers = await getVolunteers();
    return volunteers.find(volunteer => volunteer.id === id);
  } catch (error) {
    console.error('Error finding volunteer:', error);
    return undefined;
  }
}

/**
 * Add new volunteer
 */
export async function addVolunteer(volunteerData: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt' | 'totalHours' | 'lastActiveDate'>): Promise<Volunteer> {
  const newVolunteer: Volunteer = {
    id: `vol-${Date.now()}`,
    ...volunteerData,
    totalHours: 0,
    lastActiveDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const volunteers = await getVolunteers();
    const updatedVolunteers = [newVolunteer, ...volunteers];
    await AsyncStorage.setItem(VOLUNTEERS_KEY, JSON.stringify(updatedVolunteers));
  } catch (error) {
    console.error('Error adding volunteer:', error);
  }

  return newVolunteer;
}

/**
 * Update volunteer
 */
export async function updateVolunteer(
  id: string,
  updates: Partial<Omit<Volunteer, 'id' | 'createdAt'>>
): Promise<Volunteer | null> {
  try {
    const volunteers = await getVolunteers();
    const volunteerIndex = volunteers.findIndex(volunteer => volunteer.id === id);

    if (volunteerIndex === -1) return null;

    const updatedVolunteer = {
      ...volunteers[volunteerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedVolunteers = volunteers.map((volunteer, index) =>
      index === volunteerIndex ? updatedVolunteer : volunteer
    );

    await AsyncStorage.setItem(VOLUNTEERS_KEY, JSON.stringify(updatedVolunteers));
    return updatedVolunteer;
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return null;
  }
}

/**
 * Get volunteer shifts
 */
export async function getVolunteerShifts(): Promise<VolunteerShift[]> {
  try {
    const stored = await AsyncStorage.getItem(VOLUNTEER_SHIFTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading volunteer shifts:', error);
  }
  return mockShifts;
}

/**
 * Get shifts for specific volunteer
 */
export async function getShiftsForVolunteer(volunteerId: string): Promise<VolunteerShift[]> {
  try {
    const shifts = await getVolunteerShifts();
    return shifts.filter(shift => shift.volunteerId === volunteerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading volunteer shifts:', error);
    return [];
  }
}

/**
 * Schedule new shift
 */
export async function scheduleShift(shiftData: Omit<VolunteerShift, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<VolunteerShift> {
  const newShift: VolunteerShift = {
    id: `shift-${Date.now()}`,
    ...shiftData,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const shifts = await getVolunteerShifts();
    const updatedShifts = [newShift, ...shifts];
    await AsyncStorage.setItem(VOLUNTEER_SHIFTS_KEY, JSON.stringify(updatedShifts));
  } catch (error) {
    console.error('Error scheduling shift:', error);
  }

  return newShift;
}

/**
 * Check in volunteer for shift
 */
export async function checkInVolunteer(shiftId: string): Promise<VolunteerShift | null> {
  try {
    const shifts = await getVolunteerShifts();
    const shiftIndex = shifts.findIndex(shift => shift.id === shiftId);

    if (shiftIndex === -1) return null;

    const updatedShift = {
      ...shifts[shiftIndex],
      status: 'in-progress' as const,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
    };

    const updatedShifts = shifts.map((shift, index) =>
      index === shiftIndex ? updatedShift : shift
    );

    await AsyncStorage.setItem(VOLUNTEER_SHIFTS_KEY, JSON.stringify(updatedShifts));
    return updatedShift;
  } catch (error) {
    console.error('Error checking in volunteer:', error);
    return null;
  }
}

/**
 * Check out volunteer from shift
 */
export async function checkOutVolunteer(shiftId: string, feedback?: string, rating?: number): Promise<VolunteerShift | null> {
  try {
    const shifts = await getVolunteerShifts();
    const shiftIndex = shifts.findIndex(shift => shift.id === shiftId);

    if (shiftIndex === -1) return null;

    const shift = shifts[shiftIndex];
    const checkOutTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Calculate actual duration if check-in time exists
    let actualDuration = shift.duration;
    if (shift.checkInTime) {
      const checkInDate = new Date(`2024-01-01 ${shift.checkInTime}`);
      const checkOutDate = new Date(`2024-01-01 ${checkOutTime}`);
      actualDuration = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60));
    }

    const updatedShift = {
      ...shift,
      status: 'completed' as const,
      checkOutTime,
      actualDuration,
      feedback,
      rating,
      updatedAt: new Date().toISOString(),
    };

    const updatedShifts = shifts.map((s, index) =>
      index === shiftIndex ? updatedShift : s
    );

    await AsyncStorage.setItem(VOLUNTEER_SHIFTS_KEY, JSON.stringify(updatedShifts));

    // Update volunteer total hours
    if (actualDuration) {
      const volunteer = await getVolunteerById(shift.volunteerId);
      if (volunteer) {
        await updateVolunteer(shift.volunteerId, {
          totalHours: volunteer.totalHours + Math.round(actualDuration / 60 * 10) / 10,
          lastActiveDate: new Date().toISOString(),
        });
      }
    }

    return updatedShift;
  } catch (error) {
    console.error('Error checking out volunteer:', error);
    return null;
  }
}

/**
 * Get volunteer activities
 */
export async function getVolunteerActivities(): Promise<VolunteerActivity[]> {
  try {
    const stored = await AsyncStorage.getItem(VOLUNTEER_ACTIVITIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading volunteer activities:', error);
  }
  return mockActivities;
}

/**
 * Get volunteer statistics
 */
export async function getVolunteerStats() {
  try {
    const volunteers = await getVolunteers();
    const shifts = await getVolunteerShifts();
    
    const total = volunteers.length;
    const active = volunteers.filter(v => v.status === 'active').length;
    const pending = volunteers.filter(v => v.status === 'pending').length;
    
    const totalHours = volunteers.reduce((sum, volunteer) => sum + volunteer.totalHours, 0);
    const averageHours = total > 0 ? Math.round(totalHours / total * 10) / 10 : 0;
    
    const completedShifts = shifts.filter(shift => shift.status === 'completed').length;
    const upcomingShifts = shifts.filter(shift => 
      shift.status === 'scheduled' && new Date(shift.date) > new Date()
    ).length;

    const byStatus = volunteers.reduce((acc: Record<string, number>, volunteer) => {
      acc[volunteer.status] = (acc[volunteer.status] || 0) + 1;
      return acc;
    }, {});

    const retentionRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      active,
      pending,
      totalHours: Math.round(totalHours * 10) / 10,
      averageHours,
      completedShifts,
      upcomingShifts,
      byStatus,
      retentionRate,
    };
  } catch (error) {
    console.error('Error calculating volunteer statistics:', error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      totalHours: 0,
      averageHours: 0,
      completedShifts: 0,
      upcomingShifts: 0,
      byStatus: {},
      retentionRate: 0,
    };
  }
}

/**
 * Search volunteers
 */
export async function searchVolunteers(query: string): Promise<Volunteer[]> {
  try {
    const volunteers = await getVolunteers();
    const searchTerm = query.toLowerCase();
    
    return volunteers.filter(volunteer =>
      volunteer.firstName.toLowerCase().includes(searchTerm) ||
      volunteer.lastName.toLowerCase().includes(searchTerm) ||
      volunteer.email.toLowerCase().includes(searchTerm) ||
      volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      volunteer.interests.some(interest => interest.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching volunteers:', error);
    return [];
  }
}
