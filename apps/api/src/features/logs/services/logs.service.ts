import type {
  BulkCreateLogsPayload,
  BulkCreateLogsResult,
  CreateLogPayload,
  LogDetailRecord,
  LogFilterOptions,
  LogListQuery,
  LogListResult,
  LogRecord,
} from '@aegis-core/contracts';
import {
  logEventTypeValues,
  logSeverityValues,
  logStatusValues,
} from '@aegis-core/contracts';
import type {
  Prisma,
  LogEventType as PrismaLogEventType,
  LogSeverity as PrismaLogSeverity,
  LogStatus as PrismaLogStatus,
} from '@prisma/client';
import {
  Prisma as PrismaNamespace,
} from '@prisma/client';

import { AppError } from '../../../lib/http/app-error.js';
import { prisma } from '../../../lib/prisma.js';

const logRecordSelect = {
  id: true,
  timestamp: true,
  source: true,
  host: true,
  severity: true,
  eventType: true,
  message: true,
  rawData: true,
  status: true,
  createdAt: true,
} satisfies PrismaNamespace.LogSelect;

const logDetailSelect = {
  ...logRecordSelect,
  alerts: {
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
} satisfies PrismaNamespace.LogSelect;

type LogRecordModel = PrismaNamespace.LogGetPayload<{
  select: typeof logRecordSelect;
}>;

type LogDetailModel = PrismaNamespace.LogGetPayload<{
  select: typeof logDetailSelect;
}>;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function toStartDate(value: string) {
  const date = new Date(value);

  if (dateOnlyPattern.test(value)) {
    date.setUTCHours(0, 0, 0, 0);
  }

  return date;
}

function toEndDate(value: string) {
  const date = new Date(value);

  if (dateOnlyPattern.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
}

function toPrismaSeverity(value: LogRecord['severity']) {
  return value.toUpperCase() as PrismaLogSeverity;
}

function toPrismaEventType(value: LogRecord['eventType']) {
  return value.toUpperCase() as PrismaLogEventType;
}

function toPrismaStatus(value: LogRecord['status']) {
  return value.toUpperCase() as PrismaLogStatus;
}

function mapLogRecord(log: LogRecordModel): LogRecord {
  return {
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    source: log.source,
    host: log.host,
    severity: log.severity.toLowerCase() as LogRecord['severity'],
    eventType: log.eventType.toLowerCase() as LogRecord['eventType'],
    message: log.message,
    rawData: log.rawData ?? null,
    status: log.status.toLowerCase() as LogRecord['status'],
    createdAt: log.createdAt.toISOString(),
  };
}

function mapLogDetailRecord(log: LogDetailModel): LogDetailRecord {
  return {
    ...mapLogRecord(log),
    relatedAlerts: log.alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity.toLowerCase() as LogDetailRecord['relatedAlerts'][number]['severity'],
      status: alert.status.toLowerCase() as LogDetailRecord['relatedAlerts'][number]['status'],
    })),
  };
}

function buildLogWhereClause(query: LogListQuery): Prisma.LogWhereInput {
  const filters: PrismaNamespace.LogWhereInput[] = [];

  if (query.search) {
    filters.push({
      OR: [
        {
          message: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          source: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          host: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  if (query.severity && query.severity.length > 0) {
    filters.push({
      severity: {
        in: query.severity.map(toPrismaSeverity),
      },
    });
  }

  if (query.source && query.source.length > 0) {
    filters.push({
      source: {
        in: query.source,
      },
    });
  }

  if (query.eventType && query.eventType.length > 0) {
    filters.push({
      eventType: {
        in: query.eventType.map(toPrismaEventType),
      },
    });
  }

  if (query.status && query.status.length > 0) {
    filters.push({
      status: {
        in: query.status.map(toPrismaStatus),
      },
    });
  }

  if (query.dateFrom || query.dateTo) {
    filters.push({
      timestamp: {
        ...(query.dateFrom ? { gte: toStartDate(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: toEndDate(query.dateTo) } : {}),
      },
    });
  }

  if (filters.length === 0) {
    return {};
  }

  return {
    AND: filters,
  };
}

function toCreateLogData(payload: CreateLogPayload): Prisma.LogCreateInput {
  return {
    timestamp: new Date(payload.timestamp),
    source: payload.source,
    host: payload.host,
    severity: toPrismaSeverity(payload.severity),
    eventType: toPrismaEventType(payload.eventType),
    message: payload.message,
    rawData: payload.rawData ?? PrismaNamespace.JsonNull,
    status: toPrismaStatus(payload.status),
  };
}

async function getLogFilterOptions(): Promise<LogFilterOptions> {
  const sources = await prisma.log.findMany({
    distinct: ['source'],
    orderBy: {
      source: 'asc',
    },
    select: {
      source: true,
    },
  });

  return {
    severities: [...logSeverityValues],
    sources: sources.map((entry) => entry.source),
    eventTypes: [...logEventTypeValues],
    statuses: [...logStatusValues],
  };
}

export async function listLogs(query: LogListQuery): Promise<LogListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildLogWhereClause(query);

  const [total, logs] = await prisma.$transaction([
    prisma.log.count({ where }),
    prisma.log.findMany({
      where,
      select: logRecordSelect,
      orderBy: {
        timestamp: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const filters = await getLogFilterOptions();

  return {
    items: logs.map(mapLogRecord),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filters,
  };
}

export async function getLogById(logId: string): Promise<LogDetailRecord> {
  const log = await prisma.log.findUnique({
    where: {
      id: logId,
    },
    select: logDetailSelect,
  });

  if (!log) {
    throw new AppError(404, 'LOG_NOT_FOUND', 'The requested log entry could not be found.');
  }

  return mapLogDetailRecord(log);
}

export async function createLog(payload: CreateLogPayload): Promise<LogDetailRecord> {
  const log = await prisma.log.create({
    data: toCreateLogData(payload),
    select: logDetailSelect,
  });

  return mapLogDetailRecord(log);
}

export async function createLogsBulk(
  payload: BulkCreateLogsPayload,
): Promise<BulkCreateLogsResult> {
  const createdLogs = await prisma.$transaction(
    payload.logs.map((log) =>
      prisma.log.create({
        data: toCreateLogData(log),
        select: logRecordSelect,
      }),
    ),
  );

  return {
    insertedCount: createdLogs.length,
    items: createdLogs.map(mapLogRecord),
  };
}
