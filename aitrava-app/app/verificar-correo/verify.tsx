'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Icon } from '@/components/Icon';
import { Alert, LoadingState } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { continueHref, useConfig } from '@/lib/config';
import { CONTACT, whatsappLink } from '@/lib/site';
import type { MailResult, User } from '@/lib/types';


/** Abre el proveedor de correo más probable. */
const inboxUrl = (email: string) => {
  const d = email.split('@')[1]?.toLowerCase() ?? '';
  if (d.includes('gmail')) return 'https://mail.google.com/mail/u/0/#inbox';
  if (/(hotmail|outlook|live)\./.test(d)) return 'https://outlook.live.com/mail/0/';
  if (d.includes('yahoo')) return 'https://mail.yahoo.com';
  return `mailto:${email}`;
};

export function VerifyEmail() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const config = useConfig();
  const [state, setState] = useState<'idle' | 'verifying' | 'verified' | 'error'>(token ? 'verifying' : 'idle');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [mail, setMail] = useState<MailResult | null>(null);
  const [resent, setResent] = useState(false);
  const ran = useRef(false);

  // Abrió el enlace del correo
  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    api<{ token: string; user: User }>('/auth/verify', { json: { token } })
      .then((res) => {
        signIn(res.token, res.user);
        setState('verified');
      })
      .catch((e: Error) => {
        setError(e.message);
        setState('error');
      });
  }, [token, signIn]);

  useEffect(() => {
    try {
      const m = sessionStorage.getItem('aitrava_mail');
      if (m) setMail(JSON.parse(m));
    } catch {}
    setCooldown(60);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (!token && !loading && !user) router.replace('/iniciar-sesion?next=/verificar-correo');
  }, [token, loading, user, router]);

  const resend = async () => {
    setError('');
    try {
      const res = await api<{ alreadyVerified: boolean; mail: MailResult }>('/auth/resend', { method: 'POST' });
      if (res.alreadyVerified) return setState('verified');
      setMail(res.mail);
      setResent(true);
      setCooldown(60);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 429 && typeof err.data?.retryIn === 'number') setCooldown(err.data.retryIn);
      setError(err.message);
    }
  };

  if (state === 'verifying' || (!token && (loading || !user))) {
    return (
      <AuthCard title="Verificando tu correo…">
        <LoadingState label="Un momento…" rows={0} />
      </AuthCard>
    );
  }

  if (state === 'verified' || (user?.emailVerified && !token)) {
    return (
      <AuthCard title="Correo verificado ✓" text="Tu cuenta está activa. Ya puedes crear y organizar tus viajes.">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-3xl bg-ok-bg text-ok">
          <Icon name="checkCircle" size={34} />
        </span>
        <button
          onClick={() => {
            const href = continueHref();
            try {
              sessionStorage.removeItem('aitrava_mail');
            } catch {}
            router.push(href);
          }}
          className="btn btn-primary btn-lg w-full"
        >
          Continuar a AITRAVA <Icon name="arrow" size={20} />
        </button>
      </AuthCard>
    );
  }

  if (state === 'error') {
    return (
      <AuthCard title="No pudimos verificar tu correo">
        <Alert tone="bad">{error}</Alert>
        <div className="mt-6 space-y-3">
          {user ? (
            <button onClick={() => (setState('idle'), router.replace('/verificar-correo'))} className="btn btn-navy w-full">
              Pedir un enlace nuevo
            </button>
          ) : (
            <Link href="/iniciar-sesion?next=/verificar-correo" className="btn btn-navy w-full">
              Inicia sesión para pedir un enlace nuevo
            </Link>
          )}
        </div>
      </AuthCard>
    );
  }

  const mailOff = config?.mailEnabled === false || mail?.sent === false;
  return (
    <AuthCard
      title={mailOff ? 'Verifica tu correo' : '¡Revisa tu correo!'}
      text={mailOff ? `Para activar tu cuenta necesitamos confirmar que ${user!.email} es tuyo.` : `Hemos enviado un enlace de verificación a ${user!.email}.`}
    >
      {mailOff && (
        <div className="mb-5">
          <Alert tone="warn">
            {config?.mailEnabled === false
              ? 'El envío de correos todavía no está activo en este entorno.'
              : 'No pudimos enviar el correo en este momento.'}{' '}
            Escríbenos a{' '}
            <a className="font-semibold underline" href={whatsappLink(`Hola, necesito verificar mi cuenta de AITRAVA (${user!.email}).`)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{' '}
            o a {CONTACT.email} y te ayudamos a activar tu cuenta.
          </Alert>
          {mail?.devLink && (
            <a href={mail.devLink} className="mt-3 block rounded-2xl border border-dashed border-line-2 p-3 text-sm text-text-2">
              <strong className="text-navy">Solo en desarrollo:</strong> abrir el enlace de verificación
            </a>
          )}
        </div>
      )}
      <div className="space-y-3">
        <a href={inboxUrl(user!.email)} target="_blank" rel="noopener noreferrer" className={`btn btn-lg w-full ${mailOff ? 'btn-outline' : 'btn-navy'}`}>
          <Icon name="mail" size={20} /> Ir a mi correo
        </a>
        <button onClick={resend} disabled={cooldown > 0} className="btn btn-outline w-full">
          {cooldown > 0 ? `Reenviar correo (${cooldown} s)` : 'Reenviar correo'}
        </button>
      </div>
      {resent && !error && <p className="mt-3 text-center text-sm text-ok">Te enviamos un enlace nuevo.</p>}
      {error && (
        <div className="mt-3">
          <Alert tone="bad">{error}</Alert>
        </div>
      )}
      {config && !config.emailVerificationRequired && (
        <button onClick={() => router.push(continueHref())} className="btn btn-ghost mt-3 w-full">
          Hacerlo después y seguir
        </button>
      )}
      <p className="mt-6 text-center text-sm text-text-2">¿No te llegó? Revisa la carpeta de spam o promociones.</p>
    </AuthCard>
  );
}
