import { Activity, ShieldCheck, Target } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { BrandMark } from '@/components/branding/BrandMark';
import { UserMenu } from '@/components/navigation/UserMenu';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { navigationItems } from '@/config/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();

  const visibleNavigation = navigationItems.filter((item) =>
    item.allowedRoles.includes(user!.role),
  );
  const activeItem =
    visibleNavigation.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path),
    ) ?? visibleNavigation[0];

  return (
    <div className="aegis-app-shell min-h-screen bg-transparent text-white">
      <div className="mx-auto grid min-h-screen max-w-[1840px] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950/70 px-5 py-5 backdrop-blur xl:sticky xl:top-0 xl:h-screen xl:border-b-0 xl:border-r xl:px-6 xl:py-7">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4 xl:block">
              <BrandMark />
            </div>

            <div className="aegis-panel-muted mt-7 p-5">
              <p className="aegis-kicker">Milestone readiness</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-4xl text-white">25%</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Auth, protected routes, Prisma data, and the SOC shell are running.
                  </p>
                </div>
                <StatusBadge label="Live demo" tone="warning" />
              </div>
            </div>

            <nav className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    className={({ isActive }) =>
                      `group rounded-[26px] border px-4 py-4 transition ${
                        isActive
                          ? 'border-aegis-500/35 bg-aegis-500/10 text-white shadow-[0_18px_40px_rgba(255,122,26,0.12)]'
                          : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                      }`
                    }
                    end={item.path === '/'}
                    key={item.path}
                    to={item.path}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/6 bg-slate-950/80 text-aegis-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-inherit">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 transition group-hover:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <div className="aegis-panel-muted mt-7 hidden p-5 xl:block">
              <p className="aegis-kicker text-slate-400">Operations profile</p>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Active role</span>
                  <span className="font-medium capitalize text-white">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Workspace</span>
                  <span className="font-medium text-white">{activeItem?.label}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Modules</span>
                  <span className="font-medium text-white">{visibleNavigation.length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
          <div className="space-y-6">
            <header className="aegis-panel px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-4">
                    <BrandMark compact />
                    <div className="min-w-0">
                      <p className="aegis-kicker">Secure operations workspace</p>
                      <h1 className="mt-3 truncate font-display text-2xl text-white sm:text-[2rem]">
                        {activeItem?.label}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                        {activeItem?.description}. Welcome back, {user?.fullName.split(' ')[0]}.
                        Your {user?.role} session is active and authenticated.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="aegis-chip">
                    <Target className="h-3.5 w-3.5 text-aegis-300" />
                    Protected routes
                  </span>
                  <span className="aegis-chip">
                    <ShieldCheck className="h-3.5 w-3.5 text-aegis-300" />
                    JWT active
                  </span>
                  <span className="aegis-chip">
                    <Activity className="h-3.5 w-3.5 text-emerald-300" />
                    Platform online
                  </span>
                  <UserMenu />
                </div>
              </div>
            </header>

            <div className="rounded-[34px] border border-white/10 bg-slate-950/30 p-4 shadow-panel backdrop-blur sm:p-6 xl:p-7">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
