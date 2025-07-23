import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdoptionApplication {
  id: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  petId: string
  petName: string
  petType: "dog" | "cat" | "bird" | "rabbit" | "other"
  applicationDate: string
  status: "pending" | "approved" | "rejected" | "interview" | "home-visit" | "completed"
  priority: "low" | "normal" | "high" | "urgent"
  notes?: string
  interviewDate?: string
  homeVisitDate?: string
  approvalDate?: string
  rejectionReason?: string
  score: number // Application score out of 100
}

export interface AdoptionMetrics {
  totalApplications: number
  successfulAdoptions: number
  pendingApplications: number
  rejectedApplications: number
  averageProcessingTime: number // in days
  adoptionSuccessRate: number // percentage
  topReasons: Array<{ reason: string; count: number }>
  monthlyTrends: Array<{ month: string; applications: number; adoptions: number }>
}

export interface PetAdoptionProfile {
  petId: string
  petName: string
  petType: string
  breed: string
  age: number
  arrivalDate: string
  adoptionDate?: string
  totalApplications: number
  timeToAdoption?: number // days from arrival to adoption
  adoptionStatus: "available" | "pending" | "adopted" | "reserved"
  specialNeeds: string[]
  adoptabilityScore: number // 1-10 scale
}

export interface AdopterProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  experienceLevel: "first-time" | "experienced" | "expert"
  preferredPetTypes: string[]
  housingType: "apartment" | "house" | "farm"
  hasYard: boolean
  hasOtherPets: boolean
  familySize: number
  adoptionHistory: string[] // Array of adopted pet IDs
  applicationScore: number // Average score across applications
}

// Storage keys
const ADOPTION_APPLICATIONS_KEY = "petpal_adoption_applications"
const PET_PROFILES_KEY = "petpal_pet_adoption_profiles"
const ADOPTER_PROFILES_KEY = "petpal_adopter_profiles"
const ADOPTION_METRICS_KEY = "petpal_adoption_metrics"

// Default adoption applications for demo
const defaultApplications: AdoptionApplication[] = [
  {
    id: "app-1",
    applicantId: "adopter-1",
    applicantName: "Alice Johnson",
    applicantEmail: "alice.johnson@email.com",
    petId: "pet-1",
    petName: "Buddy",
    petType: "dog",
    applicationDate: "2024-07-15",
    status: "completed",
    priority: "normal",
    notes: "Great match, experienced dog owner",
    interviewDate: "2024-07-18",
    homeVisitDate: "2024-07-20",
    approvalDate: "2024-07-22",
    score: 95
  },
  {
    id: "app-2",
    applicantId: "adopter-2",
    applicantName: "Mark Davis",
    applicantEmail: "mark.davis@email.com",
    petId: "pet-2",
    petName: "Whiskers",
    petType: "cat",
    applicationDate: "2024-07-18",
    status: "interview",
    priority: "high",
    notes: "First-time cat owner, needs guidance",
    interviewDate: "2024-07-25",
    score: 78
  },
  {
    id: "app-3",
    applicantId: "adopter-3",
    applicantName: "Sarah Miller",
    applicantEmail: "sarah.miller@email.com",
    petId: "pet-3",
    petName: "Luna",
    petType: "dog",
    applicationDate: "2024-07-20",
    status: "pending",
    priority: "normal",
    notes: "Application under review",
    score: 82
  },
  {
    id: "app-4",
    applicantId: "adopter-4",
    applicantName: "Tom Wilson",
    applicantEmail: "tom.wilson@email.com",
    petId: "pet-1",
    petName: "Buddy",
    petType: "dog",
    applicationDate: "2024-07-12",
    status: "rejected",
    priority: "low",
    notes: "Housing not suitable for large dog",
    rejectionReason: "Inadequate living space",
    score: 45
  },
  {
    id: "app-5",
    applicantId: "adopter-5",
    applicantName: "Emma Brown",
    applicantEmail: "emma.brown@email.com",
    petId: "pet-4",
    petName: "Charlie",
    petType: "cat",
    applicationDate: "2024-07-21",
    status: "home-visit",
    priority: "normal",
    notes: "Interview completed, scheduling home visit",
    interviewDate: "2024-07-23",
    homeVisitDate: "2024-07-26",
    score: 88
  }
]

