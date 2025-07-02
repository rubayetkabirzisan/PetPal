export interface AdopterVerification {
  id: string
  adopterName: string
  adopterEmail: string
  adopterPhone: string
  submissionDate: string
  status: "pending" | "in-progress" | "requires-review" | "approved" | "rejected"
  overallScore: number
  reviewDate?: string
  reviewedBy?: string
  adminNotes?: string
  flaggedConcerns: string[]

  backgroundCheck: {
    status: "pending" | "passed" | "failed"
    criminalHistory: boolean
    animalAbuseHistory: boolean
    employmentVerified: boolean
    creditScore?: number
    notes?: string
  }

  homeInspection: {
    completed: boolean
    livingSpace: "apartment" | "house" | "condo" | "other"
    yardSize?: "none" | "small" | "medium" | "large"
    fencing: boolean
    petProofing: boolean
    score: number
    safetyHazards: string[]
    inspectorNotes?: string
  }

  financialCheck: {
    verified: boolean
    annualIncome: number
    petBudget: number
    emergencyFund: boolean
    petInsurance: boolean
    score: number
  }

  petHistory: {
    experienceLevel: "beginner" | "intermediate" | "experienced"
    currentPets: Array<{
      type: string
      breed: string
      age: string
    }>
    previousPets: Array<{
      type: string
      breed: string
      yearsOwned: number
      outcome: string
    }>
    specialNeeds: boolean
    veterinarianReference?: {
      name: string
      clinic: string
      phone: string
      verified: boolean
    }
  }

  lifestyle: {
    workSchedule: "full-time" | "part-time" | "remote" | "retired"
    hoursAwayDaily: number
    activityLevel: "low" | "moderate" | "high" | "very-high"
    familyMembers: number
    childrenAges?: number[]
    travelFrequency: "rarely" | "occasionally" | "frequently"
  }
}

