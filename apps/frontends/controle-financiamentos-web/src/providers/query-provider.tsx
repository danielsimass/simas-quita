import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '../lib/api-client';

type QueryProviderProps = {
  children: ReactNode;
  onUnauthorized?: () => void;
};

export function QueryProvider({ children, onUnauthorized }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.statusCode === 401) {
                return false;
              }
              return failureCount < 1;
            },
          },
          mutations: {
            onError: (error) => {
              if (error instanceof ApiError && error.statusCode === 401) {
                onUnauthorized?.();
              }
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
