import type { DashboardDto } from '@simas-quita/shared-financing-types';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';

export function useDashboard(financingId: string | null) {
  return useQuery({
    queryKey: ['dashboard', financingId],
    queryFn: () => apiRequest<DashboardDto>(`/financings/${financingId}/dashboard`),
    enabled: Boolean(financingId),
  });
}
