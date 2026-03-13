import {
  alertSeverityValues,
  alertStatusValues,
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

const stringArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    const items = toStringArray(value);

    return items.length > 0 ? items : undefined;
  });

const severityArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(alertSeverityValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof alertSeverityValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported alert severity filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof alertSeverityValues)[number][];
  });

const statusArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(alertStatusValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof alertStatusValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported alert status filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof alertStatusValues)[number][];
  });

export const listAlertsSchema = z.object({
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
    source: stringArraySchema,
  }),
});

export const alertIdParamsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});

export const createAlertSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(10).max(600),
    source: z.string().trim().min(2).max(80),
    severity: z.enum(alertSeverityValues),
    confidenceScore: z.coerce.number().int().min(0).max(100),
    linkedLogId: z.string().trim().min(1).nullable().optional(),
    status: z.enum(alertStatusValues).default('new'),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateAlertStatusSchema = z.object({
  body: z.object({
    status: z.enum(alertStatusValues),
  }),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});

export const createIncidentFromAlertSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(10).max(600).optional(),
    assigneeId: z.string().trim().min(1).nullable().optional(),
  }),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});
