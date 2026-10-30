'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { Alert } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

function Verify() {
  const params = useSearchParams();
  const token = params.get('token');
  const dev = params.get('dev');
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    api<{ token: string; user: User }>('/auth/verify', { json: { token } })
      .then((r) => {
        signIn(r.token, r.user);
        setState('ok');
        setTimeout(() => router.replace(r.user.role === 'ADMIN' ? '/admin' : '/'), 1200);
      })
      .catch((e) => {
        setState('error');
        setMsg(e instanceof ApiError ? e.message : 'No pudimos verificar el correo.');
      });
  }, [token, signIn, router]);

  const resend = async () => {
    try {
      const r = await api<{ mail: { sent: boolean; devLink?: string } }>('/auth/resend', { method: 'POST' });
      setMsg(r.mail.sent ? 'Te enviamos un correo nuevo.' : r.mail.devLink ? `SMTP sin configurar. Enlace local: ${r.mail.devLink}` : 'El correo no está configurado en el servidor.');
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'No pudimos reenviar el correo.');
    }
  };

  if (token)
    return (
      <AuthCard title={state === 'ok' ? 'Correo verificado' : state === 'error' ? 'No pudimos verificar' : 'Verificando…'}>
        {msg && <Alert tone={state === 'error' ? 'bad' : 'info'}>{msg}</Alert>}
        {state === 'error' && (
          <Link href="/equipo/ingresar" className="btn btn-pine btn-block mt-4">
            Ir a iniciar sesión
          </Link>
        )}
      </AuthCard>
    );

  return (
    <AuthCard title="Revisa tu correo" text={user ? `Te enviamos un enlace a ${user.email}. Ábrelo para activar tu acceso al panel.` : 'Te enviamos un enlace para activar tu acceso.'}>
      {dev && (
        <Alert tone="warn">
          SMTP sin configurar (solo en local).{' '}
          <a className="link break-all" href={dev}>
            Verificar ahora
          </a>
        </Alert>
      )}
      {msg && (
        <div className="mt-3">
          <Alert>{msg}</Alert>
        </div>
      )}
      {user && (
        <button onClick={resend} className="btn btn-line btn-block mt-4">
          Reenviar el correo
        </button>
      )}
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
