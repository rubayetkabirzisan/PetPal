import {
    User,
    authenticateUser,
    clearStoredAuth,
    getStoredAuth,
    initializeDemoUsers,
    registerUser
} from '@lib/auth';
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API, API_BASE_URL } from "../config/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: "adopter" | "admin") => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  loading: boolean;
  savedPetIds: string[];
  toggleSavedPet: (petId: string) => Promise<void>;
}


// Set up global axios interceptor for JWT
axios.interceptors.request.use(
  async (config) => {
    try {
      const authState = await getStoredAuth();
      if (authState.user?.token) {
        config.headers.Authorization = `Bearer ${authState.user.token}`;
      }
    } catch (error) {
      console.error("Error applying JWT token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized detected! Clearing old auth cache...");
      await clearStoredAuth();
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedPetIds, setSavedPetIds] = useState<string[]>([]);

  // Load authentication state on mount
  useEffect(() => {
const loadAuth = async () => {
      try {
        await initializeDemoUsers();
        const authState = await getStoredAuth();
        setUser(authState.user);
        setIsAuthenticated(authState.isAuthenticated);
        
        // Fetch saved pets if authenticated
        if (authState.isAuthenticated && authState.user) {
          try {
            // Using central API config
            const API_BASE = API_BASE_URL; 
            const res = await axios.get(`${API_BASE}/api/profile/saved-pets/${authState.user.id}`);
            const pets = res.data;
            setSavedPetIds(pets.map((p: any) => p._id));
          } catch (e) {
            console.error("Failed to load saved pets", e);
          }
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
}, []);

  
  const toggleSavedPet = async (petId: string) => {
    if (!user) return;
    const isSaved = savedPetIds.includes(petId);
    
    // Optimistic UI update
    if (isSaved) {
      setSavedPetIds(prev => prev.filter(id => id !== petId));
    } else {
      setSavedPetIds(prev => [...prev, petId]);
    }
    
    try {
      const API_BASE = API_BASE_URL;
      const endpoint = isSaved ? "/api/profile/unsave-pet" : "/api/profile/save-pet";
      await axios.post(`${API_BASE}${endpoint}`, {
        uid: user.id,
        petId
      });
    } catch (e) {
      console.error("Failed to toggle saved pet", e);
      // Revert on failure
      if (isSaved) {
        setSavedPetIds(prev => [...prev, petId]);
      } else {
        setSavedPetIds(prev => prev.filter(id => id !== petId));
      }
    }
  };

  const login = async (email: string, password: string, userType: "adopter" | "admin"): Promise<boolean> => {
    try {
      setLoading(true);
      const authenticatedUser = await authenticateUser(email, password, userType);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      const registeredUser = await registerUser(email, password, name);
      
      if (registeredUser) {
        setUser(registeredUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await clearStoredAuth();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        setUser,
        loading,
        savedPetIds,
        toggleSavedPet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
