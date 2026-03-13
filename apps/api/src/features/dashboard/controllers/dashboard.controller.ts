import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import { getDashboardSummary } from '../services/dashboard.service.js';

export async function getDashboardSummaryController(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const summary = await getDashboardSummary();

    return sendSuccess(response, 200, 'Dashboard summary fetched successfully.', summary);
  } catch (error) {
    return next(error);
  }
}
