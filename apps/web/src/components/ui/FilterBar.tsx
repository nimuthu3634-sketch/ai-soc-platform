import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type FilterOption = {
  label: string;
  active?: boolean;
};

type FilterBarProps = {
  label?: string;
  filters: FilterOption[];
  action?: ReactNode;
  className?: string;
};

export function FilterBar({
  label = 'Views',
  filters,
  action,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'aegis-panel-muted flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div>
        <p className="aegis-kicker text-slate-400">{label}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={cn(
                'aegis-chip normal-case text-[0.78rem] tracking-[0.04em] transition',
                filter.active
                  ? 'border-aegis-500/30 bg-aegis-500/10 text-white'
                  : 'hover:border-white/20 hover:text-white',
              )}
              key={filter.label}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
