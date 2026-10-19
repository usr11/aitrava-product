'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ mailEnabled: boolean; devLink?: string } | null>(null);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      setDone(await api<{ mailEnabled: boolean; devLink?: string }>('/auth/forgot', { json: { email } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Recupera tu contraseña"
      text="Te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <Link href="/iniciar-sesion" className="font-semibold text-blue">
          Volver a iniciar sesión
        </Link>
      }
    >
      {done ? (
        <div className="space-y-3">
          {done.mailEnabled ? (
            <Alert tone="ok">Si existe una cuenta con {email}, te llegará un correo con el enlace. Vence en 1 hora.</Alert>
          ) : (
            <Alert tone="warn">El envío de correos todavía no está activo en este entorno. Escríbenos a aitrava.25@gmail.com y te ayudamos.</Alert>
          )}
          {done.devLink && (
            <a href={done.devLink} className="block rounded-2xl border border-dashed border-line-2 p-3 text-sm text-text-2">
              <strong className="text-navy">Solo en desarrollo:</strong> abrir el enlace para restablecer
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo de tu cuenta" htmlFor="f-email">
            <input id="f-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          {error && <Alert tone="bad">{error}</Alert>}
          <button className="btn btn-navy btn-lg w-full" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
