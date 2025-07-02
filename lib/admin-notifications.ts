"use client"

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

const ADOPTERS_STORAGE_KEY = "petpal_adopters"

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

export function getAdopters(): Adopter[] {
  if (typeof window === "undefined") return defaultAdopters

  try {
    const stored = localStorage.getItem(ADOPTERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      localStorage.setItem(ADOPTERS_STORAGE_KEY, JSON.stringify(defaultAdopters))
      return defaultAdopters
    }
  } catch (error) {
    console.error("Error loading adopters:", error)
    return defaultAdopters
  }
}

export function sendNotificationToUsers(userIds: string[], notification: NotificationTemplate): boolean {
  try {
    // In a real app, this would send notifications via push notifications, email, etc.
    // For demo purposes, we'll add them to the notifications storage

    const NOTIFICATIONS_STORAGE_KEY = "petpal_notifications"
    const existingNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || "[]")

    userIds.forEach((userId) => {
      const newNotification = {
        id: Math.random().toString(36).substr(2, 9),
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

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications))

    // Simulate API call delay
    return true
  } catch (error) {
    console.error("Error sending notifications:", error)
    return false
  }
}
