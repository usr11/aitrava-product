'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { Alert, Field, MoneyInput, ProgressBar } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useConfig } from '@/lib/config';
import { AVOID, BUDGET_CATEGORIES, COUNTRIES, DEFAULT_SPLIT, FREQUENCIES, LIKES, ORIGINS, PER_PERIOD, TRAVEL_STYLES } from '@/lib/catalog';
import { daysBetween, formatCOP, formatDate, todayISO } from '@/lib/format';
import { track } from '@/lib/track';
import { invalidateTrips } from '@/lib/trips';
import type { BudgetCategory, Destination, Frequency, Suggestion, Trip, TripMode } from '@/lib/types';

type Draft = {
  mode: TripMode;
  destinationCity: string;
  destinationCountry: string;
  destinationSlug: string;
  prefillItinerary: boolean;
  originCity: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  budgetAmount: number | null;
  detailBudget: boolean;
  budgetByCategory: Record<BudgetCategory, number>;
  savingsOn: boolean;
  initialSaved: number | null;
  frequency: Frequency;
  monthlyCapacity: number | null;
  likes: string[];
  avoid: string[];
  style: string;
  scope: 'todos' | 'colombia' | 'internacional';
};

const DRAFT_KEY = 'aitrava_draft';

const empty = (): Draft => ({
  mode: 'KNOWN',
  destinationCity: '',
  destinationCountry: 'Colombia',
  destinationSlug: '',
  prefillItinerary: true,
  originCity: 'Bogotá',
  startDate: '',
  endDate: '',
  travelerCount: 2,
  budgetAmount: null,
  detailBudget: false,
  budgetByCategory: { transporte: 0, alojamiento: 0, actividades: 0, comida: 0, seguros: 0, otros: 0 },
  savingsOn: true,
  initialSaved: null,
  frequency: 'BIWEEKLY',
  monthlyCapacity: null,
  likes: [],
  avoid: [],
  style: 'equilibrado',
  scope: 'todos',
});

const STEPS = ['Destino', 'Fechas', 'Viajeros', 'Presupuesto', 'Preferencias'];

const MODES: { key: TripMode; title: string; text: string; icon: IconName }[] = [
  { key: 'KNOWN', title: 'Sé a dónde voy', text: 'Ya tengo mi destino.', icon: 'pin' },
  { key: 'HELP', title: 'Ayúdame a elegir', text: 'Te mostramos opciones según tus gustos, fechas y presupuesto.', icon: 'compass' },
  { key: 'SURPRISE', title: 'Destino sorpresa', text: 'Te proponemos un destino compatible con lo que buscas.', icon: 'sparkle' },
];

/** Cuántos días de pago quedan antes del viaje (aproximación del plan, el cálculo fino lo hace el backend). */
function paydaysUntil(freq: Frequency, endISO: string) {
  const end = new Date(endISO);
  let n = 0;
  for (let d = new Date(`${todayISO()}T00:00:00Z`); d < end; d = new Date(d.getTime() + 86_400_000)) {
    const next = new Date(d.getTime() + 86_400_000);
    if (next >= end) break;
    const last = new Date(next.getTime() + 86_400_000).getUTCDate() === 1;
    if (freq === 'WEEKLY' && next.getUTCDay() === 5) n++;
    else if (freq === 'BIWEEKLY' && (next.getUTCDate() === 15 || last)) n++;
    else if (freq === 'MONTHLY' && last) n++;
  }
  return n;
}

