import type { Request, Response } from 'express';

import { env } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel) {
  return logLevelWeight[level] >= logLevelWeight[env.LOG_LEVEL];
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function formatMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      key === 'error' ? serializeError(value) : value,
    ]),
  );
}

function writeLog(level: LogLevel, event: string, metadata: Record<string, unknown> = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...formatMetadata(metadata),
  };

  if (env.NODE_ENV === 'development') {
    const summary = Object.entries(entry)
      .filter(([key]) => !['timestamp', 'level', 'event'].includes(key))
      .map(([key, value]) => `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join(' ');

    if (level === 'error') {
      console.error(`[${entry.level.toUpperCase()}] ${entry.event}${summary ? ` ${summary}` : ''}`);
      return;
    }

    if (level === 'warn') {
      console.warn(`[${entry.level.toUpperCase()}] ${entry.event}${summary ? ` ${summary}` : ''}`);
      return;
    }

    console.log(`[${entry.level.toUpperCase()}] ${entry.event}${summary ? ` ${summary}` : ''}`);
    return;
  }

  if (level === 'error') {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
}

export function getRequestLogMetadata(request: Request, response: Response) {
  return {
    requestId: response.locals.requestId,
    method: request.method,
    path: request.originalUrl,
    userId: request.user?.id,
  };
}

export const logger = {
  debug: (event: string, metadata?: Record<string, unknown>) => writeLog('debug', event, metadata),
  info: (event: string, metadata?: Record<string, unknown>) => writeLog('info', event, metadata),
  warn: (event: string, metadata?: Record<string, unknown>) => writeLog('warn', event, metadata),
  error: (event: string, metadata?: Record<string, unknown>) => writeLog('error', event, metadata),
};
