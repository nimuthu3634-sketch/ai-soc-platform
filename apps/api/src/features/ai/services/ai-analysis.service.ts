import type {
  AiCapabilities,
  AiGeneratedAlertSummary,
  AiLogAnalysisResult,
  AnalyzeBatchPayload,
  AnalyzeLogPayload,
  AlertSeverity,
} from '@aegis-core/contracts';
import type { Prisma as PrismaNamespace } from '@prisma/client';
import { AlertStatus } from '@prisma/client';

import { env } from '../../../config/env.js';
import { AppError } from '../../../lib/http/app-error.js';
import { prisma } from '../../../lib/prisma.js';
import type { AiAnalysisLogInput } from '../providers/ai-analysis-provider.js';
import { createAiAnalysisProvider } from '../providers/create-ai-analysis-provider.js';

const AI_ALERT_SOURCE = 'AI Analysis Engine';

const aiLogSelect = {
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

const generatedAlertSelect = {
  id: true,
  title: true,
  severity: true,
  status: true,
  createdAt: true,
} satisfies PrismaNamespace.AlertSelect;

type AiLogModel = PrismaNamespace.LogGetPayload<{
  select: typeof aiLogSelect;
}>;

type GeneratedAlertModel = PrismaNamespace.AlertGetPayload<{
  select: typeof generatedAlertSelect;
}>;

function mapLogForAnalysis(log: AiLogModel): AiAnalysisLogInput {
  return {
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    source: log.source,
    host: log.host,
    severity: log.severity.toLowerCase() as AiAnalysisLogInput['severity'],
    eventType: log.eventType.toLowerCase() as AiAnalysisLogInput['eventType'],
    message: log.message,
    rawData: log.rawData ?? null,
    status: log.status.toLowerCase() as AiAnalysisLogInput['status'],
    createdAt: log.createdAt.toISOString(),
  };
}

function mapGeneratedAlert(alert: GeneratedAlertModel): AiGeneratedAlertSummary {
  return {
    id: alert.id,
    title: alert.title,
    severity: alert.severity.toLowerCase() as AiGeneratedAlertSummary['severity'],
    status: alert.status.toLowerCase() as AiGeneratedAlertSummary['status'],
    createdAt: alert.createdAt.toISOString(),
  };
}

function confidenceToAlertSeverity(confidenceScore: number): AlertSeverity {
  if (confidenceScore >= 92) {
    return 'critical';
  }

  if (confidenceScore >= 80) {
    return 'high';
  }

  if (confidenceScore >= 60) {
    return 'medium';
  }

  return 'low';
}

function buildGeneratedAlertTitle(log: AiAnalysisLogInput, threatLabel: string) {
  return `AI detected ${threatLabel} on ${log.host}`;
}

function buildGeneratedAlertDescription(
  log: AiAnalysisLogInput,
  reasoningSummary: string,
  recommendedAction: string,
) {
  return [
    `AI analysis flagged log ${log.id} from ${log.source} on host ${log.host}.`,
    reasoningSummary,
    `Recommended action: ${recommendedAction}`,
  ].join(' ');
}

async function getLogForAnalysis(logId: string) {
  const log = await prisma.log.findUnique({
    where: {
      id: logId,
    },
    select: aiLogSelect,
  });

  if (!log) {
    throw new AppError(404, 'LOG_NOT_FOUND', 'The requested log entry could not be found.');
  }

  return log;
}

async function maybeCreateGeneratedAlert(
  log: AiAnalysisLogInput,
  assessment: Pick<
    AiLogAnalysisResult,
    'threatLabel' | 'confidenceScore' | 'recommendedAction' | 'reasoningSummary'
  >,
  shouldCreateAlert: boolean,
) {
  if (!shouldCreateAlert || assessment.confidenceScore < env.AI_ALERT_THRESHOLD) {
    return {
      generatedAlert: null,
      alertCreated: false,
    };
  }

  const existingAlert = await prisma.alert.findFirst({
    where: {
      linkedLogId: log.id,
      source: AI_ALERT_SOURCE,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: generatedAlertSelect,
  });

  if (existingAlert) {
    return {
      generatedAlert: mapGeneratedAlert(existingAlert),
      alertCreated: false,
    };
  }

  const createdAlert = await prisma.alert.create({
    data: {
      title: buildGeneratedAlertTitle(log, assessment.threatLabel),
      description: buildGeneratedAlertDescription(
        log,
        assessment.reasoningSummary,
        assessment.recommendedAction,
      ),
      source: AI_ALERT_SOURCE,
      severity: confidenceToAlertSeverity(assessment.confidenceScore).toUpperCase() as PrismaNamespace.AlertCreateInput['severity'],
      status: AlertStatus.NEW,
      confidenceScore: Math.round(assessment.confidenceScore),
      linkedLogId: log.id,
    },
    select: generatedAlertSelect,
  });

  return {
    generatedAlert: mapGeneratedAlert(createdAlert),
    alertCreated: true,
  };
}

async function buildLogAnalysisResult(
  log: AiAnalysisLogInput,
  shouldCreateAlert: boolean,
) {
  const provider = createAiAnalysisProvider();
  const analysis = await provider.analyzeLog(log);
  const alertOutcome = await maybeCreateGeneratedAlert(log, analysis, shouldCreateAlert);

  return {
    logId: log.id,
    provider: provider.name,
    analyzedAt: new Date().toISOString(),
    threatLabel: analysis.threatLabel,
    confidenceScore: Math.round(analysis.confidenceScore),
    recommendedAction: analysis.recommendedAction,
    reasoningSummary: analysis.reasoningSummary,
    ...alertOutcome,
  } satisfies AiLogAnalysisResult;
}

export async function analyzeLog(payload: AnalyzeLogPayload): Promise<AiLogAnalysisResult> {
  const log = await getLogForAnalysis(payload.logId);

  return buildLogAnalysisResult(mapLogForAnalysis(log), payload.createAlertOnHighConfidence ?? true);
}

export async function analyzeBatch(payload: AnalyzeBatchPayload) {
  const provider = createAiAnalysisProvider();
  const shouldCreateAlert = payload.createAlertsOnHighConfidence ?? true;

  let logs: AiLogModel[];

  if (payload.logIds && payload.logIds.length > 0) {
    const uniqueLogIds = [...new Set(payload.logIds)];
    const foundLogs = await prisma.log.findMany({
      where: {
        id: {
          in: uniqueLogIds,
        },
      },
      select: aiLogSelect,
    });

    if (foundLogs.length !== uniqueLogIds.length) {
      const foundIds = new Set(foundLogs.map((log) => log.id));
      const missingIds = uniqueLogIds.filter((logId) => !foundIds.has(logId));

      throw new AppError(
        404,
        'LOG_NOT_FOUND',
        'One or more requested log entries could not be found.',
        { missingIds },
      );
    }

    const logMap = new Map(foundLogs.map((log) => [log.id, log]));
    logs = uniqueLogIds.map((logId) => logMap.get(logId)!);
  } else {
    logs = await prisma.log.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: payload.limit ?? 10,
      select: aiLogSelect,
    });
  }

  const mappedLogs = logs.map(mapLogForAnalysis);
  const analyses = await provider.analyzeBatch(mappedLogs);

  const items: AiLogAnalysisResult[] = [];
  let createdAlertCount = 0;

  for (const [index, analysis] of analyses.entries()) {
    const log = mappedLogs[index];
    const alertOutcome = await maybeCreateGeneratedAlert(log, analysis, shouldCreateAlert);

    if (alertOutcome.alertCreated) {
      createdAlertCount += 1;
    }

    items.push({
      logId: log.id,
      provider: provider.name,
      analyzedAt: new Date().toISOString(),
      threatLabel: analysis.threatLabel,
      confidenceScore: Math.round(analysis.confidenceScore),
      recommendedAction: analysis.recommendedAction,
      reasoningSummary: analysis.reasoningSummary,
      ...alertOutcome,
    });
  }

  return {
    totalLogs: mappedLogs.length,
    analyzedCount: items.length,
    createdAlertCount,
    items,
  };
}

export function getAiCapabilities(): AiCapabilities {
  return {
    provider: env.AI_ANALYZER_PROVIDER,
    autoAlertThreshold: env.AI_ALERT_THRESHOLD,
    endpoints: ['/api/ai/analyze-log', '/api/ai/analyze-batch'],
    integrationMode:
      env.AI_ANALYZER_PROVIDER === 'external' ? 'external_http' : 'in_process_mock',
  };
}
