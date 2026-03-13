import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function usePlatformHealthQuery() {
  return useQuery({
    queryKey: ['platform-health'],
    queryFn: apiClient.getHealth,
    retry: 1,
    refetchInterval: 60_000,
  });
}
