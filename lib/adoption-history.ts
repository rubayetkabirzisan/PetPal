import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdoptionHistoryEntry {
  id: string
  petId: string
  petName: string
  petBreed: string
  petImage: string
  userId: string
  applicationDate: string
  adoptionDate?: string
  status: "pending" | "approved" | "rejected" | "adopted"
  shelterName: string
  shelterContact: string
  notes?: string
  applicationId: string
}

const ADOPTION_HISTORY_KEY = "petpal_adoption_history"

// Initialize with demo data
const defaultHistory: AdoptionHistoryEntry[] = [
  {
    id: "hist-1",
    petId: "1",
    petName: "Buddy",
    petBreed: "Golden Retriever",
    petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
    userId: "demo-user",
    applicationDate: "2024-01-15",
    adoptionDate: "2024-02-01",
    status: "adopted",
    shelterName: "Happy Paws Shelter",
    shelterContact: "(555) 123-4567",
    notes: "Wonderful family dog, great with kids",
    applicationId: "app-1",
  },
  {
    id: "hist-2",
    petId: "2",
    petName: "Luna",
    petBreed: "Siamese Mix",
    petImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    userId: "demo-user",
    applicationDate: "2024-02-20",
    status: "approved",
    shelterName: "Feline Friends Rescue",
    shelterContact: "(555) 987-6543",
    notes: "Application approved, waiting for pickup",
    applicationId: "app-2",
  },
]

/**
 * Get adoption history for a specific user
 */
export async function getAdoptionHistory(userId: string): Promise<AdoptionHistoryEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTION_HISTORY_KEY)
    if (stored) {
      const history = JSON.parse(stored)
      return history.filter((entry: AdoptionHistoryEntry) => entry.userId === userId)
    } else {
      await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(defaultHistory))
      return defaultHistory.filter((h) => h.userId === userId)
    }
  } catch (error) {
    console.error("Error loading adoption history:", error)
    return defaultHistory.filter((h) => h.userId === userId)
  }
}

/**
 * Get application by ID for a specific user
 */
export async function getApplicationById(applicationId: string, userId: string): Promise<AdoptionHistoryEntry | null> {
  const history = await getAdoptionHistory(userId)
  return history.find((entry) => entry.applicationId === applicationId) || null
}

/**
 * Add a new entry to adoption history
 */
export async function addToHistory(entry: Omit<AdoptionHistoryEntry, "id">): Promise<AdoptionHistoryEntry> {
  const history = await getAllHistory()
  const newEntry: AdoptionHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  }

  history.push(newEntry)
  await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(history))
  return newEntry
}

/**
 * Update an existing history entry
 */
export async function updateHistoryEntry(
  id: string, 
  updates: Partial<AdoptionHistoryEntry>
): Promise<AdoptionHistoryEntry | null> {
  const history = await getAllHistory()
  const index = history.findIndex((entry) => entry.id === id)

  if (index !== -1) {
    history[index] = { ...history[index], ...updates }
    await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(history))
    return history[index]
  }

  return null
}

/**
 * Get all adoption history entries
 */
async function getAllHistory(): Promise<AdoptionHistoryEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTION_HISTORY_KEY)
    return stored ? JSON.parse(stored) : defaultHistory
  } catch (error) {
    console.error("Error loading all history:", error)
    return defaultHistory
  }
}

/**
 * Initialize demo adoption history data
 */
export async function initializeAdoptionHistory(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTION_HISTORY_KEY)
    if (!stored) {
      await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(defaultHistory))
      console.log("Initialized demo adoption history data")
    }
  } catch (error) {
    console.error("Error initializing adoption history:", error)
  }
}
