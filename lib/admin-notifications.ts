import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationTemplate {
  type: "announcement" | "reminder" | "update"
  title: string
  message: string
  priority: "low" | "normal" | "high"
  scheduledDate?: string
  senderName: string
}

export interface Adopter {
  id: string
  name: string
  email: string
  adoptedPets: string[]
  joinDate: string
}
// Storage keys

const ADOPTERS_STORAGE_KEY = "petpal_adopters"
const NOTIFICATIONS_STORAGE_KEY = "petpal_notifications"

// Default adopters for demo
const defaultAdopters: Adopter[] = [
  {
    id: "demo-user",
    name: "Demo User",
    email: "demo@example.com",
    adoptedPets: ["1", "2"],
    joinDate: "2024-01-15",
  },
  {
    id: "user2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    adoptedPets: ["3"],
    joinDate: "2024-01-20",
  },
  {
    id: "user3",
    name: "Mike Chen",
    email: "mike@example.com",
    adoptedPets: [],
    joinDate: "2024-02-01",
  },
  {
    id: "user4",
    name: "Emily Davis",
    email: "emily@example.com",
    adoptedPets: ["4"],
    joinDate: "2024-02-05",
  },
]

/**
 * Get all adopters from storage
 */
export async function getAdopters(): Promise<Adopter[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(ADOPTERS_STORAGE_KEY, JSON.stringify(defaultAdopters))
      return defaultAdopters
    }
  } catch (error) {
    console.error("Error loading adopters:", error)
    return defaultAdopters
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[], 
  notification: NotificationTemplate
): Promise<boolean> {
  try {
    // Get existing notifications or create empty array if none exist
    const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    const existingNotifications = storedNotifications ? JSON.parse(storedNotifications) : []

    // Create a notification for each user
    userIds.forEach((userId) => {
      const newNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId,
        userType: "adopter",
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.scheduledDate || new Date().toISOString(),
        read: false,
        data: {
          priority: notification.priority,
          senderName: notification.senderName,
        },
      }
      existingNotifications.push(newNotification)
    })

    // Save updated notifications
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications))
    return true
  } catch (error) {
    console.error("Error sending notifications:", error)
    return false
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<any[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (stored) {
      const notifications = JSON.parse(stored)
      return notifications.filter((n: any) => n.userId === userId)
    }
    return []
  } catch (error) {
    console.error("Error getting user notifications:", error)
    return []
  }
}

/**
 * Initialize demo adopter data
 */
export async function initializeAdopters(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTERS_STORAGE_KEY)
    if (!stored) {
      await AsyncStorage.setItem(ADOPTERS_STORAGE_KEY, JSON.stringify(defaultAdopters))
      console.log("Initialized demo adopter data")
    }
  } catch (error) {
    console.error("Error initializing adopters:", error)
  }
}
