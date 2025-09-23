import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    authenticateUser,
    authenticateUserDemo,
    clearStoredAuth,
    getStoredAuth,
    initializeDemoUsers,
    registerUser,
    validateAuthToken
} from '../../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: "adopter" | "admin") => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load authentication state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Initialize demo users for convenience (legacy)
        await initializeDemoUsers();
        
        // First check if we have stored user data
        const authState = await getStoredAuth();
        
        if (authState.isAuthenticated && authState.user) {
          // Validate token with backend
          const validatedUser = await validateAuthToken();
          if (validatedUser) {
            setUser(validatedUser);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear state
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (email: string, password: string, userType: "adopter" | "admin"): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try backend authentication first
      let authenticatedUser = await authenticateUser(email, password, userType);
      
      // If backend auth fails, try demo authentication
      if (!authenticatedUser) {
        console.log("Backend auth failed, trying demo authentication...");
        authenticatedUser = await authenticateUserDemo(email, password, userType);
      }
      
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
        loading,
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
