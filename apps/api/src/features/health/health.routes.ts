import type { HealthReadinessStatus, HealthStatus } from '@aegis-core/contracts';
import { Router } from 'express';

import { env } from '../../config/env.js';
import { sendError, sendSuccess } from '../../lib/http/response.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';

const healthRoutes = Router();

healthRoutes.get('/', (_request, response) => {
  const payload: HealthStatus = {
    service: 'api',
    status: 'ok',
    version: '0.1.0',
    uptimeSeconds: Math.round(process.uptime()),
    environment: env.NODE_ENV,
  };

  return sendSuccess(response, 200, 'API health check successful.', payload);
});

healthRoutes.get('/ready', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const payload: HealthReadinessStatus = {
      service: 'api',
      status: 'ready',
      version: '0.1.0',
      environment: env.NODE_ENV,
      database: 'connected',
      checkedAt: new Date().toISOString(),
    };

    return sendSuccess(response, 200, 'API readiness check successful.', payload);
  } catch (error) {
    logger.error('health_readiness_failed', {
      error,
    });

    return sendError(response, 503, {
      code: 'SERVICE_NOT_READY',
      message: 'The API is running but not ready to serve traffic.',
      details: {
        database: 'disconnected',
      },
    });
  }
});

export { healthRoutes };
