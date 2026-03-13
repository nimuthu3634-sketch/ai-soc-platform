import { cn } from '@/lib/utils/cn';

type StatusBadgeProps = {
  label: string;
  tone?: 'neutral' | 'info' | 'warning' | 'danger' | 'success';
};

const toneClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  neutral: 'border-white/10 bg-white/5 text-slate-200',
  info: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
  warning: 'border-aegis-400/30 bg-aegis-500/10 text-aegis-300',
  danger: 'border-rose-400/30 bg-rose-500/10 text-rose-300',
  success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
};

const toneDotClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  neutral: 'bg-slate-300',
  info: 'bg-sky-300',
  warning: 'bg-aegis-300',
  danger: 'bg-rose-300',
  success: 'bg-emerald-300',
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]',
        toneClasses[tone],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', toneDotClasses[tone])} />
      {label}
    </span>
  );
}
