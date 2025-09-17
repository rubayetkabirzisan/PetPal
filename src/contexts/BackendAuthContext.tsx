import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User as LocalUser,
    authenticateUser,
    clearStoredAuth,
    getStoredAuth,
    initializeDemoUsers,
    registerUser
} from '../../lib/auth';
import authService, { BackendUser } from '../services/AuthService';

// Union type to support both local and backend users
export type User = LocalUser | BackendUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: "adopter" | "admin" | "shelter") => Promise<boolean>;
  register: (email: string, password: string, name: string, userType?: "adopter" | "admin" | "shelter") => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  useBackend: boolean;
  setUseBackend: (use: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true); // Toggle between backend and local auth

  // Load authentication state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        if (useBackend) {
          // Try to load from backend
          const isAuth = await authService.isAuthenticated();
          if (isAuth) {
            try {
              const backendUser = await authService.getCurrentUser();
              setUser(backendUser);
              setIsAuthenticated(true);
              console.log('AuthContext: Loaded backend user:', backendUser);
            } catch (error) {
              console.log('AuthContext: Failed to get backend user, falling back to local');
              await loadLocalAuth();
            }
          } else {
            console.log('AuthContext: No backend authentication, checking local');
            await loadLocalAuth();
          }
        } else {
          await loadLocalAuth();
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        await loadLocalAuth(); // Fallback to local
      } finally {
        setLoading(false);
      }
    };

    const loadLocalAuth = async () => {
      // Initialize demo users for convenience
      await initializeDemoUsers();
      
      // Load stored auth state from local storage
      const authState = await getStoredAuth();
      console.log('AuthContext: Loaded local auth state:', authState);
      setUser(authState.user);
      setIsAuthenticated(authState.isAuthenticated);
    };

    loadAuth();
  }, [useBackend]);

  const login = async (email: string, password: string, userType: "adopter" | "admin" | "shelter"): Promise<boolean> => {
    try {
      setLoading(true);

      if (useBackend) {
        // Try backend authentication first
        try {
          const response = await authService.login({ 
            email, 
            password, 
            userType: userType === 'admin' ? 'shelter' : userType // Map admin to shelter for backend
          });
          
          if (response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
            return true;
          }
        } catch (error) {
          console.log('Backend login failed, trying local auth:', error);
          // Fall back to local authentication
        }
      }

      // Local authentication fallback
      const localUser = await authenticateUser(email, password, userType as "adopter" | "admin");
      if (localUser) {
        setUser(localUser);
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

  const register = async (email: string, password: string, name: string, userType: "adopter" | "admin" | "shelter" = "adopter"): Promise<boolean> => {
    try {
      setLoading(true);

      if (useBackend) {
        // Try backend registration first
        try {
          await authService.signup({
            name,
            email,
            password,
            userType: userType === 'admin' ? 'shelter' : userType // Map admin to shelter for backend
          });
          return true;
        } catch (error) {
          console.log('Backend registration failed, trying local registration:', error);
          // Fall back to local registration
        }
      }

      // Local registration fallback
      const success = await registerUser(email, password, name);
      return !!success;
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
      
      if (useBackend) {
        await authService.logout();
      }
      
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
        useBackend,
        setUseBackend,
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
};