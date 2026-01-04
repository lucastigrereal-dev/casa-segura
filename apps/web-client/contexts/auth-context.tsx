'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  phone: string;
  avatar_url?: string;
  status: string;
  professional?: {
    id: string;
    level: string;
    is_available: boolean;
    rating_avg: number;
    total_jobs: number;
  };
  addresses?: Array<{
    id: string;
    label?: string;
    street: string;
    number: string;
    city: string;
    is_default: boolean;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  name: string;
  role?: 'CLIENT' | 'PROFESSIONAL';
}

const TOKEN_KEY = 'casa_segura_token';
const REFRESH_TOKEN_KEY = 'casa_segura_refresh_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setToken(accessToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
  }, []);

  const loadUser = useCallback(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe(storedToken) as User;
      setUser(response);
      setToken(storedToken);
    } catch (error) {
      // Try to refresh token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshResponse = await authApi.refresh(refreshToken) as {
            accessToken: string;
            refreshToken: string;
          };
          setTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
          const userResponse = await authApi.getMe(refreshResponse.accessToken) as User;
          setUser(userResponse);
        } catch {
          clearTokens();
          setUser(null);
        }
      } else {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken, setTokens, clearTokens]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await authApi.login({ email, password }) as {
        user: User;
        accessToken: string;
        refreshToken: string;
      };
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return response.user;
    },
    [setTokens]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      const response = await authApi.register(data) as {
        user: User;
        accessToken: string;
        refreshToken: string;
      };
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return response.user;
    },
    [setTokens]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    // TODO: Implement profile update API call
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        token,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
