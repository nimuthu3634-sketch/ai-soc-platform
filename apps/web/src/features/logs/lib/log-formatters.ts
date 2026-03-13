import type { LogSeverity, LogStatus } from '@aegis-core/contracts';

export const logSeverityToneMap: Record<LogSeverity, 'neutral' | 'info' | 'warning' | 'danger'> = {
  info: 'info',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export const logStatusToneMap: Record<
  LogStatus,
  'neutral' | 'info' | 'warning' | 'danger' | 'success'
> = {
  new: 'warning',
  reviewed: 'neutral',
  investigating: 'info',
  archived: 'success',
};

export function formatLogLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
