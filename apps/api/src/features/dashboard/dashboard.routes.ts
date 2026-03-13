import { Router } from 'express';

import { getDashboardSummaryController } from './controllers/dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);
dashboardRoutes.get('/summary', getDashboardSummaryController);

export { dashboardRoutes };
