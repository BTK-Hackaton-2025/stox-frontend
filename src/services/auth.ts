// Authentication Service Functions
//
// This service provides comprehensive authentication functionality including:
// - User registration and login
// - JWT token management with automatic refresh
// - Token validation and expiry checking
// - Secure token storage in localStorage
//
// REFRESH TOKEN MECHANISM:
// - Tokens are automatically refreshed when they expire or are about to expire
// - API client automatically retries failed requests with refreshed tokens
// - AuthContext periodically checks and refreshes tokens in the background
// - Cross-tab synchronization ensures consistent auth state
//
// USAGE:
// - Use authService for direct authentication operations
// - Use useAuth() hook in React components for auth state and actions
// - API calls automatically handle token refresh via apiClient

import { apiClient } from '@/lib/api';
import type {
  RegisterRequest,
  LoginRequest,
  RegisterResponse,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ProfileResponse,
  User,
  TokenData
} from '@/types/auth';

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
      
      // Store tokens after successful registration
      if (response.tokenData) {
        this.storeTokens(response.tokenData);
      }
      
      // Store user data after successful registration
      if (response.userData) {
        this.storeUserData(response.userData);
      }
      
      return response;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Login existing user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      // Store tokens after successful login
      if (response.tokenData) {
        this.storeTokens(response.tokenData);
      }
      
      // Store user data after successful login
      if (response.userData) {
        this.storeUserData(response.userData);
      }
      
      return response;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token?: string): Promise<ValidateTokenResponse> {
    const tokenToValidate = token || this.getStoredToken();
    
    if (!tokenToValidate) {
      throw new Error('No token provided');
    }

    try {
      const response = await apiClient.post<ValidateTokenResponse>('/auth/validate', {
        token: tokenToValidate
      });
      
      return response;
    } catch (error: unknown) {
      // If token is invalid, remove it from storage
      this.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/profile', {
        userId
      });
      
      return response;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user (clear tokens)
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    return !!(token && refreshToken);
  }

  /**
   * Get current access token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current refresh token
   */
  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userJson = localStorage.getItem('userData');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Store tokens and user data in localStorage
   */
  private storeTokens(tokenData: TokenData, userData?: User): void {
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + tokenData.expiresIn * 1000).toString());
    
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }

  /**
   * Store user data separately
   */
  storeUserData(userData: User): void {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  /**
   * Clear all stored authentication data
   */
  private clearTokens(): void {
    console.log('Clearing tokens from AuthService');
    console.trace('Token clear call stack');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userData');
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken
      });
      
      // Store new tokens after successful refresh
      if (response.success && response.tokenData) {
        this.storeTokens(response.tokenData);
      }
      
      return response;
    } catch (error: unknown) {
      // If refresh token is invalid, clear all tokens
      this.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Auto-refresh token if needed
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.isTokenExpired()) {
      return true;
    }

    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      await this.refreshToken();
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  /**
   * Handle authentication errors consistently
   */
  private handleAuthError(error: unknown): Error {
    // Only clear tokens for specific auth errors, not network errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      // Check if this is a real auth error or just a network/server issue
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (message.includes('token') || message.includes('unauthorized') || message.includes('expired')) {
          console.log('Clearing tokens due to authentication error:', message);
          this.clearTokens();
        } else {
          console.warn('Got 401 but keeping tokens - might be network issue:', message);
        }
      } else {
        // Generic 401, be conservative and clear tokens
        this.clearTokens();
      }
    }
    
    // Format validation errors
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      const messages = error.errors.map((err: { message: string }) => err.message).join(', ');
      return new Error(messages);
    }
    
    return error instanceof Error ? error : new Error(String(error));
  }

  /**
   * Check if token will expire soon (within specified minutes)
   */
  willTokenExpireSoon(minutesThreshold: number = 5): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const thresholdInMs = minutesThreshold * 60 * 1000;
    
    return (expiryTime - currentTime) <= thresholdInMs;
  }

  /**
   * Get time until token expiry in minutes
   */
  getTimeUntilExpiry(): number {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return 0;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const diffInMs = expiryTime - currentTime;
    
    return Math.max(0, Math.floor(diffInMs / (60 * 1000)));
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Force logout and clear all authentication data
   */
  forceLogout(): void {
    this.clearTokens();
    // Dispatch a custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();