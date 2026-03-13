import type { LoginPayload, RegisterPayload } from '@aegis-core/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Radar, Server, Shield, ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';

import { BrandMark } from '@/components/branding/BrandMark';
import { branding } from '@/config/branding';
import { ApiClientError } from '@/lib/api/client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['admin', 'analyst', 'responder']),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const demoAccounts = [
  { role: 'Admin', email: 'admin@aegiscore.local' },
  { role: 'Analyst', email: 'analyst@aegiscore.local' },
  { role: 'Responder', email: 'responder@aegiscore.local' },
];

const platformSignals = [
  {
    icon: ShieldCheck,
    title: 'Authenticated command access',
    description: 'JWT sessions and protected routes are already wired into the platform.',
  },
  {
    icon: Radar,
    title: 'Operational module shell',
    description: 'Dashboard, logs, alerts, and incidents are ready for live walkthroughs.',
  },
  {
    icon: Server,
    title: 'Seeded backend data',
    description: 'PostgreSQL, Prisma, and sample records make the demo feel operational.',
  },
];

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: 'analyst@aegiscore.local',
      password: 'Aegis123!',
    },
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: 'Aegis123!',
      role: 'analyst',
    },
    resolver: zodResolver(registerSchema),
  });

  const handleAuthError = (error: unknown) => {
    if (error instanceof ApiClientError) {
      setAuthError(error.message);
      return;
    }

    setAuthError('Unable to complete authentication right now.');
  };

  const handleLogin = async (values: LoginPayload) => {
    setAuthError(null);

    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleRegister = async (values: RegisterPayload) => {
    setAuthError(null);

    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <main className="aegis-app-shell relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,122,26,0.2),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(56,189,248,0.08),transparent_18%),linear-gradient(180deg,rgba(6,10,18,0.18),rgba(6,10,18,0.74))]" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden border-r border-white/10 lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,26,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
            <div className="space-y-8">
              <BrandMark />
              <div className="max-w-2xl">
                <p className="aegis-kicker">Secure operations center</p>
                <h1 className="mt-5 font-display text-5xl leading-[1.04] text-white xl:text-[4.35rem]">
                  Premium access to the Aegis Core security console.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                  The interface now follows the same dark command-center language as the Aegis Core
                  identity: restrained orange emphasis, readable surfaces, and presentation-ready
                  module framing.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {platformSignals.map(({ icon: Icon, title, description }) => (
                <article
                  className="aegis-panel-muted p-5"
                  key={title}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-aegis-500/15 bg-aegis-500/10 text-aegis-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-base font-semibold text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
                </article>
              ))}
            </div>

            <div className="aegis-panel mt-8 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="aegis-kicker">Demo access</p>
                  <h2 className="mt-4 font-display text-2xl text-white">Seeded role accounts</h2>
                </div>
                <span className="aegis-chip">
                  <Shield className="h-3.5 w-3.5 text-aegis-300" />
                  Shared password
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {demoAccounts.map((account) => (
                  <div
                    className="aegis-panel-muted flex items-center justify-between gap-4 px-4 py-3"
                    key={account.email}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{account.role}</p>
                      <p className="mt-1 text-sm text-slate-300">{account.email}</p>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-aegis-300">
                      Aegis123!
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-400">
                Logo runtime path:{' '}
                <span className="font-mono text-aegis-300">{branding.logoPath}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
          <div className="aegis-panel w-full max-w-xl p-7 sm:p-8 xl:p-9">
            <div className="lg:hidden">
              <BrandMark />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 lg:mt-0">
              <span className="aegis-chip">Dark SOC theme</span>
              <span className="aegis-chip">Role-based access</span>
              <span className="aegis-chip">Presentation ready</span>
            </div>

            <div className="mt-8 flex rounded-[22px] border border-white/10 bg-white/[0.04] p-1">
              <button
                className={`flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-aegis-500 text-slate-950 shadow-[0_12px_28px_rgba(255,122,26,0.24)]'
                    : 'text-slate-300 hover:text-white'
                }`}
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                }}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  mode === 'register'
                    ? 'bg-aegis-500 text-slate-950 shadow-[0_12px_28px_rgba(255,122,26,0.24)]'
                    : 'text-slate-300 hover:text-white'
                }`}
                onClick={() => {
                  setMode('register');
                  setAuthError(null);
                }}
                type="button"
              >
                Register
              </button>
            </div>

            <div className="mt-7">
              <p className="aegis-kicker">{mode === 'login' ? 'Secure sign in' : 'Create access'}</p>
              <h2 className="mt-4 font-display text-3xl text-white sm:text-[2.3rem]">
                {mode === 'login'
                  ? 'Enter the Aegis Core console'
                  : 'Create a role-aware demo account'}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {mode === 'login'
                  ? 'Authenticate with a seeded account or a user you register here. Existing auth flow remains unchanged.'
                  : 'Registration creates a JWT session immediately, so the user lands inside the protected dashboard shell.'}
              </p>
            </div>

            {authError ? (
              <div className="mt-5 rounded-[22px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                {authError}
              </div>
            ) : null}

            {mode === 'login' ? (
              <form
                className="mt-8 space-y-5"
                onSubmit={loginForm.handleSubmit(handleLogin)}
              >
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Email</span>
                  <input
                    className="aegis-input"
                    placeholder="analyst@aegiscore.local"
                    type="email"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email ? (
                    <span className="mt-2 block text-sm text-rose-300">
                      {loginForm.formState.errors.email.message}
                    </span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Password</span>
                  <input
                    className="aegis-input"
                    placeholder="Aegis123!"
                    type="password"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password ? (
                    <span className="mt-2 block text-sm text-rose-300">
                      {loginForm.formState.errors.password.message}
                    </span>
                  ) : null}
                </label>

                <button
                  className="aegis-button-primary w-full"
                  disabled={loginForm.formState.isSubmitting}
                  type="submit"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form
                className="mt-8 space-y-5"
                onSubmit={registerForm.handleSubmit(handleRegister)}
              >
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Full name</span>
                  <input
                    className="aegis-input"
                    placeholder="Your name"
                    type="text"
                    {...registerForm.register('fullName')}
                  />
                  {registerForm.formState.errors.fullName ? (
                    <span className="mt-2 block text-sm text-rose-300">
                      {registerForm.formState.errors.fullName.message}
                    </span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Email</span>
                  <input
                    className="aegis-input"
                    placeholder="your.name@aegiscore.local"
                    type="email"
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email ? (
                    <span className="mt-2 block text-sm text-rose-300">
                      {registerForm.formState.errors.email.message}
                    </span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Password</span>
                  <input
                    className="aegis-input"
                    placeholder="Choose a secure password"
                    type="password"
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password ? (
                    <span className="mt-2 block text-sm text-rose-300">
                      {registerForm.formState.errors.password.message}
                    </span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Role</span>
                  <select
                    className="aegis-input"
                    {...registerForm.register('role')}
                  >
                    <option
                      className="bg-slate-950"
                      value="admin"
                    >
                      admin
                    </option>
                    <option
                      className="bg-slate-950"
                      value="analyst"
                    >
                      analyst
                    </option>
                    <option
                      className="bg-slate-950"
                      value="responder"
                    >
                      responder
                    </option>
                  </select>
                </label>

                <button
                  className="aegis-button-primary w-full"
                  disabled={registerForm.formState.isSubmitting}
                  type="submit"
                >
                  <UserPlus className="h-4 w-4" />
                  {registerForm.formState.isSubmitting ? 'Creating account...' : 'Register and enter'}
                </button>
              </form>
            )}

            <div className="aegis-panel-muted mt-8 p-4 lg:hidden">
              <p className="text-sm font-semibold text-white">Demo credentials</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Use any seeded account with password{' '}
                <span className="font-mono text-aegis-300">Aegis123!</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
