// Authentication Context and Provider

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';
import type {
  User,
  AuthContextType,
  LoginRequest,
  RegisterRequest
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        // Check if token is expired before validating
        if (authService.isTokenExpired()) {
          console.log('Token expired, attempting refresh...');
          try {
            await authService.refreshToken();
            const newToken = authService.getStoredToken();
            const newUser = authService.getStoredUser();
            if (newToken && newUser) {
              setToken(newToken);
              setUser(newUser);
            }
          } catch (refreshError) {
            console.warn('Token refresh failed during initialization:', refreshError);
            // Only logout if refresh fails - don't logout on network errors
            if (refreshError instanceof Error && refreshError.message.includes('No refresh token')) {
              authService.logout();
            } else {
              // Set the user anyway - let them use the app, token will be refreshed on next API call
              setToken(storedToken);
              setUser(storedUser);
            }
          }
        } else {
          // Token not expired, validate it but don't logout on network errors
          try {
            const isValid = await validateToken();
            if (isValid) {
              setToken(storedToken);
              setUser(storedUser);
            } else {
              // Token invalid, try refresh before giving up
              try {
                await authService.refreshToken();
                const newToken = authService.getStoredToken();
                const newUser = authService.getStoredUser();
                if (newToken && newUser) {
                  setToken(newToken);
                  setUser(newUser);
                }
              } catch {
                authService.logout();
              }
            }
          } catch (validationError) {
            console.warn('Token validation failed during initialization:', validationError);
            // Don't logout on network errors - set the user anyway
            setToken(storedToken);
            setUser(storedUser);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Only clear tokens if we have a real authentication error, not network issues
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      if (storedToken && storedUser) {
        // Keep the user logged in despite initialization errors
        setToken(storedToken);
        setUser(storedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.userData && response.tokenData) {
        setUser(response.userData);
        setToken(response.tokenData.accessToken);
        authService.storeUserData(response.userData);
        
        toast({
          title: "Login Successful",
          description: response.message || "Welcome back!",
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authService.register(userData);
      
      if (response.success && response.userData && response.tokenData) {
        setUser(response.userData);
        setToken(response.tokenData.accessToken);
        authService.storeUserData(response.userData);
        
        toast({
          title: "Registration Successful",
          description: response.message || "Welcome to our platform!",
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear state
   */
  const logout = () => {
    // Add debugging to track logout events
    console.log('Logout triggered from AuthContext');
    console.trace('Logout call stack');
    
    authService.logout();
    setUser(null);
    setToken(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  /**
   * Validate current token
   */
  const validateToken = async (): Promise<boolean> => {
    try {
      const currentToken = token || authService.getStoredToken();
      if (!currentToken) return false;

      const response = await authService.validateToken(currentToken);
      return response.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  /**
   * Refresh token if needed
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      if (response.success && response.tokenData) {
        setToken(response.tokenData.accessToken);
        // Update stored user data if needed
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
      
      // Only logout and show error if this is a real authentication error
      // Network errors or temporary issues shouldn't force logout
      if (error instanceof Error) {
        if (error.message.includes('No refresh token') || 
            error.message.includes('refresh token is invalid') ||
            error.message.includes('refresh token has expired')) {
          // These are real auth errors - logout required
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          logout();
        } else {
          // Likely a network error - don't logout, just log the error
          console.warn('Token refresh failed due to network/server issue, keeping user logged in');
        }
      }
      throw error;
    }
  };

  /**
   * Check if token needs refresh (within 5 minutes of expiry)
   */
  const shouldRefreshToken = (): boolean => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
    
    return (expiryTime - currentTime) <= fiveMinutesInMs;
  };

  // Auto-refresh token when needed (check every 5 minutes, less aggressive)
  useEffect(() => {
    if (!token) return;

    const checkAndRefresh = async () => {
      if (shouldRefreshToken()) {
        try {
          await refreshToken();
        } catch (error) {
          // Error already handled in refreshToken function
          // Don't log as error since refreshToken already handles it
          console.debug('Auto-refresh attempt failed:', error);
        }
      }
    };

    // Initial check after a delay to avoid conflicts with initialization
    const initialTimeout = setTimeout(checkAndRefresh, 10000); // 10 seconds delay

    // Set up interval for periodic checks (less frequent)
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [token]);

  // Listen for storage changes (token updates from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        const newToken = e.newValue;
        if (newToken !== token) {
          setToken(newToken);
        }
      } else if (e.key === 'userData') {
        const newUserData = e.newValue;
        if (newUserData) {
          try {
            const userData = JSON.parse(newUserData);
            setUser(userData);
          } catch {
            // Invalid JSON, ignore
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook for authentication state only (lighter version)
 */
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { user, isAuthenticated, isLoading };
};