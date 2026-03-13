import { Router } from 'express';

import { aiRoutes } from '../features/ai/ai.routes.js';
import { alertsRoutes } from '../features/alerts/alerts.routes.js';
import { authRoutes } from '../features/auth/auth.routes.js';
import { dashboardRoutes } from '../features/dashboard/dashboard.routes.js';
import { healthRoutes } from '../features/health/health.routes.js';
import { incidentsRoutes } from '../features/incidents/incidents.routes.js';
import { logsRoutes } from '../features/logs/logs.routes.js';
import { reportsRoutes } from '../features/reports/reports.routes.js';
import { settingsRoutes } from '../features/settings/settings.routes.js';
import { sendSuccess } from '../lib/http/response.js';

const apiRouter = Router();

apiRouter.get('/', (_request, response) =>
  sendSuccess(response, 200, 'Aegis Core API ready.', {
    modules: ['health', 'auth', 'dashboard', 'logs', 'alerts', 'incidents', 'ai', 'reports', 'settings'],
  }),
);

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/logs', logsRoutes);
apiRouter.use('/alerts', alertsRoutes);
apiRouter.use('/incidents', incidentsRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/settings', settingsRoutes);

export { apiRouter };
