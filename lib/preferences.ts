"use client"

export interface UserPreferences {
  userId: string
  petTypes: string[]
  lifestyle: "active" | "calm" | "mixed"
  housingType: "apartment" | "house_no_yard" | "house_with_yard"
  hasAllergies: boolean
  experienceLevel: "beginner" | "intermediate" | "experienced"
  maxAge: number
  preferredSizes: string[]
  location: string
  maxDistance: number
  notifications: {
    newPets: boolean
    applicationUpdates: boolean
    messages: boolean
  }
}

const PREFERENCES_STORAGE_KEY = "petpal_preferences"

export function getUserPreferences(userId: string): UserPreferences | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    const preferences = stored ? JSON.parse(stored) : []
    return preferences.find((p: UserPreferences) => p.userId === userId) || null
  } catch (error) {
    console.error("Error loading preferences:", error)
    return null
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    const allPreferences = stored ? JSON.parse(stored) : []
    const index = allPreferences.findIndex((p: UserPreferences) => p.userId === preferences.userId)

    if (index !== -1) {
      allPreferences[index] = preferences
    } else {
      allPreferences.push(preferences)
    }

    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(allPreferences))
  } catch (error) {
    console.error("Error saving preferences:", error)
  }
}

export function getDefaultPreferences(userId: string): UserPreferences {
  return {
    userId,
    petTypes: ["Dog", "Cat"],
    lifestyle: "mixed",
    housingType: "apartment",
    hasAllergies: false,
    experienceLevel: "beginner",
    maxAge: 10,
    preferredSizes: ["Small", "Medium", "Large"],
    location: "Current Location",
    maxDistance: 50,
    notifications: {
      newPets: true,
      applicationUpdates: true,
      messages: true,
    },
  }
}
