import type { DashboardMetric } from '@aegis-core/contracts';

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Active alerts',
    value: '27',
    delta: '+12%',
  },
  {
    label: 'Open incidents',
    value: '4',
    delta: '-8%',
  },
  {
    label: 'Ingested logs',
    value: '1.2M',
    delta: '+23%',
  },
  {
    label: 'MTTR target',
    value: '18 min',
    delta: '+6%',
  },
];

export const threatTrend = [
  { day: 'Mon', alerts: 14, incidents: 3 },
  { day: 'Tue', alerts: 18, incidents: 4 },
  { day: 'Wed', alerts: 17, incidents: 2 },
  { day: 'Thu', alerts: 23, incidents: 5 },
  { day: 'Fri', alerts: 27, incidents: 4 },
  { day: 'Sat', alerts: 16, incidents: 2 },
  { day: 'Sun', alerts: 20, incidents: 3 },
];

export const analystQueue = [
  {
    title: 'Review lateral movement anomaly',
    owner: 'Analyst Team 02',
    eta: '10 min',
  },
  {
    title: 'Validate endpoint isolation request',
    owner: 'Responder Team',
    eta: '22 min',
  },
  {
    title: 'Publish weekly SOC trend report',
    owner: 'Lead Analyst',
    eta: 'Today',
  },
];
