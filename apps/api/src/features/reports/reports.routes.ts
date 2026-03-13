import { Router } from 'express';

import { sendSuccess } from '../../lib/http/response.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

const reportsRoutes = Router();

reportsRoutes.use(authenticate);
reportsRoutes.get('/', authorizeRoles('admin', 'analyst'), (_request, response) =>
  sendSuccess(response, 200, 'Report module placeholder fetched successfully.', {
    items: [
      {
        id: 'REP-001',
        name: 'Weekly Threat Summary',
        status: 'planned',
      },
    ],
    page: 1,
    pageSize: 25,
    total: 1,
    totalPages: 1,
  }),
);

export { reportsRoutes };
