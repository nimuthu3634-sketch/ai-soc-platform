import type { ApiErrorBody, ApiFailure, ApiSuccess, RequestMeta } from '@aegis-core/contracts';
import type { Response } from 'express';

const buildMeta = (requestId?: string): RequestMeta => ({
  timestamp: new Date().toISOString(),
  requestId,
});

export function sendSuccess<TData>(
  response: Response,
  statusCode: number,
  message: string,
  data: TData,
) {
  const payload: ApiSuccess<TData> = {
    success: true,
    message,
    data,
    meta: buildMeta(response.locals.requestId),
  };

  return response.status(statusCode).json(payload);
}

export function sendError(
  response: Response,
  statusCode: number,
  error: ApiErrorBody,
) {
  const payload: ApiFailure = {
    success: false,
    error,
    meta: buildMeta(response.locals.requestId),
  };

  return response.status(statusCode).json(payload);
}
