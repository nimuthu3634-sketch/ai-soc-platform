import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/http/app-error.js';

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(
    new AppError(
      404,
      'ROUTE_NOT_FOUND',
      `No route is registered for ${request.method} ${request.originalUrl}.`,
    ),
  );
}
