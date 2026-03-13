import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { LoadingScreen } from '@/components/ui/LoadingScreen';


export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen label="Checking existing session..." />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        replace
        to="/"
      />
    );
  }

  return <>{children}</>;
}
