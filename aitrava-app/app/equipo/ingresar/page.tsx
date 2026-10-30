'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

function Login() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User }>('/auth/login', { json: { email, password } });
      signIn(r.token, r.user);
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión.');
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Acceso del equipo" text="Para reservar una salida no necesitas cuenta: esto es solo para el equipo de AiTrava.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Correo" htmlFor="email">
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña" htmlFor="password">
          <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button disabled={busy} className="btn btn-pine btn-block">
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/equipo/recuperar" className="link">
          Olvidé mi contraseña
        </Link>
        <Link href="/equipo/registro" className="link">
          Crear cuenta del equipo
        </Link>
      </div>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
