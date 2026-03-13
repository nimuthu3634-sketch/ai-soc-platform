import {
  incidentSeverityValues,
  incidentStatusValues,
} from '@aegis-core/contracts';
import { z } from 'zod';

const toStringArray = (value: string | string[] | undefined) => {
  if (!value) {
    return [];
  }

  const items = Array.isArray(value) ? value : value.split(',');

  return items
    .map((item) => item.trim())
    .filter(Boolean);
};

const severityArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(incidentSeverityValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof incidentSeverityValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported incident severity filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof incidentSeverityValues)[number][];
  });

const statusArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(incidentStatusValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof incidentStatusValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported incident status filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof incidentStatusValues)[number][];
  });

const assigneeArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    const items = toStringArray(value);

    return items.length > 0 ? items : undefined;
  });

export const listIncidentsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
    search: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => value || undefined),
    severity: severityArraySchema,
    status: statusArraySchema,
    assigneeId: assigneeArraySchema,
  }),
});

export const incidentIdParamsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});

export const updateIncidentStatusSchema = z.object({
  body: z.object({
    status: z.enum(incidentStatusValues),
  }),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});

export const assignIncidentSchema = z.object({
  body: z.object({
    assigneeId: z.string().trim().min(1).nullable(),
  }),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});
