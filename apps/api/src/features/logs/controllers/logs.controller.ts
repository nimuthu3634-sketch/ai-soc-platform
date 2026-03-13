import type { BulkCreateLogsPayload, CreateLogPayload, LogListQuery } from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import {
  createLog,
  createLogsBulk,
  getLogById,
  listLogs,
} from '../services/logs.service.js';

export async function listLogsController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const logs = await listLogs(request.query as unknown as LogListQuery);

    return sendSuccess(response, 200, 'Logs fetched successfully.', logs);
  } catch (error) {
    return next(error);
  }
}

export async function getLogByIdController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const log = await getLogById((request.params as { id: string }).id);

    return sendSuccess(response, 200, 'Log entry fetched successfully.', log);
  } catch (error) {
    return next(error);
  }
}

export async function createLogController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const log = await createLog(request.body as CreateLogPayload);

    return sendSuccess(response, 201, 'Log entry created successfully.', log);
  } catch (error) {
    return next(error);
  }
}

export async function bulkCreateLogsController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await createLogsBulk(request.body as BulkCreateLogsPayload);

    return sendSuccess(response, 201, 'Bulk log ingest completed successfully.', result);
  } catch (error) {
    return next(error);
  }
}
