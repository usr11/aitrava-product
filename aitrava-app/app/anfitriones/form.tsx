'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Field } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { track } from '@/lib/track';

const EMPTY = { name: '', phone: '', email: '', organization: '', activity: '', area: '', rnt: '', website: '' };

export function HostForm() {
  const [f, setF] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => track('host_page_viewed'), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (f.name.trim().length < 2) return setError('Escribe tu nombre.');
    if (f.phone.replace(/\D/g, '').length < 10) return setError('Escribe tu WhatsApp de 10 dígitos.');
    if (f.activity.trim().length < 5) return setError('Cuéntanos qué experiencia ofreces.');
    if (!consent) return setError('Necesitamos tu autorización para escribirte.');
    setBusy(true);
    try {
      await api('/hosts/apply', {
        json: { ...f, email: f.email || undefined, organization: f.organization || undefined, area: f.area || undefined, rnt: f.rnt || undefined, consent },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos enviar tus datos. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Alert tone="ok">
        <strong>Gracias, {f.name.split(' ')[0]}.</strong> Te escribimos por WhatsApp en los próximos días.
      </Alert>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu nombre" htmlFor="h-name">
          <input id="h-name" className="input" autoComplete="name" value={f.name} onChange={set('name')} maxLength={80} />
        </Field>
        <Field label="Tu WhatsApp" htmlFor="h-phone">
          <input id="h-phone" className="input tnum" type="tel" inputMode="tel" autoComplete="tel-national" value={f.phone} onChange={set('phone')} maxLength={20} />
        </Field>
      </div>
      <Field label="¿Qué experiencia ofreces?" htmlFor="h-act" hint="Ej.: caminatas por fincas cafeteras en Dapa, taller de café en San Antonio.">
        <textarea id="h-act" className="input" rows={3} value={f.activity} onChange={set('activity')} maxLength={500} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa o marca" htmlFor="h-org" optional>
          <input id="h-org" className="input" autoComplete="organization" value={f.organization} onChange={set('organization')} maxLength={120} />
        </Field>
        <Field label="Zona" htmlFor="h-area" optional>
          <input id="h-area" className="input" value={f.area} onChange={set('area')} maxLength={120} />
        </Field>
        <Field label="Número de RNT" htmlFor="h-rnt" optional>
          <input id="h-rnt" className="input tnum" value={f.rnt} onChange={set('rnt')} maxLength={40} />
        </Field>
        <Field label="Correo" htmlFor="h-mail" optional>
          <input id="h-mail" className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} maxLength={120} />
        </Field>
      </div>
      <input type="text" name="website" value={f.website} onChange={set('website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <label className="flex items-start gap-3 text-[0.95rem]">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--color-pine)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Autorizo a AiTrava a contactarme, según la{' '}
          <Link href="/tratamiento-de-datos" className="link">
            política de datos
          </Link>
          .
        </span>
      </label>
      {error && <Alert tone="bad">{error}</Alert>}
      <button type="submit" disabled={busy} className="btn btn-pine sm:justify-self-start">
        {busy ? 'Enviando…' : 'Enviar mis datos'}
      </button>
    </form>
  );
}
