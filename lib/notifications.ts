"use client"

export interface Notification {
  id: string
  userId: string
  userType: "adopter" | "admin"
  type: "new_pet" | "application_update" | "message" | "medical_reminder" | "adoption_approved" | "adoption_rejected"
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

const NOTIFICATIONS_STORAGE_KEY = "petpal_notifications"

export function getNotifications(userId: string, userType: "adopter" | "admin"): Notification[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    const notifications = stored ? JSON.parse(stored) : []
    return notifications.filter((n: Notification) => n.userId === userId && n.userType === userType)
  } catch (error) {
    console.error("Error loading notifications:", error)
    return []
  }
}

export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Notification {
  const notifications = getAllNotifications()
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
  }
  notifications.push(newNotification)

  if (typeof window !== "undefined") {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  }

  return newNotification
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAllNotifications()
  const index = notifications.findIndex((n: Notification) => n.id === notificationId)
  if (index !== -1) {
    notifications[index].read = true
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    }
  }
}

function getAllNotifications(): Notification[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading all notifications:", error)
    return []
  }
}

export function createNewPetNotification(pet: any, adopters: string[]) {
  adopters.forEach((adopterId) => {
    addNotification({
      userId: adopterId,
      userType: "adopter",
      type: "new_pet",
      title: "New Pet Available!",
      message: `${pet.name}, a ${pet.breed}, is now available for adoption!`,
      data: { petId: pet.id },
    })
  })
}

export function createApplicationUpdateNotification(
  adopterId: string,
  petName: string,
  status: "Approved" | "Rejected",
) {
  addNotification({
    userId: adopterId,
    userType: "adopter",
    type: status === "Approved" ? "adoption_approved" : "adoption_rejected",
    title: `Application ${status}`,
    message: `Your application to adopt ${petName} has been ${status.toLowerCase()}.`,
  })
}
