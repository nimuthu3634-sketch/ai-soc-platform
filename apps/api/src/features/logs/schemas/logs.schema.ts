import {
  logEventTypeValues,
  logSeverityValues,
  logStatusValues,
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

const isValidDateString = (value: string) => !Number.isNaN(new Date(value).valueOf());

const sourceArraySchema = z
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

    const allowedValues = new Set(logSeverityValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof logSeverityValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported severity filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof logSeverityValues)[number][];
  });

const eventTypeArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(logEventTypeValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof logEventTypeValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported event type filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof logEventTypeValues)[number][];
  });

const statusArraySchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, context) => {
    const items = toStringArray(value);

    if (items.length === 0) {
      return undefined;
    }

    const allowedValues = new Set(logStatusValues);

    for (const item of items) {
      if (!allowedValues.has(item as (typeof logStatusValues)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported status filter: ${item}.`,
        });
        return z.NEVER;
      }
    }

    return items as (typeof logStatusValues)[number][];
  });

const dateStringSchema = z
  .string()
  .trim()
  .refine(isValidDateString, 'Expected a valid date or datetime string.');

const createLogBodySchema = z.object({
  timestamp: dateStringSchema,
  source: z.string().trim().min(2).max(80),
  host: z.string().trim().min(2).max(120),
  severity: z.enum(logSeverityValues),
  eventType: z.enum(logEventTypeValues),
  message: z.string().trim().min(8).max(600),
  rawData: z.unknown().optional(),
  status: z.enum(logStatusValues).default('new'),
});

export const listLogsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(10),
      search: z
        .string()
        .trim()
        .max(200)
        .optional()
        .transform((value) => value || undefined),
      severity: severityArraySchema,
      source: sourceArraySchema,
      eventType: eventTypeArraySchema,
      status: statusArraySchema,
      dateFrom: dateStringSchema.optional(),
      dateTo: dateStringSchema.optional(),
    })
    .refine(
      (value) =>
        !value.dateFrom ||
        !value.dateTo ||
        new Date(value.dateFrom).valueOf() <= new Date(value.dateTo).valueOf(),
      {
        message: 'dateFrom must be earlier than or equal to dateTo.',
        path: ['dateFrom'],
      },
    ),
});

export const logIdParamsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).default({}),
});

export const createLogSchema = z.object({
  body: createLogBodySchema,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const bulkCreateLogsSchema = z.object({
  body: z.object({
    logs: z.array(createLogBodySchema).min(1).max(100),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
