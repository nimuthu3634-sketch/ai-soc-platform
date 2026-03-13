import type { AnalyzeBatchPayload, AnalyzeLogPayload } from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import { analyzeBatch, analyzeLog, getAiCapabilities } from '../services/ai-analysis.service.js';

export async function analyzeLogController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await analyzeLog(request.body as AnalyzeLogPayload);

    return sendSuccess(response, 200, 'Log analyzed successfully.', result);
  } catch (error) {
    return next(error);
  }
}

export async function analyzeBatchController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await analyzeBatch(request.body as AnalyzeBatchPayload);

    return sendSuccess(response, 200, 'Log batch analyzed successfully.', result);
  } catch (error) {
    return next(error);
  }
}

export function getAiCapabilitiesController(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    return sendSuccess(response, 200, 'AI capabilities fetched successfully.', getAiCapabilities());
  } catch (error) {
    return next(error);
  }
}
