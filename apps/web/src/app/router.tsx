import { createBrowserRouter } from 'react-router-dom';

import { NotFoundPage } from '@/app/NotFoundPage';
import { UnauthorizedPage } from '@/app/UnauthorizedPage';
import { AlertsPage } from '@/features/alerts/routes/AlertsPage';
import { ProtectedRoute } from '@/features/auth/guards/ProtectedRoute';
import { PublicOnlyRoute } from '@/features/auth/guards/PublicOnlyRoute';
import { RoleGuard } from '@/features/auth/guards/RoleGuard';
import { LoginPage } from '@/features/auth/routes/LoginPage';
import { DashboardPage } from '@/features/dashboard/routes/DashboardPage';
import { IncidentsPage } from '@/features/incidents/routes/IncidentsPage';
import { LogsPage } from '@/features/logs/routes/LogsPage';
import { ReportsPage } from '@/features/reports/routes/ReportsPage';
import { SettingsPage } from '@/features/settings/routes/SettingsPage';
import { AppShell } from '@/layouts/AppShell';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <ProtectedRoute>
        <UnauthorizedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'logs',
        element: <LogsPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'incidents',
        element: <IncidentsPage />,
      },
      {
        path: 'reports',
        element: (
          <RoleGuard allowedRoles={['admin', 'analyst']}>
            <ReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <SettingsPage />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
