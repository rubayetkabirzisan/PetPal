"use client"

export interface Reminder {
  id: string
  petId: string
  userId: string
  type: "vaccine" | "grooming" | "medication" | "checkup"
  title: string
  description: string
  dueDate: string
  recurring: boolean
  recurringInterval?: "weekly" | "monthly" | "yearly"
  completed: boolean
  completedDate?: string
  createdDate: string
}

const REMINDERS_STORAGE_KEY = "petpal_reminders"
const ADOPTED_PETS_STORAGE_KEY = "petpal_adopted_pets"

// Initialize default adopted pets for demo
const defaultAdoptedPets = [
  {
    id: "1",
    name: "Buddy",
    breed: "Golden Retriever",
    age: "2 years",
    gender: "Male",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
    adoptedDate: "2024-01-15",
    adopterId: "demo-user",
    shelter: "Happy Paws Shelter",
    microchipId: "123456789",
    vaccinated: true,
    neutered: true,
    weight: "28 kg",
    color: "Golden",
  },
  {
    id: "2",
    name: "Luna",
    breed: "Persian Cat",
    age: "1 year",
    gender: "Female",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
    adoptedDate: "2024-02-01",
    adopterId: "demo-user",
    shelter: "Feline Friends Foster",
    microchipId: "987654321",
    vaccinated: true,
    neutered: false,
    weight: "4 kg",
    color: "White",
  },
]

// Initialize default reminders
const defaultReminders: Reminder[] = [
  {
    id: "rem-1",
    petId: "1",
    userId: "demo-user",
    type: "vaccine",
    title: "Annual Vaccination",
    description: "DHPP and Rabies vaccination due",
    dueDate: "2024-12-30",
    recurring: true,
    recurringInterval: "yearly",
    completed: false,
    createdDate: "2024-01-15",
  },
  {
    id: "rem-2",
    petId: "1",
    userId: "demo-user",
    type: "grooming",
    title: "Professional Grooming",
    description: "Full grooming session including nail trimming",
    dueDate: "2024-12-28",
    recurring: true,
    recurringInterval: "monthly",
    completed: false,
    createdDate: "2024-01-15",
  },
  {
    id: "rem-3",
    petId: "2",
    userId: "demo-user",
    type: "checkup",
    title: "Health Checkup",
    description: "Annual health examination",
    dueDate: "2024-12-25",
    recurring: true,
    recurringInterval: "yearly",
    completed: false,
    createdDate: "2024-02-01",
  },
]

export function getAdoptedPets(userId: string): any[] {
  if (typeof window === "undefined") return defaultAdoptedPets

  try {
    const stored = localStorage.getItem(ADOPTED_PETS_STORAGE_KEY)
    if (stored) {
      const pets = JSON.parse(stored)
      return pets.filter((pet: any) => pet.adopterId === userId)
    } else {
      localStorage.setItem(ADOPTED_PETS_STORAGE_KEY, JSON.stringify(defaultAdoptedPets))
      return defaultAdoptedPets.filter((pet) => pet.adopterId === userId)
    }
  } catch (error) {
    console.error("Error loading adopted pets:", error)
    return defaultAdoptedPets.filter((pet) => pet.adopterId === userId)
  }
}

export function getReminders(userId: string): Reminder[] {
  if (typeof window === "undefined") return defaultReminders.filter((r) => r.userId === userId)

  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY)
    if (stored) {
      const reminders = JSON.parse(stored)
      return reminders
        .filter((reminder: Reminder) => reminder.userId === userId)
        .sort((a: Reminder, b: Reminder) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    } else {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(defaultReminders))
      return defaultReminders
        .filter((r) => r.userId === userId)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }
  } catch (error) {
    console.error("Error loading reminders:", error)
    return defaultReminders.filter((r) => r.userId === userId)
  }
}

export function addReminder(reminder: Omit<Reminder, "id" | "completed" | "createdDate">): Reminder {
  const reminders = getAllReminders()
  const newReminder: Reminder = {
    ...reminder,
    id: Math.random().toString(36).substr(2, 9),
    completed: false,
    createdDate: new Date().toISOString().split("T")[0],
  }

  reminders.push(newReminder)

  if (typeof window !== "undefined") {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders))
  }

  return newReminder
}

export function updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
  const reminders = getAllReminders()
  const index = reminders.findIndex((reminder) => reminder.id === id)

  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...updates }

    // If marking as completed, set completion date
    if (updates.completed === true && !reminders[index].completedDate) {
      reminders[index].completedDate = new Date().toISOString().split("T")[0]
    }

    // If marking as incomplete, remove completion date
    if (updates.completed === false) {
      delete reminders[index].completedDate
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders))
    }

    return reminders[index]
  }

  return null
}

export function deleteReminder(id: string): boolean {
  const reminders = getAllReminders()
  const index = reminders.findIndex((reminder) => reminder.id === id)

  if (index !== -1) {
    reminders.splice(index, 1)

    if (typeof window !== "undefined") {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders))
    }

    return true
  }

  return false
}

export function getReminderStatus(reminder: Reminder): "completed" | "overdue" | "upcoming" | "future" {
  if (reminder.completed) return "completed"

  const today = new Date()
  const dueDate = new Date(reminder.dueDate)
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "overdue"
  if (diffDays <= 7) return "upcoming"
  return "future"
}

function getAllReminders(): Reminder[] {
  if (typeof window === "undefined") return defaultReminders

  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(defaultReminders))
      return defaultReminders
    }
  } catch (error) {
    console.error("Error loading all reminders:", error)
    return defaultReminders
  }
}