const defaultVerifications: AdopterVerification[] = [
  {
    id: "verify-1",
    adopterName: "Sarah Johnson",
    adopterEmail: "sarah.johnson@email.com",
    adopterPhone: "(555) 123-4567",
    submissionDate: "2024-01-15",
    status: "approved",
    overallScore: 92,
    reviewDate: "2024-01-20",
    reviewedBy: "Admin User",
    adminNotes: "Excellent candidate with strong background and experience.",
    flaggedConcerns: [],

    backgroundCheck: {
      status: "passed",
      criminalHistory: false,
      animalAbuseHistory: false,
      employmentVerified: true,
      creditScore: 750,
      notes: "Clean background, stable employment",
    },

    homeInspection: {
      completed: true,
      livingSpace: "house",
      yardSize: "large",
      fencing: true,
      petProofing: true,
      score: 95,
      safetyHazards: [],
      inspectorNotes: "Excellent home environment for pets",
    },

    financialCheck: {
      verified: true,
      annualIncome: 75000,
      petBudget: 3000,
      emergencyFund: true,
      petInsurance: true,
      score: 90,
    },

    petHistory: {
      experienceLevel: "experienced",
      currentPets: [{ type: "Dog", breed: "Labrador", age: "5 years" }],
      previousPets: [{ type: "Cat", breed: "Domestic Shorthair", yearsOwned: 8, outcome: "Natural death" }],
      specialNeeds: true,
      veterinarianReference: {
        name: "Dr. Smith",
        clinic: "Austin Animal Hospital",
        phone: "(555) 987-6543",
        verified: true,
      },
    },

    lifestyle: {
      workSchedule: "remote",
      hoursAwayDaily: 2,
      activityLevel: "high",
      familyMembers: 3,
      childrenAges: [8, 12],
      travelFrequency: "occasionally",
    },
  },
  {
    id: "verify-2",
    adopterName: "Mike Wilson",
    adopterEmail: "mike.wilson@email.com",
    adopterPhone: "(555) 234-5678",
    submissionDate: "2024-01-18",
    status: "requires-review",
    overallScore: 68,
    flaggedConcerns: ["Limited pet experience", "Long work hours away from home", "No emergency fund for pet care"],

    backgroundCheck: {
      status: "passed",
      criminalHistory: false,
      animalAbuseHistory: false,
      employmentVerified: true,
      creditScore: 680,
    },

    homeInspection: {
      completed: true,
      livingSpace: "apartment",
      yardSize: "none",
      fencing: false,
      petProofing: false,
      score: 65,
      safetyHazards: ["Balcony without pet barriers", "Toxic plants present"],
    },

    financialCheck: {
      verified: true,
      annualIncome: 45000,
      petBudget: 1200,
      emergencyFund: false,
      petInsurance: false,
      score: 60,
    },

    petHistory: {
      experienceLevel: "beginner",
      currentPets: [],
      previousPets: [],
      specialNeeds: false,
    },

    lifestyle: {
      workSchedule: "full-time",
      hoursAwayDaily: 10,
      activityLevel: "moderate",
      familyMembers: 1,
      travelFrequency: "frequently",
    },
  },
  {
    id: "verify-3",
    adopterName: "Emily Davis",
    adopterEmail: "emily.davis@email.com",
    adopterPhone: "(555) 345-6789",
    submissionDate: "2024-01-22",
    status: "in-progress",
    overallScore: 78,
    flaggedConcerns: [],

    backgroundCheck: {
      status: "passed",
      criminalHistory: false,
      animalAbuseHistory: false,
      employmentVerified: true,
      creditScore: 720,
    },

    homeInspection: {
      completed: false,
      livingSpace: "house",
      yardSize: "medium",
      fencing: true,
      petProofing: true,
      score: 0,
      safetyHazards: [],
    },

    financialCheck: {
      verified: true,
      annualIncome: 62000,
      petBudget: 2500,
      emergencyFund: true,
      petInsurance: true,
      score: 85,
    },

    petHistory: {
      experienceLevel: "intermediate",
      currentPets: [{ type: "Cat", breed: "Persian", age: "3 years" }],
      previousPets: [{ type: "Dog", breed: "Beagle", yearsOwned: 6, outcome: "Rehomed due to move" }],
      specialNeeds: false,
      veterinarianReference: {
        name: "Dr. Brown",
        clinic: "Pet Care Clinic",
        phone: "(555) 876-5432",
        verified: true,
      },
    },

    lifestyle: {
      workSchedule: "part-time",
      hoursAwayDaily: 6,
      activityLevel: "moderate",
      familyMembers: 2,
      travelFrequency: "rarely",
    },
  },
  {
    id: "verify-4",
    adopterName: "David Thompson",
    adopterEmail: "david.thompson@email.com",
    adopterPhone: "(555) 456-7890",
    submissionDate: "2024-01-25",
    status: "rejected",
    overallScore: 35,
    reviewDate: "2024-01-28",
    reviewedBy: "Admin User",
    adminNotes: "Multiple red flags identified. Not suitable for pet adoption at this time.",
    flaggedConcerns: [
      "Previous animal abuse incident",
      "Unstable housing situation",
      "Insufficient financial resources",
      "No veterinary references",
    ],

    backgroundCheck: {
      status: "failed",
      criminalHistory: true,
      animalAbuseHistory: true,
      employmentVerified: false,
      creditScore: 450,
      notes: "Animal cruelty conviction 3 years ago",
    },

    homeInspection: {
      completed: false,
      livingSpace: "apartment",
      yardSize: "none",
      fencing: false,
      petProofing: false,
      score: 0,
      safetyHazards: [],
    },

    financialCheck: {
      verified: false,
      annualIncome: 25000,
      petBudget: 500,
      emergencyFund: false,
      petInsurance: false,
      score: 20,
    },

    petHistory: {
      experienceLevel: "beginner",
      currentPets: [],
      previousPets: [],
      specialNeeds: false,
    },

    lifestyle: {
      workSchedule: "part-time",
      hoursAwayDaily: 8,
      activityLevel: "low",
      familyMembers: 1,
      travelFrequency: "rarely",
    },
  },
  {
    id: "verify-5",
    adopterName: "Lisa Chen",
    adopterEmail: "lisa.chen@email.com",
    adopterPhone: "(555) 567-8901",
    submissionDate: "2024-01-28",
    status: "pending",
    overallScore: 0,
    flaggedConcerns: [],

    backgroundCheck: {
      status: "pending",
      criminalHistory: false,
      animalAbuseHistory: false,
      employmentVerified: false,
    },

    homeInspection: {
      completed: false,
      livingSpace: "house",
      yardSize: "large",
      fencing: true,
      petProofing: false,
      score: 0,
      safetyHazards: [],
    },

    financialCheck: {
      verified: false,
      annualIncome: 0,
      petBudget: 0,
      emergencyFund: false,
      petInsurance: false,
      score: 0,
    },

    petHistory: {
      experienceLevel: "intermediate",
      currentPets: [],
      previousPets: [{ type: "Dog", breed: "Golden Retriever", yearsOwned: 10, outcome: "Natural death" }],
      specialNeeds: false,
    },

    lifestyle: {
      workSchedule: "full-time",
      hoursAwayDaily: 8,
      activityLevel: "moderate",
      familyMembers: 4,
      childrenAges: [6, 10, 14],
      travelFrequency: "occasionally",
    },
  },
]

export function getAdopterVerifications(): AdopterVerification[] {
  if (typeof window === "undefined") return defaultVerifications

  try {
    const stored = localStorage.getItem("petpal_adopter_verifications")
    if (stored) {
      return JSON.parse(stored)
    } else {
      localStorage.setItem("petpal_adopter_verifications", JSON.stringify(defaultVerifications))
      return defaultVerifications
    }
  } catch (error) {
    console.error("Error loading adopter verifications:", error)
    return defaultVerifications
  }
}

export function saveAdopterVerifications(verifications: AdopterVerification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("petpal_adopter_verifications", JSON.stringify(verifications))
}

export function updateVerificationStatus(
  id: string,
  status: AdopterVerification["status"],
  reviewedBy: string,
  notes?: string,
): AdopterVerification | null {
  const verifications = getAdopterVerifications()
  const index = verifications.findIndex((v) => v.id === id)

  if (index !== -1) {
    verifications[index] = {
      ...verifications[index],
      status,
      reviewDate: new Date().toISOString(),
      reviewedBy,
      adminNotes: notes || verifications[index].adminNotes,
    }
    saveAdopterVerifications(verifications)
    return verifications[index]
  }
  return null
}

export function getVerificationStats() {
  const verifications = getAdopterVerifications()

  return {
    total: verifications.length,
    pending: verifications.filter((v) => v.status === "pending").length,
    inProgress: verifications.filter((v) => v.status === "in-progress").length,
    requiresReview: verifications.filter((v) => v.status === "requires-review").length,
    approved: verifications.filter((v) => v.status === "approved").length,
    rejected: verifications.filter((v) => v.status === "rejected").length,
  }
}

export function getVerificationById(id: string): AdopterVerification | undefined {
  const verifications = getAdopterVerifications()
  return verifications.find((v) => v.id === id)
}
