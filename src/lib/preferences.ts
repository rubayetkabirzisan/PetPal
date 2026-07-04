import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
    const preferences = stored ? JSON.parse(stored) : []
    return preferences.find((p: UserPreferences) => p.userId === userId) || null
  } catch (error) {
    console.error("Error loading preferences:", error)
    return null
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
    const allPreferences = stored ? JSON.parse(stored) : []
    const index = allPreferences.findIndex((p: UserPreferences) => p.userId === preferences.userId)

    if (index !== -1) {
      allPreferences[index] = preferences
    } else {
      allPreferences.push(preferences)
    }

    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(allPreferences))
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

/**
 * Helper function to initialize preferences for a new user
 * @param userId The ID of the user to initialize preferences for
 */
export async function initializeUserPreferences(userId: string): Promise<UserPreferences> {
  const defaultPrefs = getDefaultPreferences(userId);
  await saveUserPreferences(defaultPrefs);
  return defaultPrefs;
}

/**
 * Clear all user preferences (useful for logout)
 * @param userId The ID of the user whose preferences to clear
 */
export async function clearUserPreferences(userId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      const allPreferences = JSON.parse(stored);
      const filteredPreferences = allPreferences.filter(
        (p: UserPreferences) => p.userId !== userId
      );
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(filteredPreferences));
    }
  } catch (error) {
    console.error("Error clearing user preferences:", error);
  }
}
