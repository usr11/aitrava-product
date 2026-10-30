'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { LINES } from '@/lib/config';
import { attribution, track } from '@/lib/track';
import type { Line } from '@/lib/types';
import { Alert, Field } from '../ui';

/** Lista de espera (TC0): para quien no encuentra una fecha que le sirva. */
export function WaitlistForm({ onPine = false }: { onPine?: boolean }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line, setLine] = useState<Line | ''>('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { alreadyIn: boolean }>(null);
  const [started, setStarted] = useState(false);

  const onFocus = () => {
    if (!started) {
      setStarted(true);
      track('waitlist_started');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError('Escribe tu nombre.');
    if (phone.replace(/\D/g, '').length < 10) return setError('Escribe tu WhatsApp de 10 dígitos.');
    if (!consent) return setError('Necesitamos tu autorización para escribirte.');
    setBusy(true);
    try {
      const r = await api<{ alreadyIn: boolean }>('/waitlist', {
        json: { name, phone, line: line || undefined, consent, website, ...attribution() },
      });
      setDone(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos guardar tus datos. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Alert tone="ok">
        <strong>{done.alreadyIn ? 'Ya estabas en la lista.' : 'Listo, estás en la lista.'}</strong> Te escribimos por WhatsApp cuando abramos la
        próxima salida{line ? ` de la línea ${LINES[line].label.toLowerCase()}` : ''}.
      </Alert>
    );
  }

  const text = onPine ? 'text-paper' : 'text-ink';
  return (
    <form onSubmit={submit} onFocus={onFocus} noValidate className={`grid gap-4 ${text}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu nombre" htmlFor="wl-name">
          <input id="wl-name" className="input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </Field>
        <Field label="Tu WhatsApp" htmlFor="wl-phone">
          <input
            id="wl-phone"
            className="input tnum"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="300 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
          />
        </Field>
      </div>
      <fieldset>
        <legend className="label">¿Qué tipo de salida te llama más?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(LINES) as Line[]).map((l) => (
            <label key={l} className="choice text-ink">
              <input type="radio" name="wl-line" checked={line === l} onChange={() => setLine(l)} />
              <span>
                {LINES[l].label}
                <span className="block text-sm font-normal text-ink-3">{LINES[l].detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <label className="flex items-start gap-3 text-[0.95rem]">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--color-ember)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Autorizo a AiTrava a escribirme por WhatsApp sobre próximas salidas, según la{' '}
          <Link href="/tratamiento-de-datos" className={onPine ? 'underline' : 'link'}>
            política de datos
          </Link>
          .
        </span>
      </label>
      {error && (
        <p role="alert" className={onPine ? 'font-semibold text-ember' : 'error-text'}>
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-ember sm:justify-self-start">
        {busy ? 'Guardando…' : 'Avísame de la próxima salida'}
      </button>
    </form>
  );
}
