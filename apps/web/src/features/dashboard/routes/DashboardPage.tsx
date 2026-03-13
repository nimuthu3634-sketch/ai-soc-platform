import {
  Activity,
  AlertTriangle,
  Database,
  FolderKanban,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltip } from '../components/ChartTooltip';
import { KpiCard } from '../components/KpiCard';
import {
  dashboardChartPalette,
  formatDashboardDate,
  incidentStatusChartColors,
  logSeverityChartColors,
} from '../lib/dashboard-theme';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  alertSeverityToneMap,
  alertStatusToneMap,
  formatAlertLabel,
} from '@/features/alerts/lib/alert-formatters';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePlatformHealthQuery } from '@/features/dashboard/data/usePlatformHealthQuery';
import { useDashboardSummaryQuery } from '@/features/dashboard/hooks/useDashboardSummaryQuery';
import {
  formatIncidentLabel,
  incidentSeverityToneMap,
  incidentStatusToneMap,
} from '@/features/incidents/lib/incident-formatters';
import { formatLogLabel } from '@/features/logs/lib/log-formatters';

function DashboardLoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="aegis-panel h-44 animate-pulse"
            key={index}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="aegis-panel h-[380px] animate-pulse" />
        <div className="aegis-panel h-[380px] animate-pulse" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="aegis-panel h-[420px] animate-pulse" />
        <div className="space-y-6">
          <div className="aegis-panel h-[260px] animate-pulse" />
          <div className="aegis-panel h-[330px] animate-pulse" />
        </div>
      </section>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const summaryQuery = useDashboardSummaryQuery();
  const healthQuery = usePlatformHealthQuery();

  const healthStatusTone = healthQuery.data?.status === 'ok' ? 'success' : 'warning';

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-7">
        <PageHeader
          actions={
            <>
              <StatusBadge label={user?.role ?? 'session'} tone="info" />
              <StatusBadge label="Loading" tone="warning" />
            </>
          }
          description="Real telemetry, alert pressure, and incident workflow are being synchronized for the Aegis Core console."
          eyebrow="SOC Overview"
          title="Aegis Core Dashboard"
        />
        <DashboardLoadingState />
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="space-y-7">
        <PageHeader
          actions={
            <>
              <StatusBadge label={user?.role ?? 'session'} tone="info" />
              <StatusBadge
                label={healthQuery.data?.status === 'ok' ? 'API Online' : 'Checking API'}
                tone={healthStatusTone}
              />
            </>
          }
          description="The dashboard requires the protected analytics summary endpoint. Retry once the API and database are available."
          eyebrow="SOC Overview"
          title="Aegis Core Dashboard"
        />
        <Panel title="Dashboard unavailable">
          <EmptyState
            action={
              <button
                className="aegis-button-primary"
                onClick={() => {
                  void summaryQuery.refetch();
                }}
                type="button"
              >
                Retry dashboard
              </button>
            }
            description="The protected summary endpoint could not be loaded. Verify the backend is running, the database is seeded, and the session is still valid."
            icon={Activity}
            title="Unable to load analytics"
          />
        </Panel>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const totalIncidents = summary.incidentsByStatus.reduce((total, entry) => total + entry.count, 0);

  const metricCards = [
    {
      label: 'Total logs',
      value: summary.metrics.totalLogs.toLocaleString(),
      description: 'Security telemetry ingested from the current PostgreSQL-backed dataset.',
      icon: Database,
      tone: 'neutral' as const,
    },
    {
      label: 'Total alerts',
      value: summary.metrics.totalAlerts.toLocaleString(),
      description: 'Detections surfaced to analysts across all monitored security sources.',
      icon: Siren,
      tone: 'accent' as const,
    },
    {
      label: 'Critical alerts',
      value: summary.metrics.criticalAlerts.toLocaleString(),
      description: 'High-priority detections requiring immediate analyst attention.',
      icon: AlertTriangle,
      tone: 'danger' as const,
    },
    {
      label: 'Open incidents',
      value: summary.metrics.openIncidents.toLocaleString(),
      description: 'Response cases still active in open, investigating, or contained states.',
      icon: ShieldAlert,
      tone: 'warning' as const,
    },
    {
      label: 'Resolved incidents',
      value: summary.metrics.resolvedIncidents.toLocaleString(),
      description: 'Cases already resolved or closed and ready for reporting review.',
      icon: ShieldCheck,
      tone: 'success' as const,
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        actions={
          <>
            <StatusBadge label={user?.role ?? 'session'} tone="info" />
            <StatusBadge
              label={healthQuery.data?.status === 'ok' ? 'API Online' : 'Checking API'}
              tone={healthStatusTone}
            />
            <StatusBadge
              label={summary.systemHealth.database === 'connected' ? 'Database Connected' : 'Database'}
              tone="success"
            />
          </>
        }
        description="A unified SOC view of live logs, alerts, and incidents. The dashboard now renders real chart data and recent operational context from the protected Aegis Core backend."
        eyebrow="SOC Overview"
        title="Aegis Core Dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((card) => (
          <KpiCard
            description={card.description}
            icon={card.icon}
            key={card.label}
            label={card.label}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel
          action={<span className="aegis-chip">Last 7 days</span>}
          subtitle="Alert creation volume across the last seven days, with critical detections separated so surges are visible at a glance."
          title="Alert trend"
        >
          <div className="h-[320px]">
            <ResponsiveContainer
              height="100%"
              width="100%"
            >
              <AreaChart data={summary.alertTrend}>
                <defs>
                  <linearGradient
                    id="alertsArea"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={dashboardChartPalette.accent}
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor={dashboardChartPalette.accent}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="criticalAlertsArea"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={dashboardChartPalette.danger}
                      stopOpacity={0.42}
                    />
                    <stop
                      offset="100%"
                      stopColor={dashboardChartPalette.danger}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={dashboardChartPalette.grid}
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  minTickGap={24}
                  tick={{ fill: dashboardChartPalette.axis, fontSize: 12 }}
                  tickFormatter={formatDashboardDate}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tick={{ fill: dashboardChartPalette.axis, fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      labelFormatter={(label) => formatDashboardDate(String(label))}
                      nameFormatter={(name) =>
                        name === 'alerts' ? 'Alerts' : 'Critical alerts'
                      }
                    />
                  }
                />
                <Area
                  dataKey="alerts"
                  fill="url(#alertsArea)"
                  fillOpacity={1}
                  name="alerts"
                  stroke={dashboardChartPalette.accent}
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  dataKey="criticalAlerts"
                  fill="url(#criticalAlertsArea)"
                  fillOpacity={1}
                  name="criticalAlerts"
                  stroke={dashboardChartPalette.danger}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          action={
            <span className="aegis-chip">
              <Database className="h-3.5 w-3.5 text-aegis-300" />
              {summary.metrics.totalLogs.toLocaleString()} logs
            </span>
          }
          subtitle="Telemetry distribution by severity across the currently seeded log dataset."
          title="Logs by severity"
        >
          <div className="h-[320px]">
            <ResponsiveContainer
              height="100%"
              width="100%"
            >
              <BarChart data={summary.logsBySeverity}>
                <CartesianGrid
                  stroke={dashboardChartPalette.grid}
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="severity"
                  tick={{ fill: dashboardChartPalette.axis, fontSize: 12 }}
                  tickFormatter={formatLogLabel}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tick={{ fill: dashboardChartPalette.axis, fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      nameFormatter={formatLogLabel}
                      valueFormatter={(value) => `${value} logs`}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  radius={[14, 14, 0, 0]}
                >
                  {summary.logsBySeverity.map((entry) => (
                    <Cell
                      fill={logSeverityChartColors[entry.severity]}
                      key={entry.severity}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          action={
            <Link
              className="aegis-button-secondary"
              to="/alerts"
            >
              Open alerts queue
            </Link>
          }
          subtitle="Most recent detections surfaced by the protected backend, ready for triage from the Alert Management module."
          title="Recent alerts"
        >
          {summary.recentAlerts.length === 0 ? (
            <EmptyState
              description="Recent alerts will appear here once detections are available."
              icon={Siren}
              title="No recent alerts"
            />
          ) : (
            <div className="aegis-table-shell overflow-x-auto">
              <table className="aegis-table min-w-[920px]">
                <thead>
                  <tr>
                    <th>Alert</th>
                    <th>Source</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        <Link
                          className="block"
                          to={`/alerts?alertId=${alert.id}`}
                        >
                          <p className="font-semibold text-white transition hover:text-aegis-300">
                            {alert.title}
                          </p>
                          <p className="mt-2 max-w-[360px] text-sm leading-7 text-slate-300">
                            {alert.description}
                          </p>
                        </Link>
                      </td>
                      <td className="text-slate-200">{alert.source}</td>
                      <td>
                        <StatusBadge
                          label={formatAlertLabel(alert.severity)}
                          tone={alertSeverityToneMap[alert.severity]}
                        />
                      </td>
                      <td>
                        <StatusBadge
                          label={formatAlertLabel(alert.status)}
                          tone={alertStatusToneMap[alert.status]}
                        />
                      </td>
                      <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel
            action={
              <span className="aegis-chip">
                <FolderKanban className="h-3.5 w-3.5 text-aegis-300" />
                {totalIncidents.toLocaleString()} incidents
              </span>
            }
            subtitle="Workflow state distribution for the current incident response queue."
            title="Incidents by status"
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="h-[260px]">
                <ResponsiveContainer
                  height="100%"
                  width="100%"
                >
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={summary.incidentsByStatus}
                      dataKey="count"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {summary.incidentsByStatus.map((entry) => (
                        <Cell
                          fill={incidentStatusChartColors[entry.status]}
                          key={entry.status}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          nameFormatter={formatIncidentLabel}
                          valueFormatter={(value) => `${value} incidents`}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {summary.incidentsByStatus.map((entry) => (
                  <div
                    className="aegis-panel-muted flex items-center justify-between gap-4 p-4"
                    key={entry.status}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: incidentStatusChartColors[entry.status] }}
                      />
                      <StatusBadge
                        label={formatIncidentLabel(entry.status)}
                        tone={incidentStatusToneMap[entry.status]}
                      />
                    </div>
                    <span className="font-display text-2xl text-white">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel
            action={
              <Link
                className="aegis-button-secondary"
                to="/incidents"
              >
                Open incidents
              </Link>
            }
            subtitle="Latest response cases with ownership and status context for the active analyst session."
            title="Recent incidents"
          >
            {summary.recentIncidents.length === 0 ? (
              <EmptyState
                description="Recent incidents will appear here once alerts are escalated into response cases."
                icon={FolderKanban}
                title="No recent incidents"
              />
            ) : (
              <div className="space-y-3">
                {summary.recentIncidents.map((incident) => (
                  <Link
                    className="block rounded-[24px] border border-white/5 bg-white/[0.03] p-4 transition hover:border-aegis-500/30 hover:bg-white/[0.045]"
                    key={incident.id}
                    to={`/incidents?incidentId=${incident.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-aegis-300">
                          {incident.reference}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-white">{incident.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{incident.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={formatIncidentLabel(incident.severity)}
                          tone={incidentSeverityToneMap[incident.severity]}
                        />
                        <StatusBadge
                          label={formatIncidentLabel(incident.status)}
                          tone={incidentStatusToneMap[incident.status]}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                      <span>Assignee: {incident.assigneeName ?? 'Unassigned'}</span>
                      <span>{new Date(incident.openedAt).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
}
