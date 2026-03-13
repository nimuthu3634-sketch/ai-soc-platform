import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useIncidentDetailQuery(incidentId?: string | null) {
  return useQuery({
    queryKey: ['incident-detail', incidentId],
    queryFn: () => apiClient.getIncidentById(incidentId!),
    enabled: Boolean(incidentId),
  });
}
