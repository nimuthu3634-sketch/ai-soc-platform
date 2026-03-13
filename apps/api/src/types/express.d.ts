import type { AuthUser } from '@aegis-core/contracts';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }

    interface Locals {
      requestId?: string;
    }
  }
}

export {};
