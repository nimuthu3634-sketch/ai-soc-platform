import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('aegis-panel-muted p-6 sm:p-7', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-aegis-500/20 bg-aegis-500/10 text-aegis-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-display text-2xl text-white">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
