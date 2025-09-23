import { API_CONFIG, apiCall, TokenManager } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
  type?: 'admin' | 'adopter'; // What frontend expects
  userType?: 'admin' | 'adopter'; // For backend compatibility
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  bio?: string;
  type: 'admin' | 'adopter'; // What frontend expects
  userType?: 'admin' | 'adopter'; // For backend compatibility
}

export interface User {
  id: string;
  uid?: string; // Keep for compatibility with backend
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  type: 'admin' | 'adopter'; // What frontend expects
  userType?: 'admin' | 'adopter'; // Keep for compatibility with backend
  isVerified: boolean;
  avatar?: string;
  preferences?: any;
  shelterName?: string; // For admin users
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
  error?: string;
}

export interface VerificationData {
  userId: string;
  code: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data?.token) {
        await TokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          await TokenManager.setRefreshToken(response.data.refreshToken);
        }
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });

      // Clear tokens regardless of API response
      await TokenManager.clearTokens();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens on error
      await TokenManager.clearTokens();
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }

  /**
   * Verify user email/phone with verification code
   */
  async verifyUser(verificationData: VerificationData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.VERIFY, {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });

      return response;
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Resend verification code
   */
  async resendVerification(userId: string): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await TokenManager.getToken();
      if (!token) return false;

      // Optionally verify token with backend
      const profileResponse = await this.getProfile();
      return profileResponse.success;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }
}

export default new AuthService();
