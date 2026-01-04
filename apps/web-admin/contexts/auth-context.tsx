'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT' | 'PROFESSIONAL';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
const TOKEN_KEY = 'casa_segura_admin_token';
const REFRESH_TOKEN_KEY = 'casa_segura_admin_refresh_token';

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
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!response.ok) throw new Error('Token invalid');

      const userData = await response.json();

      // Only allow admin users
      if (userData.role !== 'ADMIN') {
        clearTokens();
        setUser(null);
      } else {
        setUser(userData);
        setToken(storedToken);
      }
    } catch (error) {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken, clearTokens]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Credenciais invalidas' }));
        throw new Error(error.message);
      }

      const data = await response.json();

      // Only allow admin users
      if (data.user.role !== 'ADMIN') {
        throw new Error('Acesso negado. Apenas administradores podem acessar este painel.');
      }

      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      return data.user;
    },
    [setTokens]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        token,
        login,
        logout,
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
