import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { AuthProvider } from '@/features/auth/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function RootProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

export function AppProviders() {
  return (
    <RootProviders>
      <RouterProvider router={router} />
    </RootProviders>
  );
}
