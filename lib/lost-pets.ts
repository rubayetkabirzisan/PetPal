export interface LostPet {
  id: string
  name: string
  species: string
  breed: string
  age: string
  color: string
  size: string
  description: string
  lastSeenLocation: string
  lastSeenDate: string
  contactName: string
  contactPhone: string
  contactEmail: string
  reward?: string
  microchipped: boolean
  specialNeeds?: string
  photos?: File[]
  status: "lost" | "sighted" | "found" | "reunited"
  priority: "low" | "medium" | "high" | "critical"
  reportedDate: string
  sightings: Sighting[]
  actionLog: ActionLog[]
}

export interface Sighting {
  id: string
  petId: string
  location: string
  date: string
  time?: string
  description: string
  reporterName: string
  reporterPhone?: string
  reporterEmail?: string
  photos?: File[]
  timestamp: string
}

export interface ActionLog {
  timestamp: string
  action: string
  adminName: string
  notes?: string
}

// Mock data
const mockLostPets: LostPet[] = [
  {
    id: "lost-1",
    name: "Max",
    species: "dog",
    breed: "Golden Retriever",
    age: "3 years",
    color: "Golden",
    size: "large",
    description: "Friendly golden retriever with a red collar. Very social and loves people.",
    lastSeenLocation: "Central Park, near the playground",
    lastSeenDate: "2024-01-19T15:30:00Z",
    contactName: "Sarah Johnson",
    contactPhone: "(555) 123-4567",
    contactEmail: "sarah.johnson@email.com",
    reward: "$500",
    microchipped: true,
    specialNeeds: "Takes medication for hip dysplasia",
    status: "sighted",
    priority: "high",
    reportedDate: "2024-01-19T16:00:00Z",
    sightings: [
      {
        id: "sight-1",
        petId: "lost-1",
        location: "5th Avenue near Central Park",
        date: "2024-01-20T09:00:00Z",
        time: "09:00",
        description: "Saw a golden retriever matching the description running towards the park",
        reporterName: "Mike Wilson",
        reporterPhone: "(555) 987-6543",
        reporterEmail: "mike.w@email.com",
        timestamp: "2024-01-20T09:15:00Z",
      },
    ],
    actionLog: [
      {
        timestamp: "2024-01-19T16:00:00Z",
        action: "Case Created",
        adminName: "System",
        notes: "Lost pet report submitted by owner",
      },
      {
        timestamp: "2024-01-20T09:20:00Z",
        action: "Status Updated to Sighted",
        adminName: "Admin User",
        notes: "Sighting reported by Mike Wilson on 5th Avenue",
      },
    ],
  },
  {
    id: "lost-2",
    name: "Luna",
    species: "cat",
    breed: "Siamese",
    age: "2 years",
    color: "Cream and brown points",
    size: "medium",
    description: "Indoor cat, very shy around strangers. Blue eyes and distinctive Siamese markings.",
    lastSeenLocation: "Brooklyn Heights, Remsen Street",
    lastSeenDate: "2024-01-18T20:00:00Z",
    contactName: "David Chen",
    contactPhone: "(555) 456-7890",
    contactEmail: "david.chen@email.com",
    microchipped: true,
    status: "lost",
    priority: "critical",
    reportedDate: "2024-01-18T21:00:00Z",
    sightings: [],
    actionLog: [
      {
        timestamp: "2024-01-18T21:00:00Z",
        action: "Case Created",
        adminName: "System",
        notes: "Lost pet report submitted by owner",
      },
      {
        timestamp: "2024-01-19T10:00:00Z",
        action: "Priority Set to Critical",
        adminName: "Admin User",
        notes: "Indoor cat missing for over 24 hours",
      },
    ],
  },
  {
    id: "lost-3",
    name: "Buddy",
    species: "dog",
    breed: "Mixed Breed",
    age: "5 years",
    color: "Brown and white",
    size: "medium",
    description: "Rescue dog, very friendly but can be skittish. Has a distinctive white patch on his chest.",
    lastSeenLocation: "Prospect Park, near the lake",
    lastSeenDate: "2024-01-15T14:00:00Z",
    contactName: "Emily Rodriguez",
    contactPhone: "(555) 234-5678",
    contactEmail: "emily.r@email.com",
    reward: "$200",
    microchipped: false,
    status: "reunited",
    priority: "low",
    reportedDate: "2024-01-15T15:00:00Z",
    sightings: [
      {
        id: "sight-2",
        petId: "lost-3",
        location: "Prospect Park, dog run area",
        date: "2024-01-16T10:00:00Z",
        time: "10:00",
        description: "Found the dog at the dog run, very friendly and responsive to the name Buddy",
        reporterName: "Park Volunteer",
        reporterPhone: "(555) 111-2222",
        timestamp: "2024-01-16T10:30:00Z",
      },
    ],
    actionLog: [
      {
        timestamp: "2024-01-15T15:00:00Z",
        action: "Case Created",
        adminName: "System",
        notes: "Lost pet report submitted by owner",
      },
      {
        timestamp: "2024-01-16T10:30:00Z",
        action: "Status Updated to Found",
        adminName: "Admin User",
        notes: "Pet found at Prospect Park dog run",
      },
      {
        timestamp: "2024-01-16T12:00:00Z",
        action: "Status Updated to Reunited",
        adminName: "Admin User",
        notes: "Owner successfully reunited with Buddy",
      },
    ],
  },
]

