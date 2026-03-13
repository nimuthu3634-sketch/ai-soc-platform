import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url().optional(),
  FRONTEND_ORIGINS: z.string().optional(),
  TRUST_PROXY: z
    .union([z.string(), z.boolean()])
    .optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters.'),
  JWT_EXPIRES_IN: z.string().min(1).default('8h'),
  JWT_ISSUER: z.string().min(1).default('aegis-core'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  AI_ANALYZER_PROVIDER: z.enum(['mock', 'external']).default('mock'),
  AI_ALERT_THRESHOLD: z.coerce.number().min(0).max(100).default(80),
  AI_EXTERNAL_SERVICE_URL: z.string().url().optional().or(z.literal('')),
  AI_EXTERNAL_SERVICE_API_KEY: z.string().optional(),
  AI_EXTERNAL_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
}

function parseBoolean(value: string | boolean | undefined, fallback: boolean) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const urlSchema = z.string().url();
const frontendOrigins = [
  parsedEnv.data.FRONTEND_ORIGIN,
  ...(parsedEnv.data.FRONTEND_ORIGINS?.split(',') ?? []),
]
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value));

if (frontendOrigins.length === 0) {
  throw new Error(
    'Invalid environment configuration:\n- FRONTEND_ORIGIN or FRONTEND_ORIGINS must define at least one allowed frontend URL.',
  );
}

const invalidFrontendOrigins = frontendOrigins.filter(
  (origin) => !urlSchema.safeParse(origin).success,
);

if (invalidFrontendOrigins.length > 0) {
  throw new Error(
    `Invalid environment configuration:\n- FRONTEND_ORIGINS contains invalid URLs: ${invalidFrontendOrigins.join(', ')}`,
  );
}

export const env = {
  ...parsedEnv.data,
  FRONTEND_ORIGINS: [...new Set(frontendOrigins)],
  TRUST_PROXY: parseBoolean(
    parsedEnv.data.TRUST_PROXY,
    parsedEnv.data.NODE_ENV === 'production',
  ),
};
