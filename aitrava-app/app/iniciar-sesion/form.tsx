'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthCard, safeNext } from '@/components/auth/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useConfig } from '@/lib/config';
import { getAnonId } from '@/lib/track';
import type { User } from '@/lib/types';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { user, signIn } = useAuth();
  const config = useConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const mustVerify = !user.emailVerified && config?.emailVerificationRequired;
    router.replace(mustVerify ? '/verificar-correo' : (next ?? '/mis-viajes'));
  }, [user, next, router, config]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api<{ token: string; user: User }>('/auth/login', { json: { email, password, anonId: getAnonId() } });
      try {
        if (next) sessionStorage.setItem('aitrava_next', next);
      } catch {}
      signIn(res.token, res.user);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Hola de nuevo"
      text="Inicia sesión para seguir con tu viaje."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-blue">
            Crea una gratis
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Correo" htmlFor="l-email">
          <input id="l-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Contraseña" htmlFor="l-pass">
          <input id="l-pass" type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <div className="text-right">
          <Link href="/recuperar-contrasena" className="text-sm font-semibold text-blue">
            Olvidé mi contraseña
          </Link>
        </div>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy btn-lg w-full" disabled={busy}>
          {busy ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthCard>
  );
}
