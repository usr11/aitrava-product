'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function Registro() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accept) return setError('Acepta los términos y el tratamiento de datos.');
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User; mail: { sent: boolean; devLink?: string } }>('/auth/register', {
        json: { ...f, acceptTerms: true, acceptData: true },
      });
      signIn(r.token, r.user);
      router.replace(r.mail.devLink ? `/equipo/verificar?dev=${encodeURIComponent(r.mail.devLink)}` : '/equipo/verificar');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos crear la cuenta.');
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Cuenta del equipo" text="Solo los correos del equipo (ADMIN_EMAILS) pueden crear cuenta.">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="fn">
            <input id="fn" className="input" autoComplete="given-name" required value={f.firstName} onChange={set('firstName')} />
          </Field>
          <Field label="Apellido" htmlFor="ln">
            <input id="ln" className="input" autoComplete="family-name" required value={f.lastName} onChange={set('lastName')} />
          </Field>
        </div>
        <Field label="Correo" htmlFor="em">
          <input id="em" className="input" type="email" autoComplete="email" required value={f.email} onChange={set('email')} />
        </Field>
        <Field label="Contraseña" htmlFor="pw" hint="Mínimo 8 caracteres.">
          <input id="pw" className="input" type="password" autoComplete="new-password" minLength={8} required value={f.password} onChange={set('password')} />
        </Field>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 accent-[var(--color-pine)]" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <span>
            Acepto los{' '}
            <Link className="link" href="/terminos">
              términos
            </Link>{' '}
            y el{' '}
            <Link className="link" href="/tratamiento-de-datos">
              tratamiento de datos
            </Link>
            .
          </span>
        </label>
        {error && <Alert tone="bad">{error}</Alert>}
        <button disabled={busy} className="btn btn-pine btn-block">
          {busy ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthCard>
  );
}
