import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

type KpiCardProps = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: 'accent' | 'warning' | 'danger' | 'success' | 'neutral';
};

const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
  accent: 'border-aegis-500/20 bg-aegis-500/10 text-aegis-300',
  warning: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-400/20 bg-rose-500/10 text-rose-300',
  success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  neutral: 'border-white/10 bg-white/[0.05] text-slate-200',
};

export function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
}: KpiCardProps) {
  return (
    <div className="aegis-panel h-full p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="aegis-kicker text-slate-400">{label}</p>
          <p className="mt-5 font-display text-3xl text-white sm:text-[2.4rem]">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-[20px] border',
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-6 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}
