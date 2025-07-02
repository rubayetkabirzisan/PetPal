"use client"

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

export function getAdoptionHistory(userId: string): AdoptionHistoryEntry[] {
  if (typeof window === "undefined") return defaultHistory.filter((h) => h.userId === userId)

  try {
    const stored = localStorage.getItem(ADOPTION_HISTORY_KEY)
    if (stored) {
      const history = JSON.parse(stored)
      return history.filter((entry: AdoptionHistoryEntry) => entry.userId === userId)
    } else {
      localStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(defaultHistory))
      return defaultHistory.filter((h) => h.userId === userId)
    }
  } catch (error) {
    console.error("Error loading adoption history:", error)
    return defaultHistory.filter((h) => h.userId === userId)
  }
}

export function getApplicationById(applicationId: string, userId: string): AdoptionHistoryEntry | null {
  const history = getAdoptionHistory(userId)
  return history.find((entry) => entry.applicationId === applicationId) || null
}

export function addToHistory(entry: Omit<AdoptionHistoryEntry, "id">): AdoptionHistoryEntry {
  const history = getAllHistory()
  const newEntry: AdoptionHistoryEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
  }

  history.push(newEntry)

  if (typeof window !== "undefined") {
    localStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(history))
  }

  return newEntry
}

export function updateHistoryEntry(id: string, updates: Partial<AdoptionHistoryEntry>): AdoptionHistoryEntry | null {
  const history = getAllHistory()
  const index = history.findIndex((entry) => entry.id === id)

  if (index !== -1) {
    history[index] = { ...history[index], ...updates }

    if (typeof window !== "undefined") {
      localStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(history))
    }

    return history[index]
  }

  return null
}

function getAllHistory(): AdoptionHistoryEntry[] {
  if (typeof window === "undefined") return defaultHistory

  try {
    const stored = localStorage.getItem(ADOPTION_HISTORY_KEY)
    return stored ? JSON.parse(stored) : defaultHistory
  } catch (error) {
    console.error("Error loading all history:", error)
    return defaultHistory
  }
}
