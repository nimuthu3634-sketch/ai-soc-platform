import type { IncidentListQuery } from '@aegis-core/contracts';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useIncidentsQuery(query: IncidentListQuery) {
  return useQuery({
    queryKey: ['incidents', query],
    queryFn: () => apiClient.getIncidents(query),
  });
}