export function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const config = useConfig();
  const [d, setD] = useState<Draft>(empty);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'form' | 'pick' | 'creating'>('form');
  const [error, setError] = useState('');
  const [popular, setPopular] = useState<Destination[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [surpriseIdx, setSurpriseIdx] = useState(0);
  const started = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  // Borrador (sobrevive al registro) y destino elegido desde /destinos
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) draft = { ...empty(), ...JSON.parse(raw) };
    } catch {}
    if (draft) {
      setD(draft);
      if (params.get('continuar')) setStep(4);
    }
    setHydrated(true);
    api<Destination[]>('/destinations')
      .then((list) => {
        setPopular(list);
        const slug = params.get('destino');
        const dest = list.find((x) => x.slug === slug);
        if (dest && !draft) setD((p) => ({ ...p, mode: 'KNOWN', destinationCity: dest.name, destinationCountry: dest.country, destinationSlug: dest.slug }));
      })
      .catch(() => {});
    if (!started.current) {
      started.current = true;
      track('trip_creation_started', { from: params.get('destino') ? 'destino' : 'directo' });
    }
  }, [params]);

  // Se guarda solo después de restaurar el borrador (si no, se pisaría con uno vacío).
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {}
  }, [d, hydrated]);

  const nights = d.startDate && d.endDate ? daysBetween(d.startDate, d.endDate) : 0;
  const budget = d.budgetAmount ?? 0;
  const split = useMemo(
    () => Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c.key, Math.round((budget * DEFAULT_SPLIT[c.key]) / 10_000) * 10_000])) as Record<BudgetCategory, number>,
    [budget],
  );
  const detailedSum = BUDGET_CATEGORIES.reduce((s, c) => s + (d.budgetByCategory[c.key] || 0), 0);
  const savingsPreview = useMemo(() => {
    if (!d.startDate || !budget) return null;
    const n = paydaysUntil(d.frequency, d.startDate);
    const missing = Math.max(0, budget - (d.initialSaved ?? 0));
    return { n, quota: n ? Math.ceil(missing / n / 1000) * 1000 : missing };
  }, [d.startDate, d.frequency, budget, d.initialSaved]);

  const validate = (s: number): string => {
    if (s === 0 && d.mode === 'KNOWN') {
      if (d.destinationCity.trim().length < 2) return 'Escribe la ciudad o el lugar de destino';
      if (!d.destinationCountry.trim()) return 'Elige el país de destino';
    }
    if (s === 1) {
      if (!d.originCity.trim()) return '¿Desde qué ciudad sales?';
      if (!d.startDate || !d.endDate) return 'Elige la fecha de salida y la de regreso';
      if (d.startDate < todayISO()) return 'La salida no puede ser en el pasado';
      if (d.endDate < d.startDate) return 'El regreso debe ser después de la salida';
      if (nights > 120) return 'El viaje puede durar máximo 120 días';
    }
    if (s === 2 && (d.travelerCount < 1 || d.travelerCount > 30)) return 'Entre 1 y 30 viajeros';
    if (s === 3) {
      if (!budget || budget < 50_000) return 'Pon un presupuesto de al menos $50.000';
      if (d.detailBudget && detailedSum !== budget) return `El detalle suma ${formatCOP(detailedSum)}: debe sumar ${formatCOP(budget)}`;
      if ((d.initialSaved ?? 0) > budget) return 'Lo ahorrado no puede ser mayor que el presupuesto';
    }
    return '';
  };

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const next = () => {
    const err = validate(step);
    setError(err);
    if (err) return;
    track('trip_creation_step', { step: step + 1, mode: d.mode });
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      scrollTop();
    } else finish();
  };

  const back = () => {
    setError('');
    if (phase === 'pick') return setPhase('form');
    if (step > 0) {
      setStep(step - 1);
      scrollTop();
    } else router.back();
  };

  /** Termina el formulario: con "Ayúdame a elegir" o "Sorpresa" primero mostramos opciones. */
  const finish = async () => {
    if (d.mode === 'KNOWN') return create();
    setError('');
    const q = new URLSearchParams({
      budget: String(budget),
      travelers: String(d.travelerCount),
      nights: String(Math.max(1, nights)),
      likes: d.likes.join(','),
      avoid: d.avoid.join(','),
      scope: d.scope,
    });
    try {
      const list = await api<Suggestion[]>(`/suggestions?${q}`);
      setSuggestions(list);
      setSurpriseIdx(crypto.getRandomValues(new Uint32Array(1))[0] % Math.max(1, Math.min(3, list.length)));
      setPhase('pick');
      scrollTop();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const create = async (pick?: Suggestion) => {
    if (loading) return;
    const chosen = pick ? { ...d, destinationCity: pick.name, destinationCountry: pick.country, destinationSlug: pick.slug } : d;
    if (pick) setD(chosen);
    if (!user) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(chosen));
      } catch {}
      router.push(`/registro?next=${encodeURIComponent('/planear?continuar=1')}`);
      return;
    }
    if (!user.emailVerified && config?.emailVerificationRequired) {
      try {
        sessionStorage.setItem('aitrava_next', '/planear?continuar=1');
      } catch {}
      router.push('/verificar-correo');
      return;
    }
    setPhase('creating');
    setError('');
    try {
      const trip = await api<Trip>('/trips', {
        json: {
          mode: chosen.mode,
          destinationCity: chosen.destinationCity.trim(),
          destinationCountry: chosen.destinationCountry.trim(),
          destinationSlug: chosen.destinationSlug || undefined,
          prefillItinerary: !!chosen.destinationSlug && chosen.prefillItinerary,
          originCity: chosen.originCity.trim(),
          startDate: chosen.startDate,
          endDate: chosen.endDate,
          travelerCount: chosen.travelerCount,
          budgetAmount: budget,
          budgetByCategory: chosen.detailBudget ? chosen.budgetByCategory : undefined,
          preferences: { likes: chosen.likes, avoid: chosen.avoid, style: chosen.style },
          savings: chosen.savingsOn
            ? { initialSaved: chosen.initialSaved ?? 0, frequency: chosen.frequency, monthlyCapacity: chosen.monthlyCapacity ?? undefined }
            : undefined,
        },
      });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      invalidateTrips();
      router.push(`/viajes/${trip.id}?nuevo=1`);
    } catch (e) {
      setError((e as Error).message);
      setPhase(pick ? 'pick' : 'form');
    }
  };

  const toggle = (k: 'likes' | 'avoid', id: string) => set(k, d[k].includes(id) ? d[k].filter((x) => x !== id) : [...d[k], id]);

  /* ── Pantalla de opciones (Ayúdame a elegir / Sorpresa) ─────────────── */
  if (phase === 'pick' && suggestions) {
    const surprise = suggestions[surpriseIdx];
    return (
      <div ref={topRef} className="container-app max-w-3xl scroll-mt-20 py-6 pb-32 lg:py-10">
        <button onClick={back} className="btn btn-ghost -ml-3">
          <Icon name="back" size={18} /> Ajustar mis respuestas
        </button>
        {!suggestions.length ? (
          <Alert tone="warn">No encontramos destinos con esos filtros. Prueba quitando algo de “Prefiero evitar” o ampliando el alcance.</Alert>
        ) : d.mode === 'SURPRISE' && surprise ? (
          <>
            <p className="eyebrow mt-4 text-blue">Destino sorpresa</p>
            <h1 className="h-display mt-2 text-4xl text-navy">Te proponemos…</h1>
            <SuggestionCard s={surprise} big onPick={() => create(surprise)} busy={false} />
            {suggestions.length > 1 && (
              <button onClick={() => setSurpriseIdx((i) => (i + 1) % suggestions.length)} className="btn btn-outline mt-4 w-full">
                <Icon name="shuffle" size={18} /> Proponme otro
              </button>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow mt-4 text-blue">Ayúdame a elegir</p>
            <h1 className="h-display mt-2 text-4xl text-navy">Opciones para ti</h1>
            <p className="mt-2 text-text-2">Ordenadas por lo que te gusta y por qué tan bien encajan con tu presupuesto (referencia aproximada, no son precios).</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {suggestions.map((s) => (
                <SuggestionCard key={s.slug} s={s} onPick={() => create(s)} busy={false} />
              ))}
            </div>
          </>
        )}
        {error && (
          <div className="mt-4">
            <Alert tone="bad">{error}</Alert>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'creating') {
    return (
      <div className="container-app flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
        <span className="grid size-16 animate-pulse place-items-center rounded-3xl bg-yellow text-navy">
          <Icon name="plane" size={30} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-navy">Creando tu viaje…</h1>
        <p className="mt-2 text-text-2">Estamos armando Mi Viaje y tu plan de ahorro.</p>
      </div>
    );
  }

  /* ── Formulario por pasos ───────────────────────────────────────────── */
  return (
    <div ref={topRef} className="scroll-mt-16 bg-surface">
      <div className="container-app max-w-3xl py-6 pb-36 lg:py-10">
        <div className="flex items-center justify-between text-sm font-semibold text-text-2">
          <span>
            Paso {step + 1} de {STEPS.length}
          </span>
          <span className="text-navy">{STEPS[step]}</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={((step + 1) / STEPS.length) * 100} tone="navy" label={`Paso ${step + 1} de ${STEPS.length}`} />
        </div>

        <div className="card mt-6 p-5 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">¿Cómo quieres crear tu viaje?</h1>
                <p className="mt-1 text-text-2">Lo puedes cambiar después.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Forma de crear el viaje">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    role="radio"
                    aria-checked={d.mode === m.key}
                    onClick={() => set('mode', m.key)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${d.mode === m.key ? 'border-navy bg-sky' : 'border-line bg-white hover:border-line-2'}`}
                  >
                    <span className={`grid size-11 place-items-center rounded-xl ${d.mode === m.key ? 'bg-navy text-yellow' : 'bg-surface text-navy'}`}>
                      <Icon name={m.icon} />
                    </span>
                    <span className="mt-3 block font-bold text-navy">{m.title}</span>
                    <span className="mt-1 block text-sm text-text-2">{m.text}</span>
                  </button>
                ))}
              </div>

              {d.mode === 'KNOWN' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                    <Field label="Ciudad o lugar de destino" htmlFor="w-city">
                      <input
                        id="w-city"
                        className="input"
                        placeholder="Ej.: Madrid, Cartagena, Tokio…"
                        value={d.destinationCity}
                        onChange={(e) => setD((p) => ({ ...p, destinationCity: e.target.value, destinationSlug: '' }))}
                        maxLength={80}
                        autoComplete="off"
                      />
                    </Field>
                    <Field label="País" htmlFor="w-country">
                      <input id="w-country" className="input" list="countries" value={d.destinationCountry} onChange={(e) => set('destinationCountry', e.target.value)} maxLength={60} />
                      <datalist id="countries">
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </Field>
                  </div>
                  {popular.length > 0 && (
                    <div>
                      <p className="label">O elige uno popular</p>
                      <div className="scroll-x -mx-1 px-1 pb-1">
                        {popular.slice(0, 14).map((p) => (
                          <button
                            key={p.slug}
                            className="chip"
                            aria-pressed={d.destinationSlug === p.slug}
                            onClick={() => setD((x) => ({ ...x, destinationCity: p.name, destinationCountry: p.country, destinationSlug: p.slug }))}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.destinationSlug && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-navy">
                      <input type="checkbox" className="mt-0.5 size-5 accent-navy" checked={d.prefillItinerary} onChange={(e) => set('prefillItinerary', e.target.checked)} />
                      <span>
                        <strong>Agregar un itinerario sugerido</strong>
                        <span className="block text-text-2">Ideas para cada día que puedes editar o borrar.</span>
                      </span>
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="label">¿Dónde buscamos?</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ['todos', 'Colombia y el mundo'],
                        ['colombia', 'Solo Colombia'],
                        ['internacional', 'Solo internacional'],
                      ] as const
                    ).map(([k, l]) => (
                      <button key={k} className="chip" aria-pressed={d.scope === k} onClick={() => set('scope', k)}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <Alert tone="info">Al final te mostraremos destinos según tus fechas, presupuesto y gustos.</Alert>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">¿Cuándo viajas?</h1>
              <Field label="Sales desde" htmlFor="w-origin">
                <input id="w-origin" className="input" list="origins" value={d.originCity} onChange={(e) => set('originCity', e.target.value)} maxLength={60} />
                <datalist id="origins">
                  {ORIGINS.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Salida" htmlFor="w-start">
                  <input
                    id="w-start"
                    type="date"
                    className="input"
                    min={todayISO()}
                    value={d.startDate}
                    onChange={(e) => setD((p) => ({ ...p, startDate: e.target.value, endDate: p.endDate && p.endDate < e.target.value ? e.target.value : p.endDate }))}
                  />
                </Field>
                <Field label="Regreso" htmlFor="w-end">
                  <input id="w-end" type="date" className="input" min={d.startDate || todayISO()} value={d.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </Field>
              </div>
              {d.startDate && d.endDate && d.endDate >= d.startDate && (
                <p className="rounded-2xl bg-sky p-4 text-sm text-navy">
                  <strong>{nights + 1} días</strong> de viaje · faltan <strong>{daysBetween(todayISO(), d.startDate)} días</strong> para salir: ese es el tiempo que tienes para ahorrar.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">¿Cuántos viajan?</h1>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { n: 1, t: 'Solo' },
                  { n: 2, t: 'En pareja' },
                  { n: 3, t: 'Con amigos' },
                  { n: 4, t: 'En familia' },
                ].map((o) => (
                  <button
                    key={o.n}
                    onClick={() => set('travelerCount', o.n)}
                    aria-pressed={d.travelerCount === o.n}
                    className={`rounded-2xl border-2 p-4 text-left transition ${d.travelerCount === o.n ? 'border-navy bg-sky' : 'border-line hover:border-line-2'}`}
                  >
                    <span className="block text-2xl font-extrabold text-navy">{o.n === 4 ? '4+' : o.n === 3 ? '3+' : o.n}</span>
                    <span className="text-sm text-text-2">{o.t}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
                <span className="font-semibold text-navy">Número exacto de viajeros</span>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline size-11 p-0" onClick={() => set('travelerCount', Math.max(1, d.travelerCount - 1))} aria-label="Quitar un viajero">
                    −
                  </button>
                  <span className="num w-8 text-center text-xl font-extrabold text-navy" aria-live="polite">
                    {d.travelerCount}
                  </span>
                  <button className="btn btn-outline size-11 p-0" onClick={() => set('travelerCount', Math.min(30, d.travelerCount + 1))} aria-label="Agregar un viajero">
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Presupuesto y ahorro</h1>
                <p className="mt-1 text-text-2">El total del viaje para {d.travelerCount === 1 ? 'ti' : `los ${d.travelerCount}`}. Con esto armamos tu plan de ahorro.</p>
              </div>
              <Field label="Presupuesto total (COP)" htmlFor="w-budget" hint={budget && d.travelerCount > 1 ? `≈ ${formatCOP(budget / d.travelerCount)} por persona` : undefined}>
                <MoneyInput id="w-budget" value={d.budgetAmount} onChange={(v) => set('budgetAmount', v)} placeholder="3.000.000" />
              </Field>

              {budget > 0 && (
                <div className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy">Reparto por categoría</p>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-text-2">
                      <input
                        type="checkbox"
                        className="size-5 accent-navy"
                        checked={d.detailBudget}
                        onChange={(e) => setD((p) => ({ ...p, detailBudget: e.target.checked, budgetByCategory: e.target.checked ? split : p.budgetByCategory }))}
                      />
                      Ajustarlo yo
                    </label>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {BUDGET_CATEGORIES.map((c) => (
                      <li key={c.key} className="flex items-center gap-3">
                        <Icon name={c.icon} size={18} className="shrink-0 text-text-2" />
                        <span className="flex-1 text-sm text-navy">{c.label}</span>
                        {d.detailBudget ? (
                          <div className="w-40">
                            <MoneyInput value={d.budgetByCategory[c.key]} onChange={(v) => setD((p) => ({ ...p, budgetByCategory: { ...p.budgetByCategory, [c.key]: v ?? 0 } }))} />
                          </div>
                        ) : (
                          <span className="num text-sm font-semibold text-navy">{formatCOP(split[c.key])}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {d.detailBudget && detailedSum !== budget && (
                    <p className="mt-3 text-sm text-warn">
                      Suma {formatCOP(detailedSum)} · {detailedSum > budget ? 'sobran' : 'faltan'} {formatCOP(Math.abs(budget - detailedSum))}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-2xl bg-navy p-5 text-white">
                <label className="flex cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="flex items-center gap-2 font-bold">
                      <Icon name="piggy" size={20} className="text-yellow" /> Plan de ahorro inteligente
                    </span>
                    <span className="mt-1 block text-sm text-white/75">Te decimos cuánto ahorrar y cuándo, para pagar cada cosa a tiempo.</span>
                  </span>
                  <input type="checkbox" className="mt-1 size-6 shrink-0 accent-yellow" checked={d.savingsOn} onChange={(e) => set('savingsOn', e.target.checked)} />
                </label>
                {d.savingsOn && (
                  <div className="mt-5 space-y-4 [&_.label]:text-white">
                    <Field label="¿Cuánto llevas ahorrado para este viaje?" htmlFor="w-saved">
                      <MoneyInput id="w-saved" value={d.initialSaved} onChange={(v) => set('initialSaved', v)} />
                    </Field>
                    <div>
                      <p className="label">¿Cada cuánto ahorras?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {FREQUENCIES.map((f) => (
                          <button
                            key={f.key}
                            onClick={() => set('frequency', f.key)}
                            aria-pressed={d.frequency === f.key}
                            className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold transition ${d.frequency === f.key ? 'border-yellow bg-yellow text-navy' : 'border-white/20 text-white'}`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs text-white/70">{FREQUENCIES.find((f) => f.key === d.frequency)?.detail}</p>
                    </div>
                    <Field label="¿Cuánto puedes ahorrar al mes? (opcional)" htmlFor="w-cap">
                      <MoneyInput id="w-cap" value={d.monthlyCapacity} onChange={(v) => set('monthlyCapacity', v)} placeholder="Ej.: 500.000" />
                    </Field>
                    {savingsPreview && (
                      <p className="rounded-xl bg-white/10 p-3 text-sm">
                        {savingsPreview.n > 0 ? (
                          <>
                            Aproximadamente <strong className="num text-yellow">{formatCOP(savingsPreview.quota)}</strong> {PER_PERIOD[d.frequency]} durante {savingsPreview.n} cuotas.
                            Al crear el viaje lo ajustamos para que el vuelo y el hotel estén cubiertos a tiempo.
                          </>
                        ) : (
                          'Tu viaje es muy pronto para cuotas: te mostraremos qué falta y opciones.'
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">¿Qué te gusta?</h1>
              <div>
                <p className="label">Me mueve…</p>
                <div className="flex flex-wrap gap-2">
                  {LIKES.map((l) => (
                    <button key={l.id} className="chip" aria-pressed={d.likes.includes(l.id)} onClick={() => toggle('likes', l.id)}>
                      <span aria-hidden>{l.emoji}</span> {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Prefiero evitar</p>
                <div className="flex flex-wrap gap-2">
                  {AVOID.map((a) => (
                    <button key={a.id} className="chip" aria-pressed={d.avoid.includes(a.id)} onClick={() => toggle('avoid', a.id)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Estilo de viaje</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => set('style', s.id)}
                      aria-pressed={d.style === s.id}
                      className={`rounded-2xl border-2 p-3 text-left transition ${d.style === s.id ? 'border-navy bg-sky' : 'border-line hover:border-line-2'}`}
                    >
                      <span className="block font-bold text-navy">{s.label}</span>
                      <span className="text-sm text-text-2">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
              {d.mode === 'KNOWN' && (
                <div className="rounded-2xl bg-surface p-4 text-sm text-navy">
                  <p className="font-bold">Resumen</p>
                  <p className="mt-1 text-text-2">
                    {d.destinationCity}, {d.destinationCountry} · {d.startDate && formatDate(d.startDate)} – {d.endDate && formatDate(d.endDate)} · {d.travelerCount}{' '}
                    {d.travelerCount === 1 ? 'viajero' : 'viajeros'} · {formatCOP(budget)}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6">
              <Alert tone="bad">{error}</Alert>
            </div>
          )}
        </div>
      </div>

      {/* Barra fija: Atrás / Continuar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <div className="container-app flex max-w-3xl gap-3 py-3">
          <button onClick={back} className="btn btn-outline flex-1 sm:flex-none">
            Atrás
          </button>
          <button onClick={next} className="btn btn-primary flex-[2] sm:ml-auto sm:flex-none sm:px-10">
            {step < STEPS.length - 1 ? 'Continuar' : d.mode === 'KNOWN' ? (user ? 'Crear mi viaje' : 'Crear mi cuenta y mi viaje') : 'Ver destinos'}
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ s, onPick, big = false, busy }: { s: Suggestion; onPick: () => void; big?: boolean; busy: boolean }) {
  return (
    <article className={`card mt-6 overflow-hidden ${big ? '' : 'mt-0'}`}>
      <div className={`relative ${big ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        <Image src={s.imageUrl} alt={s.name} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="p-5">
        <p className="text-sm text-text-2">
          {s.region} · {s.country}
        </p>
        <h2 className={`font-extrabold text-navy ${big ? 'text-3xl' : 'text-xl'}`}>{s.name}</h2>
        <p className="mt-2 text-text-2">{s.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.reasons.map((r) => (
            <span key={r} className="badge bg-sky text-blue">
              {r}
            </span>
          ))}
          {s.fitsBudget === true && <span className="badge bg-ok-bg text-ok">Encaja con tu presupuesto</span>}
          {s.fitsBudget === false && <span className="badge bg-warn-bg text-warn">Puede exigir más presupuesto</span>}
        </div>
        <button onClick={onPick} disabled={busy} className="btn btn-navy mt-5 w-full">
          Elegir {s.name}
        </button>
      </div>
    </article>
  );
}
