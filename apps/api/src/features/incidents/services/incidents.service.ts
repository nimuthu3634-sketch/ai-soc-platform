import type {
  AssignIncidentPayload,
  CreateIncidentFromAlertPayload,
  IncidentAssigneeOption,
  IncidentDetailRecord,
  IncidentFilterOptions,
  IncidentListQuery,
  IncidentListResult,
  IncidentRecord,
} from '@aegis-core/contracts';
import {
  incidentSeverityValues,
  incidentStatusValues,
} from '@aegis-core/contracts';
import type {
  AlertSeverity as PrismaAlertSeverity,
  IncidentSeverity as PrismaIncidentSeverity,
  IncidentStatus as PrismaIncidentStatus,
} from '@prisma/client';
import type { Prisma as PrismaNamespace } from '@prisma/client';
import { AlertStatus, IncidentStatus } from '@prisma/client';

import { AppError } from '../../../lib/http/app-error.js';
import { prisma } from '../../../lib/prisma.js';

const incidentRecordSelect = {
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

const incidentDetailSelect = {
  ...incidentRecordSelect,
  relatedAlert: {
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
      source: true,
    },
  },
} satisfies PrismaNamespace.IncidentSelect;

type IncidentRecordModel = PrismaNamespace.IncidentGetPayload<{
  select: typeof incidentRecordSelect;
}>;

type IncidentDetailModel = PrismaNamespace.IncidentGetPayload<{
  select: typeof incidentDetailSelect;
}>;

function toPrismaIncidentSeverity(value: IncidentRecord['severity']) {
  return value.toUpperCase() as PrismaIncidentSeverity;
}

function toPrismaIncidentStatus(value: IncidentRecord['status']) {
  return value.toUpperCase() as PrismaIncidentStatus;
}

function fromPrismaIncidentSeverity(value: PrismaIncidentSeverity) {
  return value.toLowerCase() as IncidentRecord['severity'];
}

function fromPrismaIncidentStatus(value: PrismaIncidentStatus) {
  return value.toLowerCase() as IncidentRecord['status'];
}

function mapIncidentRecord(incident: IncidentRecordModel): IncidentRecord {
  return {
    id: incident.id,
    reference: incident.reference,
    title: incident.title,
    description: incident.description,
    severity: fromPrismaIncidentSeverity(incident.severity),
    status: fromPrismaIncidentStatus(incident.status),
    assigneeId: incident.assigneeId,
    assigneeName: incident.assignee?.fullName ?? null,
    relatedAlertId: incident.relatedAlertId,
    openedAt: incident.openedAt.toISOString(),
    closedAt: incident.closedAt?.toISOString() ?? null,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
  };
}

function mapIncidentDetailRecord(
  incident: IncidentDetailModel,
  availableAssignees: IncidentAssigneeOption[],
): IncidentDetailRecord {
  type RelatedAlertSummary = NonNullable<IncidentDetailRecord['relatedAlert']>;

  return {
    ...mapIncidentRecord(incident),
    relatedAlert: incident.relatedAlert
      ? {
          id: incident.relatedAlert.id,
          title: incident.relatedAlert.title,
          severity: incident.relatedAlert.severity.toLowerCase() as RelatedAlertSummary['severity'],
          status: incident.relatedAlert.status.toLowerCase() as RelatedAlertSummary['status'],
          source: incident.relatedAlert.source,
        }
      : null,
    availableAssignees,
  };
}

