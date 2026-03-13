import type { CreateIncidentFromAlertPayload } from '@aegis-core/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useCreateIncidentFromAlertMutation(alertId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIncidentFromAlertPayload) =>
      apiClient.createIncidentFromAlert(alertId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['alert-detail', alertId] }),
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
      ]);
    },
  });
}
