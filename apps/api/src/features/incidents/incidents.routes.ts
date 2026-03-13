import { Router } from 'express';

import {
  assignIncidentController,
  getIncidentByIdController,
  listIncidentsController,
  updateIncidentStatusController,
} from './controllers/incidents.controller.js';
import {
  assignIncidentSchema,
  incidentIdParamsSchema,
  listIncidentsSchema,
  updateIncidentStatusSchema,
} from './schemas/incidents.schema.js';
import { validateRequest } from '../../lib/http/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

const incidentsRoutes = Router();

incidentsRoutes.use(authenticate);
incidentsRoutes.get('/', validateRequest(listIncidentsSchema), listIncidentsController);
incidentsRoutes.get('/:id', validateRequest(incidentIdParamsSchema), getIncidentByIdController);
incidentsRoutes.patch(
  '/:id/status',
  authorizeRoles('admin', 'responder'),
  validateRequest(updateIncidentStatusSchema),
  updateIncidentStatusController,
);
incidentsRoutes.patch(
  '/:id/assign',
  authorizeRoles('admin', 'responder'),
  validateRequest(assignIncidentSchema),
  assignIncidentController,
);

export { incidentsRoutes };