// Default pet adoption profiles
const defaultPetProfiles: PetAdoptionProfile[] = [
  {
    petId: "pet-1",
    petName: "Buddy",
    petType: "dog",
    breed: "Golden Retriever",
    age: 3,
    arrivalDate: "2024-06-01",
    adoptionDate: "2024-07-22",
    totalApplications: 3,
    timeToAdoption: 51,
    adoptionStatus: "adopted",
    specialNeeds: [],
    adoptabilityScore: 9
  },
  {
    petId: "pet-2",
    petName: "Whiskers",
    petType: "cat",
    breed: "Persian",
    age: 2,
    arrivalDate: "2024-06-15",
    totalApplications: 2,
    adoptionStatus: "pending",
    specialNeeds: ["daily grooming"],
    adoptabilityScore: 8
  },
  {
    petId: "pet-3",
    petName: "Luna",
    petType: "dog",
    breed: "Border Collie",
    age: 1,
    arrivalDate: "2024-07-01",
    totalApplications: 1,
    adoptionStatus: "available",
    specialNeeds: ["high energy", "needs training"],
    adoptabilityScore: 7
  },
  {
    petId: "pet-4",
    petName: "Charlie",
    petType: "cat",
    breed: "Maine Coon",
    age: 4,
    arrivalDate: "2024-06-20",
    totalApplications: 1,
    adoptionStatus: "reserved",
    specialNeeds: [],
    adoptabilityScore: 9
  }
]

// Default adopter profiles
const defaultAdopterProfiles: AdopterProfile[] = [
  {
    id: "adopter-1",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1-555-0101",
    address: "123 Oak Street, Springfield",
    experienceLevel: "experienced",
    preferredPetTypes: ["dog"],
    housingType: "house",
    hasYard: true,
    hasOtherPets: true,
    familySize: 4,
    adoptionHistory: ["pet-1"],
    applicationScore: 95
  },
  {
    id: "adopter-2",
    name: "Mark Davis",
    email: "mark.davis@email.com",
    phone: "+1-555-0102",
    address: "456 Pine Avenue, Springfield",
    experienceLevel: "first-time",
    preferredPetTypes: ["cat"],
    housingType: "apartment",
    hasYard: false,
    hasOtherPets: false,
    familySize: 2,
    adoptionHistory: [],
    applicationScore: 78
  },
  {
    id: "adopter-3",
    name: "Sarah Miller",
    email: "sarah.miller@email.com",
    phone: "+1-555-0103",
    address: "789 Elm Drive, Springfield",
    experienceLevel: "experienced",
    preferredPetTypes: ["dog", "cat"],
    housingType: "house",
    hasYard: true,
    hasOtherPets: false,
    familySize: 3,
    adoptionHistory: [],
    applicationScore: 82
  }
]

/**
 * Get all adoption applications
 */
export async function getAdoptionApplications(): Promise<AdoptionApplication[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTION_APPLICATIONS_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(ADOPTION_APPLICATIONS_KEY, JSON.stringify(defaultApplications))
      return defaultApplications
    }
  } catch (error) {
    console.error("Error loading adoption applications:", error)
    return defaultApplications
  }
}

/**
 * Add new adoption application
 */
