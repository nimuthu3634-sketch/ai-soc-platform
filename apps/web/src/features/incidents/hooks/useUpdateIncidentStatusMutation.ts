import type { UpdateIncidentStatusPayload } from '@aegis-core/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useUpdateIncidentStatusMutation(incidentId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIncidentStatusPayload) =>
      apiClient.updateIncidentStatus(incidentId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
        queryClient.invalidateQueries({ queryKey: ['incident-detail', incidentId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
      ]);
    },
  });
}
