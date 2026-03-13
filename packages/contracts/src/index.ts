export type RequestMeta = {
  timestamp: string;
  requestId?: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccess<TData> = {
  success: true;
  message: string;
  data: TData;
  meta?: RequestMeta;
};

export type ApiFailure = {
  success: false;
  error: ApiErrorBody;
  meta?: RequestMeta;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export type PaginatedResult<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const userRoleValues = ['admin', 'analyst', 'responder'] as const;
export type UserRole = (typeof userRoleValues)[number];

export const logSeverityValues = ['info', 'low', 'medium', 'high', 'critical'] as const;
export type LogSeverity = (typeof logSeverityValues)[number];
export const logEventTypeValues = [
  'authentication',
  'process_execution',
  'network_traffic',
  'email_security',
  'privilege_change',
  'file_activity',
  'cloud_audit',
] as const;
export type LogEventType = (typeof logEventTypeValues)[number];
export const logStatusValues = ['new', 'reviewed', 'investigating', 'archived'] as const;
export type LogStatus = (typeof logStatusValues)[number];
export const alertSeverityValues = ['low', 'medium', 'high', 'critical'] as const;
export type AlertSeverity = (typeof alertSeverityValues)[number];
export const alertStatusValues = ['new', 'investigating', 'escalated', 'resolved'] as const;
export type AlertStatus = (typeof alertStatusValues)[number];
export const incidentSeverityValues = ['low', 'medium', 'high', 'critical'] as const;
export type IncidentSeverity = (typeof incidentSeverityValues)[number];
export const incidentStatusValues = [
  'open',
  'investigating',
  'contained',
  'resolved',
  'closed',
] as const;
export type IncidentStatus = (typeof incidentStatusValues)[number];
export type HealthStatus = {
  service: 'api';
  status: 'ok' | 'degraded';
  version: string;
  uptimeSeconds: number;
  environment: string;
};

export type HealthReadinessStatus = {
  service: 'api';
  status: 'ready' | 'not_ready';
  version: string;
  environment: string;
  database: 'connected' | 'disconnected';
  checkedAt: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
};

export type DashboardMetrics = {
  totalLogs: number;
  totalAlerts: number;
  criticalAlerts: number;
  openIncidents: number;
  resolvedIncidents: number;
};

export type DashboardAlertTrendPoint = {
  date: string;
  alerts: number;
  criticalAlerts: number;
};

export type DashboardLogsBySeverityPoint = {
  severity: LogSeverity;
  count: number;
};

export type DashboardIncidentsByStatusPoint = {
  status: IncidentStatus;
  count: number;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LogRecord = {
  id: string;
  timestamp: string;
  source: string;
  host: string;
  severity: LogSeverity;
  eventType: LogEventType;
  message: string;
  rawData: unknown | null;
  status: LogStatus;
  createdAt: string;
};

export type LogAlertSummary = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
};

export type LogDetailRecord = LogRecord & {
  relatedAlerts: LogAlertSummary[];
};

export type LogFilterOptions = {
  severities: LogSeverity[];
  sources: string[];
  eventTypes: LogEventType[];
  statuses: LogStatus[];
};

export type LogListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  severity?: LogSeverity[];
  source?: string[];
  eventType?: LogEventType[];
  status?: LogStatus[];
  dateFrom?: string;
  dateTo?: string;
};

export type LogListResult = PaginatedResult<LogRecord> & {
  filters: LogFilterOptions;
};

export type CreateLogPayload = {
  timestamp: string;
  source: string;
  host: string;
  severity: LogSeverity;
  eventType: LogEventType;
  message: string;
  rawData?: unknown;
  status: LogStatus;
};

export type BulkCreateLogsPayload = {
  logs: CreateLogPayload[];
};

export type BulkCreateLogsResult = {
  insertedCount: number;
  items: LogRecord[];
};

export type AlertLinkedLogSummary = {
  id: string;
  source: string;
  host: string;
  eventType: LogEventType;
  message: string;
  timestamp: string;
};

export type AlertIncidentSummary = {
  id: string;
  reference: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
};

export type AlertRecord = {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: AlertSeverity;
  status: AlertStatus;
  confidenceScore: number;
  linkedLogId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AlertDetailRecord = AlertRecord & {
  linkedLog: AlertLinkedLogSummary | null;
  incident: AlertIncidentSummary | null;
};

export type AlertFilterOptions = {
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  sources: string[];
};

export type AlertListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  severity?: AlertSeverity[];
  source?: string[];
  status?: AlertStatus[];
};

export type AlertListResult = PaginatedResult<AlertRecord> & {
  filters: AlertFilterOptions;
};

export type CreateAlertPayload = {
  title: string;
  description: string;
  source: string;
  severity: AlertSeverity;
  confidenceScore: number;
  linkedLogId?: string | null;
  status?: AlertStatus;
};

export type UpdateAlertStatusPayload = {
  status: AlertStatus;
};

export type CreateIncidentFromAlertPayload = {
  title?: string;
  description?: string;
  assigneeId?: string | null;
};

export type IncidentAssigneeOption = {
  id: string;
  fullName: string;
  role: UserRole;
};

export type IncidentRelatedAlertSummary = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
};

