import AsyncStorage from '@react-native-async-storage/async-storage';

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

/**
 * Initialize foster management data in AsyncStorage
 */
export async function initializeFosterManagementData(): Promise<void> {
  try {
    const familiesData = await AsyncStorage.getItem(FOSTER_FAMILIES_KEY);
    if (!familiesData) {
      await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(defaultFosterFamilies));
      console.log("Foster families data initialized successfully");
    }

    const assignmentsData = await AsyncStorage.getItem(FOSTER_ASSIGNMENTS_KEY);
    if (!assignmentsData) {
      await AsyncStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify([]));
      console.log("Foster assignments data initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize foster management data:", error);
  }
}

/**
 * Get all foster families
 */
export async function getFosterFamilies(): Promise<FosterFamily[]> {
  try {
    const stored = await AsyncStorage.getItem(FOSTER_FAMILIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(defaultFosterFamilies));
      return defaultFosterFamilies;
    }
  } catch (error) {
    console.error("Error loading foster families:", error);
    return defaultFosterFamilies;
  }
}

/**
 * Get a foster family by ID
 */
export async function getFosterFamilyById(id: string): Promise<FosterFamily | null> {
  try {
    const families = await getFosterFamilies();
    return families.find(family => family.id === id) || null;
  } catch (error) {
    console.error(`Error finding foster family ${id}:`, error);
    return null;
  }
}

/**
 * Add a new foster family
 */
export async function addFosterFamily(family: Omit<FosterFamily, "id" | "joinDate" | "totalFostered">): Promise<FosterFamily> {
  try {
    const families = await getFosterFamilies();
    const newFamily: FosterFamily = {
      ...family,
      id: `foster-${Date.now()}`,
      joinDate: new Date().toISOString().split("T")[0],
      totalFostered: 0,
    };

    const updatedFamilies = [...families, newFamily];
    await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(updatedFamilies));
    return newFamily;
  } catch (error) {
    console.error("Error adding foster family:", error);
    throw error;
  }
}

/**
 * Update an existing foster family
 */
export async function updateFosterFamily(id: string, updates: Partial<FosterFamily>): Promise<FosterFamily | null> {
  try {
    const families = await getFosterFamilies();
    const index = families.findIndex((family) => family.id === id);

    if (index !== -1) {
      const updatedFamily = { ...families[index], ...updates };
      families[index] = updatedFamily;
      await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families));
      return updatedFamily;
    }
    return null;
  } catch (error) {
    console.error(`Error updating foster family ${id}:`, error);
    return null;
  }
}

/**
 * Delete a foster family
 */
export async function deleteFosterFamily(id: string): Promise<boolean> {
  try {
    const families = await getFosterFamilies();
    const assignments = await getFosterAssignments();
    
    // Check if family has active assignments
    const hasActiveAssignments = assignments.some(
      assignment => assignment.fosterFamilyId === id && assignment.status === "Active"
    );
    
    if (hasActiveAssignments) {
      console.error("Cannot delete family with active assignments");
      return false;
    }
    
    const updatedFamilies = families.filter(family => family.id !== id);
    
    if (updatedFamilies.length === families.length) {
      // No family was removed
      return false;
    }
    
    await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(updatedFamilies));
    return true;
  } catch (error) {
    console.error(`Error deleting foster family ${id}:`, error);
    return false;
  }
}

/**
 * Get all foster assignments
 */
export async function getFosterAssignments(): Promise<FosterAssignment[]> {
  try {
    const stored = await AsyncStorage.getItem(FOSTER_ASSIGNMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading foster assignments:", error);
    return [];
  }
}

/**
 * Get foster assignments by family ID
 */
export async function getAssignmentsByFamily(familyId: string): Promise<FosterAssignment[]> {
  try {
    const assignments = await getFosterAssignments();
    return assignments.filter(assignment => assignment.fosterFamilyId === familyId);
  } catch (error) {
    console.error(`Error finding assignments for family ${familyId}:`, error);
    return [];
  }
}

/**
 * Get foster assignments by pet ID
 */
export async function getAssignmentsByPet(petId: string): Promise<FosterAssignment[]> {
  try {
    const assignments = await getFosterAssignments();
    return assignments.filter(assignment => assignment.petId === petId);
  } catch (error) {
    console.error(`Error finding assignments for pet ${petId}:`, error);
    return [];
  }
}

/**
 * Assign a pet to a foster family
 */
export async function assignPetToFoster(
  fosterFamilyId: string,
  petId: string,
  fosterFamilyName: string,
  petName: string,
): Promise<FosterAssignment> {
  try {
    const assignments = await getFosterAssignments();
    const newAssignment: FosterAssignment = {
      id: `assignment-${Date.now()}`,
      petId,
      petName,
      fosterFamilyId,
      fosterFamilyName,
      startDate: new Date().toISOString().split("T")[0],
      status: "Active",
      checkups: [],
    };

    // Update foster family status
    const families = await getFosterFamilies();
    const familyIndex = families.findIndex((f) => f.id === fosterFamilyId);
    
    if (familyIndex !== -1) {
      families[familyIndex].currentPets.push(petName);
      if (families[familyIndex].currentPets.length >= families[familyIndex].maxPets) {
        families[familyIndex].status = "Active";
      }

      await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families));
    }

    const updatedAssignments = [...assignments, newAssignment];
    await AsyncStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(updatedAssignments));
    
    return newAssignment;
  } catch (error) {
    console.error("Error assigning pet to foster family:", error);
    throw error;
  }
}

