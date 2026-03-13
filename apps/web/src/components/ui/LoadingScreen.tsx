import { ShieldCheck } from 'lucide-react';

import { BrandMark } from '@/components/branding/BrandMark';

type LoadingScreenProps = {
  label?: string;
};

export function LoadingScreen({ label = 'Loading secure workspace...' }: LoadingScreenProps) {
  return (
    <div className="aegis-app-shell flex min-h-screen items-center justify-center px-6">
      <div className="aegis-panel w-full max-w-lg p-8 text-center sm:p-10">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-aegis-500/20" />
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <div className="absolute inset-[14px] animate-spin rounded-full border-[3px] border-aegis-500/15 border-t-aegis-400" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-aegis-500/20 bg-aegis-500/10 text-aegis-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <BrandMark />
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-300">{label}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="aegis-chip">JWT secured</span>
          <span className="aegis-chip">Telemetry sync</span>
          <span className="aegis-chip">SOC console</span>
        </div>
      </div>
    </div>
  );
}
