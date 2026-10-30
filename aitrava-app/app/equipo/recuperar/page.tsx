'use client';

import { useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';

export default function Recuperar() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState<{ devLink?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setDone(await api<{ devLink?: string }>('/auth/forgot', { json: { email } }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos enviar el correo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Recuperar contraseña">
      {done ? (
        <Alert tone="ok">
          Si el correo está registrado, te enviamos un enlace que vence en 1 hora.
          {done.devLink && (
            <a className="link mt-2 block break-all" href={done.devLink}>
              Enlace local (SMTP sin configurar)
            </a>
          )}
        </Alert>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Correo del equipo" htmlFor="em">
            <input id="em" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <Alert tone="bad">{error}</Alert>}
          <button disabled={busy} className="btn btn-pine btn-block">
            {busy ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
