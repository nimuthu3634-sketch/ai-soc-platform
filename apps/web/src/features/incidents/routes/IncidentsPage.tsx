import type {
  IncidentListQuery,
  IncidentSeverity,
  IncidentStatus,
} from '@aegis-core/contracts';
import { Eye, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IncidentDetailDrawer } from '../components/IncidentDetailDrawer';
import { useAssignIncidentMutation } from '../hooks/useAssignIncidentMutation';
import { useIncidentDetailQuery } from '../hooks/useIncidentDetailQuery';
import { useIncidentsQuery } from '../hooks/useIncidentsQuery';
import { useUpdateIncidentStatusMutation } from '../hooks/useUpdateIncidentStatusMutation';
import {
  formatIncidentLabel,
  incidentSeverityToneMap,
  incidentStatusToneMap,
} from '../lib/incident-formatters';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/features/auth/context/AuthContext';

type IncidentFilterFormState = {
  search: string;
  severity: string;
  status: string;
  assigneeId: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePage(value: string | null) {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_PAGE;
}

function getFilterFormState(searchParams: URLSearchParams): IncidentFilterFormState {
  return {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    status: searchParams.get('status') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
  };
}

export function IncidentsPage() {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersForm, setFiltersForm] = useState<IncidentFilterFormState>(() =>
    getFilterFormState(searchParams),
  );
  const [statusDraft, setStatusDraft] = useState<IncidentStatus>('open');
  const [assigneeDraft, setAssigneeDraft] = useState('');

  useEffect(() => {
    setFiltersForm(getFilterFormState(searchParams));
  }, [searchParams]);

  const page = parsePage(searchParams.get('page'));
  const selectedIncidentId = searchParams.get('incidentId');
  const activeFilters = getFilterFormState(searchParams);
  const incidentsQueryInput: IncidentListQuery = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(activeFilters.search ? { search: activeFilters.search } : {}),
    ...(activeFilters.severity
      ? { severity: [activeFilters.severity as IncidentSeverity] }
      : {}),
    ...(activeFilters.status ? { status: [activeFilters.status as IncidentStatus] } : {}),
    ...(activeFilters.assigneeId ? { assigneeId: [activeFilters.assigneeId] } : {}),
  };

  const incidentsQuery = useIncidentsQuery(incidentsQueryInput);
  const incidentDetailQuery = useIncidentDetailQuery(selectedIncidentId);
  const updateIncidentStatusMutation = useUpdateIncidentStatusMutation(selectedIncidentId);
  const assignIncidentMutation = useAssignIncidentMutation(selectedIncidentId);
  const incidents = incidentsQuery.data?.items ?? [];

  useEffect(() => {
    if (incidentDetailQuery.data) {
      setStatusDraft(incidentDetailQuery.data.status);
      setAssigneeDraft(incidentDetailQuery.data.assigneeId ?? '');
    }
  }, [incidentDetailQuery.data]);

  const canManageIncidents = hasRole(['admin', 'responder']);
  const availableSeverities = incidentsQuery.data?.filters.severities ?? [
    'low',
    'medium',
    'high',
    'critical',
  ];
  const availableStatuses = incidentsQuery.data?.filters.statuses ?? [
    'open',
    'investigating',
    'contained',
    'resolved',
    'closed',
  ];
  const availableAssignees = incidentsQuery.data?.filters.assignees ?? [];

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
          nextParams.delete('incidentId');
        }

        return nextParams;
      });
    });
  };

  const handleApplyFilters = () => {
    updateSearchParamValues({
      search: filtersForm.search || null,
      severity: filtersForm.severity || null,
      status: filtersForm.status || null,
      assigneeId: filtersForm.assigneeId || null,
    });
  };

  const handleClearFilters = () => {
    setFiltersForm({
      search: '',
      severity: '',
      status: '',
      assigneeId: '',
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

  const openIncidentDetail = (incidentId: string) => {
    updateSearchParamValues(
      {
        incidentId,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  const closeIncidentDetail = () => {
    updateSearchParamValues(
      {
        incidentId: null,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  const handleSaveStatus = async () => {
    if (!selectedIncidentId) {
      return;
    }

    await updateIncidentStatusMutation.mutateAsync({ status: statusDraft });
  };

  const handleSaveAssignment = async () => {
    if (!selectedIncidentId) {
      return;
    }

    await assignIncidentMutation.mutateAsync({
      assigneeId: assigneeDraft || null,
    });
  };

  const statusMutationError =
    updateIncidentStatusMutation.error instanceof Error
      ? updateIncidentStatusMutation.error.message
      : null;
  const assignmentMutationError =
    assignIncidentMutation.error instanceof Error ? assignIncidentMutation.error.message : null;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          actions={
            <StatusBadge
              label={`${incidentsQuery.data?.total ?? 0} incidents`}
              tone="danger"
            />
          }
          description="Track escalated alerts through the response workflow with assignment controls, live incident states, and linked alert context."
          eyebrow="Incident Management"
          title="Response Coordination"
        />

        <Panel
          subtitle="Search the response queue by case reference or narrative, then filter by severity, status, and assignee."
          title="Incident filters"
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
                  placeholder="Search reference, title, or description"
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
                    {formatIncidentLabel(severity)}
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
                    {formatIncidentLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Assignee</span>
              <select
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    assigneeId: event.target.value,
                  }))
                }
                value={filtersForm.assigneeId}
              >
                <option value="">All assignees</option>
                {availableAssignees.map((assignee) => (
                  <option
                    className="bg-slate-950"
                    key={assignee.id}
                    value={assignee.id}
                  >
                    {assignee.fullName}
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
          subtitle="Open a case to update its status, assign ownership, and inspect the linked alert that triggered the response workflow."
          title="Incident queue"
        >
          {incidentsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="aegis-panel-muted h-16 animate-pulse"
                  key={index}
                />
              ))}
            </div>
          ) : incidentsQuery.isError ? (
            <EmptyState
              action={
                <button
                  className="aegis-button-secondary"
                  onClick={() => {
                    void incidentsQuery.refetch();
                  }}
                  type="button"
                >
                  Retry
                </button>
              }
              description="The protected incidents endpoint could not be reached. Verify the API and session, then retry."
              icon={ShieldAlert}
              title="Unable to load incidents"
            />
          ) : incidents.length === 0 ? (
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
              description="No incidents match the current query. Clear the filters to inspect the seeded response workflow."
              icon={ShieldAlert}
              title="No incidents match this query"
            />
          ) : (
            <div className="space-y-5">
              <div className="aegis-table-shell overflow-x-auto">
                <table className="aegis-table min-w-[1120px]">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Case</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Opened</th>
                      <th>Linked alert</th>
                      <th className="text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-300">
                          {incident.reference}
                        </td>
                        <td>
                          <p className="font-semibold text-white">{incident.title}</p>
                          <p className="mt-2 max-w-[420px] text-sm leading-7 text-slate-300">
                            {incident.description}
                          </p>
                        </td>
                        <td>
                          <StatusBadge
                            label={formatIncidentLabel(incident.severity)}
                            tone={incidentSeverityToneMap[incident.severity]}
                          />
                        </td>
                        <td>
                          <StatusBadge
                            label={formatIncidentLabel(incident.status)}
                            tone={incidentStatusToneMap[incident.status]}
                          />
                        </td>
                        <td className="text-slate-200">{incident.assigneeName ?? 'Unassigned'}</td>
                        <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                          {new Date(incident.openedAt).toLocaleString()}
                        </td>
                        <td className="text-slate-300">
                          {incident.relatedAlertId ? 'Linked alert' : 'Standalone'}
                        </td>
                        <td className="text-right">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-aegis-500/30 hover:text-white"
                            onClick={() => openIncidentDetail(incident.id)}
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
                itemLabel="incidents"
                onPageChange={handlePageChange}
                page={incidentsQuery.data?.page ?? page}
                pageSize={incidentsQuery.data?.pageSize ?? DEFAULT_PAGE_SIZE}
                total={incidentsQuery.data?.total ?? 0}
                totalPages={incidentsQuery.data?.totalPages ?? 1}
              />
            </div>
          )}
        </Panel>
      </div>

      <IncidentDetailDrawer
        assignmentError={assignmentMutationError}
        assigneeDraft={assigneeDraft}
        canManage={canManageIncidents}
        incident={incidentDetailQuery.data}
        isError={incidentDetailQuery.isError}
        isLoading={incidentDetailQuery.isLoading}
        isSavingAssignment={assignIncidentMutation.isPending}
        isSavingStatus={updateIncidentStatusMutation.isPending}
        onAssigneeDraftChange={setAssigneeDraft}
        onClose={closeIncidentDetail}
        onRetry={() => {
          void incidentDetailQuery.refetch();
        }}
        onSaveAssignment={() => {
          void handleSaveAssignment();
        }}
        onSaveStatus={() => {
          void handleSaveStatus();
        }}
        onStatusDraftChange={setStatusDraft}
        open={Boolean(selectedIncidentId)}
        statusDraft={statusDraft}
        statusError={statusMutationError}
      />
    </>
  );
}
