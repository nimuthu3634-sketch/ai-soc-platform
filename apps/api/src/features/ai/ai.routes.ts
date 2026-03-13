import { Router } from 'express';

import {
  analyzeBatchController,
  analyzeLogController,
  getAiCapabilitiesController,
} from './controllers/ai.controller.js';
import { analyzeBatchSchema, analyzeLogSchema } from './schemas/ai.schema.js';
import { validateRequest } from '../../lib/http/validate.js';
import { authenticate } from '../../middleware/authenticate.js';

const aiRoutes = Router();

aiRoutes.use(authenticate);
aiRoutes.get('/capabilities', getAiCapabilitiesController);
aiRoutes.post('/analyze-log', validateRequest(analyzeLogSchema), analyzeLogController);
aiRoutes.post('/analyze-batch', validateRequest(analyzeBatchSchema), analyzeBatchController);

export { aiRoutes };
