import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, apiCall, TokenManager } from '../src/config/api';

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
    await TokenManager.clearTokens();
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
  try {
    const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password, userType: type }),
    });

    if (response.success && response.data) {
      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      await TokenManager.setToken(token);
      if (refreshToken) {
        await TokenManager.setRefreshToken(refreshToken);
      }
      
      // Store user data
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.userType,
        shelterName: user.shelterName,
      };
      
      await setStoredAuth(userData);
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string, 
  password: string, 
  name: string
): Promise<User | null> {
  try {
    const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, name, userType: 'adopter' }),
    });

    if (response.success && response.data) {
      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      await TokenManager.setToken(token);
      if (refreshToken) {
        await TokenManager.setRefreshToken(refreshToken);
      }
      
      // Store user data
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.userType,
        shelterName: user.shelterName,
      };
      
      await setStoredAuth(userData);
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

/**
 * Validate existing token and get user profile
 */
export async function validateAuthToken(): Promise<User | null> {
  try {
    const token = await TokenManager.getToken();
    if (!token) {
      return null;
    }

    const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
    });

    if (response.success && response.data) {
      const { user } = response.data;
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.userType,
        shelterName: user.shelterName,
      };
      
      await setStoredAuth(userData);
      return userData;
    }
    
    // Token is invalid, clear it
    await clearStoredAuth();
    return null;
  } catch (error) {
    console.error('Token validation failed:', error);
    await clearStoredAuth();
    return null;
  }
}

/**
 * Initialize demo users (legacy - now handled by backend)
 */
export async function initializeDemoUsers(): Promise<void> {
  // This function is kept for compatibility but demo users are now handled by the backend
  console.log("Demo users initialization is handled by the backend");
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
