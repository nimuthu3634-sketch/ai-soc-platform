import type { AlertSeverity, AlertStatus } from '@aegis-core/contracts';

export const alertSeverityToneMap: Record<
  AlertSeverity,
  'neutral' | 'warning' | 'danger'
> = {
  low: 'neutral',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
};

export const alertStatusToneMap: Record<
  AlertStatus,
  'warning' | 'info' | 'danger' | 'success'
> = {
  new: 'warning',
  investigating: 'info',
  escalated: 'danger',
  resolved: 'success',
};

export function formatAlertLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
