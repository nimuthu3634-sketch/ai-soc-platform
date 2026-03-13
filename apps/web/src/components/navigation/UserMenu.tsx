import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/context/AuthContext';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        className="inline-flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm text-slate-100 transition hover:border-aegis-500/35 hover:bg-white/[0.06]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-aegis-500/15 bg-aegis-500/10 font-semibold text-aegis-300">
          {initials}
        </span>
        <span className="hidden sm:block">
          <span className="block font-semibold">{user.fullName}</span>
          <span className="block text-xs uppercase tracking-[0.25em] text-slate-500">
            {user.role}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen ? (
        <div className="aegis-panel absolute right-0 z-20 mt-3 w-72 p-4">
          <div className="aegis-panel-muted p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-aegis-300" />
              <div>
                <p className="font-semibold text-white">{user.fullName}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-aegis-300">
              Role: {user.role}
            </p>
          </div>

          <button
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-500/15"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
