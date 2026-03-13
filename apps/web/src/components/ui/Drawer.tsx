import { X } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils/cn';

type DrawerProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
  className?: string;
  eyebrow?: string;
}>;

export function Drawer({
  open,
  title,
  description,
  onClose,
  actions,
  className,
  eyebrow = 'Details',
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close details"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          'aegis-panel relative z-[1] flex h-full w-full max-w-2xl flex-col rounded-none border-l border-white/10 p-6 sm:p-7',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <p className="aegis-kicker">{eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl text-white sm:text-[2rem]">{title}</h2>
            {description ? (
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{description}</p>
            ) : null}
          </div>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-aegis-500/30 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
      </aside>
    </div>
  );
}
