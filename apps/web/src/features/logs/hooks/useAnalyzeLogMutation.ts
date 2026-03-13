import type { AnalyzeLogPayload } from '@aegis-core/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useAnalyzeLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AnalyzeLogPayload) => apiClient.analyzeLog(payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['log-detail', result.logId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['logs'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['alerts'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard-summary'],
        }),
      ]);
    },
  });
}
