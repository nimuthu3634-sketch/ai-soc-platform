import type { NextFunction, Request, Response } from 'express';

import { getAuthUserById } from '../features/auth/services/auth.service.js';
import { verifyAccessToken } from '../lib/auth/jwt.js';
import { AppError } from '../lib/http/app-error.js';

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const authorization = request.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid bearer token is required.');
    }

    const token = authorization.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);
    const user = await getAuthUserById(payload.sub);

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    next(new AppError(401, 'INVALID_TOKEN', 'The provided token is invalid or expired.'));
  }
}
