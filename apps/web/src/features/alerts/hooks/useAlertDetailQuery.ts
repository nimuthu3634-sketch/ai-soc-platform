import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useAlertDetailQuery(alertId?: string | null) {
  return useQuery({
    queryKey: ['alert-detail', alertId],
    queryFn: () => apiClient.getAlertById(alertId!),
    enabled: Boolean(alertId),
  });
}
