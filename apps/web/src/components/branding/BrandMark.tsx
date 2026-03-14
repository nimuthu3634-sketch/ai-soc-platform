import { useState } from 'react';

import { branding } from '@/config/branding';
import { cn } from '@/lib/utils/cn';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  const [hasLogoError, setHasLogoError] = useState(false);

  const activeAssetPath =
    compact && branding.markPath ? branding.markPath : branding.logoPath;

  return (
    <div
      className={cn(
        compact ? 'flex items-center' : 'flex flex-col items-start gap-2',
        className,
      )}
    >
      {hasLogoError ? (
        <div
          className={cn(
            'flex items-center justify-center rounded-xl border border-orange-500/25 bg-slate-900/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)]',
            compact
              ? 'h-12 min-w-[60px] px-3 text-sm font-bold'
              : 'h-16 min-w-[90px] px-4 text-base font-bold',
          )}
        >
          AC
        </div>
      ) : (
        <img
          src={activeAssetPath}
          alt={compact ? 'Aegis Core mark' : 'Aegis Core logo'}
          onError={() => setHasLogoError(true)}
          className={cn(
            'bg-transparent object-contain',
            compact
              ? 'h-14 w-auto max-w-[180px]'
              : 'h-20 w-auto max-w-[340px] drop-shadow-[0_16px_28px_rgba(0,0,0,0.28)]',
          )}
        />
      )}

      {!compact ? (
        <p className="pl-1 text-xs uppercase tracking-[0.32em] text-slate-400">
          {branding.tagline}
        </p>
      ) : null}
    </div>
  );
}
