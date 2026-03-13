import type { AlertListQuery } from '@aegis-core/contracts';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useAlertsQuery(query: AlertListQuery) {
  return useQuery({
    queryKey: ['alerts', query],
    queryFn: () => apiClient.getAlerts(query),
  });
}
