'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AuthCard, PasswordInput, safeNext } from '@/components/auth/AuthCard';
import { Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { continueHref, loadConfig } from '@/lib/config';
import { getAnonId, getUtmSource, track } from '@/lib/track';
import type { MailResult, User } from '@/lib/types';

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { user, signIn } = useAuth();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [terms, setTerms] = useState(false);
  const [data, setData] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  // Si ya tenía sesión al abrir el registro, se va a su cuenta.
  useEffect(() => {
    if (user && !busy) router.replace(next ?? '/mis-viajes');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!started.current) {
      started.current = true;
      track('signup_started');
    }
    setF({ ...f, [k]: e.target.value });
  };

  const mismatch = f.confirm.length > 0 && f.password !== f.confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (f.password !== f.confirm) return setError('Las contraseñas no coinciden');
    if (!terms) return setError('Debes aceptar los Términos y Condiciones');
    if (!data) return setError('Debes autorizar el tratamiento de tus datos personales');
    setBusy(true);
    try {
      const res = await api<{ token: string; user: User; mail: MailResult }>('/auth/register', {
        json: {
          firstName: f.firstName,
          lastName: f.lastName,
          email: f.email,
          password: f.password,
          acceptTerms: terms,
          acceptData: data,
          utmSource: getUtmSource(),
          anonId: getAnonId(),
        },
      });
      try {
        sessionStorage.setItem('aitrava_mail', JSON.stringify(res.mail));
        if (next) sessionStorage.setItem('aitrava_next', next);
      } catch {}
      const config = await loadConfig();
      signIn(res.token, res.user);
      // Fase de prueba: si verificar no es obligatorio, sigue directo (puede verificar después).
      router.push(config?.emailVerificationRequired ? '/verificar-correo' : continueHref());
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Crea tu cuenta"
      text="Gratis. Organiza tu viaje y empieza a ahorrar para él hoy."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href={`/iniciar-sesion${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-blue">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="r-first">
            <input id="r-first" className="input" required minLength={2} maxLength={60} value={f.firstName} onChange={set('firstName')} autoComplete="given-name" />
          </Field>
          <Field label="Apellido" htmlFor="r-last">
            <input id="r-last" className="input" required minLength={2} maxLength={60} value={f.lastName} onChange={set('lastName')} autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Correo electrónico" htmlFor="r-email">
          <input id="r-email" type="email" className="input" required value={f.email} onChange={set('email')} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Contraseña" htmlFor="r-pass" hint="Mínimo 8 caracteres.">
          <PasswordInput id="r-pass" value={f.password} onChange={(v) => setF({ ...f, password: v })} autoComplete="new-password" />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="r-confirm" error={mismatch ? 'Las contraseñas no coinciden' : undefined}>
          <PasswordInput id="r-confirm" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} autoComplete="new-password" invalid={mismatch} />
        </Field>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-2">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-navy" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
          <span>
            He leído y acepto los{' '}
            <Link href="/terminos" target="_blank" className="font-semibold text-blue underline">
              Términos y Condiciones
            </Link>
            .
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-2">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-navy" checked={data} onChange={(e) => setData(e.target.checked)} required />
          <span>
            Autorizo el tratamiento de mis datos personales de acuerdo con la{' '}
            <Link href="/tratamiento-de-datos" target="_blank" className="font-semibold text-blue underline">
              Política de Tratamiento de Datos
            </Link>
            .
          </span>
        </label>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy btn-lg w-full" disabled={busy}>
          {busy ? 'Creando tu cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthCard>
  );
}
