import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { UserDto } from '@simas-quita/shared-financing-types';
import { AuthProvider } from '../providers/auth-provider';
import { useAuth } from './use-auth';
import { ApiError } from '../lib/api-client';

const mockUser: UserDto = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  profileSetupCompleted: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

vi.mock('../lib/api-client', () => ({
  apiRequest: vi.fn(),
  API_BASE_URL: 'http://localhost:3001/api/v1',
  ApiError: class MockApiError extends Error {
    constructor(
      public statusCode: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

import { apiRequest } from '../lib/api-client';

const mockedApiRequest = vi.mocked(apiRequest);

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads authenticated user on mount', async () => {
    mockedApiRequest.mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('refreshes session when initial me request returns 401', async () => {
    mockedApiRequest
      .mockRejectedValueOnce(new ApiError(401, 'Unauthorized'))
      .mockResolvedValueOnce({ status: 'ok' })
      .mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/refresh', { method: 'POST' });
    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/me');
  });

  it('logs out and clears user', async () => {
    mockedApiRequest.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });
});
