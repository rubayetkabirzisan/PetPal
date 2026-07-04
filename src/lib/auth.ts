import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  type: "adopter" | "admin";
  shelterName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Use the same storage key as in useAuth.tsx for consistency
const AUTH_STORAGE_KEY = "@petpal/user";

/**
 * Get the stored authentication state
 */
export async function getStoredAuth(): Promise<AuthState> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed, isAuthenticated: true };
    }
  } catch (error) {
    console.error("Error retrieving stored auth:", error);
  }

  return { user: null, isAuthenticated: false };
}

/**
 * Store user authentication data
 */
export async function setStoredAuth(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error storing auth:", error);
  }
}

/**
 * Clear stored authentication data
 */
export async function clearStoredAuth(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(
  email: string, 
  password: string, 
  type: "adopter" | "admin"
): Promise<User | null> {
  // Simulate authentication logic
  if (email && password.length >= 6) {
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name: email.split("@")[0],
      type,
      shelterName: type === "admin" ? "Happy Paws Shelter" : undefined,
    };
    await setStoredAuth(user);
    return user;
  }
  return null;
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string, 
  password: string, 
  name: string
): Promise<User | null> {
  // Simulate registration logic
  if (email && password.length >= 6 && name) {
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name,
      type: "adopter",
    };
    await setStoredAuth(user);
    return user;
  }
  return null;
}

/**
 * Initialize demo users
 */
export async function initializeDemoUsers(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      // Create a demo admin user if no user exists
      const demoAdmin: User = {
        id: "admin-demo-123",
        email: "admin@petpal.com",
        name: "Admin User",
        type: "admin",
        shelterName: "Happy Paws Shelter"
      };
      
      console.log("Initializing demo admin user");
      // Don't actually store the demo admin - we'll just make it available for demo login
    }
  } catch (error) {
    console.error("Error initializing demo users:", error);
  }
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.type === "admin";
}

/**
 * Check if a user has access to a specific pet (for admins and pet owners)
 */
export function hasAccessToPet(user: User | null, petOwnerId: string): boolean {
  if (!user) return false;
  if (user.type === "admin") return true;
  return user.id === petOwnerId;
}

/**
 * Get current auth state synchronously (for initial state)
 * Note: This is a placeholder that should be replaced with a proper state management solution
 */
export function getInitialAuthState(): AuthState {
  return { user: null, isAuthenticated: false };
}
