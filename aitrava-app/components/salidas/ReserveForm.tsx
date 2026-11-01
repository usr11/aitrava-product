'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { CHANNEL_OPTIONS } from '@/lib/config';
import { formatCOP, formatDay, formatTime } from '@/lib/format';
import { attribution, myReservations } from '@/lib/track';
import type { ReservationView, Salida } from '@/lib/types';
import { Alert, Field, YesNo } from '../ui';

type Form = {
  name: string;
  phone: string;
  motivation: string;
  comesAlone: boolean | null;
  inCali: boolean | null;
  knowsTeam: boolean | null;
  heardFrom: string;
  phoneChallenge: boolean;
  isAdult: boolean;
  acceptsTerms: boolean;
  acceptsConduct: boolean;
  website: string;
};

const EMPTY: Form = {
  name: '',
  phone: '',
  motivation: '',
  comesAlone: null,
  inCali: null,
  knowsTeam: null,
  heardFrom: '',
  phoneChallenge: false,
  isAdult: false,
  acceptsTerms: false,
  acceptsConduct: false,
  website: '',
};

type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Escribe tu nombre.';
  const digits = f.phone.replace(/\D/g, '').replace(/^57/, '');
  if (digits.length !== 10 || !digits.startsWith('3')) e.phone = 'Escribe un celular de 10 dígitos que empiece por 3.';
  if (f.motivation.trim().length < 8) e.motivation = 'Cuéntanos en una frase qué te motivó.';
  if (f.comesAlone === null) e.comesAlone = 'Elige una opción.';
  if (f.inCali === null) e.inCali = 'Elige una opción.';
  if (f.knowsTeam === null) e.knowsTeam = 'Elige una opción.';
  if (!f.heardFrom) e.heardFrom = 'Elige una opción.';
  if (!f.isAdult) e.isAdult = 'Debes ser mayor de edad para reservar.';
  if (!f.acceptsTerms) e.acceptsTerms = 'Acepta el precio, la fecha y la política de reembolso.';
  if (!f.acceptsConduct) e.acceptsConduct = 'Acepta la regla de convivencia para continuar.';
  return e;
}

