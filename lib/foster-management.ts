"use client"

export interface FosterFamily {
  id: string
  name: string
  email: string
  phone: string
  location: string
  experience: string
  specialization: string
  status: "Available" | "Active" | "On Break"
  maxPets: number
  currentPets: string[]
  joinDate: string
  totalFostered: number
}

export interface FosterCheckup {
  id: string
  date: string
  notes: string
  vetVisit: boolean
  healthStatus: string
}

export interface FosterAssignment {
  id: string
  petId: string
  petName: string
  fosterFamilyId: string
  fosterFamilyName: string
  startDate: string
  endDate?: string
  status: "Active" | "Completed"
  checkups: FosterCheckup[]
}

const FOSTER_FAMILIES_KEY = "petpal_foster_families"
const FOSTER_ASSIGNMENTS_KEY = "petpal_foster_assignments"

// Default foster families for demo
const defaultFosterFamilies: FosterFamily[] = [
  {
    id: "foster-1",
    name: "The Johnson Family",
    email: "johnson@example.com",
    phone: "(555) 123-4567",
    location: "Austin, TX",
    experience: "5+ years",
    specialization: "Puppies and young dogs",
    status: "Available",
    maxPets: 2,
    currentPets: [],
    joinDate: "2023-01-15",
    totalFostered: 12,
  },
  {
    id: "foster-2",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    phone: "(555) 987-6543",
    location: "Austin, TX",
    experience: "3 years",
    specialization: "Cats and kittens",
    status: "Active",
    maxPets: 3,
    currentPets: ["Luna", "Oliver"],
    joinDate: "2023-06-20",
    totalFostered: 8,
  },
  {
    id: "foster-3",
    name: "The Rodriguez Family",
    email: "rodriguez@example.com",
    phone: "(555) 456-7890",
    location: "Austin, TX",
    experience: "2 years",
    specialization: "Senior pets",
    status: "Available",
    maxPets: 1,
    currentPets: [],
    joinDate: "2024-02-10",
    totalFostered: 5,
  },
  {
    id: "foster-4",
    name: "Mike Thompson",
    email: "mike.thompson@example.com",
    phone: "(555) 321-0987",
    location: "Austin, TX",
    experience: "4 years",
    specialization: "Large breed dogs",
    status: "On Break",
    maxPets: 1,
    currentPets: [],
    joinDate: "2023-03-05",
    totalFostered: 15,
  },
]

export function getFosterFamilies(): FosterFamily[] {
  if (typeof window === "undefined") return defaultFosterFamilies

  try {
    const stored = localStorage.getItem(FOSTER_FAMILIES_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      localStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(defaultFosterFamilies))
      return defaultFosterFamilies
    }
  } catch (error) {
    console.error("Error loading foster families:", error)
    return defaultFosterFamilies
  }
}

export function addFosterFamily(family: Omit<FosterFamily, "id" | "joinDate" | "totalFostered">): FosterFamily {
  const families = getFosterFamilies()
  const newFamily: FosterFamily = {
    ...family,
    id: Math.random().toString(36).substr(2, 9),
    joinDate: new Date().toISOString().split("T")[0],
    totalFostered: 0,
  }

  families.push(newFamily)

  if (typeof window !== "undefined") {
    localStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families))
  }

  return newFamily
}

export function updateFosterFamily(id: string, updates: Partial<FosterFamily>): FosterFamily | null {
  const families = getFosterFamilies()
  const index = families.findIndex((family) => family.id === id)

  if (index !== -1) {
    families[index] = { ...families[index], ...updates }

    if (typeof window !== "undefined") {
      localStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families))
    }

    return families[index]
  }

  return null
}

export function assignPetToFoster(
  fosterFamilyId: string,
  petId: string,
  fosterFamilyName: string,
  petName: string,
): FosterAssignment {
  const assignments = getFosterAssignments()
  const newAssignment: FosterAssignment = {
    id: Math.random().toString(36).substr(2, 9),
    petId,
    petName,
    fosterFamilyId,
    fosterFamilyName,
    startDate: new Date().toISOString().split("T")[0],
    status: "Active",
    checkups: [],
  }

  assignments.push(newAssignment)

  // Update foster family status
  const families = getFosterFamilies()
  const familyIndex = families.findIndex((f) => f.id === fosterFamilyId)
  if (familyIndex !== -1) {
    families[familyIndex].currentPets.push(petName)
    if (families[familyIndex].currentPets.length >= families[familyIndex].maxPets) {
      families[familyIndex].status = "Active"
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families))
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments))
  }

  return newAssignment
}

export function getFosterAssignments(): FosterAssignment[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(FOSTER_ASSIGNMENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading foster assignments:", error)
    return []
  }
}

export function scheduleCheckup(assignmentId: string, checkupData: Omit<FosterCheckup, "id">): void {
  const assignments = getFosterAssignments()
  const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId)

  if (assignmentIndex !== -1) {
    const newCheckup: FosterCheckup = {
      ...checkupData,
      id: Math.random().toString(36).substr(2, 9),
    }

    assignments[assignmentIndex].checkups.push(newCheckup)

    if (typeof window !== "undefined") {
      localStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments))
    }
  }
}

export function updateCheckup(assignmentId: string, checkupId: string, updates: Partial<FosterCheckup>): void {
  const assignments = getFosterAssignments()
  const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId)

  if (assignmentIndex !== -1) {
    const checkupIndex = assignments[assignmentIndex].checkups.findIndex((c) => c.id === checkupId)
    if (checkupIndex !== -1) {
      assignments[assignmentIndex].checkups[checkupIndex] = {
        ...assignments[assignmentIndex].checkups[checkupIndex],
        ...updates,
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments))
      }
    }
  }
}

export function completeFosterAssignment(assignmentId: string): void {
  const assignments = getFosterAssignments()
  const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId)

  if (assignmentIndex !== -1) {
    assignments[assignmentIndex].status = "Completed"
    assignments[assignmentIndex].endDate = new Date().toISOString().split("T")[0]

    // Update foster family
    const families = getFosterFamilies()
    const familyIndex = families.findIndex((f) => f.id === assignments[assignmentIndex].fosterFamilyId)
    if (familyIndex !== -1) {
      const petName = assignments[assignmentIndex].petName
      families[familyIndex].currentPets = families[familyIndex].currentPets.filter((p) => p !== petName)
      families[familyIndex].totalFostered += 1

      if (families[familyIndex].currentPets.length < families[familyIndex].maxPets) {
        families[familyIndex].status = "Available"
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families))
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments))
    }
  }
}
