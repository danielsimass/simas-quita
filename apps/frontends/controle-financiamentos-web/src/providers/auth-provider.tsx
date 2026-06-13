import type { LoginInput, UpdateProfileInput, UserDto } from '@simas-quita/shared-financing-types';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, apiRequest } from '../lib/api-client';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export type AuthContextValue = {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<UserDto>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      await apiRequest<{ status: string }>('/auth/refresh', { method: 'POST' });
      const currentUser = await apiRequest<UserDto>('/auth/me');
      setUser(currentUser);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await apiRequest<UserDto>('/auth/me');
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          setUser(null);
        }
        return;
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    void loadUser();
    return clearRefreshTimer;
  }, [loadUser, clearRefreshTimer]);

  useEffect(() => {
    clearRefreshTimer();
    if (!user) {
      return;
    }

    refreshTimerRef.current = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return clearRefreshTimer;
  }, [user, refreshSession, clearRefreshTimer]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await apiRequest<{ user: UserDto }>('/auth/login', {
      method: 'POST',
      body: input,
    });
    setUser(response.user);
    return response.user;
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const updatedUser = await apiRequest<UserDto>('/auth/profile', {
      method: 'POST',
      body: input,
    });
    setUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      clearRefreshTimer();
    }
  }, [clearRefreshTimer]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      updateProfile,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, updateProfile, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
