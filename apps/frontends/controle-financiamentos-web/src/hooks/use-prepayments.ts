import type {
  CreatePrepaymentInput,
  PrepaymentDto,
  UpdatePrepaymentInput,
} from '@simas-quita/shared-financing-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';

export function usePrepayments(financingId: string | null) {
  return useQuery({
    queryKey: ['prepayments', financingId],
    queryFn: () => apiRequest<PrepaymentDto[]>(`/financings/${financingId}/prepayments`),
    enabled: Boolean(financingId),
  });
}

export function useCreatePrepayment(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePrepaymentInput) =>
      apiRequest<PrepaymentDto>(`/financings/${financingId}/prepayments`, {
        method: 'POST',
        body: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prepayments', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['installments', financingId] });
    },
  });
}

export function useUpdatePrepayment(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prepaymentId, input }: { prepaymentId: string; input: UpdatePrepaymentInput }) =>
      apiRequest<PrepaymentDto>(`/prepayments/${prepaymentId}`, {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prepayments', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['installments', financingId] });
    },
  });
}

export function useDeletePrepayment(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prepaymentId: string) =>
      apiRequest<void>(`/prepayments/${prepaymentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['prepayments', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['installments', financingId] });
    },
  });
}
