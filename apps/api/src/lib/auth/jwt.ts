import type { UserRole } from '@aegis-core/contracts';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';

type AccessTokenClaims = {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AuthTokenPayload = JwtPayload & AccessTokenClaims;

export function signAccessToken(payload: AccessTokenClaims) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
  }) as AuthTokenPayload;
}
