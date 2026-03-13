import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';


import { branding } from '@/config/branding';
import { cn } from '@/lib/utils/cn';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  const [hasLogoError, setHasLogoError] = useState(false);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden border shadow-[0_18px_44px_rgba(0,0,0,0.3)]',
          compact ? 'h-11 w-11 rounded-[18px]' : 'h-14 w-14 rounded-[22px]',
        )}
        style={{
          background:
            'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(8,12,20,0.94))',
          borderColor: 'rgba(255, 122, 26, 0.24)',
        }}
      >
        <span
          className="absolute inset-[1px] rounded-[inherit]"
          style={{
            background:
              'linear-gradient(160deg, rgba(255,122,26,0.16), rgba(15,23,42,0.18) 45%, rgba(15,23,42,0.82))',
          }}
        />
        {hasLogoError ? (
          <ShieldCheck
            className={cn(
              'relative z-[1] text-aegis-400',
              compact ? 'h-5 w-5' : 'h-6 w-6',
            )}
          />
        ) : (
          <img
            alt="Aegis Core logo"
            className="relative z-[1] h-full w-full object-cover"
            onError={() => setHasLogoError(true)}
            src={branding.logoPath}
          />
        )}
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold tracking-[0.04em] text-white">
            {branding.appName}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.32em] text-slate-400">
            {branding.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}
