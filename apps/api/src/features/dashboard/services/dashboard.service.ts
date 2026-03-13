import type {
  AlertRecord,
  DashboardAlertTrendPoint,
  DashboardIncidentsByStatusPoint,
  DashboardLogsBySeverityPoint,
  DashboardSummary,
  IncidentRecord,
} from '@aegis-core/contracts';
import {
  incidentStatusValues,
  logSeverityValues,
} from '@aegis-core/contracts';
import type {
  IncidentStatus as PrismaIncidentStatus,
  LogSeverity as PrismaLogSeverity,
  Prisma as PrismaNamespace,
} from '@prisma/client';
import {
  AlertSeverity,
  IncidentStatus,
} from '@prisma/client';

import { env } from '../../../config/env.js';
import { prisma } from '../../../lib/prisma.js';

const dashboardAlertSelect = {
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

type DashboardAlertModel = PrismaNamespace.AlertGetPayload<{
  select: typeof dashboardAlertSelect;
}>;

const dashboardIncidentSelect = {
  id: true,
  reference: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  assigneeId: true,
  relatedAlertId: true,
  openedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  assignee: {
    select: {
      fullName: true,
    },
  },
} satisfies PrismaNamespace.IncidentSelect;

type DashboardIncidentModel = PrismaNamespace.IncidentGetPayload<{
  select: typeof dashboardIncidentSelect;
}>;

type AlertTrendRow = {
  day: Date;
  alerts: number;
  criticalAlerts: number;
};

function mapAlertRecord(alert: DashboardAlertModel): AlertRecord {
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

function mapIncidentRecord(incident: DashboardIncidentModel): IncidentRecord {
  return {
    id: incident.id,
    reference: incident.reference,
    title: incident.title,
    description: incident.description,
    severity: incident.severity.toLowerCase() as IncidentRecord['severity'],
    status: incident.status.toLowerCase() as IncidentRecord['status'],
    assigneeId: incident.assigneeId,
    assigneeName: incident.assignee?.fullName ?? null,
    relatedAlertId: incident.relatedAlertId,
    openedAt: incident.openedAt.toISOString(),
    closedAt: incident.closedAt?.toISOString() ?? null,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
  };
}

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function formatDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildAlertTrend(
  rows: AlertTrendRow[],
  startDate: Date,
  days: number,
): DashboardAlertTrendPoint[] {
  const rowMap = new Map(
    rows.map((row) => [formatDateKey(new Date(row.day)), row]),
  );

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    const row = rowMap.get(formatDateKey(date));

    return {
      date: formatDateKey(date),
      alerts: row?.alerts ?? 0,
      criticalAlerts: row?.criticalAlerts ?? 0,
    };
  });
}

function buildLogsBySeverity(
  rows: Array<{ severity: PrismaLogSeverity; _count?: { _all?: number } | true }>,
): DashboardLogsBySeverityPoint[] {
  const rowMap = new Map(
    rows.map((row) => [
      row.severity,
      row._count && row._count !== true ? (row._count._all ?? 0) : 0,
    ]),
  );

  return logSeverityValues.map((severity) => ({
    severity,
    count: rowMap.get(severity.toUpperCase() as PrismaLogSeverity) ?? 0,
  }));
}

function buildIncidentsByStatus(
  rows: Array<{ status: PrismaIncidentStatus; _count?: { _all?: number } | true }>,
): DashboardIncidentsByStatusPoint[] {
  const rowMap = new Map(
    rows.map((row) => [
      row.status,
      row._count && row._count !== true ? (row._count._all ?? 0) : 0,
    ]),
  );

  return incidentStatusValues.map((status) => ({
    status,
    count: rowMap.get(status.toUpperCase() as PrismaIncidentStatus) ?? 0,
  }));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const trendWindowDays = 7;
  const trendWindowStart = startOfUtcDay(new Date());
  trendWindowStart.setUTCDate(trendWindowStart.getUTCDate() - (trendWindowDays - 1));

  const [
    totalLogs,
    totalAlerts,
    criticalAlerts,
    openIncidents,
    resolvedIncidents,
    alertTrendRows,
    logsBySeverityRows,
    incidentsByStatusRows,
    recentAlerts,
    recentIncidents,
  ] =
    await prisma.$transaction([
      prisma.log.count(),
      prisma.alert.count({
      }),
      prisma.alert.count({
        where: {
          severity: AlertSeverity.CRITICAL,
        },
      }),
      prisma.incident.count({
        where: {
          status: {
            in: [
              IncidentStatus.OPEN,
              IncidentStatus.INVESTIGATING,
              IncidentStatus.CONTAINED,
            ],
          },
        },
      }),
      prisma.incident.count({
        where: {
          status: {
            in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED],
          },
        },
      }),
      prisma.$queryRaw<AlertTrendRow[]>`
        SELECT
          DATE_TRUNC('day', "createdAt") AS "day",
          COUNT(*)::int AS "alerts",
          COUNT(*) FILTER (WHERE "severity" = 'CRITICAL'::"AlertSeverity")::int AS "criticalAlerts"
        FROM "Alert"
        WHERE "createdAt" >= ${trendWindowStart}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY DATE_TRUNC('day', "createdAt") ASC
      `,
      prisma.log.groupBy({
        by: ['severity'],
        _count: {
          _all: true,
        },
        orderBy: {
          severity: 'asc',
        },
      }),
      prisma.incident.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
        orderBy: {
          status: 'asc',
        },
      }),
      prisma.alert.findMany({
        select: dashboardAlertSelect,
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      prisma.incident.findMany({
        select: dashboardIncidentSelect,
        orderBy: {
          openedAt: 'desc',
        },
        take: 4,
      }),
    ]);

  return {
    metrics: {
      totalLogs,
      totalAlerts,
      criticalAlerts,
      openIncidents,
      resolvedIncidents,
    },
    alertTrend: buildAlertTrend(alertTrendRows, trendWindowStart, trendWindowDays),
    logsBySeverity: buildLogsBySeverity(logsBySeverityRows),
    incidentsByStatus: buildIncidentsByStatus(incidentsByStatusRows),
    recentAlerts: recentAlerts.map(mapAlertRecord),
    recentIncidents: recentIncidents.map(mapIncidentRecord),
    systemHealth: {
      api: 'online',
      database: 'connected',
      auth: 'jwt',
      environment: env.NODE_ENV,
    },
  };
}