export type IncidentRecord = {
  id: string;
  reference: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  relatedAlertId: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentDetailRecord = IncidentRecord & {
  relatedAlert: IncidentRelatedAlertSummary | null;
  availableAssignees: IncidentAssigneeOption[];
};

export type IncidentFilterOptions = {
  severities: IncidentSeverity[];
  statuses: IncidentStatus[];
  assignees: IncidentAssigneeOption[];
};

export type IncidentListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  severity?: IncidentSeverity[];
  status?: IncidentStatus[];
  assigneeId?: string[];
};

export type IncidentListResult = PaginatedResult<IncidentRecord> & {
  filters: IncidentFilterOptions;
};

export type UpdateIncidentStatusPayload = {
  status: IncidentStatus;
};

export type AssignIncidentPayload = {
  assigneeId: string | null;
};

export const aiAnalyzerProviderValues = ['mock', 'external'] as const;
export type AiAnalyzerProvider = (typeof aiAnalyzerProviderValues)[number];

export type AiThreatAssessment = {
  threatLabel: string;
  confidenceScore: number;
  recommendedAction: string;
  reasoningSummary: string;
};

export type AiGeneratedAlertSummary = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
};

export type AnalyzeLogPayload = {
  logId: string;
  createAlertOnHighConfidence?: boolean;
};

export type AnalyzeBatchPayload = {
  logIds?: string[];
  limit?: number;
  createAlertsOnHighConfidence?: boolean;
};

export type AiLogAnalysisResult = AiThreatAssessment & {
  logId: string;
  provider: AiAnalyzerProvider;
  analyzedAt: string;
  alertCreated: boolean;
  generatedAlert: AiGeneratedAlertSummary | null;
};

export type AiBatchAnalysisResult = {
  totalLogs: number;
  analyzedCount: number;
  createdAlertCount: number;
  items: AiLogAnalysisResult[];
};

export type AiCapabilities = {
  provider: AiAnalyzerProvider;
  autoAlertThreshold: number;
  endpoints: string[];
  integrationMode: 'in_process_mock' | 'external_http';
};

export type DashboardSummary = {
  metrics: DashboardMetrics;
  alertTrend: DashboardAlertTrendPoint[];
  logsBySeverity: DashboardLogsBySeverityPoint[];
  incidentsByStatus: DashboardIncidentsByStatusPoint[];
  recentAlerts: AlertRecord[];
  recentIncidents: IncidentRecord[];
  systemHealth: {
    api: 'online';
    database: 'connected';
    auth: 'jwt';
    environment: string;
  };
};
