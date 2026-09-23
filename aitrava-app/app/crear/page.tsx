'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DepartureBoard } from '@/components/DepartureBoard';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AVOID, ORIGINS, TRAVELERS, VIBES } from '@/lib/constants';
import { formatCOP, nightsBetween, splitBudget } from '@/lib/format';
import { pixel, track } from '@/lib/track';

type Draft = {
  originCity: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetTotal: number;
  vibes: string[];
  avoid: string[];
  isGift: boolean;
  giftTo: string;
  giftMessage: string;
};

const DRAFT_KEY = 'aitrava_draft';
const STEPS = ['Origen y fechas', 'Presupuesto', 'Qué te mueve', 'Qué evitar', '¿Para quién?'];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const nextWeekend = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + 7); // viernes de la otra semana
  const end = new Date(d);
  end.setDate(d.getDate() + 2);
  return { startDate: iso(d), endDate: iso(end) };
};

const defaultDraft = (): Draft => ({
  originCity: 'Bogotá',
  ...nextWeekend(),
  travelers: 2,
  budgetTotal: 2_800_000,
  vibes: [],
  avoid: [],
  isGift: false,
  giftTo: '',
  giftMessage: '',
});

export default function CreateTripPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(defaultDraft);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        setD(JSON.parse(saved));
        setStep(STEPS.length - 1);
        return;
      }
    } catch {}
    setD((prev) => ({
      ...prev,
      travelers: Number(q.get('pax')) || prev.travelers,
      isGift: q.get('regalo') === '1',
    }));
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track('quiz_start');
  }, []);

  const update = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const toggle = (key: 'vibes' | 'avoid', id: string, max = 10) =>
    setD((prev) => {
      const list = prev[key];
      if (list.includes(id)) return { ...prev, [key]: list.filter((x) => x !== id) };
      if (list.length >= max) return prev;
      return { ...prev, [key]: [...list, id] };
    });

  const nights = nightsBetween(d.startDate, d.endDate);
  const datesOk = d.startDate >= iso(new Date()) && d.endDate > d.startDate;
  const canNext = [
    d.originCity.trim().length > 1 && datesOk,
    d.budgetTotal > 0,
    d.vibes.length > 0,
    true,
    !d.isGift || d.giftTo.trim().length > 0,
  ][step];

  const next = () => {
    track('quiz_step', { step: step + 1 });
    if (step < STEPS.length - 1) setStep(step + 1);
    else generate();
  };

  const generate = async () => {
    if (!user) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      } catch {}
      router.push('/registro?next=/crear');
      return;
    }
    track('quiz_complete', { vibes: d.vibes, travelers: d.travelers, budget: d.budgetTotal, isGift: d.isGift });
    pixel('Lead');
    setGenerating(true);
    setError('');
    try {
      const minWait = new Promise((r) => setTimeout(r, 3500)); // que se disfrute el tablero
      const [res] = await Promise.all([
        api<{ id: string }>('/trips/generate', {
          json: { ...d, giftTo: d.isGift ? d.giftTo : undefined, giftMessage: d.isGift ? d.giftMessage : undefined },
        }),
        minWait,
      ]);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push(`/viaje/${res.id}`);
    } catch (err) {
      setError((err as Error).message);
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="container-app grid min-h-[75dvh] place-items-center py-10">
        <div className="w-full max-w-xl text-center">
          <p className="eyebrow text-secondary">Armando tu viaje</p>
          <h1 className="display mt-3 mb-8 text-5xl sm:text-6xl">Buscando tu destino…</h1>
          <DepartureBoard />
          <p className="mt-6 text-muted">Estamos cruzando tus gustos con transporte, alojamiento y planes locales.</p>
        </div>
      </div>
    );
  }

  const split = splitBudget(d.budgetTotal);

  return (
    <div className="container-app max-w-2xl py-6 md:py-12">
      {/* Progreso */}
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="btn-ghost -ml-3 rounded-full p-2" aria-label="Paso anterior">
            <Icon name="back" />
          </button>
        ) : (
          <span className="size-10" />
        )}
        <div className="grid flex-1 grid-cols-5 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-line-strong'}`} />
          ))}
        </div>
        <span className="font-mono text-xs text-muted-2">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <div key={step} className="animate-fade-up">
        <p className="eyebrow text-secondary">{STEPS[step]}</p>

        {step === 0 && (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">¿Desde dónde y cuándo?</h1>
            <div className="mt-8 space-y-6">
              <div>
                <span className="field-label">Sales desde</span>
                <div className="flex flex-wrap gap-2">
                  {ORIGINS.map((c) => (
                    <button key={c} className="chip" aria-pressed={d.originCity === c} onClick={() => update({ originCity: c })}>
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  className="input mt-3"
                  placeholder="¿Otra ciudad? Escríbela"
                  value={ORIGINS.includes(d.originCity) ? '' : d.originCity}
                  onChange={(e) => update({ originCity: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="field-label">Salida</span>
                  <input className="input" type="date" min={iso(new Date())} value={d.startDate} onChange={(e) => update({ startDate: e.target.value })} />
                </label>
                <label>
                  <span className="field-label">Regreso</span>
                  <input className="input" type="date" min={d.startDate} value={d.endDate} onChange={(e) => update({ endDate: e.target.value })} />
                </label>
              </div>
              <p className={`text-sm ${datesOk ? 'text-muted' : 'text-bad'}`}>
                {datesOk ? `${nights} ${nights === 1 ? 'noche' : 'noches'} de viaje` : 'Revisa las fechas: el regreso debe ser después de la salida'}
              </p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">¿Cuánto y con quién?</h1>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRAVELERS.map((t) => (
                <button
                  key={t.pax}
                  onClick={() => update({ travelers: t.value })}
                  aria-pressed={d.travelers === t.value}
                  className={`rounded-2xl border p-4 text-left transition ${
                    d.travelers === t.value ? 'border-primary bg-primary text-ink' : 'border-line-strong bg-board'
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-[0.16em]">{t.pax}</span>
                  <span className="display mt-3 block text-2xl">{t.title}</span>
                </button>
              ))}
            </div>
            <div className="card mt-6 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="field-label">Presupuesto total (tope)</span>
                  <p className="display text-5xl text-primary">{formatCOP(d.budgetTotal)}</p>
                </div>
                <p className="pb-1 text-right text-sm text-muted">
                  {formatCOP(Math.round(d.budgetTotal / d.travelers / 10_000) * 10_000)}
                  <br />
                  por persona
                </p>
              </div>
              <input
                className="range mt-4"
                type="range"
                min={600_000}
                max={10_000_000}
                step={100_000}
                value={d.budgetTotal}
                onChange={(e) => update({ budgetTotal: Number(e.target.value) })}
                aria-label="Presupuesto total"
              />
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ['plane', 'Transporte', split.transporte],
                  ['home', 'Alojamiento', split.alojamiento],
                  ['mountain', 'Experiencias locales', split.experiencias],
                  ['sparkle', 'Tarifa fija AiTrava', split.comision],
                ].map(([icon, label, value]) => (
                  <li key={label as string} className="flex items-center justify-between border-t border-line pt-2">
                    <span className="flex items-center gap-2 text-muted">
                      <Icon name={icon as 'plane'} size={18} /> {label}
                    </span>
                    <span className="font-mono">{formatCOP(value as number)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-dim">Transparencia total: nunca pasamos de tu tope. Nuestra tarifa fija de $50.000 ya está incluida, sin cobros extra.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">¿Qué te mueve?</h1>
            <p className="mt-3 text-muted">Elige hasta 4. Esto es lo que más pesa para elegir tu destino.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button key={v.id} className="chip" aria-pressed={d.vibes.includes(v.id)} onClick={() => toggle('vibes', v.id, 4)}>
                  <span aria-hidden>{v.emoji}</span> {v.label}
                </button>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs text-muted-2">{d.vibes.length}/4 elegidos</p>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">¿Algo que prefieras evitar?</h1>
            <p className="mt-3 text-muted">Opcional. Lo descartamos del sorteo.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {AVOID.map((a) => (
                <button key={a.id} className="chip" aria-pressed={d.avoid.includes(a.id)} onClick={() => toggle('avoid', a.id)}>
                  {d.avoid.includes(a.id) && <Icon name="close" size={16} strokeWidth={2.4} />} {a.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="display mt-3 text-5xl sm:text-6xl">¿Es para ti o es un regalo?</h1>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { gift: false, title: 'Para mí', text: 'Yo vivo la sorpresa', icon: 'user' as const },
                { gift: true, title: 'Es un regalo', text: 'Otra persona abre el sobre', icon: 'gift' as const },
              ].map((o) => (
                <button
                  key={o.title}
                  onClick={() => update({ isGift: o.gift })}
                  aria-pressed={d.isGift === o.gift}
                  className={`rounded-2xl border p-5 text-left transition ${
                    d.isGift === o.gift ? 'border-primary bg-primary text-ink' : 'border-line-strong bg-board'
                  }`}
                >
                  <Icon name={o.icon} size={26} />
                  <span className="display mt-4 block text-3xl">{o.title}</span>
                  <span className={`text-sm ${d.isGift === o.gift ? 'text-ink/75' : 'text-muted'}`}>{o.text}</span>
                </button>
              ))}
            </div>
            {d.isGift && (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="field-label">¿Para quién es?</span>
                  <input className="input" maxLength={60} value={d.giftTo} onChange={(e) => update({ giftTo: e.target.value })} placeholder="Nombre de la persona" />
                </label>
                <label className="block">
                  <span className="field-label">Mensaje (lo verá al abrir el link)</span>
                  <textarea
                    className="input min-h-24 resize-none"
                    maxLength={400}
                    value={d.giftMessage}
                    onChange={(e) => update({ giftMessage: e.target.value })}
                    placeholder="Feliz aniversario, empaca porque nos vamos…"
                  />
                </label>
              </div>
            )}
            {!user && !loading && (
              <p className="mt-6 rounded-xl border border-line-strong bg-board px-4 py-3 text-sm text-muted">
                Para guardar tu viaje te pediremos crear una cuenta (30 segundos). No guardamos nada de pago.
              </p>
            )}
          </>
        )}
      </div>

      {error && <p className="mt-6 text-sm text-bad" role="alert">{error}</p>}

      <div className="sticky bottom-20 mt-10 md:bottom-4">
        <button className="btn btn-primary btn-lg w-full shadow-xl shadow-black/40" disabled={!canNext} onClick={next}>
          {step < STEPS.length - 1 ? 'Siguiente' : user ? 'Armar mi viaje sorpresa' : 'Crear cuenta y armar mi viaje'}
          <Icon name={step < STEPS.length - 1 ? 'arrow' : 'sparkle'} size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
