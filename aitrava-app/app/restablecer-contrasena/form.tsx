'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthCard, PasswordInput } from '@/components/auth/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export function ResetForm() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const { signIn } = useAuth();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Enlace incompleto">
        <Alert tone="bad">Abre el enlace completo que te llegó al correo.</Alert>
        <Link href="/recuperar-contrasena" className="btn btn-navy mt-6 w-full">
          Pedir un enlace nuevo
        </Link>
      </AuthCard>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirm) return setError('Las contraseñas no coinciden');
    setError('');
    setBusy(true);
    try {
      const res = await api<{ token: string; user: User }>('/auth/reset', { json: { token, password: pass } });
      signIn(res.token, res.user);
      router.push('/mis-viajes');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Crea una contraseña nueva">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Contraseña nueva" htmlFor="n-pass" hint="Mínimo 8 caracteres.">
          <PasswordInput id="n-pass" value={pass} onChange={setPass} autoComplete="new-password" />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="n-confirm">
          <PasswordInput id="n-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={!!confirm && confirm !== pass} />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy btn-lg w-full" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar y entrar'}
        </button>
      </form>
    </AuthCard>
  );
}