export function ReserveForm({ salida, refundPolicy }: { salida: Salida; refundPolicy: string[] }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<{ message: string; reference?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setServerError(null);
    const errs = validate(f);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ code: string; token: string; reservation: ReservationView }>(`/salidas/${salida.slug}/reservations`, {
        json: { ...f, ...attribution() },
      });
      myReservations.add({ code: res.code, token: res.token, title: salida.title, startsAt: salida.startsAt });
      router.push(`/reserva/${res.code}?t=${encodeURIComponent(res.token)}&nueva=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError({ message: err.message, reference: err.data?.reference as string | undefined });
      } else setServerError({ message: 'No pudimos apartar tu cupo. Intenta de nuevo.' });
      setBusy(false);
    }
  };

  const saved = serverError?.reference ? myReservations.list().find((r) => r.code === serverError.reference) : null;

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-5">
      <div data-field="name">
        <Field label="Tu nombre" htmlFor="r-name" error={errors.name}>
          <input id="r-name" className="input" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={80} aria-invalid={!!errors.name} />
        </Field>
      </div>
      <div data-field="phone">
        <Field label="Tu WhatsApp" htmlFor="r-phone" hint="Por aquí te confirmamos el cupo." error={errors.phone}>
          <input
            id="r-phone"
            className="input tnum"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="300 123 4567"
            value={f.phone}
            onChange={(e) => set('phone', e.target.value)}
            maxLength={20}
            aria-invalid={!!errors.phone}
          />
        </Field>
      </div>
      <div data-field="motivation">
        <Field label="¿Qué te motivó a buscar esta experiencia?" htmlFor="r-mot" hint="Una frase basta. Nos ayuda a armar un grupo con tu misma intención." error={errors.motivation}>
          <textarea
            id="r-mot"
            className="input"
            rows={3}
            value={f.motivation}
            onChange={(e) => set('motivation', e.target.value)}
            maxLength={500}
            aria-invalid={!!errors.motivation}
          />
        </Field>
      </div>

      <fieldset data-field="comesAlone">
        <legend className="label">¿Vienes solo o con alguien?</legend>
        <YesNo name="alone" value={f.comesAlone} onChange={(v) => set('comesAlone', v)} yes="Vengo solo" no="Con alguien" />
        {errors.comesAlone && <p className="error-text">{errors.comesAlone}</p>}
      </fieldset>
      <fieldset data-field="inCali">
        <legend className="label">¿Vives o estás en Cali?</legend>
        <YesNo name="cali" value={f.inCali} onChange={(v) => set('inCali', v)} />
        {errors.inCali && <p className="error-text">{errors.inCali}</p>}
      </fieldset>
      <fieldset data-field="knowsTeam">
        <legend className="label">¿Eres amigo o familiar de alguien del equipo de AiTrava?</legend>
        <YesNo name="team" value={f.knowsTeam} onChange={(v) => set('knowsTeam', v)} />
        <p className="hint">Igual puedes reservar. Lo preguntamos para medir bien.</p>
        {errors.knowsTeam && <p className="error-text">{errors.knowsTeam}</p>}
      </fieldset>
      <div data-field="heardFrom">
        <Field label="¿Cómo nos conociste?" htmlFor="r-from" error={errors.heardFrom}>
          <select id="r-from" className="input" value={f.heardFrom} onChange={(e) => set('heardFrom', e.target.value)} aria-invalid={!!errors.heardFrom}>
            <option value="">Elige una opción</option>
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="choice items-start">
        <input type="checkbox" className="mt-0.5" checked={f.phoneChallenge} onChange={(e) => set('phoneChallenge', e.target.checked)} />
        <span>
          Me animo al reto del sobre sellado
          <span className="block text-sm font-normal text-ink-3">El celular va en un sobre durante la actividad. Es voluntario y puedes cambiar de idea.</span>
        </span>
      </label>

      <div className="grid gap-3 rounded-xl bg-paper-2 p-4">
        <Check data="isAdult" checked={f.isAdult} onChange={(v) => set('isAdult', v)} error={errors.isAdult}>
          Soy mayor de edad.
        </Check>
        <Check data="acceptsTerms" checked={f.acceptsTerms} onChange={(v) => set('acceptsTerms', v)} error={errors.acceptsTerms}>
          Acepto el precio de <strong className="tnum">{formatCOP(salida.price + salida.serviceFee)}</strong>, la fecha (
          <span>{formatDay(salida.startsAt)}</span>, {formatTime(salida.startsAt)}) y la política de reembolso.
        </Check>
        <Check data="acceptsConduct" checked={f.acceptsConduct} onChange={(v) => set('acceptsConduct', v)} error={errors.acceptsConduct}>
          Acepto la{' '}
          <Link href="/seguridad" target="_blank" className="link">
            regla de convivencia y el consentimiento informado
          </Link>
          , y autorizo el{' '}
          <Link href="/tratamiento-de-datos" target="_blank" className="link">
            tratamiento de mis datos
          </Link>
          .
        </Check>
        <details className="pl-8 text-sm">
          <summary className="link cursor-pointer">Ver la política de reembolso</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
            {refundPolicy.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      </div>

      <input type="text" name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      {serverError && (
        <Alert tone="bad">
          {serverError.message}
          {saved && (
            <Link href={`/reserva/${saved.code}?t=${encodeURIComponent(saved.token)}`} className="link mt-2 block">
              Abrir mi reserva {saved.code}
            </Link>
          )}
        </Alert>
      )}

      <button type="submit" disabled={busy} className="btn btn-ember btn-block">
        {busy ? 'Guardando tu cupo…' : salida.paymentUrl ? 'Continuar al pago' : 'Apartar mi cupo'}
      </button>
      <p className="-mt-2 text-center text-sm text-ink-3">
        {salida.paymentUrl
          ? 'Guardamos tu cupo y te llevamos al pago seguro de Wompi (desde tu banco o con tarjeta).'
          : 'No pagas nada todavía. Te escribimos por WhatsApp para confirmar.'}
      </p>
    </form>
  );
}

function Check({
  data,
  checked,
  onChange,
  error,
  children,
}: {
  data: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={data}>
      <label className="flex items-start gap-3 text-[0.95rem]">
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-pine)]" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} />
        <span>{children}</span>
      </label>
      {error && <p className="error-text pl-8">{error}</p>}
    </div>
  );
}
