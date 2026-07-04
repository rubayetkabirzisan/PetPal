import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CareJournalEntry {
  id: string;
  petId: string;
  userId: string;
  type: "health" | "feeding" | "grooming" | "general";
  title: string;
  description: string;
  date: string;
  time: string;
  data: {
    vetName?: string;
    nextAppointment?: string;
    weight?: string;
    foodBrand?: string;
    amount?: string;
    groomingType?: string;
  };
}

export interface CareEntry {
  id: string;
  petName: string;
  type: "feeding" | "medical" | "exercise" | "grooming" | "training" | "vet_visit" | "other";
  title: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const CARE_JOURNAL_STORAGE_KEY = "petpal_care_journal";
const CARE_ENTRIES_KEY = "petpal_care_entries";

// Sample data for demo purposes
const sampleCareJournalEntries: CareJournalEntry[] = [
  {
    id: "cje-001",
    petId: "1",
    userId: "user-1",
    type: "health",
    title: "Annual Checkup",
    description: "Buddy had his annual checkup. Everything looks good!",
    date: "2025-06-01",
    time: "10:30 AM",
    data: {
      vetName: "Dr. Smith",
      nextAppointment: "2026-06-01",
      weight: "65 lbs"
    }
  },
  {
    id: "cje-002",
    petId: "1",
    userId: "user-1",
    type: "feeding",
    title: "Diet Change",
    description: "Switching Buddy to a grain-free diet",
    date: "2025-06-15",
    time: "08:00 AM",
    data: {
      foodBrand: "Natural Balance",
      amount: "2 cups twice daily"
    }
  }
];

const sampleCareEntries: CareEntry[] = [
  {
    id: "ce-001",
    petName: "Buddy",
    type: "medical",
    title: "Vaccination",
    description: "Rabies and distemper boosters",
    date: "2025-06-05",
    createdAt: "2025-06-05T09:00:00Z",
    updatedAt: "2025-06-05T09:00:00Z"
  },
  {
    id: "ce-002",
    petName: "Buddy",
    type: "grooming",
    title: "Full Grooming",
    description: "Bath, haircut, nail trim, and ear cleaning",
    date: "2025-06-20",
    createdAt: "2025-06-20T11:00:00Z",
    updatedAt: "2025-06-20T11:00:00Z"
  }
];

/**
 * Initialize care journal data with sample entries
 */
export async function initializeCareJournal(): Promise<void> {
  try {
    const existingJournalEntries = await AsyncStorage.getItem(CARE_JOURNAL_STORAGE_KEY);
    const existingCareEntries = await AsyncStorage.getItem(CARE_ENTRIES_KEY);

    if (!existingJournalEntries) {
      await AsyncStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(sampleCareJournalEntries));
      console.log("Initialized sample care journal entries");
    }

    if (!existingCareEntries) {
      await AsyncStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify(sampleCareEntries));
      console.log("Initialized sample care entries");
    }
  } catch (error) {
    console.error("Error initializing care journal data:", error);
  }
}

// Care Journal Entry Functions

/**
 * Get all care journal entries for a specific pet
 */
export async function getCareJournalEntries(petId: string): Promise<CareJournalEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(CARE_JOURNAL_STORAGE_KEY);
    const entries = stored ? JSON.parse(stored) : [];
    return entries
      .filter((entry: CareJournalEntry) => entry.petId === petId)
      .sort(
        (a: CareJournalEntry, b: CareJournalEntry) =>
          new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime(),
      );
  } catch (error) {
    console.error("Error loading care journal entries:", error);
    return [];
  }
}

/**
 * Add a new care journal entry
 */
