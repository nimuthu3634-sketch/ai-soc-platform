import { Router } from 'express';

import {
  createAlertController,
  createIncidentFromAlertController,
  getAlertByIdController,
  listAlertsController,
  updateAlertStatusController,
} from './controllers/alerts.controller.js';
import {
  alertIdParamsSchema,
  createAlertSchema,
  createIncidentFromAlertSchema,
  listAlertsSchema,
  updateAlertStatusSchema,
} from './schemas/alerts.schema.js';
import { validateRequest } from '../../lib/http/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

const alertsRoutes = Router();

alertsRoutes.use(authenticate);
alertsRoutes.get('/', validateRequest(listAlertsSchema), listAlertsController);
alertsRoutes.get('/:id', validateRequest(alertIdParamsSchema), getAlertByIdController);
alertsRoutes.post(
  '/',
  authorizeRoles('admin', 'analyst'),
  validateRequest(createAlertSchema),
  createAlertController,
);
alertsRoutes.patch(
  '/:id/status',
  authorizeRoles('admin', 'analyst', 'responder'),
  validateRequest(updateAlertStatusSchema),
  updateAlertStatusController,
);
alertsRoutes.post(
  '/:id/incidents',
  authorizeRoles('admin', 'analyst', 'responder'),
  validateRequest(createIncidentFromAlertSchema),
  createIncidentFromAlertController,
);

export { alertsRoutes };
