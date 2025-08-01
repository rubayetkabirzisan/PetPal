import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

// Check if we're in Expo Go environment
const isExpoGo = (): boolean => {
  return __DEV__ && Platform.OS !== 'web'
}

/**
 * Configure Expo notifications for the app
 */
export async function configureNotifications() {
  try {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    if (isExpoGo()) {
      console.log('Notifications: Limited functionality in Expo Go - this is expected');
    } else {
      console.error('Error configuring notifications:', error);
    }
  }
}

/**
 * Request notification permissions
 * @returns True if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    if (isExpoGo()) {
      console.log('Notification permissions: Limited in Expo Go - falling back to local notifications only');
      return true; // Return true to allow local notifications to work
    } else {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
}

/**
 * Initialize notifications with proper error handling for Expo Go
 * This function can be called safely from App.tsx without causing errors
 */
export async function initializeNotifications(): Promise<void> {
  if (isExpoGo()) {
    console.log('PetPal Notifications: Running in Expo Go - local notifications only');
    return;
  }
  
  try {
    await configureNotifications();
    await requestNotificationPermission();
    console.log('PetPal Notifications: Initialized successfully');
  } catch (error) {
    console.log('PetPal Notifications: Could not initialize push notifications, using local notifications only');
  }
}

/**
 * Get all notifications for a specific user
 * @param userId User identifier
 * @param userType Type of user (adopter or admin)
 * @returns Array of notifications
 */
export async function getNotifications(userId: string, userType: "adopter" | "admin"): Promise<Notification[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    return notifications.filter((n: Notification) => n.userId === userId && n.userType === userType);
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
}

/**
 * Add a new notification
 * @param notification Notification object without id, timestamp and read status
 * @returns Complete notification object
 */
export async function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Promise<Notification> {
  const notifications = await getAllNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.push(newNotification);

  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    
    // Display a push notification if applicable
    await showPushNotification(newNotification);
    
    return newNotification;
  } catch (error) {
    console.error("Error saving notification:", error);
    return newNotification;
  }
}

/**
 * Mark a notification as read
 * @param notificationId ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notifications = await getAllNotifications();
  const index = notifications.findIndex((n: Notification) => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  }
}

/**
 * Get all notifications from storage
 * @returns Array of all notifications
 */
async function getAllNotifications(): Promise<Notification[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading all notifications:", error);
    return [];
  }
}

/**
 * Create notifications for all adopters about a new pet
 * @param pet Pet object
 * @param adopters Array of adopter IDs
 */
export async function createNewPetNotification(pet: any, adopters: string[]): Promise<void> {
  for (const adopterId of adopters) {
    await addNotification({
      userId: adopterId,
      userType: "adopter",
      type: "new_pet",
      title: "New Pet Available!",
      message: `${pet.name}, a ${pet.breed}, is now available for adoption!`,
      data: { petId: pet.id },
    });
  }
}

/**
 * Create notification about application status
 * @param adopterId Adopter ID
 * @param petName Pet name
 * @param status Application status
 */
export async function createApplicationUpdateNotification(
  adopterId: string,
  petName: string,
  status: "Approved" | "Rejected",
): Promise<void> {
  await addNotification({
    userId: adopterId,
    userType: "adopter",
    type: status === "Approved" ? "adoption_approved" : "adoption_rejected",
    title: `Application ${status}`,
    message: `Your application to adopt ${petName} has been ${status.toLowerCase()}.`,
  });
}

/**
 * Show a push notification using Expo Notifications
 * @param notification Notification object
 */
async function showPushNotification(notification: Notification): Promise<void> {
  try {
    // Only attempt to show push notifications if not in Expo Go
    if (isExpoGo()) {
      console.log(`Local notification: ${notification.title} - ${notification.message}`);
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: notification.data || {},
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Push notification error (expected in Expo Go):', errorMessage);
    // Silently fail in Expo Go - notifications will still work in-app
  }
}

/**
 * Clear all notifications for a user (useful for logout)
 * @param userId User identifier
 */
export async function clearUserNotifications(userId: string): Promise<void> {
  try {
    const notifications = await getAllNotifications();
    const filteredNotifications = notifications.filter(
      (notification: Notification) => notification.userId !== userId
    );
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filteredNotifications));
  } catch (error) {
    console.error("Error clearing user notifications:", error);
  }
}

/**
 * Get unread notification count for a user
 * @param userId User identifier
 * @param userType Type of user (adopter or admin)
 * @returns Number of unread notifications
 */
export async function getUnreadNotificationCount(
  userId: string,
  userType: "adopter" | "admin"
): Promise<number> {
  const notifications = await getNotifications(userId, userType);
  return notifications.filter(notification => !notification.read).length;
}
