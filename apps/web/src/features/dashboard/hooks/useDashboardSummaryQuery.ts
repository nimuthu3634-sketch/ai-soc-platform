import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: apiClient.getDashboardSummary,
  });
}
