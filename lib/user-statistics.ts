import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  averageSessionTime: number
  topFeatures: string[]
  userGrowthRate: number
}

export interface UserActivity {
  userId: string
  lastActive: string
  sessionCount: number
  totalTimeSpent: number // in minutes
  favoriteFeatures: string[]
}

// Storage keys
const USER_STATS_STORAGE_KEY = "petpal_user_statistics"
const USER_ACTIVITY_STORAGE_KEY = "petpal_user_activity"

// Default statistics for demo
const defaultStatistics: UserStatistics = {
  totalUsers: 234,
  activeUsers: 189,
  newUsersThisMonth: 45,
  averageSessionTime: 12.5,
  topFeatures: ["Browse Pets", "Chat", "Applications", "GPS Tracking"],
  userGrowthRate: 24.7
}

// Sample user activities
const defaultUserActivities: UserActivity[] = [
  {
    userId: "demo-user",
    lastActive: new Date().toISOString(),
    sessionCount: 15,
    totalTimeSpent: 245,
    favoriteFeatures: ["Browse Pets", "Applications"]
  },
  {
    userId: "user2",
    lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    sessionCount: 8,
    totalTimeSpent: 120,
    favoriteFeatures: ["Chat", "GPS Tracking"]
  },
  {
    userId: "user3",
    lastActive: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    sessionCount: 22,
    totalTimeSpent: 380,
    favoriteFeatures: ["Browse Pets", "Profile", "Notifications"]
  }
]

/**
 * Get user statistics from storage
 */
export async function getUserStatistics(): Promise<UserStatistics> {
  try {
    const stored = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(defaultStatistics))
      return defaultStatistics
    }
  } catch (error) {
    console.error("Error loading user statistics:", error)
    return defaultStatistics
  }
}

/**
 * Update user statistics
 */
export async function updateUserStatistics(newStats: Partial<UserStatistics>): Promise<boolean> {
  try {
    const currentStats = await getUserStatistics()
    const updatedStats = { ...currentStats, ...newStats }
    await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(updatedStats))
    return true
  } catch (error) {
    console.error("Error updating user statistics:", error)
    return false
  }
}

/**
 * Get user activities
 */
export async function getUserActivities(): Promise<UserActivity[]> {
  try {
    const stored = await AsyncStorage.getItem(USER_ACTIVITY_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(USER_ACTIVITY_STORAGE_KEY, JSON.stringify(defaultUserActivities))
      return defaultUserActivities
    }
  } catch (error) {
    console.error("Error loading user activities:", error)
    return defaultUserActivities
  }
}

/**
 * Track user activity
 */
export async function trackUserActivity(userId: string, sessionTime: number, features: string[]): Promise<boolean> {
  try {
    const activities = await getUserActivities()
    const existingActivityIndex = activities.findIndex(activity => activity.userId === userId)
    
    if (existingActivityIndex >= 0) {
      // Update existing activity
      activities[existingActivityIndex] = {
        ...activities[existingActivityIndex],
        lastActive: new Date().toISOString(),
        sessionCount: activities[existingActivityIndex].sessionCount + 1,
        totalTimeSpent: activities[existingActivityIndex].totalTimeSpent + sessionTime,
        favoriteFeatures: Array.from(new Set([...activities[existingActivityIndex].favoriteFeatures, ...features]))
      }
    } else {
      // Add new activity
      activities.push({
        userId,
        lastActive: new Date().toISOString(),
        sessionCount: 1,
        totalTimeSpent: sessionTime,
        favoriteFeatures: features
      })
    }
    
    await AsyncStorage.setItem(USER_ACTIVITY_STORAGE_KEY, JSON.stringify(activities))
    return true
  } catch (error) {
    console.error("Error tracking user activity:", error)
    return false
  }
}

/**
 * Calculate user engagement metrics
 */
export async function calculateEngagementMetrics(): Promise<{
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averageSessionsPerUser: number
}> {
  try {
    const activities = await getUserActivities()
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyActiveUsers = activities.filter(activity => 
      new Date(activity.lastActive) >= oneDayAgo
    ).length

    const weeklyActiveUsers = activities.filter(activity => 
      new Date(activity.lastActive) >= oneWeekAgo
    ).length

    const monthlyActiveUsers = activities.filter(activity => 
      new Date(activity.lastActive) >= oneMonthAgo
    ).length

    const averageSessionsPerUser = activities.length > 0 
      ? activities.reduce((sum, activity) => sum + activity.sessionCount, 0) / activities.length 
      : 0

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100
    }
  } catch (error) {
    console.error("Error calculating engagement metrics:", error)
    return {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      averageSessionsPerUser: 0
    }
  }
}

/**
 * Initialize user statistics data
 */
export async function initializeUserStatistics(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY)
    if (!stored) {
      await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(defaultStatistics))
      console.log("Initialized user statistics data")
    }

    const activityStored = await AsyncStorage.getItem(USER_ACTIVITY_STORAGE_KEY)
    if (!activityStored) {
      await AsyncStorage.setItem(USER_ACTIVITY_STORAGE_KEY, JSON.stringify(defaultUserActivities))
      console.log("Initialized user activity data")
    }
  } catch (error) {
    console.error("Error initializing user statistics:", error)
  }
}
