import AsyncStorage from '@react-native-async-storage/async-storage';

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
  photos?: string[] // Changed from File[] to string[] to store URLs or base64 images
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
  photos?: string[] // Changed from File[] to string[] to store URLs or base64 images
  timestamp: string
}

export interface ActionLog {
  timestamp: string
  action: string
  adminName: string
  notes?: string
}

const LOST_PETS_STORAGE_KEY = "petpal_lost_pets";

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

/**
 * Initializes lost pets data in AsyncStorage
 */
export async function initializeLostPetsData(): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(LOST_PETS_STORAGE_KEY);
    if (!existingData) {
      await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(mockLostPets));
      console.log("Lost pets data initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize lost pets data:", error);
  }
}

/**
 * Gets all lost pets from storage
 */
export async function getLostPets(): Promise<LostPet[]> {
  try {
    const stored = await AsyncStorage.getItem(LOST_PETS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading lost pets:", error);
  }
  return mockLostPets;
}

/**
 * Gets a specific lost pet by ID
 */
export async function getLostPetById(id: string): Promise<LostPet | undefined> {
  try {
    const pets = await getLostPets();
    return pets.find(pet => pet.id === id);
  } catch (error) {
    console.error("Error finding lost pet:", error);
    return undefined;
  }
}

/**
 * Reports a new lost pet
 */
export async function reportLostPet(petData: {
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
  photos?: string[]
}): Promise<LostPet> {
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
  };

  try {
    const pets = await getLostPets();
    const updatedPets = [newPet, ...pets];
    await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(updatedPets));
  } catch (error) {
    console.error("Error saving lost pet report:", error);
  }

  return newPet;
}

/**
 * Reports a sighting of a lost pet
 */
export async function reportSighting(sightingData: {
  petId: string
  location: string
  date: string
  time?: string
  description: string
  reporterName: string
  reporterPhone?: string
  reporterEmail?: string
  photos?: string[]
}): Promise<Sighting> {
  const newSighting: Sighting = {
    id: `sight-${Date.now()}`,
    ...sightingData,
    timestamp: new Date().toISOString(),
  };

  try {
    const pets = await getLostPets();
    const updatedPets = pets.map((pet) =>
      pet.id === sightingData.petId
        ? {
            ...pet,
            // Update status if currently lost
            status: pet.status === 'lost' ? 'sighted' : pet.status,
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
    );
    await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(updatedPets));
  } catch (error) {
    console.error("Error saving sighting report:", error);
  }

  return newSighting;
}

/**
 * Updates the status of a lost pet
 */
export async function updateLostPetStatus(
  petId: string,
  newStatus: LostPet["status"],
  adminName: string,
  notes?: string,
): Promise<LostPet | null> {
  try {
    const pets = await getLostPets();
    const petIndex = pets.findIndex((pet) => pet.id === petId);

    if (petIndex === -1) return null;

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
    };

    const updatedPets = pets.map((pet, index) => (index === petIndex ? updatedPet : pet));
    await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(updatedPets));

    return updatedPet;
  } catch (error) {
    console.error("Error updating lost pet status:", error);
    return null;
  }
}

/**
 * Updates the priority of a lost pet
 */
export async function updateLostPetPriority(
  petId: string,
  newPriority: LostPet["priority"],
  adminName: string,
  notes?: string,
): Promise<LostPet | null> {
  try {
    const pets = await getLostPets();
    const petIndex = pets.findIndex((pet) => pet.id === petId);

    if (petIndex === -1) return null;

    const updatedPet = {
      ...pets[petIndex],
      priority: newPriority,
      actionLog: [
        ...pets[petIndex].actionLog,
        {
          timestamp: new Date().toISOString(),
          action: `Priority Updated to ${newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}`,
          adminName,
          notes,
        },
      ],
    };

    const updatedPets = pets.map((pet, index) => (index === petIndex ? updatedPet : pet));
    await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(updatedPets));

    return updatedPet;
  } catch (error) {
    console.error("Error updating lost pet priority:", error);
    return null;
  }
}

/**
 * Adds an action log entry to a lost pet's record
 */
export async function addActionLog(petId: string, action: string, adminName: string, notes?: string): Promise<boolean> {
  try {
    const pets = await getLostPets();
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
    );
    await AsyncStorage.setItem(LOST_PETS_STORAGE_KEY, JSON.stringify(updatedPets));
    return true;
  } catch (error) {
    console.error("Error adding action log:", error);
    return false;
  }
}

/**
 * Gets statistics about lost pets
 */
export async function getLostPetStats() {
  try {
    const pets = await getLostPets();
    const total = pets.length;
    const lost = pets.filter((pet) => pet.status === "lost").length;
    const sighted = pets.filter((pet) => pet.status === "sighted").length;
    const found = pets.filter((pet) => pet.status === "found").length;
    const reunited = pets.filter((pet) => pet.status === "reunited").length;
    const critical = pets.filter((pet) => pet.priority === "critical").length;
    const bySpecies = pets.reduce((acc: Record<string, number>, pet) => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      lost,
      sighted,
      found,
      reunited,
      critical,
      bySpecies,
      successRate: total > 0 ? Math.round(((found + reunited) / total) * 100) : 0,
    };
  } catch (error) {
    console.error("Error calculating lost pet statistics:", error);
    return {
      total: 0,
      lost: 0,
      sighted: 0,
      found: 0,
      reunited: 0,
      critical: 0,
      bySpecies: {},
      successRate: 0,
    };
  }
}

/**
 * Search for lost pets based on criteria
 */
export async function searchLostPets(criteria: {
  species?: string;
  status?: LostPet["status"];
  priority?: LostPet["priority"];
  location?: string;
  dateRange?: { from: string; to: string };
  searchText?: string; // Added search text support
}): Promise<LostPet[]> {
  try {
    const pets = await getLostPets();
    return pets.filter(pet => {
      // Match all provided criteria
      if (criteria.species && pet.species.toLowerCase() !== criteria.species.toLowerCase()) return false;
      if (criteria.status && pet.status !== criteria.status) return false;
      if (criteria.priority && pet.priority !== criteria.priority) return false;
      if (criteria.location && !pet.lastSeenLocation.toLowerCase().includes(criteria.location.toLowerCase())) return false;
      
      // Date range filtering
      if (criteria.dateRange) {
        const petDate = new Date(pet.lastSeenDate).getTime();
        const fromDate = new Date(criteria.dateRange.from).getTime();
        const toDate = new Date(criteria.dateRange.to).getTime();
        
        if (petDate < fromDate || petDate > toDate) return false;
      }
      
      // Text search across multiple fields
      if (criteria.searchText) {
        const searchText = criteria.searchText.toLowerCase();
        const searchFields = [
          pet.name, 
          pet.breed, 
          pet.description, 
          pet.lastSeenLocation,
          pet.contactName
        ].map(field => field.toLowerCase());
        
        if (!searchFields.some(field => field.includes(searchText))) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error("Error searching lost pets:", error);
    return [];
  }
}

/**
 * Delete all lost pets data (for testing/reset)
 */
export async function clearAllLostPetsData(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(LOST_PETS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear lost pets data:', error);
    return false;
  }
}

/**
 * Get lost pets by species statistics
 */
export async function getLostPetSpeciesStats(): Promise<Record<string, number>> {
  try {
    const pets = await getLostPets();
    const bySpecies = pets.reduce((acc: Record<string, number>, pet) => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
      return acc;
    }, {});
    
    return bySpecies;
  } catch (error) {
    console.error("Error calculating lost pet species statistics:", error);
    return {};
  }
}