function buildIncidentWhereClause(query: IncidentListQuery): PrismaNamespace.IncidentWhereInput {
  const filters: PrismaNamespace.IncidentWhereInput[] = [];

  if (query.search) {
    filters.push({
      OR: [
        {
          reference: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
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
      ],
    });
  }

  if (query.severity && query.severity.length > 0) {
    filters.push({
      severity: {
        in: query.severity.map(toPrismaIncidentSeverity),
      },
    });
  }

  if (query.status && query.status.length > 0) {
    filters.push({
      status: {
        in: query.status.map(toPrismaIncidentStatus),
      },
    });
  }

  if (query.assigneeId && query.assigneeId.length > 0) {
    filters.push({
      assigneeId: {
        in: query.assigneeId,
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

async function getIncidentAssigneeOptions(): Promise<IncidentAssigneeOption[]> {
  const users = await prisma.user.findMany({
    orderBy: {
      fullName: 'asc',
    },
    select: {
      id: true,
      fullName: true,
      role: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    role: user.role.toLowerCase() as IncidentAssigneeOption['role'],
  }));
}

async function generateIncidentReference(transaction: PrismaNamespace.TransactionClient) {
  const lastIncident = await transaction.incident.findFirst({
    orderBy: {
      reference: 'desc',
    },
    select: {
      reference: true,
    },
  });

  const currentNumber = lastIncident
    ? Number.parseInt(lastIncident.reference.replace(/^INC-/, ''), 10)
    : 1000;
  const nextNumber = Number.isNaN(currentNumber) ? 1001 : currentNumber + 1;

  return `INC-${String(nextNumber).padStart(4, '0')}`;
}

function mapAlertSeverityToIncidentSeverity(value: PrismaAlertSeverity) {
  return value as unknown as PrismaIncidentSeverity;
}

export async function listIncidents(query: IncidentListQuery): Promise<IncidentListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildIncidentWhereClause(query);

  const [total, incidents, assignees] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.findMany({
      where,
      select: incidentRecordSelect,
      orderBy: {
        openedAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    getIncidentAssigneeOptions(),
  ]);

  const filters: IncidentFilterOptions = {
    severities: [...incidentSeverityValues],
    statuses: [...incidentStatusValues],
    assignees,
  };

  return {
    items: incidents.map(mapIncidentRecord),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filters,
  };
}

export async function getIncidentById(incidentId: string): Promise<IncidentDetailRecord> {
  const [incident, assignees] = await Promise.all([
    prisma.incident.findUnique({
      where: {
        id: incidentId,
      },
      select: incidentDetailSelect,
    }),
    getIncidentAssigneeOptions(),
  ]);

  if (!incident) {
    throw new AppError(404, 'INCIDENT_NOT_FOUND', 'The requested incident could not be found.');
  }

  return mapIncidentDetailRecord(incident, assignees);
}

export async function updateIncidentStatus(
  incidentId: string,
  payload: { status: IncidentRecord['status'] },
): Promise<IncidentDetailRecord> {
  const currentIncident = await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
    select: {
      closedAt: true,
    },
  });

  if (!currentIncident) {
    throw new AppError(404, 'INCIDENT_NOT_FOUND', 'The requested incident could not be found.');
  }

  const [incident, assignees] = await Promise.all([
    prisma.incident.update({
      where: {
        id: incidentId,
      },
      data: {
        status: toPrismaIncidentStatus(payload.status),
        closedAt:
          payload.status === 'closed'
            ? currentIncident.closedAt ?? new Date()
            : null,
      },
      select: incidentDetailSelect,
    }),
    getIncidentAssigneeOptions(),
  ]);

  return mapIncidentDetailRecord(incident, assignees);
}

export async function assignIncident(
  incidentId: string,
  payload: AssignIncidentPayload,
): Promise<IncidentDetailRecord> {
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
    select: {
      id: true,
    },
  });

  if (!incident) {
    throw new AppError(404, 'INCIDENT_NOT_FOUND', 'The requested incident could not be found.');
  }

  if (payload.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: {
        id: payload.assigneeId,
      },
      select: {
        id: true,
      },
    });

    if (!assignee) {
      throw new AppError(404, 'ASSIGNEE_NOT_FOUND', 'The selected assignee does not exist.');
    }
  }

  const [updatedIncident, assignees] = await Promise.all([
    prisma.incident.update({
      where: {
        id: incidentId,
      },
      data: {
        assigneeId: payload.assigneeId,
      },
      select: incidentDetailSelect,
    }),
    getIncidentAssigneeOptions(),
  ]);

  return mapIncidentDetailRecord(updatedIncident, assignees);
}

export async function createIncidentFromAlert(
  alertId: string,
  payload: CreateIncidentFromAlertPayload,
  createdById: string,
): Promise<IncidentDetailRecord> {
  return prisma.$transaction(async (transaction) => {
    const alert = await transaction.alert.findUnique({
      where: {
        id: alertId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        severity: true,
      },
    });

    if (!alert) {
      throw new AppError(404, 'ALERT_NOT_FOUND', 'The requested alert could not be found.');
    }

    const existingIncident = await transaction.incident.findUnique({
      where: {
        relatedAlertId: alertId,
      },
      select: {
        id: true,
      },
    });

    if (existingIncident) {
      throw new AppError(
        409,
        'INCIDENT_ALREADY_EXISTS',
        'An incident has already been created from this alert.',
      );
    }

    if (payload.assigneeId) {
      const assignee = await transaction.user.findUnique({
        where: {
          id: payload.assigneeId,
        },
        select: {
          id: true,
        },
      });

      if (!assignee) {
        throw new AppError(404, 'ASSIGNEE_NOT_FOUND', 'The selected assignee does not exist.');
      }
    }

    const reference = await generateIncidentReference(transaction);

    const createdIncident = await transaction.incident.create({
      data: {
        reference,
        title: payload.title ?? alert.title,
        description: payload.description ?? alert.description,
        severity: mapAlertSeverityToIncidentSeverity(alert.severity),
        status: IncidentStatus.OPEN,
        assigneeId: payload.assigneeId ?? null,
        relatedAlertId: alert.id,
        createdById,
        openedAt: new Date(),
      },
      select: incidentDetailSelect,
    });

    await transaction.alert.update({
      where: {
        id: alert.id,
      },
      data: {
        status: AlertStatus.ESCALATED,
      },
    });

    const assignees = await transaction.user.findMany({
      orderBy: {
        fullName: 'asc',
      },
      select: {
        id: true,
        fullName: true,
        role: true,
      },
    });

    return mapIncidentDetailRecord(
      createdIncident,
      assignees.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        role: user.role.toLowerCase() as IncidentAssigneeOption['role'],
      })),
    );
  });
}
