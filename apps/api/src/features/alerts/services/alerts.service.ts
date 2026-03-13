import type {
  AlertDetailRecord,
  AlertFilterOptions,
  AlertListQuery,
  AlertListResult,
  AlertRecord,
  CreateAlertPayload,
} from '@aegis-core/contracts';
import {
  alertSeverityValues,
  alertStatusValues,
} from '@aegis-core/contracts';
import type {
  AlertSeverity as PrismaAlertSeverity,
  AlertStatus as PrismaAlertStatus,
} from '@prisma/client';
import type { Prisma as PrismaNamespace } from '@prisma/client';

import { AppError } from '../../../lib/http/app-error.js';
import { prisma } from '../../../lib/prisma.js';

const alertRecordSelect = {
  id: true,
  title: true,
  description: true,
  source: true,
  severity: true,
  status: true,
  confidenceScore: true,
  linkedLogId: true,
  createdAt: true,
  updatedAt: true,
} satisfies PrismaNamespace.AlertSelect;

const alertDetailSelect = {
  ...alertRecordSelect,
  linkedLog: {
    select: {
      id: true,
      source: true,
      host: true,
      eventType: true,
      message: true,
      timestamp: true,
    },
  },
  incident: {
    select: {
      id: true,
      reference: true,
      title: true,
      severity: true,
      status: true,
    },
  },
} satisfies PrismaNamespace.AlertSelect;

type AlertRecordModel = PrismaNamespace.AlertGetPayload<{
  select: typeof alertRecordSelect;
}>;

type AlertDetailModel = PrismaNamespace.AlertGetPayload<{
  select: typeof alertDetailSelect;
}>;

function toPrismaAlertSeverity(value: AlertRecord['severity']) {
  return value.toUpperCase() as PrismaAlertSeverity;
}

function toPrismaAlertStatus(value: AlertRecord['status']) {
  return value.toUpperCase() as PrismaAlertStatus;
}

function mapAlertRecord(alert: AlertRecordModel): AlertRecord {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    source: alert.source,
    severity: alert.severity.toLowerCase() as AlertRecord['severity'],
    status: alert.status.toLowerCase() as AlertRecord['status'],
    confidenceScore: alert.confidenceScore,
    linkedLogId: alert.linkedLogId,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
  };
}

function mapAlertDetailRecord(alert: AlertDetailModel): AlertDetailRecord {
  type LinkedLogSummary = NonNullable<AlertDetailRecord['linkedLog']>;
  type IncidentSummary = NonNullable<AlertDetailRecord['incident']>;

  return {
    ...mapAlertRecord(alert),
    linkedLog: alert.linkedLog
      ? {
          id: alert.linkedLog.id,
          source: alert.linkedLog.source,
          host: alert.linkedLog.host,
          eventType: alert.linkedLog.eventType.toLowerCase() as LinkedLogSummary['eventType'],
          message: alert.linkedLog.message,
          timestamp: alert.linkedLog.timestamp.toISOString(),
        }
      : null,
    incident: alert.incident
      ? {
          id: alert.incident.id,
          reference: alert.incident.reference,
          title: alert.incident.title,
          severity: alert.incident.severity.toLowerCase() as IncidentSummary['severity'],
          status: alert.incident.status.toLowerCase() as IncidentSummary['status'],
        }
      : null,
  };
}

function buildAlertWhereClause(query: AlertListQuery): PrismaNamespace.AlertWhereInput {
  const filters: PrismaNamespace.AlertWhereInput[] = [];

  if (query.search) {
    filters.push({
      OR: [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
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
      ],
    });
  }

  if (query.severity && query.severity.length > 0) {
    filters.push({
      severity: {
        in: query.severity.map(toPrismaAlertSeverity),
      },
    });
  }

  if (query.status && query.status.length > 0) {
    filters.push({
      status: {
        in: query.status.map(toPrismaAlertStatus),
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

  if (filters.length === 0) {
    return {};
  }

  return {
    AND: filters,
  };
}

async function getAlertFilterOptions(): Promise<AlertFilterOptions> {
  const sources = await prisma.alert.findMany({
    distinct: ['source'],
    orderBy: {
      source: 'asc',
    },
    select: {
      source: true,
    },
  });

  return {
    severities: [...alertSeverityValues],
    statuses: [...alertStatusValues],
    sources: sources.map((entry) => entry.source),
  };
}

async function ensureLinkedLogExists(linkedLogId: string | null | undefined) {
  if (!linkedLogId) {
    return;
  }

  const log = await prisma.log.findUnique({
    where: {
      id: linkedLogId,
    },
    select: {
      id: true,
    },
  });

  if (!log) {
    throw new AppError(404, 'LINKED_LOG_NOT_FOUND', 'The selected linked log does not exist.');
  }
}

export async function listAlerts(query: AlertListQuery): Promise<AlertListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildAlertWhereClause(query);

  const [total, alerts, filters] = await Promise.all([
    prisma.alert.count({ where }),
    prisma.alert.findMany({
      where,
      select: alertRecordSelect,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    getAlertFilterOptions(),
  ]);

  return {
    items: alerts.map(mapAlertRecord),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filters,
  };
}

export async function getAlertById(alertId: string): Promise<AlertDetailRecord> {
  const alert = await prisma.alert.findUnique({
    where: {
      id: alertId,
    },
    select: alertDetailSelect,
  });

  if (!alert) {
    throw new AppError(404, 'ALERT_NOT_FOUND', 'The requested alert could not be found.');
  }

  return mapAlertDetailRecord(alert);
}

export async function createAlert(payload: CreateAlertPayload): Promise<AlertDetailRecord> {
  await ensureLinkedLogExists(payload.linkedLogId);

  const alert = await prisma.alert.create({
    data: {
      title: payload.title,
      description: payload.description,
      source: payload.source,
      severity: toPrismaAlertSeverity(payload.severity),
      status: toPrismaAlertStatus(payload.status ?? 'new'),
      confidenceScore: payload.confidenceScore,
      linkedLogId: payload.linkedLogId ?? null,
    },
    select: alertDetailSelect,
  });

  return mapAlertDetailRecord(alert);
}

export async function updateAlertStatus(
  alertId: string,
  payload: { status: AlertRecord['status'] },
): Promise<AlertDetailRecord> {
  const alert = await prisma.alert.findUnique({
    where: {
      id: alertId,
    },
    select: {
      id: true,
    },
  });

  if (!alert) {
    throw new AppError(404, 'ALERT_NOT_FOUND', 'The requested alert could not be found.');
  }

  const updatedAlert = await prisma.alert.update({
    where: {
      id: alertId,
    },
    data: {
      status: toPrismaAlertStatus(payload.status),
    },
    select: alertDetailSelect,
  });

  return mapAlertDetailRecord(updatedAlert);
}
