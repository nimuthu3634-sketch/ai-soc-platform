import { cn } from '@/lib/utils/cn';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function StatCard({ label, value, delta }: StatCardProps) {
  const tone = delta.startsWith('-') ? 'negative' : delta.startsWith('+') ? 'positive' : 'neutral';

  return (
    <div className="aegis-panel h-full p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="aegis-kicker text-slate-400">{label}</p>
          <p className="mt-5 font-display text-3xl text-white sm:text-[2.5rem]">{value}</p>
        </div>
        <span
          className={cn(
            'inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
            tone === 'positive' &&
              'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
            tone === 'negative' && 'border-rose-400/30 bg-rose-500/10 text-rose-300',
            tone === 'neutral' && 'border-white/10 bg-white/5 text-slate-300',
          )}
        >
          {delta}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 text-xs text-slate-500">
        <span>Compared with previous observation window</span>
        <span className="h-1.5 w-16 rounded-full bg-white/10">
          <span
            className={cn(
              'block h-full rounded-full',
              tone === 'positive' && 'bg-emerald-400',
              tone === 'negative' && 'bg-rose-400',
              tone === 'neutral' && 'bg-aegis-400/80',
            )}
            style={{ width: tone === 'neutral' ? '42%' : '74%' }}
          />
        </span>
      </div>
    </div>
  );
}
