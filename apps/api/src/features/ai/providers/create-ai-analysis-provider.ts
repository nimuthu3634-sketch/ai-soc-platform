import type { AiAnalysisProvider } from './ai-analysis-provider.js';
import { ExternalAiAnalysisProvider } from './external-ai-analysis-provider.js';
import { MockAiAnalysisProvider } from './mock-ai-analysis-provider.js';
import { env } from '../../../config/env.js';

let cachedProvider: AiAnalysisProvider | null = null;

export function createAiAnalysisProvider(): AiAnalysisProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider =
    env.AI_ANALYZER_PROVIDER === 'external'
      ? new ExternalAiAnalysisProvider({
          baseUrl: env.AI_EXTERNAL_SERVICE_URL || undefined,
          apiKey: env.AI_EXTERNAL_SERVICE_API_KEY,
          timeoutMs: env.AI_EXTERNAL_SERVICE_TIMEOUT_MS,
        })
      : new MockAiAnalysisProvider();

  return cachedProvider;
}
