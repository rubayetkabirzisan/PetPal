"use client"

export interface CareJournalEntry {
  id: string
  petId: string
  userId: string
  type: "health" | "feeding" | "grooming" | "general"
  title: string
  description: string
  date: string
  time: string
  data: {
    vetName?: string
    nextAppointment?: string
    weight?: string
    foodBrand?: string
    amount?: string
    groomingType?: string
  }
}

export interface CareEntry {
  id: string
  petName: string
  type: "feeding" | "medical" | "exercise" | "grooming" | "training" | "vet_visit" | "other"
  title: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

const CARE_JOURNAL_STORAGE_KEY = "petpal_care_journal"
const CARE_ENTRIES_KEY = "petpal_care_entries"

// Original Care Journal Functions
export function getCareJournalEntries(petId: string): CareJournalEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(CARE_JOURNAL_STORAGE_KEY)
    const entries = stored ? JSON.parse(stored) : []
    return entries
      .filter((entry: CareJournalEntry) => entry.petId === petId)
      .sort(
        (a: CareJournalEntry, b: CareJournalEntry) =>
          new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime(),
      )
  } catch (error) {
    console.error("Error loading care journal entries:", error)
    return []
  }
}

export function addCareJournalEntry(
  entry: Omit<CareJournalEntry, "id" | "date" | "time" | "userId">,
): CareJournalEntry {
  const entries = getAllCareJournalEntries()
  const newEntry: CareJournalEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    userId: "demo-user", // In a real app, this would come from auth
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }

  entries.push(newEntry)

  if (typeof window !== "undefined") {
    localStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries))
  }

  return newEntry
}

export function updateCareJournalEntry(
  id: string,
  updates: Omit<CareJournalEntry, "id" | "date" | "time" | "userId">,
): CareJournalEntry | null {
  const entries = getAllCareJournalEntries()
  const index = entries.findIndex((entry) => entry.id === id)

  if (index !== -1) {
    entries[index] = {
      ...entries[index],
      ...updates,
      id: entries[index].id,
      userId: entries[index].userId,
      date: entries[index].date,
      time: entries[index].time,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries))
    }

    return entries[index]
  }

  return null
}

export function deleteCareJournalEntry(id: string): boolean {
  const entries = getAllCareJournalEntries()
  const index = entries.findIndex((entry) => entry.id === id)

  if (index !== -1) {
    entries.splice(index, 1)

    if (typeof window !== "undefined") {
      localStorage.setItem(CARE_JOURNAL_STORAGE_KEY, JSON.stringify(entries))
    }

    return true
  }

  return false
}

function getAllCareJournalEntries(): CareJournalEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(CARE_JOURNAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading all care journal entries:", error)
    return []
  }
}

// New Care Entry Functions (for the care journal page)
export function addCareEntry(entry: Omit<CareEntry, "id" | "createdAt" | "updatedAt">): CareEntry {
  if (typeof window === "undefined") {
    return {
      id: "",
      createdAt: "",
      updatedAt: "",
      petName: "",
      type: "other",
      title: "",
      description: "",
      date: "",
    }
  }

  const id = Math.random().toString(36).substr(2, 9)
  const createdAt = new Date().toISOString()
  const newEntry: CareEntry = {
    id,
    createdAt,
    updatedAt: createdAt,
    petName: entry.petName,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    date: entry.date,
  }

  const existingEntries = getCareEntries()
  localStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify([...existingEntries, newEntry]))

  return newEntry
}

export function getCareEntries(): CareEntry[] {
  if (typeof window === "undefined") return []

  const storedEntries = localStorage.getItem(CARE_ENTRIES_KEY)
  if (!storedEntries) return []

  try {
    const parsedEntries = JSON.parse(storedEntries)
    return Array.isArray(parsedEntries) ? parsedEntries : []
  } catch (error) {
    console.error("Error parsing care entries from localStorage:", error)
    return []
  }
}

export function updateCareEntry(id: string, updates: Partial<CareEntry>): void {
  if (typeof window === "undefined") return

  const entries = getCareEntries()
  const updatedEntries = entries.map((entry) =>
    entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry,
  )

  localStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify(updatedEntries))
}

export function deleteCareEntry(id: string): void {
  if (typeof window === "undefined") return

  const entries = getCareEntries()
  const filteredEntries = entries.filter((entry) => entry.id !== id)

  localStorage.setItem(CARE_ENTRIES_KEY, JSON.stringify(filteredEntries))
}

export function getCareEntry(id: string): CareEntry | null {
  const entries = getCareEntries()
  return entries.find((entry) => entry.id === id) || null
}
