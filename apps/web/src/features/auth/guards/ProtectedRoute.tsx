import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { LoadingScreen } from '@/components/ui/LoadingScreen';


export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen label="Restoring secure session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/login"
      />
    );
  }

  return <>{children}</>;
}
