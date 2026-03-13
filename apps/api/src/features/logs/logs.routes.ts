import { Router } from 'express';

import {
  bulkCreateLogsController,
  createLogController,
  getLogByIdController,
  listLogsController,
} from './controllers/logs.controller.js';
import {
  bulkCreateLogsSchema,
  createLogSchema,
  listLogsSchema,
  logIdParamsSchema,
} from './schemas/logs.schema.js';
import { validateRequest } from '../../lib/http/validate.js';
import { authenticate } from '../../middleware/authenticate.js';

const logsRoutes = Router();

logsRoutes.use(authenticate);
logsRoutes.get('/', validateRequest(listLogsSchema), listLogsController);
logsRoutes.get('/:id', validateRequest(logIdParamsSchema), getLogByIdController);
logsRoutes.post('/', validateRequest(createLogSchema), createLogController);
logsRoutes.post('/bulk', validateRequest(bulkCreateLogsSchema), bulkCreateLogsController);

export { logsRoutes };
