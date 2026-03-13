import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <main className="aegis-app-shell flex min-h-screen items-center justify-center px-6">
      <div className="aegis-panel w-full max-w-xl p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-aegis-500/20 bg-aegis-500/10 text-aegis-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-4xl text-white">Access denied</h1>
        <p className="mt-3 text-sm text-slate-300">
          Your current role does not have permission to open this module.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="aegis-button-secondary"
            to="/"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
