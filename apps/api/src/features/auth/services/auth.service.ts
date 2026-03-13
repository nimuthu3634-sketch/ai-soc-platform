import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserRole as ContractUserRole,
} from '@aegis-core/contracts';
import { UserRole as PrismaUserRole, type User } from '@prisma/client';

import { env } from '../../../config/env.js';
import { comparePassword, hashPassword } from '../../../lib/auth/hash.js';
import { signAccessToken } from '../../../lib/auth/jwt.js';
import { AppError } from '../../../lib/http/app-error.js';
import { prisma } from '../../../lib/prisma.js';

const contractToPrismaRole: Record<ContractUserRole, PrismaUserRole> = {
  admin: PrismaUserRole.ADMIN,
  analyst: PrismaUserRole.ANALYST,
  responder: PrismaUserRole.RESPONDER,
};

const prismaToContractRole: Record<PrismaUserRole, ContractUserRole> = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  RESPONDER: 'responder',
};

type SerializableUser = Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'createdAt' | 'updatedAt'>;

function serializeUser(user: SerializableUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: prismaToContractRole[user.role],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function createSession(user: SerializableUser): AuthSession {
  const authUser = serializeUser(user);

  return {
    token: signAccessToken({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: authUser.role,
    }),
    tokenType: 'Bearer',
    expiresIn: env.JWT_EXPIRES_IN,
    user: authUser,
  };
}

export async function registerUser(payload: RegisterPayload) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
  }

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(payload.password),
      role: contractToPrismaRole[payload.role],
    },
  });

  return createSession(user);
}

export async function loginUser(payload: LoginPayload) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const isPasswordValid = await comparePassword(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  return createSession(user);
}

export async function getAuthUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Authenticated user could not be found.');
  }

  return serializeUser(user);
}
