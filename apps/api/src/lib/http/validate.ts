import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

import { AppError } from './app-error.js';

export function validateRequest(schema: ZodType<unknown>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body as unknown,
      params: request.params as unknown,
      query: request.query as unknown,
    });

    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', result.error.flatten()),
      );
    }

    const parsedRequest = result.data as {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };

    const mutableRequest = request as {
      body: unknown;
      params: unknown;
      query: unknown;
    };

    mutableRequest.body = parsedRequest.body;
    mutableRequest.params = parsedRequest.params;
    mutableRequest.query = parsedRequest.query;

    return next();
  };
}
