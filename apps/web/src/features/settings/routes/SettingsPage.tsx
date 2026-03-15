import { BrandMark } from '@/components/branding/BrandMark';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { branding } from '@/config/branding';
import { useAuth } from '@/features/auth/context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Settings is currently the first admin-only route. It doubles as proof that role-based access is active in both navigation and routing."
        eyebrow="Settings"
        title="Platform Configuration"
      />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          action={<StatusBadge label="Admin only" tone="info" />}
          subtitle="Branding references and authenticated profile details for the current session."
          title="Aegis Core identity"
        >
          <BrandMark />
          <dl className="mt-6 space-y-3 text-sm">
            <div className="aegis-panel-muted p-4">
              <dt className="text-slate-400">Signed-in user</dt>
              <dd className="mt-1 text-white">{user?.fullName}</dd>
            </div>
            <div className="aegis-panel-muted p-4">
              <dt className="text-slate-400">Role</dt>
              <dd className="mt-1 font-mono text-aegis-300">{user?.role}</dd>
            </div>
            <div className="aegis-panel-muted p-4">
              <dt className="text-slate-400">Runtime wordmark asset</dt>
              <dd className="mt-1 font-mono text-aegis-300">{branding.logoPath}</dd>
            </div>
            <div className="aegis-panel-muted p-4">
              <dt className="text-slate-400">Compact mark asset</dt>
              <dd className="mt-1 font-mono text-aegis-300">{branding.markPath}</dd>
            </div>
            <div className="aegis-panel-muted p-4">
              <dt className="text-slate-400">Proposal cover reference</dt>
              <dd className="mt-1 font-mono text-aegis-300">{branding.proposalCoverReference}</dd>
            </div>
          </dl>
        </Panel>

        <div className="space-y-4">
          <Panel
            subtitle="Next milestone: tenant settings, notification rules, and user management."
            title="Admin roadmap"
          >
            <p className="text-sm text-slate-300">
              This screen is intentionally minimal for now, but it already establishes protected
              admin-only navigation and authenticated profile context.
            </p>
          </Panel>
          <Panel
            subtitle="Keep role checks consistent between frontend routing and backend middleware."
            title="Access model"
          >
            <p className="text-sm text-slate-300">
              Current access split: admin sees settings, admin and analyst see reports, and
              operational modules are shared with responder.
            </p>
          </Panel>
        </div>
      </section>
    </div>
  );
}
