import { z } from 'zod';

export const analyzeLogSchema = z.object({
  body: z.object({
    logId: z.string().cuid(),
    createAlertOnHighConfidence: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const analyzeBatchSchema = z.object({
  body: z.object({
    logIds: z.array(z.string().cuid()).min(1).max(50).optional(),
    limit: z.coerce.number().int().min(1).max(25).optional(),
    createAlertsOnHighConfidence: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});
