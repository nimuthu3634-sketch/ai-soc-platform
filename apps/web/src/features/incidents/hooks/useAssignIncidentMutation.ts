import type { AssignIncidentPayload } from '@aegis-core/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';

export function useAssignIncidentMutation(incidentId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignIncidentPayload) =>
      apiClient.assignIncident(incidentId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
        queryClient.invalidateQueries({ queryKey: ['incident-detail', incidentId] }),
      ]);
    },
  });
}
