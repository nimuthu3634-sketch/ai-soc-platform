import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { sendSuccess } from './lib/http/response.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestContextMiddleware } from './middleware/request-context.js';
import { apiRouter } from './routes/index.js';

const app = express();

morgan.token('request-id', (_request, response) => {
  const requestId = response.getHeader('x-request-id');

  if (Array.isArray(requestId)) {
    return requestId.join(',');
  }

  return typeof requestId === 'string' ? requestId : '-';
});

const corsOriginSet = new Set(env.FRONTEND_ORIGINS);
const httpLogFormat =
  env.NODE_ENV === 'development'
    ? 'dev'
    : ':method :url :status :response-time ms :res[content-length] bytes req=:request-id';

app.set('trust proxy', env.TRUST_PROXY ? 1 : false);
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || corsOriginSet.has(origin)) {
        return callback(null, true);
      }

      logger.warn('cors_origin_blocked', {
        origin,
      });

      return callback(null, false);
    },
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(requestContextMiddleware);
app.use(
  morgan(httpLogFormat, {
    stream: {
      write: (message) => {
        logger.info('http_request', {
          message: message.trim(),
        });
      },
    },
  }),
);

app.get('/', (_request, response) =>
  sendSuccess(response, 200, 'Aegis Core API root ready.', {
    name: 'Aegis Core API',
    version: '0.1.0',
    status: 'ready',
  }),
);

app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
