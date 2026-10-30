'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

function Reset() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User }>('/auth/reset', { json: { token, password } });
      signIn(r.token, r.user);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos cambiar la contraseña.');
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Nueva contraseña">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Contraseña nueva" htmlFor="pw" hint="Mínimo 8 caracteres.">
          <input id="pw" className="input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button disabled={busy || !token} className="btn btn-pine btn-block">
          {busy ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Reset />
    </Suspense>
  );
}
