import type {
  AiAnalyzerProvider,
  AiThreatAssessment,
  LogEventType,
  LogSeverity,
  LogStatus,
} from '@aegis-core/contracts';
import type { Prisma as PrismaNamespace } from '@prisma/client';

export type AiAnalysisLogInput = {
  id: string;
  timestamp: string;
  source: string;
  host: string;
  severity: LogSeverity;
  eventType: LogEventType;
  message: string;
  rawData: PrismaNamespace.JsonValue;
  status: LogStatus;
  createdAt: string;
};

export interface AiAnalysisProvider {
  readonly name: AiAnalyzerProvider;
  analyzeLog: (log: AiAnalysisLogInput) => Promise<AiThreatAssessment>;
  analyzeBatch: (logs: AiAnalysisLogInput[]) => Promise<AiThreatAssessment[]>;
}
