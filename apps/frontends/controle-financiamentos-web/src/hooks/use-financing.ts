import type {
  CreateFinancingInput,
  FinancingDto,
  UpdateFinancingInput,
} from '@simas-quita/shared-financing-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';

const FINANCINGS_KEY = ['financings'] as const;

export function useFinancings() {
  return useQuery({
    queryKey: FINANCINGS_KEY,
    queryFn: () => apiRequest<FinancingDto[]>('/financings'),
  });
}

export function useFinancing(financingId: string | null) {
  return useQuery({
    queryKey: [...FINANCINGS_KEY, financingId],
    queryFn: () => apiRequest<FinancingDto>(`/financings/${financingId}`),
    enabled: Boolean(financingId),
  });
}

export function useCreateFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFinancingInput) =>
      apiRequest<FinancingDto>('/financings', { method: 'POST', body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCINGS_KEY });
    },
  });
}

export function useUpdateFinancing(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFinancingInput) =>
      apiRequest<FinancingDto>(`/financings/${financingId}`, {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCINGS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
    },
  });
}

export function useDeleteFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (financingId: string) =>
      apiRequest<void>(`/financings/${financingId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCINGS_KEY });
    },
  });
}

export function useSeedDemoFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (financingId: string) =>
      apiRequest<FinancingDto>(`/financings/${financingId}/seed-demo`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCINGS_KEY });
    },
  });
}
