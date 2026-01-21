'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface Professional {
  id: string;
  level: string;
  is_available: boolean;
  rating_avg: number;
  cpf_verified: boolean;
  selfie_verified: boolean;
  address_verified: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url?: string;
  professional?: Professional;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TOKEN_KEY = 'casa_segura_token';
const REFRESH_TOKEN_KEY = 'casa_segura_refresh_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

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
      const response = await authApi.getMe(storedToken);
      setUser(response.data);
      setToken(storedToken);
    } catch (error) {
      // Try to refresh token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshResponse = await authApi.refresh(refreshToken);
          setTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);
          const userResponse = await authApi.getMe(refreshResponse.data.accessToken);
          setUser(userResponse.data);
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
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      setTokens(response.data.accessToken, response.data.refreshToken);
      setUser(response.data.user);
      // Redirect to dashboard after successful login
      router.push('/');
    },
    [setTokens, router]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/login');
  }, [clearTokens, router]);

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
        logout,
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