/**
 * Schedule a checkup for a foster assignment
 */
export async function scheduleCheckup(assignmentId: string, checkupData: Omit<FosterCheckup, "id">): Promise<FosterCheckup | null> {
  try {
    const assignments = await getFosterAssignments();
    const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId);

    if (assignmentIndex !== -1) {
      const newCheckup: FosterCheckup = {
        ...checkupData,
        id: `checkup-${Date.now()}`,
      };

      assignments[assignmentIndex].checkups.push(newCheckup);
      await AsyncStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments));
      return newCheckup;
    }
    return null;
  } catch (error) {
    console.error(`Error scheduling checkup for assignment ${assignmentId}:`, error);
    return null;
  }
}

/**
 * Update a foster checkup
 */
export async function updateCheckup(assignmentId: string, checkupId: string, updates: Partial<FosterCheckup>): Promise<FosterCheckup | null> {
  try {
    const assignments = await getFosterAssignments();
    const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId);

    if (assignmentIndex !== -1) {
      const checkupIndex = assignments[assignmentIndex].checkups.findIndex((c) => c.id === checkupId);
      
      if (checkupIndex !== -1) {
        const updatedCheckup = {
          ...assignments[assignmentIndex].checkups[checkupIndex],
          ...updates,
        };
        
        assignments[assignmentIndex].checkups[checkupIndex] = updatedCheckup;
        await AsyncStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments));
        return updatedCheckup;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error updating checkup ${checkupId} for assignment ${assignmentId}:`, error);
    return null;
  }
}

/**
 * Complete a foster assignment
 */
export async function completeFosterAssignment(assignmentId: string): Promise<FosterAssignment | null> {
  try {
    const assignments = await getFosterAssignments();
    const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId);

    if (assignmentIndex === -1) return null;
    
    // Update assignment status
    assignments[assignmentIndex].status = "Completed";
    assignments[assignmentIndex].endDate = new Date().toISOString().split("T")[0];

    // Update foster family
    const families = await getFosterFamilies();
    const familyIndex = families.findIndex((f) => f.id === assignments[assignmentIndex].fosterFamilyId);
    
    if (familyIndex !== -1) {
      const petName = assignments[assignmentIndex].petName;
      families[familyIndex].currentPets = families[familyIndex].currentPets.filter((p) => p !== petName);
      families[familyIndex].totalFostered += 1;

      if (families[familyIndex].currentPets.length < families[familyIndex].maxPets) {
        families[familyIndex].status = "Available";
      }

      await AsyncStorage.setItem(FOSTER_FAMILIES_KEY, JSON.stringify(families));
    }

    await AsyncStorage.setItem(FOSTER_ASSIGNMENTS_KEY, JSON.stringify(assignments));
    return assignments[assignmentIndex];
  } catch (error) {
    console.error(`Error completing foster assignment ${assignmentId}:`, error);
    return null;
  }
}

/**
 * Get statistics about foster program
 */
export async function getFosterStats() {
  try {
    const families = await getFosterFamilies();
    const assignments = await getFosterAssignments();
    
    const totalFamilies = families.length;
    const availableFamilies = families.filter(f => f.status === "Available").length;
    const activeFamilies = families.filter(f => f.status === "Active").length;
    const onBreakFamilies = families.filter(f => f.status === "On Break").length;
    
    const activeAssignments = assignments.filter(a => a.status === "Active").length;
    const completedAssignments = assignments.filter(a => a.status === "Completed").length;
    const totalAssignments = activeAssignments + completedAssignments;
    
    const totalCapacity = families.reduce((sum, family) => sum + family.maxPets, 0);
    const availableCapacity = families
      .filter(f => f.status !== "On Break")
      .reduce((sum, family) => sum + (family.maxPets - family.currentPets.length), 0);
    
    return {
      totalFamilies,
      availableFamilies,
      activeFamilies,
      onBreakFamilies,
      activeAssignments,
      completedAssignments,
      totalAssignments,
      totalCapacity,
      availableCapacity,
      utilizationRate: totalCapacity > 0 
        ? Math.round(((totalCapacity - availableCapacity) / totalCapacity) * 100) 
        : 0,
    };
  } catch (error) {
    console.error("Error calculating foster statistics:", error);
    return {
      totalFamilies: 0,
      availableFamilies: 0,
      activeFamilies: 0,
      onBreakFamilies: 0,
      activeAssignments: 0,
      completedAssignments: 0,
      totalAssignments: 0,
      totalCapacity: 0,
      availableCapacity: 0,
      utilizationRate: 0,
    };
  }
}

/**
 * Clear all foster management data (for testing/reset)
 */
export async function clearAllFosterData(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(FOSTER_FAMILIES_KEY);
    await AsyncStorage.removeItem(FOSTER_ASSIGNMENTS_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear foster management data:", error);
    return false;
  }
}
