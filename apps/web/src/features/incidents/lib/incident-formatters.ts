import type { IncidentSeverity, IncidentStatus } from '@aegis-core/contracts';

export const incidentSeverityToneMap: Record<
  IncidentSeverity,
  'neutral' | 'warning' | 'danger'
> = {
  low: 'neutral',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
};

export const incidentStatusToneMap: Record<
  IncidentStatus,
  'danger' | 'info' | 'warning' | 'success' | 'neutral'
> = {
  open: 'danger',
  investigating: 'info',
  contained: 'warning',
  resolved: 'success',
  closed: 'neutral',
};

export function formatIncidentLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
