import type {
  AiBatchAnalysisResult,
  AiCapabilities,
  AiLogAnalysisResult,
  AlertDetailRecord,
  AlertListQuery,
  AlertListResult,
  AnalyzeBatchPayload,
  AnalyzeLogPayload,
  AssignIncidentPayload,
  ApiResponse,
  AuthSession,
  AuthUser,
  BulkCreateLogsPayload,
  BulkCreateLogsResult,
  CreateAlertPayload,
  CreateIncidentFromAlertPayload,
  CreateLogPayload,
  DashboardSummary,
  HealthStatus,
  IncidentDetailRecord,
  IncidentListQuery,
  IncidentListResult,
  LoginPayload,
  LogDetailRecord,
  LogListQuery,
  LogListResult,
  RegisterPayload,
  UpdateAlertStatusPayload,
  UpdateIncidentStatusPayload,
} from '@aegis-core/contracts';

import { clearStoredSession, getStoredToken } from '@/features/auth/lib/auth-storage';

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');

const buildQueryString = (
  params: Record<string, string | number | string[] | undefined>,
) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }

      searchParams.set(key, value.join(','));
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
};

type FetchOptions = {
  authenticated?: boolean;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = 'REQUEST_FAILED',
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function fetchJson<TData>(
  path: string,
  init?: RequestInit,
  options?: FetchOptions,
): Promise<TData> {
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.authenticated) {
    const token = getStoredToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => undefined)) as ApiResponse<TData> | undefined;

  if (response.status === 401 && options?.authenticated) {
    clearStoredSession();
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload && !payload.success
        ? payload.error.message
        : response.statusText || 'Request failed';
    const code = payload && !payload.success ? payload.error.code : 'REQUEST_FAILED';

    throw new ApiClientError(message, response.status, code);
  }

  return payload.data;
}

export const apiClient = {
  register: (payload: RegisterPayload) =>
    fetchJson<AuthSession>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: false },
    ),
  login: (payload: LoginPayload) =>
    fetchJson<AuthSession>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: false },
    ),
  getMe: () => fetchJson<AuthUser>('/auth/me', undefined, { authenticated: true }),
  getHealth: () => fetchJson<HealthStatus>('/health'),
  getDashboardSummary: () =>
    fetchJson<DashboardSummary>('/dashboard/summary', undefined, { authenticated: true }),
  getLogs: (query: LogListQuery = {}) =>
    fetchJson<LogListResult>(
      `/logs${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        severity: query.severity,
        source: query.source,
        eventType: query.eventType,
        status: query.status,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      })}`,
      undefined,
      { authenticated: true },
    ),
  getLogById: (logId: string) =>
    fetchJson<LogDetailRecord>(`/logs/${logId}`, undefined, { authenticated: true }),
  createLog: (payload: CreateLogPayload) =>
    fetchJson<LogDetailRecord>(
      '/logs',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  createLogsBulk: (payload: BulkCreateLogsPayload) =>
    fetchJson<BulkCreateLogsResult>(
      '/logs/bulk',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  getAlerts: (query: AlertListQuery = {}) =>
    fetchJson<AlertListResult>(
      `/alerts${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        severity: query.severity,
        source: query.source,
        status: query.status,
      })}`,
      undefined,
      { authenticated: true },
    ),
  getAlertById: (alertId: string) =>
    fetchJson<AlertDetailRecord>(`/alerts/${alertId}`, undefined, { authenticated: true }),
  createAlert: (payload: CreateAlertPayload) =>
    fetchJson<AlertDetailRecord>(
      '/alerts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  updateAlertStatus: (alertId: string, payload: UpdateAlertStatusPayload) =>
    fetchJson<AlertDetailRecord>(
      `/alerts/${alertId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  createIncidentFromAlert: (alertId: string, payload: CreateIncidentFromAlertPayload = {}) =>
    fetchJson<IncidentDetailRecord>(
      `/alerts/${alertId}/incidents`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  getIncidents: (query: IncidentListQuery = {}) =>
    fetchJson<IncidentListResult>(
      `/incidents${buildQueryString({
        page: query.page,
        pageSize: query.pageSize,
        search: query.search,
        severity: query.severity,
        status: query.status,
        assigneeId: query.assigneeId,
      })}`,
      undefined,
      { authenticated: true },
    ),
  getIncidentById: (incidentId: string) =>
    fetchJson<IncidentDetailRecord>(`/incidents/${incidentId}`, undefined, {
      authenticated: true,
    }),
  updateIncidentStatus: (incidentId: string, payload: UpdateIncidentStatusPayload) =>
    fetchJson<IncidentDetailRecord>(
      `/incidents/${incidentId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  assignIncident: (incidentId: string, payload: AssignIncidentPayload) =>
    fetchJson<IncidentDetailRecord>(
      `/incidents/${incidentId}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  getAiCapabilities: () =>
    fetchJson<AiCapabilities>('/ai/capabilities', undefined, { authenticated: true }),
  analyzeLog: (payload: AnalyzeLogPayload) =>
    fetchJson<AiLogAnalysisResult>(
      '/ai/analyze-log',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
  analyzeBatch: (payload: AnalyzeBatchPayload) =>
    fetchJson<AiBatchAnalysisResult>(
      '/ai/analyze-batch',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { authenticated: true },
    ),
};