export function getLostPets(): LostPet[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("petpal_lost_pets")
    if (stored) {
      return JSON.parse(stored)
    }
  }
  return mockLostPets
}

export function reportLostPet(petData: {
  name: string
  species: string
  breed: string
  age: string
  color: string
  size: string
  description: string
  lastSeenLocation: string
  lastSeenDate: string
  contactName: string
  contactPhone: string
  contactEmail: string
  reward?: string
  microchipped: boolean
  specialNeeds?: string
  photos?: File[]
}): LostPet {
  const newPet: LostPet = {
    id: `lost-${Date.now()}`,
    ...petData,
    status: "lost",
    priority: "medium",
    reportedDate: new Date().toISOString(),
    sightings: [],
    actionLog: [
      {
        timestamp: new Date().toISOString(),
        action: "Case Created",
        adminName: "System",
        notes: "Lost pet report submitted by owner",
      },
    ],
  }

  if (typeof window !== "undefined") {
    const pets = getLostPets()
    const updatedPets = [newPet, ...pets]
    localStorage.setItem("petpal_lost_pets", JSON.stringify(updatedPets))
  }

  return newPet
}

export function reportSighting(sightingData: {
  petId: string
  location: string
  date: string
  time?: string
  description: string
  reporterName: string
  reporterPhone?: string
  reporterEmail?: string
  photos?: File[]
}): Sighting {
  const newSighting: Sighting = {
    id: `sight-${Date.now()}`,
    ...sightingData,
    timestamp: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    const pets = getLostPets()
    const updatedPets = pets.map((pet) =>
      pet.id === sightingData.petId
        ? {
            ...pet,
            sightings: [...pet.sightings, newSighting],
            actionLog: [
              ...pet.actionLog,
              {
                timestamp: new Date().toISOString(),
                action: "Sighting Reported",
                adminName: "System",
                notes: `Sighting reported by ${sightingData.reporterName} at ${sightingData.location}`,
              },
            ],
          }
        : pet,
    )
    localStorage.setItem("petpal_lost_pets", JSON.stringify(updatedPets))
  }

  return newSighting
}

export function updateLostPetStatus(
  petId: string,
  newStatus: LostPet["status"],
  adminName: string,
  notes?: string,
): LostPet | null {
  if (typeof window !== "undefined") {
    const pets = getLostPets()
    const petIndex = pets.findIndex((pet) => pet.id === petId)

    if (petIndex === -1) return null

    const updatedPet = {
      ...pets[petIndex],
      status: newStatus,
      actionLog: [
        ...pets[petIndex].actionLog,
        {
          timestamp: new Date().toISOString(),
          action: `Status Updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          adminName,
          notes,
        },
      ],
    }

    const updatedPets = pets.map((pet, index) => (index === petIndex ? updatedPet : pet))
    localStorage.setItem("petpal_lost_pets", JSON.stringify(updatedPets))

    return updatedPet
  }

  return null
}

export function addActionLog(petId: string, action: string, adminName: string, notes?: string): boolean {
  if (typeof window !== "undefined") {
    const pets = getLostPets()
    const updatedPets = pets.map((pet) =>
      pet.id === petId
        ? {
            ...pet,
            actionLog: [
              ...pet.actionLog,
              {
                timestamp: new Date().toISOString(),
                action,
                adminName,
                notes,
              },
            ],
          }
        : pet,
    )
    localStorage.setItem("petpal_lost_pets", JSON.stringify(updatedPets))
    return true
  }
  return false
}

export function getLostPetStats() {
  const pets = getLostPets()
  const total = pets.length
  const lost = pets.filter((pet) => pet.status === "lost").length
  const sighted = pets.filter((pet) => pet.status === "sighted").length
  const found = pets.filter((pet) => pet.status === "found").length
  const reunited = pets.filter((pet) => pet.status === "reunited").length
  const critical = pets.filter((pet) => pet.priority === "critical").length

  return {
    total,
    lost,
    sighted,
    found,
    reunited,
    critical,
    successRate: total > 0 ? Math.round(((found + reunited) / total) * 100) : 0,
  }
}
