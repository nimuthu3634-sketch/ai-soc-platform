import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="aegis-app-shell flex min-h-screen items-center justify-center px-6">
      <div className="aegis-panel w-full max-w-xl p-8">
        <p className="aegis-kicker">404</p>
        <h1 className="mt-4 font-display text-4xl text-white">Route not found</h1>
        <p className="mt-3 text-sm text-slate-300">
          The requested workspace surface is not registered in the current Aegis Core milestone.
        </p>
        <Link
          className="aegis-button-secondary mt-6"
          to="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
