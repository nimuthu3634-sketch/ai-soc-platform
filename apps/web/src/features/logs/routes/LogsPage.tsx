import type { LogListQuery, LogSeverity } from '@aegis-core/contracts';
import { Eye, RotateCcw, Search } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { LogDetailDrawer } from '../components/LogDetailDrawer';
import { useLogDetailQuery } from '../hooks/useLogDetailQuery';
import { useLogsQuery } from '../hooks/useLogsQuery';
import {
  formatLogLabel,
  logSeverityToneMap,
  logStatusToneMap,
} from '../lib/log-formatters';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

type LogFilterFormState = {
  search: string;
  severity: string;
  source: string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePage(value: string | null) {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_PAGE;
}

function getFilterFormState(searchParams: URLSearchParams): LogFilterFormState {
  return {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    source: searchParams.get('source') ?? '',
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
  };
}

export function LogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersForm, setFiltersForm] = useState<LogFilterFormState>(() =>
    getFilterFormState(searchParams),
  );

  useEffect(() => {
    setFiltersForm(getFilterFormState(searchParams));
  }, [searchParams]);

  const page = parsePage(searchParams.get('page'));
  const selectedLogId = searchParams.get('logId');
  const activeFilters = getFilterFormState(searchParams);
  const logsQueryInput: LogListQuery = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(activeFilters.search ? { search: activeFilters.search } : {}),
    ...(activeFilters.severity ? { severity: [activeFilters.severity as LogSeverity] } : {}),
    ...(activeFilters.source ? { source: [activeFilters.source] } : {}),
    ...(activeFilters.dateFrom ? { dateFrom: activeFilters.dateFrom } : {}),
    ...(activeFilters.dateTo ? { dateTo: activeFilters.dateTo } : {}),
  };
  const logsQuery = useLogsQuery(logsQueryInput);
  const logDetailQuery = useLogDetailQuery(selectedLogId);
  const logs = logsQuery.data?.items ?? [];
  const availableSources = logsQuery.data?.filters.sources ?? [];
  const availableSeverities = logsQuery.data?.filters.severities ?? [
    'info',
    'low',
    'medium',
    'high',
    'critical',
  ];

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
          nextParams.delete('logId');
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
      dateFrom: filtersForm.dateFrom || null,
      dateTo: filtersForm.dateTo || null,
    });
  };

  const handleClearFilters = () => {
    setFiltersForm({
      search: '',
      severity: '',
      source: '',
      dateFrom: '',
      dateTo: '',
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

  const openLogDetail = (logId: string) => {
    updateSearchParamValues(
      {
        logId,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  const closeLogDetail = () => {
    updateSearchParamValues(
      {
        logId: null,
      },
      {
        resetPage: false,
        preserveSelection: true,
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          actions={
            <StatusBadge
              label={`${logsQuery.data?.total ?? 0} records`}
              tone="neutral"
            />
          }
          description="Search, filter, and inspect raw security telemetry from the protected backend. The module now supports real pagination, query-based filtering, and detailed payload review."
          eyebrow="Log Management"
          title="Event Intake"
        />

        <Panel
          subtitle="Search across message, source, and host. Filters are URL-backed so the view remains shareable and consistent while you paginate."
          title="Log filters"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
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
                  placeholder="Search message, source, or host"
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
                    {formatLogLabel(severity)}
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
              <span className="mb-2 block text-sm text-slate-300">From</span>
              <input
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
                type="date"
                value={filtersForm.dateFrom}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">To</span>
              <input
                className="aegis-input"
                onChange={(event) =>
                  setFiltersForm((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
                type="date"
                value={filtersForm.dateTo}
              />
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
          subtitle="Click any row to inspect the raw payload, timing, host, and any linked alert correlation."
          title="Log records"
        >
          {logsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="aegis-panel-muted h-16 animate-pulse"
                  key={index}
                />
              ))}
            </div>
          ) : logsQuery.isError ? (
            <EmptyState
              action={
                <button
                  className="aegis-button-secondary"
                  onClick={() => {
                    void logsQuery.refetch();
                  }}
                  type="button"
                >
                  Retry
                </button>
              }
              description="The protected logs endpoint could not be reached. Verify the API is running and the session is still valid, then retry."
              icon={Search}
              title="Unable to load logs"
            />
          ) : logs.length === 0 ? (
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
              description="No log entries match the current search or filters. Adjust the query or clear the filters to inspect the seeded telemetry."
              icon={Search}
              title="No logs match this query"
            />
          ) : (
            <div className="space-y-5">
              <div className="aegis-table-shell overflow-x-auto">
                <table className="aegis-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Severity</th>
                      <th>Source</th>
                      <th>Host</th>
                      <th>Event Type</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th className="text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <StatusBadge
                            label={formatLogLabel(log.severity)}
                            tone={logSeverityToneMap[log.severity]}
                          />
                        </td>
                        <td className="text-slate-200">{log.source}</td>
                        <td className="font-mono text-xs uppercase tracking-[0.16em] text-slate-300">
                          {log.host}
                        </td>
                        <td className="text-slate-300">{formatLogLabel(log.eventType)}</td>
                        <td>
                          <StatusBadge
                            label={formatLogLabel(log.status)}
                            tone={logStatusToneMap[log.status]}
                          />
                        </td>
                        <td>
                          <p className="max-w-[420px] text-sm leading-7 text-white">{log.message}</p>
                        </td>
                        <td className="text-right">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-aegis-500/30 hover:text-white"
                            onClick={() => openLogDetail(log.id)}
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
                onPageChange={handlePageChange}
                page={logsQuery.data?.page ?? page}
                pageSize={logsQuery.data?.pageSize ?? DEFAULT_PAGE_SIZE}
                total={logsQuery.data?.total ?? 0}
                totalPages={logsQuery.data?.totalPages ?? 1}
              />
            </div>
          )}
        </Panel>
      </div>

      <LogDetailDrawer
        isError={logDetailQuery.isError}
        isLoading={logDetailQuery.isLoading}
        log={logDetailQuery.data}
        onClose={closeLogDetail}
        onRetry={() => {
          void logDetailQuery.refetch();
        }}
        open={Boolean(selectedLogId)}
      />
    </>
  );
}
