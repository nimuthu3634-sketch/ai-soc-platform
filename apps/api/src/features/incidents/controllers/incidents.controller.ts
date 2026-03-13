import type {
  AssignIncidentPayload,
  IncidentListQuery,
  UpdateIncidentStatusPayload,
} from '@aegis-core/contracts';
import type { NextFunction, Request, Response } from 'express';

import { sendSuccess } from '../../../lib/http/response.js';
import {
  assignIncident,
  getIncidentById,
  listIncidents,
  updateIncidentStatus,
} from '../services/incidents.service.js';

export async function listIncidentsController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const incidents = await listIncidents(request.query as unknown as IncidentListQuery);

    return sendSuccess(response, 200, 'Incidents fetched successfully.', incidents);
  } catch (error) {
    return next(error);
  }
}

export async function getIncidentByIdController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const incident = await getIncidentById((request.params as { id: string }).id);

    return sendSuccess(response, 200, 'Incident fetched successfully.', incident);
  } catch (error) {
    return next(error);
  }
}

export async function updateIncidentStatusController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const incident = await updateIncidentStatus(
      (request.params as { id: string }).id,
      request.body as UpdateIncidentStatusPayload,
    );

    return sendSuccess(response, 200, 'Incident status updated successfully.', incident);
  } catch (error) {
    return next(error);
  }
}

export async function assignIncidentController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const incident = await assignIncident(
      (request.params as { id: string }).id,
      request.body as AssignIncidentPayload,
    );

    return sendSuccess(response, 200, 'Incident assignment updated successfully.', incident);
  } catch (error) {
    return next(error);
  }
}