export async function addCareJournalEntry(
  entry: Omit<CareJournalEntry, "id" | "date" | "time" | "userId">,
  userId: string = "demo-user"
): Promise<CareJournalEntry> {
  try {
    const entries = await getAllCareJournalEntries();
    const newEntry: CareJournalEntry = {
      ...entry,
      id: `cje-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    entries.push(newEntry);
    await AsyncStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error("Error adding care journal entry:", error);
    throw error;
  }
}

/**
 * Update an existing care journal entry
 */
export async function updateCareJournalEntry(
  id: string,
  updates: Partial<Omit<CareJournalEntry, "id" | "userId">>
): Promise<CareJournalEntry | null> {
  try {
    const entries = await getAllCareJournalEntries();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        ...updates,
        // Keep original fields
        id: entries[index].id,
        userId: entries[index].userId,
      };

      await AsyncStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      return entries[index];
    }

    return null;
  } catch (error) {
    console.error("Error updating care journal entry:", error);
    return null;
  }
}

/**
 * Delete a care journal entry
 */
export async function deleteCareJournalEntry(id: string): Promise<boolean> {
  try {
    const entries = await getAllCareJournalEntries();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index !== -1) {
      entries.splice(index, 1);
      await AsyncStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error deleting care journal entry:", error);
    return false;
  }
}

/**
 * Get all care journal entries
 */
export async function getAllCareJournalEntries(): Promise<CareJournalEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(CARE_JOURNAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading all care journal entries:", error);
    return [];
  }
}

/**
 * Get care journal entries by type
 */
export async function getCareJournalEntriesByType(type: CareJournalEntry['type']): Promise<CareJournalEntry[]> {
  try {
    const entries = await getAllCareJournalEntries();
    return entries.filter(entry => entry.type === type);
  } catch (error) {
    console.error(`Error getting care journal entries by type ${type}:`, error);
    return [];
  }
}

/**
 * Search care journal entries
 */
export async function searchCareJournalEntries(
  query: string, 
  filters: { petId?: string; type?: CareJournalEntry['type']; dateFrom?: string; dateTo?: string }
): Promise<CareJournalEntry[]> {
  try {
    let entries = await getAllCareJournalEntries();
    const lowercaseQuery = query.toLowerCase();
    
    // Apply search query
    if (query) {
      entries = entries.filter(entry => 
        entry.title.toLowerCase().includes(lowercaseQuery) || 
        entry.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply filters
    if (filters.petId) {
      entries = entries.filter(entry => entry.petId === filters.petId);
    }
    
    if (filters.type) {
      entries = entries.filter(entry => entry.type === filters.type);
    }
    
    if (filters.dateFrom) {
      entries = entries.filter(entry => new Date(entry.date) >= new Date(filters.dateFrom as string));
    }
    
    if (filters.dateTo) {
      entries = entries.filter(entry => new Date(entry.date) <= new Date(filters.dateTo as string));
    }
    
    return entries.sort((a, b) => 
      new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
    );
  } catch (error) {
    console.error("Error searching care journal entries:", error);
    return [];
  }
}

// Care Entry Functions (for the care journal page)

/**
 * Add a new care entry
 */
export async function addCareEntry(entry: Omit<CareEntry, "id" | "createdAt" | "updatedAt">): Promise<CareEntry> {
  try {
    const id = `ce-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const newEntry: CareEntry = {
      id,
      createdAt,
      updatedAt: createdAt,
      petName: entry.petName,
      type: entry.type,
      title: entry.title,
      description: entry.description,
      date: entry.date,
    };

    const existingEntries = await getCareEntries();
    await AsyncStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify([...existingEntries, newEntry]));

    return newEntry;
  } catch (error) {
    console.error("Error adding care entry:", error);
    return {
      id: "",
      createdAt: "",
      updatedAt: "",
      petName: "",
      type: "other",
      title: "",
      description: "",
      date: "",
    };
  }
}

/**
 * Get all care entries
 */
export async function getCareEntries(): Promise<CareEntry[]> {
  try {
    const storedEntries = await AsyncStorage.getItem(CARE_ENTRIES_KEY);
    if (!storedEntries) return [];

    const parsedEntries = JSON.parse(storedEntries);
    return Array.isArray(parsedEntries) ? parsedEntries : [];
  } catch (error) {
    console.error("Error getting care entries:", error);
    return [];
  }
}

/**
 * Update an existing care entry
 */
export async function updateCareEntry(id: string, updates: Partial<CareEntry>): Promise<boolean> {
  try {
    const entries = await getCareEntries();
    const updatedEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry,
    );

    await AsyncStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error("Error updating care entry:", error);
    return false;
  }
}

/**
 * Delete a care entry
 */
export async function deleteCareEntry(id: string): Promise<boolean> {
  try {
    const entries = await getCareEntries();
    const filteredEntries = entries.filter((entry) => entry.id !== id);

    await AsyncStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error("Error deleting care entry:", error);
    return false;
  }
}

/**
 * Get a specific care entry by ID
 */
export async function getCareEntry(id: string): Promise<CareEntry | null> {
  try {
    const entries = await getCareEntries();
    return entries.find((entry) => entry.id === id) || null;
  } catch (error) {
    console.error("Error getting care entry by ID:", error);
    return null;
  }
}

/**
 * Get care entries for a specific pet
 */
export async function getCareEntriesByPet(petName: string): Promise<CareEntry[]> {
  try {
    const entries = await getCareEntries();
    return entries.filter(entry => entry.petName === petName);
  } catch (error) {
    console.error("Error getting care entries by pet name:", error);
    return [];
  }
}

/**
 * Get care entries by type
 */
export async function getCareEntriesByType(type: CareEntry['type']): Promise<CareEntry[]> {
  try {
    const entries = await getCareEntries();
    return entries.filter(entry => entry.type === type);
  } catch (error) {
    console.error("Error getting care entries by type:", error);
    return [];
  }
}

/**
 * Get care entries statistics
 */
export async function getCareEntryStats(): Promise<{
  totalCount: number;
  entriesByType: Record<string, number>;
  entriesByMonth: Record<string, number>;
}> {
  try {
    const entries = await getCareEntries();
    const entriesByType: Record<string, number> = {};
    const entriesByMonth: Record<string, number> = {};
    
    entries.forEach(entry => {
      // Count by type
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
      
      // Count by month (format: YYYY-MM)
      const month = entry.date.substring(0, 7);
      entriesByMonth[month] = (entriesByMonth[month] || 0) + 1;
    });
    
    return {
      totalCount: entries.length,
      entriesByType,
      entriesByMonth
    };
  } catch (error) {
    console.error("Error getting care entry statistics:", error);
    return {
      totalCount: 0,
      entriesByType: {},
      entriesByMonth: {}
    };
  }
}
