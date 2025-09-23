import React, { createContext, useContext, useEffect, useState } from "react";
import type { LoginCredentials, RegisterData, User } from '../services';
import { AuthService } from '../services';

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
        // Check if user is already authenticated
        const profile = await AuthService.getProfile();
        if (profile.success && profile.data) {
          setUser(profile.data.user);
          setIsAuthenticated(true);
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
      
      const credentials: LoginCredentials = {
        email,
        password,
        userType
      };
      
      const result = await AuthService.login(credentials);
      
      if (result.success && result.data) {
        setUser(result.data.user);
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
      
      const registerData: RegisterData = {
        name,
        email,
        password,
        type: 'adopter', // Add the missing type property
        userType: 'adopter',
      };
      
      const result = await AuthService.register(registerData);
      
      if (result.success && result.data) {
        setUser(result.data.user);
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
      await AuthService.logout();
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
