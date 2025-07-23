import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthRecord {
  id: string
  petId: string
  recordType: "vaccination" | "checkup" | "treatment" | "medication" | "emergency"
  title: string
  description: string
  date: string
  veterinarianName: string
  cost?: number
  nextAppointment?: string
  attachments?: string[]
  status: "completed" | "scheduled" | "ongoing"
}

export interface PetHealthProfile {
  petId: string
  petName: string
  species: string
  breed: string
  age: number
  weight: number
  allergies: string[]
  medications: string[]
  lastCheckup: string
  nextVaccination?: string
  healthStatus: "excellent" | "good" | "fair" | "poor"
  specialNeeds: string[]
}

export interface VaccinationSchedule {
  id: string
  petId: string
  vaccineName: string
  dueDate: string
  completed: boolean
  veterinarianId?: string
  notes?: string
}

// Storage keys
const HEALTH_RECORDS_STORAGE_KEY = "petpal_health_records"
const HEALTH_PROFILES_STORAGE_KEY = "petpal_health_profiles"
const VACCINATION_SCHEDULE_STORAGE_KEY = "petpal_vaccination_schedule"

// Default health profiles for demo
const defaultHealthProfiles: PetHealthProfile[] = [
  {
    petId: "1",
    petName: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 28.5,
    allergies: ["chicken", "dairy"],
    medications: ["heartworm prevention"],
    lastCheckup: "2024-06-15",
    nextVaccination: "2024-08-15",
    healthStatus: "good",
    specialNeeds: ["regular exercise", "grain-free diet"]
  },
  {
    petId: "2",
    petName: "Whiskers",
    species: "Cat",
    breed: "Persian",
    age: 5,
    weight: 4.2,
    allergies: [],
    medications: ["flea prevention"],
    lastCheckup: "2024-07-01",
    nextVaccination: "2024-09-01",
    healthStatus: "excellent",
    specialNeeds: ["daily grooming"]
  }
]

// Default health records for demo
const defaultHealthRecords: HealthRecord[] = [
  {
    id: "health-1",
    petId: "1",
    recordType: "vaccination",
    title: "Annual Vaccination",
    description: "Complete vaccination package including rabies, DHPP",
    date: "2024-06-15",
    veterinarianName: "Dr. Sarah Wilson",
    cost: 150,
    nextAppointment: "2024-08-15",
    status: "completed"
  },
  {
    id: "health-2",
    petId: "1",
    recordType: "checkup",
    title: "Routine Health Checkup",
    description: "General health examination, weight check, dental inspection",
    date: "2024-06-15",
    veterinarianName: "Dr. Sarah Wilson",
    cost: 75,
    status: "completed"
  },
  {
    id: "health-3",
    petId: "2",
    recordType: "treatment",
    title: "Dental Cleaning",
    description: "Professional dental cleaning and polishing",
    date: "2024-07-01",
    veterinarianName: "Dr. Michael Chen",
    cost: 200,
    status: "completed"
  }
]

// Default vaccination schedule
const defaultVaccinationSchedule: VaccinationSchedule[] = [
  {
    id: "vacc-1",
    petId: "1",
    vaccineName: "Rabies Booster",
    dueDate: "2024-08-15",
    completed: false,
    notes: "Annual booster required"
  },
  {
    id: "vacc-2",
    petId: "2",
    vaccineName: "FVRCP",
    dueDate: "2024-09-01",
    completed: false,
    notes: "Feline viral rhinotracheitis, calicivirus, and panleukopenia"
  }
]

/**
 * Get health profiles for all pets
 */
export async function getHealthProfiles(): Promise<PetHealthProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_PROFILES_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(HEALTH_PROFILES_STORAGE_KEY, JSON.stringify(defaultHealthProfiles))
      return defaultHealthProfiles
    }
  } catch (error) {
    console.error("Error loading health profiles:", error)
    return defaultHealthProfiles
  }
}

/**
 * Get health profile for a specific pet
 */
export async function getPetHealthProfile(petId: string): Promise<PetHealthProfile | null> {
  try {
    const profiles = await getHealthProfiles()
    return profiles.find(profile => profile.petId === petId) || null
  } catch (error) {
    console.error("Error loading pet health profile:", error)
    return null
  }
}

