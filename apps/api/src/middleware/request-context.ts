import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';


export function requestContextMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const requestId = request.header('x-request-id') ?? crypto.randomUUID();

  response.locals.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  next();
}
