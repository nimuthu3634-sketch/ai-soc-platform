import { z } from 'zod';

import type { AiAnalysisLogInput, AiAnalysisProvider } from './ai-analysis-provider.js';
import { AppError } from '../../../lib/http/app-error.js';

const threatAssessmentSchema = z.object({
  threatLabel: z.string().min(1),
  confidenceScore: z.number().min(0).max(100),
  recommendedAction: z.string().min(1),
  reasoningSummary: z.string().min(1),
});

const batchThreatAssessmentSchema = z.union([
  z.array(threatAssessmentSchema),
  z.object({
    items: z.array(threatAssessmentSchema),
  }),
]);

type ExternalAiAnalysisProviderOptions = {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs: number;
};

export class ExternalAiAnalysisProvider implements AiAnalysisProvider {
  readonly name = 'external' as const;

  constructor(private readonly options: ExternalAiAnalysisProviderOptions) {}

  async analyzeLog(log: AiAnalysisLogInput) {
    return this.request('/analyze-log', { log }, threatAssessmentSchema);
  }

  async analyzeBatch(logs: AiAnalysisLogInput[]) {
    const response = await this.request('/analyze-batch', { logs }, batchThreatAssessmentSchema);
    const items = Array.isArray(response) ? response : response.items;

    if (items.length !== logs.length) {
      throw new AppError(
        502,
        'EXTERNAL_AI_RESPONSE_INVALID',
        'The external AI service returned an unexpected number of analysis results.',
      );
    }

    return items;
  }

  private async request<TOutput>(
    path: string,
    body: unknown,
    schema: z.ZodType<TOutput>,
  ): Promise<TOutput> {
    if (!this.options.baseUrl) {
      throw new AppError(
        503,
        'EXTERNAL_AI_NOT_CONFIGURED',
        'AI analyzer provider is set to external, but no external service URL was configured.',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch(`${this.options.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => undefined);

      if (!response.ok) {
        throw new AppError(
          502,
          'EXTERNAL_AI_REQUEST_FAILED',
          `The external AI service rejected the request with status ${response.status}.`,
          payload,
        );
      }

      return schema.parse(payload);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new AppError(
          502,
          'EXTERNAL_AI_RESPONSE_INVALID',
          'The external AI service returned a payload that does not match the expected contract.',
          error.flatten(),
        );
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError(
          504,
          'EXTERNAL_AI_TIMEOUT',
          'The external AI service did not respond before the timeout expired.',
        );
      }

      throw new AppError(
        502,
        'EXTERNAL_AI_UNAVAILABLE',
        'The external AI service could not be reached.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
