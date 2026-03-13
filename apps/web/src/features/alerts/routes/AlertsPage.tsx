import type { AlertListQuery, AlertSeverity, AlertStatus } from '@aegis-core/contracts';
import { Eye, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AlertDetailDrawer } from '../components/AlertDetailDrawer';
import { useAlertDetailQuery } from '../hooks/useAlertDetailQuery';
import { useAlertsQuery } from '../hooks/useAlertsQuery';
import { useCreateIncidentFromAlertMutation } from '../hooks/useCreateIncidentFromAlertMutation';
import { useUpdateAlertStatusMutation } from '../hooks/useUpdateAlertStatusMutation';
import {
  alertSeverityToneMap,
  alertStatusToneMap,
  formatAlertLabel,
} from '../lib/alert-formatters';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/features/auth/context/AuthContext';

type AlertFilterFormState = {
  search: string;
  severity: string;
  source: string;
  status: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePage(value: string | null) {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_PAGE;
}

function getFilterFormState(searchParams: URLSearchParams): AlertFilterFormState {
  return {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    source: searchParams.get('source') ?? '',
    status: searchParams.get('status') ?? '',
  };
}

export function AlertsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersForm, setFiltersForm] = useState<AlertFilterFormState>(() =>
    getFilterFormState(searchParams),
  );
  const [statusDraft, setStatusDraft] = useState<AlertStatus>('new');

  useEffect(() => {
    setFiltersForm(getFilterFormState(searchParams));
  }, [searchParams]);

  const page = parsePage(searchParams.get('page'));
  const selectedAlertId = searchParams.get('alertId');
  const activeFilters = getFilterFormState(searchParams);
  const alertsQueryInput: AlertListQuery = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(activeFilters.search ? { search: activeFilters.search } : {}),
    ...(activeFilters.severity ? { severity: [activeFilters.severity as AlertSeverity] } : {}),
    ...(activeFilters.source ? { source: [activeFilters.source] } : {}),
    ...(activeFilters.status ? { status: [activeFilters.status as AlertStatus] } : {}),
  };

  const alertsQuery = useAlertsQuery(alertsQueryInput);
  const alertDetailQuery = useAlertDetailQuery(selectedAlertId);
  const updateAlertStatusMutation = useUpdateAlertStatusMutation(selectedAlertId);
  const createIncidentMutation = useCreateIncidentFromAlertMutation(selectedAlertId);
  const alerts = alertsQuery.data?.items ?? [];

  useEffect(() => {
    if (alertDetailQuery.data) {
      setStatusDraft(alertDetailQuery.data.status);
    }
  }, [alertDetailQuery.data]);

  const availableSources = alertsQuery.data?.filters.sources ?? [];
  const availableSeverities = alertsQuery.data?.filters.severities ?? [
    'low',
    'medium',
    'high',
    'critical',
  ];
  const availableStatuses = alertsQuery.data?.filters.statuses ?? [
    'new',
    'investigating',
    'escalated',
    'resolved',
  ];

  const canManageAlerts = hasRole(['admin', 'analyst', 'responder']);
  const canCreateIncident = hasRole(['admin', 'analyst', 'responder']);

  const updateSearchParamValues = (
    updates: Record<string, string | null | undefined>,
    options?: {
      resetPage?: boolean;
      preserveSelection?: boolean;
    },
  ) => {
    startTransition(() => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        for (const [key, value] of Object.entries(updates)) {
          if (!value) {
            nextParams.delete(key);
            continue;
          }

          nextParams.set(key, value);
        }

        if (options?.resetPage ?? true) {
          nextParams.set('page', '1');
        }

        if (!options?.preserveSelection) {
          nextParams.delete('alertId');
        }

        return nextParams;
      });
    });
  };

  const handleApplyFilters = () => {
    updateSearchParamValues({
      search: filtersForm.search || null,
      severity: filtersForm.severity || null,
      source: filtersForm.source || null,
      status: filtersForm.status || null,
    });
  };

  const handleClearFilters = () => {
    setFiltersForm({
      search: '',
      severity: '',
      source: '',
      status: '',
    });

    startTransition(() => {
      setSearchParams(new URLSearchParams());
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParamValues(
      {
        page: String(nextPage),
      },
      {
        resetPage: false,
      },
    );
  };

  const openAlertDetail = (alertId: string) => {
    updateSearchParamValues(
      {
        alertId,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  const closeAlertDetail = () => {
    updateSearchParamValues(
      {
        alertId: null,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  const handleSaveStatus = async () => {
    if (!selectedAlertId) {
      return;
    }

    await updateAlertStatusMutation.mutateAsync({ status: statusDraft });
  };

  const handleCreateIncident = async () => {
    if (!selectedAlertId) {
      return;
    }

    const incident = await createIncidentMutation.mutateAsync({});
    navigate(`/incidents?incidentId=${incident.id}`);
  };

  const mutationStatusError =
    updateAlertStatusMutation.error instanceof Error
      ? updateAlertStatusMutation.error.message
      : null;
  const incidentMutationError =
    createIncidentMutation.error instanceof Error ? createIncidentMutation.error.message : null;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          actions={
            <StatusBadge
              label={`${alertsQuery.data?.total ?? 0} alerts`}
              tone="warning"
            />
          }
          description="Triage, inspect, and escalate suspicious detections from live seeded alert data. The queue now supports protected list queries, workflow state updates, and incident creation."
          eyebrow="Alert Management"
          title="Detection Queue"
        />

        <Panel
          subtitle="Search alert titles and descriptions, then narrow the queue by source, severity, and workflow state."
          title="Alert filters"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="aegis-input pl-11"
                  onChange={(event) =>
                    setFiltersForm((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleApplyFilters();
                    }
                  }}
                  placeholder="Search title, source, or description"
                  type="text"
                  value={filtersForm.search}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Severity</span>
              <select
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    severity: event.target.value,
                  }))
                }
                value={filtersForm.severity}
              >
                <option value="">All severities</option>
                {availableSeverities.map((severity) => (
                  <option
                    className="bg-slate-950"
                    key={severity}
                    value={severity}
                  >
                    {formatAlertLabel(severity)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Source</span>
              <select
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }
                value={filtersForm.source}
              >
                <option value="">All sources</option>
                {availableSources.map((source) => (
                  <option
                    className="bg-slate-950"
                    key={source}
                    value={source}
                  >
                    {source}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Status</span>
              <select
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                value={filtersForm.status}
              >
                <option value="">All statuses</option>
                {availableStatuses.map((status) => (
                  <option
                    className="bg-slate-950"
                    key={status}
                    value={status}
                  >
                    {formatAlertLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              className="aegis-button-primary"
              onClick={handleApplyFilters}
              type="button"
            >
              Apply filters
            </button>
            <button
              className="aegis-button-secondary"
              onClick={handleClearFilters}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </Panel>

        <Panel
          subtitle="Open any alert to review linked telemetry, update workflow state, or escalate it into an incident."
          title="Alert records"
        >
          {alertsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="aegis-panel-muted h-16 animate-pulse"
                  key={index}
                />
              ))}
            </div>
          ) : alertsQuery.isError ? (
            <EmptyState
              action={
                <button
                  className="aegis-button-secondary"
                  onClick={() => {
                    void alertsQuery.refetch();
                  }}
                  type="button"
                >
                  Retry
                </button>
              }
              description="The protected alerts endpoint could not be reached. Verify the API and session, then retry."
              icon={ShieldAlert}
              title="Unable to load alerts"
            />
          ) : alerts.length === 0 ? (
            <EmptyState
              action={
                <button
                  className="aegis-button-secondary"
                  onClick={handleClearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              }
              description="No alerts match the current query. Clear the filters to return to the seeded alert queue."
              icon={ShieldAlert}
              title="No alerts match this query"
            />
          ) : (
            <div className="space-y-5">
              <div className="aegis-table-shell overflow-x-auto">
                <table className="aegis-table min-w-[1080px]">
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Alert</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Confidence</th>
                      <th className="text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <p className="font-semibold text-white">{alert.title}</p>
                          <p className="mt-2 max-w-[420px] text-sm leading-7 text-slate-300">
                            {alert.description}
                          </p>
                        </td>
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
                        <td className="text-slate-200">{alert.source}</td>
                        <td className="font-semibold text-white">{alert.confidenceScore}%</td>
                        <td className="text-right">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-aegis-500/30 hover:text-white"
                            onClick={() => openAlertDetail(alert.id)}
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                itemLabel="alerts"
                onPageChange={handlePageChange}
                page={alertsQuery.data?.page ?? page}
                pageSize={alertsQuery.data?.pageSize ?? DEFAULT_PAGE_SIZE}
                total={alertsQuery.data?.total ?? 0}
                totalPages={alertsQuery.data?.totalPages ?? 1}
              />
            </div>
          )}
        </Panel>
      </div>

      <AlertDetailDrawer
        alert={alertDetailQuery.data}
        canCreateIncident={canCreateIncident}
        canUpdateStatus={canManageAlerts}
        incidentError={incidentMutationError}
        isCreatingIncident={createIncidentMutation.isPending}
        isError={alertDetailQuery.isError}
        isLoading={alertDetailQuery.isLoading}
        isSavingStatus={updateAlertStatusMutation.isPending}
        onClose={closeAlertDetail}
        onCreateIncident={() => {
          void handleCreateIncident();
        }}
        onRetry={() => {
          void alertDetailQuery.refetch();
        }}
        onSaveStatus={() => {
          void handleSaveStatus();
        }}
        onStatusDraftChange={setStatusDraft}
        open={Boolean(selectedAlertId)}
        statusDraft={statusDraft}
        statusError={mutationStatusError}
      />
    </>
  );
}