export async function submitAdoptionApplication(application: Omit<AdoptionApplication, 'id'>): Promise<string> {
  try {
    const applications = await getAdoptionApplications()
    const newApplication: AdoptionApplication = {
      ...application,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    
    applications.push(newApplication)
    await AsyncStorage.setItem(ADOPTION_APPLICATIONS_KEY, JSON.stringify(applications))
    
    // Update pet profile with new application count
    await updatePetApplicationCount(application.petId)
    
    return newApplication.id
  } catch (error) {
    console.error("Error submitting adoption application:", error)
    return ""
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: AdoptionApplication['status'],
  notes?: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    const applications = await getAdoptionApplications()
    const applicationIndex = applications.findIndex(app => app.id === applicationId)
    
    if (applicationIndex >= 0) {
      applications[applicationIndex].status = status
      if (notes) applications[applicationIndex].notes = notes
      if (rejectionReason) applications[applicationIndex].rejectionReason = rejectionReason
      
      if (status === "approved") {
        applications[applicationIndex].approvalDate = new Date().toISOString()
      }
      
      await AsyncStorage.setItem(ADOPTION_APPLICATIONS_KEY, JSON.stringify(applications))
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating application status:", error)
    return false
  }
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(status: AdoptionApplication['status']): Promise<AdoptionApplication[]> {
  try {
    const applications = await getAdoptionApplications()
    return applications.filter(app => app.status === status)
  } catch (error) {
    console.error("Error loading applications by status:", error)
    return []
  }
}

/**
 * Get applications for a specific pet
 */
export async function getApplicationsForPet(petId: string): Promise<AdoptionApplication[]> {
  try {
    const applications = await getAdoptionApplications()
    return applications.filter(app => app.petId === petId)
  } catch (error) {
    console.error("Error loading applications for pet:", error)
    return []
  }
}

/**
 * Calculate adoption analytics
 */
export async function calculateAdoptionAnalytics(): Promise<AdoptionMetrics> {
  try {
    const applications = await getAdoptionApplications()
    
    const totalApplications = applications.length
    const successfulAdoptions = applications.filter(app => app.status === "completed").length
    const pendingApplications = applications.filter(app => 
      ["pending", "interview", "home-visit", "approved"].includes(app.status)
    ).length
    const rejectedApplications = applications.filter(app => app.status === "rejected").length
    
    // Calculate average processing time
    const completedApps = applications.filter(app => 
      app.status === "completed" && app.approvalDate
    )
    const averageProcessingTime = completedApps.length > 0 
      ? completedApps.reduce((sum, app) => {
          const start = new Date(app.applicationDate)
          const end = new Date(app.approvalDate!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedApps.length
      : 0
    
    const adoptionSuccessRate = totalApplications > 0 
      ? (successfulAdoptions / totalApplications) * 100 
      : 0
    
    // Calculate top rejection reasons
    const rejectionReasons = applications
      .filter(app => app.rejectionReason)
      .reduce((acc, app) => {
        const reason = app.rejectionReason!
        acc[reason] = (acc[reason] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    const topReasons = Object.entries(rejectionReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Calculate monthly trends (last 6 months)
    const monthlyStats = applications.reduce((acc, app) => {
      const date = new Date(app.applicationDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { applications: 0, adoptions: 0 }
      }
      acc[monthKey].applications += 1
      if (app.status === "completed") {
        acc[monthKey].adoptions += 1
      }
      return acc
    }, {} as Record<string, { applications: number; adoptions: number }>)
    
    const monthlyTrends = Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
    
    return {
      totalApplications,
      successfulAdoptions,
      pendingApplications,
      rejectedApplications,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      adoptionSuccessRate: Math.round(adoptionSuccessRate * 100) / 100,
      topReasons,
      monthlyTrends
    }
  } catch (error) {
    console.error("Error calculating adoption analytics:", error)
    return {
      totalApplications: 0,
      successfulAdoptions: 0,
      pendingApplications: 0,
      rejectedApplications: 0,
      averageProcessingTime: 0,
      adoptionSuccessRate: 0,
      topReasons: [],
      monthlyTrends: []
    }
  }
}

/**
 * Get pet adoption profiles
 */
export async function getPetAdoptionProfiles(): Promise<PetAdoptionProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(PET_PROFILES_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(PET_PROFILES_KEY, JSON.stringify(defaultPetProfiles))
      return defaultPetProfiles
    }
  } catch (error) {
    console.error("Error loading pet adoption profiles:", error)
    return defaultPetProfiles
  }
}

/**
 * Update pet application count
 */
async function updatePetApplicationCount(petId: string): Promise<void> {
  try {
    const profiles = await getPetAdoptionProfiles()
    const profileIndex = profiles.findIndex(profile => profile.petId === petId)
    
    if (profileIndex >= 0) {
      profiles[profileIndex].totalApplications += 1
      await AsyncStorage.setItem(PET_PROFILES_KEY, JSON.stringify(profiles))
    }
  } catch (error) {
    console.error("Error updating pet application count:", error)
  }
}

/**
 * Get adopter profiles
 */
export async function getAdopterProfiles(): Promise<AdopterProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTER_PROFILES_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(ADOPTER_PROFILES_KEY, JSON.stringify(defaultAdopterProfiles))
      return defaultAdopterProfiles
    }
  } catch (error) {
    console.error("Error loading adopter profiles:", error)
    return defaultAdopterProfiles
  }
}

/**
 * Calculate pet adoption insights
 */
export async function calculatePetAdoptionInsights(): Promise<{
  fastestAdoptions: PetAdoptionProfile[]
  slowestAdoptions: PetAdoptionProfile[]
  mostPopularBreeds: Array<{ breed: string; count: number; averageTime: number }>
  adoptabilityFactors: Array<{ factor: string; impact: number }>
}> {
  try {
    const profiles = await getPetAdoptionProfiles()
    const adoptedPets = profiles.filter(pet => pet.adoptionStatus === "adopted" && pet.timeToAdoption)
    
    // Fastest and slowest adoptions
    const sortedByTime = [...adoptedPets].sort((a, b) => (a.timeToAdoption || 0) - (b.timeToAdoption || 0))
    const fastestAdoptions = sortedByTime.slice(0, 5)
    const slowestAdoptions = sortedByTime.slice(-5).reverse()
    
    // Most popular breeds
    const breedStats = adoptedPets.reduce((acc, pet) => {
      if (!acc[pet.breed]) {
        acc[pet.breed] = { count: 0, totalTime: 0 }
      }
      acc[pet.breed].count += 1
      acc[pet.breed].totalTime += pet.timeToAdoption || 0
      return acc
    }, {} as Record<string, { count: number; totalTime: number }>)
    
    const mostPopularBreeds = Object.entries(breedStats)
      .map(([breed, stats]) => ({
        breed,
        count: stats.count,
        averageTime: Math.round((stats.totalTime / stats.count) * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Adoptability factors analysis
    const adoptabilityFactors = [
      {
        factor: "Age (younger pets)",
        impact: profiles.filter(p => p.age <= 2 && p.adoptionStatus === "adopted").length / 
                Math.max(profiles.filter(p => p.age <= 2).length, 1) * 100
      },
      {
        factor: "No special needs",
        impact: profiles.filter(p => p.specialNeeds.length === 0 && p.adoptionStatus === "adopted").length / 
                Math.max(profiles.filter(p => p.specialNeeds.length === 0).length, 1) * 100
      },
      {
        factor: "High adoptability score",
        impact: profiles.filter(p => p.adoptabilityScore >= 8 && p.adoptionStatus === "adopted").length / 
                Math.max(profiles.filter(p => p.adoptabilityScore >= 8).length, 1) * 100
      }
    ].map(factor => ({
      ...factor,
      impact: Math.round(factor.impact * 100) / 100
    }))
    
    return {
      fastestAdoptions,
      slowestAdoptions,
      mostPopularBreeds,
      adoptabilityFactors
    }
  } catch (error) {
    console.error("Error calculating pet adoption insights:", error)
    return {
      fastestAdoptions: [],
      slowestAdoptions: [],
      mostPopularBreeds: [],
      adoptabilityFactors: []
    }
  }
}

/**
 * Initialize adoption analytics data
 */
export async function initializeAdoptionAnalytics(): Promise<void> {
  try {
    const applicationsStored = await AsyncStorage.getItem(ADOPTION_APPLICATIONS_KEY)
    if (!applicationsStored) {
      await AsyncStorage.setItem(ADOPTION_APPLICATIONS_KEY, JSON.stringify(defaultApplications))
      console.log("Initialized adoption applications data")
    }

    const petProfilesStored = await AsyncStorage.getItem(PET_PROFILES_KEY)
    if (!petProfilesStored) {
      await AsyncStorage.setItem(PET_PROFILES_KEY, JSON.stringify(defaultPetProfiles))
      console.log("Initialized pet adoption profiles data")
    }

    const adopterProfilesStored = await AsyncStorage.getItem(ADOPTER_PROFILES_KEY)
    if (!adopterProfilesStored) {
      await AsyncStorage.setItem(ADOPTER_PROFILES_KEY, JSON.stringify(defaultAdopterProfiles))
      console.log("Initialized adopter profiles data")
    }
  } catch (error) {
    console.error("Error initializing adoption analytics:", error)
  }
}
