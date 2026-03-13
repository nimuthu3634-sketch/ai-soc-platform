import { Download, FileClock, FileText } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/features/auth/context/AuthContext';

const reports = [
  {
    name: 'Weekly Threat Summary',
    schedule: 'Every Monday 08:00',
    status: 'planned',
    icon: FileClock,
  },
  {
    name: 'Incident Closure Brief',
    schedule: 'On-demand',
    status: 'planned',
    icon: FileText,
  },
];

export function ReportsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Reports stay lightweight at this milestone, but the route is protected and role-aware so the module can expand cleanly next."
        eyebrow="Reports"
        title="Reporting Workspace"
      />
      <Panel
        action={
          <button
            className="aegis-button-secondary"
            type="button"
          >
            <Download className="h-4 w-4" />
            Export placeholder
          </button>
        }
        subtitle={`Visible to ${user?.role} sessions as part of the early role-based access model.`}
        title="Templates and schedules"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map(({ icon: Icon, name, schedule, status }) => (
            <article
              className="aegis-panel-muted p-5"
              key={name}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-aegis-500/15 bg-aegis-500/10 text-aegis-300">
                  <Icon className="h-5 w-5" />
                </div>
                <StatusBadge label={status} tone="warning" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{name}</h3>
              <p className="mt-2 text-sm text-slate-300">{schedule}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
