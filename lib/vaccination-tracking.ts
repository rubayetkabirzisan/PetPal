import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  vaccineType: 'core' | 'non-core' | 'lifestyle';
  administeredDate: string;
  expiryDate: string;
  veterinarianName: string;
  clinicName: string;
  batchNumber?: string;
  nextDueDate?: string;
  sideEffects?: string;
  notes?: string;
  certificateUrl?: string;
  isOverdue: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationSchedule {
  id: string;
  petId: string;
  vaccineName: string;
  scheduledDate: string;
  isCompleted: boolean;
  isOptional: boolean;
  ageRequirement?: string;
  notes?: string;
  createdAt: string;
}

const VACCINATIONS_KEY = 'petpal_vaccinations';
const VACCINATION_SCHEDULES_KEY = 'petpal_vaccination_schedules';

// Mock vaccination data
const mockVaccinations: Vaccination[] = [
  {
    id: 'vacc-1',
    petId: 'pet-1',
    vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
    vaccineType: 'core',
    administeredDate: '2024-01-15T10:00:00Z',
    expiryDate: '2025-01-15T10:00:00Z',
    veterinarianName: 'Dr. Sarah Wilson',
    clinicName: 'City Animal Hospital',
    batchNumber: 'DHPP-2024-001',
    nextDueDate: '2025-01-15T10:00:00Z',
    notes: 'First annual booster, no adverse reactions',
    isOverdue: false,
    reminderSent: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'vacc-2',
    petId: 'pet-1',
    vaccineName: 'Rabies',
    vaccineType: 'core',
    administeredDate: '2024-01-15T10:15:00Z',
    expiryDate: '2027-01-15T10:15:00Z',
    veterinarianName: 'Dr. Sarah Wilson',
    clinicName: 'City Animal Hospital',
    batchNumber: 'RAB-2024-045',
    nextDueDate: '2027-01-15T10:15:00Z',
    notes: '3-year rabies vaccine, state required',
    isOverdue: false,
    reminderSent: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'vacc-3',
    petId: 'pet-2',
    vaccineName: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
    vaccineType: 'core',
    administeredDate: '2023-12-20T14:00:00Z',
    expiryDate: '2024-12-20T14:00:00Z',
    veterinarianName: 'Dr. Michael Chen',
    clinicName: 'Feline Health Center',
    batchNumber: 'FVRCP-2023-089',
    nextDueDate: '2024-12-20T14:00:00Z',
    notes: 'Indoor cat, reduced schedule',
    isOverdue: true,
    reminderSent: true,
    createdAt: '2023-12-20T14:30:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
];

// Mock vaccination schedules
const mockVaccinationSchedules: VaccinationSchedule[] = [
  {
    id: 'schedule-1',
    petId: 'pet-3',
    vaccineName: 'DHPP First Shot',
    scheduledDate: '2024-02-01T09:00:00Z',
    isCompleted: false,
    isOptional: false,
    ageRequirement: '6-8 weeks',
    notes: 'First puppy vaccination',
    createdAt: '2024-01-25T08:00:00Z',
  },
  {
    id: 'schedule-2',
    petId: 'pet-3',
    vaccineName: 'Bordetella',
    scheduledDate: '2024-02-15T10:00:00Z',
    isCompleted: false,
    isOptional: true,
    ageRequirement: '12 weeks',
    notes: 'Kennel cough prevention, recommended for social dogs',
    createdAt: '2024-01-25T08:00:00Z',
  },
];

/**
 * Initialize vaccination data
 */
export async function initializeVaccinationData(): Promise<void> {
  try {
    const existingVaccinations = await AsyncStorage.getItem(VACCINATIONS_KEY);
    const existingSchedules = await AsyncStorage.getItem(VACCINATION_SCHEDULES_KEY);
    
    if (!existingVaccinations) {
      await AsyncStorage.setItem(VACCINATIONS_KEY, JSON.stringify(mockVaccinations));
    }
    
    if (!existingSchedules) {
      await AsyncStorage.setItem(VACCINATION_SCHEDULES_KEY, JSON.stringify(mockVaccinationSchedules));
    }
    
    console.log('Vaccination data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize vaccination data:', error);
  }
}

/**
 * Get all vaccinations
 */
export async function getVaccinations(): Promise<Vaccination[]> {
  try {
    const stored = await AsyncStorage.getItem(VACCINATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading vaccinations:', error);
  }
  return mockVaccinations;
}

/**
 * Get vaccinations for a specific pet
 */
export async function getVaccinationsForPet(petId: string): Promise<Vaccination[]> {
  try {
    const vaccinations = await getVaccinations();
    return vaccinations.filter(vacc => vacc.petId === petId);
  } catch (error) {
    console.error('Error loading pet vaccinations:', error);
    return [];
  }
}

/**
 * Add new vaccination record
 */
export async function addVaccination(vaccinationData: Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vaccination> {
  const newVaccination: Vaccination = {
    id: `vacc-${Date.now()}`,
    ...vaccinationData,
    isOverdue: new Date(vaccinationData.expiryDate) < new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const vaccinations = await getVaccinations();
    const updatedVaccinations = [newVaccination, ...vaccinations];
    await AsyncStorage.setItem(VACCINATIONS_KEY, JSON.stringify(updatedVaccinations));
  } catch (error) {
    console.error('Error adding vaccination:', error);
  }

  return newVaccination;
}

/**
 * Update vaccination record
 */
export async function updateVaccination(
  id: string,
  updates: Partial<Omit<Vaccination, 'id' | 'createdAt'>>
): Promise<Vaccination | null> {
  try {
    const vaccinations = await getVaccinations();
    const vaccinationIndex = vaccinations.findIndex(vacc => vacc.id === id);

    if (vaccinationIndex === -1) return null;

    const updatedVaccination = {
      ...vaccinations[vaccinationIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedVaccinations = vaccinations.map((vacc, index) =>
      index === vaccinationIndex ? updatedVaccination : vacc
    );

    await AsyncStorage.setItem(VACCINATIONS_KEY, JSON.stringify(updatedVaccinations));
    return updatedVaccination;
  } catch (error) {
    console.error('Error updating vaccination:', error);
    return null;
  }
}

/**
 * Get overdue vaccinations
 */
export async function getOverdueVaccinations(): Promise<Vaccination[]> {
  try {
    const vaccinations = await getVaccinations();
    const now = new Date();
    return vaccinations.filter(vacc => new Date(vacc.expiryDate) < now);
  } catch (error) {
    console.error('Error loading overdue vaccinations:', error);
    return [];
  }
}

/**
 * Get upcoming vaccinations (due within next 30 days)
 */
export async function getUpcomingVaccinations(): Promise<Vaccination[]> {
  try {
    const vaccinations = await getVaccinations();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return vaccinations.filter(vacc => {
      const expiryDate = new Date(vacc.expiryDate);
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    });
  } catch (error) {
    console.error('Error loading upcoming vaccinations:', error);
    return [];
  }
}

/**
 * Get vaccination schedules
 */
export async function getVaccinationSchedules(): Promise<VaccinationSchedule[]> {
  try {
    const stored = await AsyncStorage.getItem(VACCINATION_SCHEDULES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading vaccination schedules:', error);
  }
  return mockVaccinationSchedules;
}

/**
 * Get vaccination statistics
 */
export async function getVaccinationStats() {
  try {
    const vaccinations = await getVaccinations();
    const overdue = await getOverdueVaccinations();
    const upcoming = await getUpcomingVaccinations();
    
    const byType = vaccinations.reduce((acc: Record<string, number>, vacc) => {
      acc[vacc.vaccineType] = (acc[vacc.vaccineType] || 0) + 1;
      return acc;
    }, {});

    return {
      total: vaccinations.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      current: vaccinations.length - overdue.length,
      byType,
      complianceRate: vaccinations.length > 0 ? 
        Math.round(((vaccinations.length - overdue.length) / vaccinations.length) * 100) : 0,
    };
  } catch (error) {
    console.error('Error calculating vaccination statistics:', error);
    return {
      total: 0,
      overdue: 0,
      upcoming: 0,
      current: 0,
      byType: {},
      complianceRate: 0,
    };
  }
}

/**
 * Mark vaccination reminder as sent
 */
export async function markReminderSent(vaccinationId: string): Promise<boolean> {
  try {
    const result = await updateVaccination(vaccinationId, { reminderSent: true });
    return result !== null;
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    return false;
  }
}
