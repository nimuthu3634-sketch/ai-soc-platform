import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../lib/http/app-error.js';
import { sendError } from '../lib/http/response.js';
import { getRequestLogMetadata, logger } from '../lib/logger.js';

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  void _next;

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error('application_error', {
        ...getRequestLogMetadata(request, response),
        code: error.code,
        details: error.details,
        error,
      });
    }

    return sendError(response, error.statusCode, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return sendError(response, 400, {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      details: error.flatten(),
    });
  }

  if (env.NODE_ENV !== 'test') {
    logger.error('unhandled_error', {
      ...getRequestLogMetadata(request, response),
      error,
    });
  }

  return sendError(response, 500, {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred.',
    details: env.NODE_ENV === 'development' ? error : undefined,
  });
}
