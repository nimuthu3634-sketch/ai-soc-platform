import type { LogListQuery } from '@aegis-core/contracts';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useLogsQuery(query: LogListQuery) {
  return useQuery({
    queryKey: ['logs', query],
    queryFn: () => apiClient.getLogs(query),
  });
}
