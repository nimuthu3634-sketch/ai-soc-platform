import type { UpdateAlertStatusPayload } from '@aegis-core/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useUpdateAlertStatusMutation(alertId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAlertStatusPayload) =>
      apiClient.updateAlertStatus(alertId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['alert-detail', alertId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['logs'] }),
      ]);
    },
  });
}
