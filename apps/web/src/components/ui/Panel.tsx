import type { PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type PanelProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}>;

export function Panel({ title, subtitle, action, className, children }: PanelProps) {
  return (
    <section className={cn('aegis-panel p-5 sm:p-6', className)}>
      {title || subtitle || action ? (
        <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            {title ? (
              <h2 className="font-display text-[1.35rem] font-semibold tracking-[0.02em] text-white">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="mt-2 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
