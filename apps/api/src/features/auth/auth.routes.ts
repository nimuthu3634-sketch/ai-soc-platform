import { Router } from 'express';

import { loginController, meController, registerController } from './controllers/auth.controller.js';
import { loginUserSchema, registerUserSchema } from './schemas/auth.schema.js';
import { validateRequest } from '../../lib/http/validate.js';
import { authenticate } from '../../middleware/authenticate.js';

const authRoutes = Router();

authRoutes.post('/register', validateRequest(registerUserSchema), registerController);
authRoutes.post('/login', validateRequest(loginUserSchema), loginController);
authRoutes.get('/me', authenticate, meController);

export { authRoutes };
