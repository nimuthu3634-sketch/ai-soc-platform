import type { UserRole } from '@aegis-core/contracts';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  FileBarChart2,
  LayoutDashboard,
  ScrollText,
  Settings2,
  Siren,
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    description: 'Operational overview and health',
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'analyst', 'responder'],
  },
  {
    label: 'Logs',
    path: '/logs',
    description: 'Centralized event intake',
    icon: ScrollText,
    allowedRoles: ['admin', 'analyst', 'responder'],
  },
  {
    label: 'Alerts',
    path: '/alerts',
    description: 'Detection and triage queue',
    icon: Siren,
    allowedRoles: ['admin', 'analyst', 'responder'],
  },
  {
    label: 'Incidents',
    path: '/incidents',
    description: 'Response coordination',
    icon: AlertTriangle,
    allowedRoles: ['admin', 'analyst', 'responder'],
  },
  {
    label: 'Reports',
    path: '/reports',
    description: 'Operational reporting',
    icon: FileBarChart2,
    allowedRoles: ['admin', 'analyst'],
  },
  {
    label: 'Settings',
    path: '/settings',
    description: 'Platform and profile options',
    icon: Settings2,
    allowedRoles: ['admin'],
  },
];
