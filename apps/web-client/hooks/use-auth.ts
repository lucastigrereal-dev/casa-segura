'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'casa_segura_token';
const REFRESH_TOKEN_KEY = 'casa_segura_refresh_token';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const loadUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.getMe(token) as { data: User };
      setState({
        user: response.data,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, [getToken, clearTokens]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password }) as {
        data: { user: User; accessToken: string; refreshToken: string };
      };
      setTokens(response.data.accessToken, response.data.refreshToken);
      setState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return response.data.user;
    },
    [setTokens]
  );

  const register = useCallback(
    async (data: { email: string; phone: string; password: string; name: string }) => {
      const response = await authApi.register(data) as {
        data: { user: User; accessToken: string; refreshToken: string };
      };
      setTokens(response.data.accessToken, response.data.refreshToken);
      setState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return response.data.user;
    },
    [setTokens]
  );

  const logout = useCallback(() => {
    clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, [clearTokens]);

  return {
    ...state,
    token: getToken(),
    login,
    register,
    logout,
    refreshUser: loadUser,
  };
}
