import type { UserRole } from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/http/app-error.js';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(
        new AppError(
          403,
          'INSUFFICIENT_ROLE',
          `This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
        ),
      );
    }

    return next();
  };
}
