import type { UserRole } from '@aegis-core/contracts';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: UserRole[];
}>;

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return (
      <Navigate
        replace
        to="/unauthorized"
      />
    );
  }

  return <>{children}</>;
}
