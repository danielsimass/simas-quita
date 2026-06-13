import type { InstallmentDto, InstallmentStatus, UpdateInstallmentInput } from '@simas-quita/shared-financing-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';

export type InstallmentFilter = 'all' | InstallmentStatus;

export function useInstallments(financingId: string | null, filter: InstallmentFilter = 'all') {
  const statusQuery = filter === 'all' ? '' : `?status=${filter}`;

  return useQuery({
    queryKey: ['installments', financingId, filter],
    queryFn: () =>
      apiRequest<InstallmentDto[]>(`/financings/${financingId}/installments${statusQuery}`),
    enabled: Boolean(financingId),
  });
}

export function useUpdateInstallment(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ installmentId, input }: { installmentId: string; input: UpdateInstallmentInput }) =>
      apiRequest<InstallmentDto>(`/installments/${installmentId}`, {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['installments', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
    },
  });
}

export function useMarkInstallmentPaid(financingId: string) {
  const updateMutation = useUpdateInstallment(financingId);

  return useMutation({
    mutationFn: (installmentId: string) =>
      updateMutation.mutateAsync({
        installmentId,
        input: { paidAt: new Date().toISOString() },
      }),
  });
}

export function useDeleteInstallment(financingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installmentId: string) =>
      apiRequest<void>(`/installments/${installmentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['installments', financingId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', financingId] });
    },
  });
}
