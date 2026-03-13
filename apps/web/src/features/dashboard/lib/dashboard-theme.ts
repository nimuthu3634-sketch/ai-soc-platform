import type { IncidentStatus, LogSeverity } from '@aegis-core/contracts';

export const dashboardChartPalette = {
  accent: '#ff7a1a',
  accentSoft: '#ffb275',
  info: '#38bdf8',
  warning: '#f59e0b',
  danger: '#fb7185',
  success: '#34d399',
  neutral: '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.16)',
  axis: '#94a3b8',
  tooltipBorder: 'rgba(255, 255, 255, 0.08)',
  tooltipBackground: 'rgba(15, 23, 42, 0.96)',
} as const;

export const logSeverityChartColors: Record<LogSeverity, string> = {
  info: dashboardChartPalette.info,
  low: dashboardChartPalette.neutral,
  medium: dashboardChartPalette.warning,
  high: dashboardChartPalette.accent,
  critical: dashboardChartPalette.danger,
};

export const incidentStatusChartColors: Record<IncidentStatus, string> = {
  open: dashboardChartPalette.danger,
  investigating: dashboardChartPalette.info,
  contained: dashboardChartPalette.warning,
  resolved: dashboardChartPalette.success,
  closed: dashboardChartPalette.neutral,
};

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));
}
