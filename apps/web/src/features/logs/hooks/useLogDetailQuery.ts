import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useLogDetailQuery(logId?: string | null) {
  return useQuery({
    queryKey: ['log-detail', logId],
    queryFn: () => apiClient.getLogById(logId!),
    enabled: Boolean(logId),
  });
}