/**
 * Update pet health profile
 */
export async function updatePetHealthProfile(petId: string, updates: Partial<PetHealthProfile>): Promise<boolean> {
  try {
    const profiles = await getHealthProfiles()
    const profileIndex = profiles.findIndex(profile => profile.petId === petId)
    
    if (profileIndex >= 0) {
      profiles[profileIndex] = { ...profiles[profileIndex], ...updates }
      await AsyncStorage.setItem(HEALTH_PROFILES_STORAGE_KEY, JSON.stringify(profiles))
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating pet health profile:", error)
    return false
  }
}

/**
 * Get health records for a specific pet
 */
export async function getPetHealthRecords(petId: string): Promise<HealthRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_RECORDS_STORAGE_KEY)
    if (stored) {
      const records = JSON.parse(stored)
      return records.filter((record: HealthRecord) => record.petId === petId)
    } else {
      await AsyncStorage.setItem(HEALTH_RECORDS_STORAGE_KEY, JSON.stringify(defaultHealthRecords))
      return defaultHealthRecords.filter(record => record.petId === petId)
    }
  } catch (error) {
    console.error("Error loading pet health records:", error)
    return []
  }
}

/**
 * Add new health record
 */
export async function addHealthRecord(record: Omit<HealthRecord, 'id'>): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_RECORDS_STORAGE_KEY)
    const records = stored ? JSON.parse(stored) : defaultHealthRecords
    
    const newRecord: HealthRecord = {
      ...record,
      id: `health-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    
    records.push(newRecord)
    await AsyncStorage.setItem(HEALTH_RECORDS_STORAGE_KEY, JSON.stringify(records))
    return newRecord.id
  } catch (error) {
    console.error("Error adding health record:", error)
    return ""
  }
}

/**
 * Get vaccination schedule for a pet
 */
export async function getPetVaccinationSchedule(petId: string): Promise<VaccinationSchedule[]> {
  try {
    const stored = await AsyncStorage.getItem(VACCINATION_SCHEDULE_STORAGE_KEY)
    if (stored) {
      const schedule = JSON.parse(stored)
      return schedule.filter((item: VaccinationSchedule) => item.petId === petId)
    } else {
      await AsyncStorage.setItem(VACCINATION_SCHEDULE_STORAGE_KEY, JSON.stringify(defaultVaccinationSchedule))
      return defaultVaccinationSchedule.filter(item => item.petId === petId)
    }
  } catch (error) {
    console.error("Error loading vaccination schedule:", error)
    return []
  }
}

/**
 * Mark vaccination as completed
 */
export async function completeVaccination(vaccinationId: string, veterinarianId?: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(VACCINATION_SCHEDULE_STORAGE_KEY)
    const schedule = stored ? JSON.parse(stored) : defaultVaccinationSchedule
    
    const vaccinationIndex = schedule.findIndex((item: VaccinationSchedule) => item.id === vaccinationId)
    if (vaccinationIndex >= 0) {
      schedule[vaccinationIndex].completed = true
      if (veterinarianId) {
        schedule[vaccinationIndex].veterinarianId = veterinarianId
      }
      
      await AsyncStorage.setItem(VACCINATION_SCHEDULE_STORAGE_KEY, JSON.stringify(schedule))
      return true
    }
    return false
  } catch (error) {
    console.error("Error completing vaccination:", error)
    return false
  }
}

/**
 * Get upcoming health appointments and vaccinations
 */
export async function getUpcomingHealthEvents(): Promise<{
  appointments: HealthRecord[]
  vaccinations: VaccinationSchedule[]
}> {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_RECORDS_STORAGE_KEY)
    const records = stored ? JSON.parse(stored) : defaultHealthRecords
    
    const vaccinationStored = await AsyncStorage.getItem(VACCINATION_SCHEDULE_STORAGE_KEY)
    const vaccinations = vaccinationStored ? JSON.parse(vaccinationStored) : defaultVaccinationSchedule
    
    const now = new Date()
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const upcomingAppointments = records.filter((record: HealthRecord) => 
      record.nextAppointment && 
      new Date(record.nextAppointment) <= oneMonthFromNow &&
      new Date(record.nextAppointment) >= now
    )
    
    const upcomingVaccinations = vaccinations.filter((vaccination: VaccinationSchedule) => 
      !vaccination.completed &&
      new Date(vaccination.dueDate) <= oneMonthFromNow &&
      new Date(vaccination.dueDate) >= now
    )
    
    return {
      appointments: upcomingAppointments,
      vaccinations: upcomingVaccinations
    }
  } catch (error) {
    console.error("Error getting upcoming health events:", error)
    return { appointments: [], vaccinations: [] }
  }
}

/**
 * Calculate health statistics
 */
export async function calculateHealthStatistics(): Promise<{
  totalHealthRecords: number
  completedVaccinations: number
  pendingVaccinations: number
  averageCostPerVisit: number
  healthStatusDistribution: Record<string, number>
}> {
  try {
    const recordsStored = await AsyncStorage.getItem(HEALTH_RECORDS_STORAGE_KEY)
    const records = recordsStored ? JSON.parse(recordsStored) : defaultHealthRecords
    
    const vaccinationsStored = await AsyncStorage.getItem(VACCINATION_SCHEDULE_STORAGE_KEY)
    const vaccinations = vaccinationsStored ? JSON.parse(vaccinationsStored) : defaultVaccinationSchedule
    
    const profilesStored = await AsyncStorage.getItem(HEALTH_PROFILES_STORAGE_KEY)
    const profiles = profilesStored ? JSON.parse(profilesStored) : defaultHealthProfiles
    
    const totalHealthRecords = records.length
    const completedVaccinations = vaccinations.filter((v: VaccinationSchedule) => v.completed).length
    const pendingVaccinations = vaccinations.filter((v: VaccinationSchedule) => !v.completed).length
    
    const recordsWithCost = records.filter((r: HealthRecord) => r.cost && r.cost > 0)
    const averageCostPerVisit = recordsWithCost.length > 0 
      ? recordsWithCost.reduce((sum: number, r: HealthRecord) => sum + (r.cost || 0), 0) / recordsWithCost.length
      : 0
    
    const healthStatusDistribution = profiles.reduce((acc: Record<string, number>, profile: PetHealthProfile) => {
      acc[profile.healthStatus] = (acc[profile.healthStatus] || 0) + 1
      return acc
    }, {})
    
    return {
      totalHealthRecords,
      completedVaccinations,
      pendingVaccinations,
      averageCostPerVisit: Math.round(averageCostPerVisit * 100) / 100,
      healthStatusDistribution
    }
  } catch (error) {
    console.error("Error calculating health statistics:", error)
    return {
      totalHealthRecords: 0,
      completedVaccinations: 0,
      pendingVaccinations: 0,
      averageCostPerVisit: 0,
      healthStatusDistribution: {}
    }
  }
}

/**
 * Initialize health tracking data
 */
export async function initializeHealthTracking(): Promise<void> {
  try {
    const profilesStored = await AsyncStorage.getItem(HEALTH_PROFILES_STORAGE_KEY)
    if (!profilesStored) {
      await AsyncStorage.setItem(HEALTH_PROFILES_STORAGE_KEY, JSON.stringify(defaultHealthProfiles))
      console.log("Initialized health profiles data")
    }

    const recordsStored = await AsyncStorage.getItem(HEALTH_RECORDS_STORAGE_KEY)
    if (!recordsStored) {
      await AsyncStorage.setItem(HEALTH_RECORDS_STORAGE_KEY, JSON.stringify(defaultHealthRecords))
      console.log("Initialized health records data")
    }

    const vaccinationStored = await AsyncStorage.getItem(VACCINATION_SCHEDULE_STORAGE_KEY)
    if (!vaccinationStored) {
      await AsyncStorage.setItem(VACCINATION_SCHEDULE_STORAGE_KEY, JSON.stringify(defaultVaccinationSchedule))
      console.log("Initialized vaccination schedule data")
    }
  } catch (error) {
    console.error("Error initializing health tracking:", error)
  }
}
