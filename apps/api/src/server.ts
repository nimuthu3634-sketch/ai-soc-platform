import 'dotenv/config';

import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

async function start() {
  await prisma.$connect();

  app.listen(env.PORT, env.HOST, () => {
    logger.info('api_server_started', {
      host: env.HOST,
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      frontendOrigins: env.FRONTEND_ORIGINS,
    });
  });
}

void start().catch(async (error) => {
  logger.error('api_server_start_failed', {
    error,
  });
  await prisma.$disconnect();
  process.exit(1);
});
