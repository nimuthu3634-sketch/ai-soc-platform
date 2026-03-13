import type { LoginPayload, RegisterPayload } from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import { getAuthUserById, loginUser, registerUser } from '../services/auth.service.js';

export async function registerController(request: Request, response: Response, next: NextFunction) {
  try {
    const payload = request.body as RegisterPayload;
    const session = await registerUser(payload);

    return sendSuccess(response, 201, 'User registered successfully.', session);
  } catch (error) {
    return next(error);
  }
}

export async function loginController(request: Request, response: Response, next: NextFunction) {
  try {
    const payload = request.body as LoginPayload;
    const session = await loginUser(payload);

    return sendSuccess(response, 200, 'Login successful.', session);
  } catch (error) {
    return next(error);
  }
}

export async function meController(request: Request, response: Response, next: NextFunction) {
  try {
    const user = await getAuthUserById(request.user!.id);

    return sendSuccess(response, 200, 'Authenticated user fetched successfully.', user);
  } catch (error) {
    return next(error);
  }
}
