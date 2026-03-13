import { z } from 'zod';

const roleSchema = z.enum(['admin', 'analyst', 'responder']);

export const registerUserSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(3).max(80),
    email: z.string().trim().email(),
    password: z.string().min(8).max(72),
    role: roleSchema.default('analyst'),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(72),
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});
