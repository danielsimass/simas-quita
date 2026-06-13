import type { ApiErrorResponse } from '@simas-quita/shared-financing-types';
import { translate } from '../i18n/create-translator';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      error?.message ?? translate('errors.requestFailed'),
      error?.errors,
    );
  }

  return payload as T;
}
