import type {
  AlertListQuery,
  CreateAlertPayload,
  CreateIncidentFromAlertPayload,
  UpdateAlertStatusPayload,
} from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import { createIncidentFromAlert } from '../../incidents/services/incidents.service.js';
import {
  createAlert,
  getAlertById,
  listAlerts,
  updateAlertStatus,
} from '../services/alerts.service.js';

export async function listAlertsController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const alerts = await listAlerts(request.query as unknown as AlertListQuery);

    return sendSuccess(response, 200, 'Alerts fetched successfully.', alerts);
  } catch (error) {
    return next(error);
  }
}

export async function getAlertByIdController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const alert = await getAlertById((request.params as { id: string }).id);

    return sendSuccess(response, 200, 'Alert fetched successfully.', alert);
  } catch (error) {
    return next(error);
  }
}

export async function createAlertController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const alert = await createAlert(request.body as CreateAlertPayload);

    return sendSuccess(response, 201, 'Alert created successfully.', alert);
  } catch (error) {
    return next(error);
  }
}

export async function updateAlertStatusController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const alert = await updateAlertStatus(
      (request.params as { id: string }).id,
      request.body as UpdateAlertStatusPayload,
    );

    return sendSuccess(response, 200, 'Alert status updated successfully.', alert);
  } catch (error) {
    return next(error);
  }
}

export async function createIncidentFromAlertController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const incident = await createIncidentFromAlert(
      (request.params as { id: string }).id,
      request.body as CreateIncidentFromAlertPayload,
      request.user!.id,
    );

    return sendSuccess(response, 201, 'Incident created from alert successfully.', incident);
  } catch (error) {
    return next(error);
  }
}
