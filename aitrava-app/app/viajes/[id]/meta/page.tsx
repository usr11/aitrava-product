'use client';

import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { Alert, ConfirmDialog, Field, MoneyInput, ProgressBar, SectionTitle, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { FREQUENCIES, PER_PERIOD } from '@/lib/catalog';
import { formatCOP, formatDate, todayISO } from '@/lib/format';
import { useLoadedTrip } from '@/lib/trip-context';
import type { Frequency, SavingsComputed } from '@/lib/types';

const MILESTONE_ICON: Record<string, IconName> = { transporte: 'plane', alojamiento: 'bed', actividades: 'ticket', seguros: 'shield', destino: 'wallet' };

const STATUS: Record<SavingsComputed['status'], { label: string; cls: string }> = {
  completed: { label: '¡Meta cumplida!', cls: 'bg-ok-bg text-ok' },
  ahead: { label: 'Vas adelantado', cls: 'bg-ok-bg text-ok' },
  on_track: { label: 'Vas al día', cls: 'bg-ok-bg text-ok' },
  behind: { label: 'Vas atrasado', cls: 'bg-warn-bg text-warn' },
  trip_started: { label: 'El viaje ya empezó', cls: 'bg-sky text-blue' },
};

/** Agrupa cuotas iguales seguidas: "Del 31 oct al 15 dic: $270.000 por quincena". */
function segments(schedule: SavingsComputed['schedule']) {
  const out: { from: string; to: string; amount: number; count: number }[] = [];
  for (const r of schedule) {
    const last = out[out.length - 1];
    if (last && last.amount === r.amount) {
      last.to = r.date;
      last.count++;
    } else out.push({ from: r.date, to: r.date, amount: r.amount, count: 1 });
  }
  return out;
}

export default function MetaPage() {
  const { trip, mutate } = useLoadedTrip();
  const savings = trip.savings;
  const [contrib, setContrib] = useState(false);
  const [settings, setSettings] = useState(false);
  const [all, setAll] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  if (!savings) return <SetupPlan />;
  const s = savings.computed;
  const segs = segments(s.schedule);
  const firstQuota = s.schedule[0]?.amount ?? 0;
  const smarter = firstQuota > s.naiveQuota && s.naiveQuota > 0;
  const flight = s.milestones.find((m) => m.key === 'transporte');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle eyebrow="Meta de viaje" title="Tu plan de ahorro" />

      {/* Meta y avance */}
      <section className="card overflow-hidden">
        <div className="bg-navy p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold uppercase">
                {trip.destinationCity} · {formatDate(trip.startDate, { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-sm text-white/70">Tu meta: {formatCOP(s.target)}</p>
            </div>
            <span className={`badge ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">Has ahorrado</p>
              <p className="num text-4xl font-extrabold">{formatCOP(s.saved)}</p>
            </div>
            <p className="num text-4xl font-extrabold text-yellow">{s.progress} %</p>
          </div>
          <div className="mt-3">
            <ProgressBar value={s.progress} size="lg" label="Progreso del ahorro" />
          </div>
          <p className="num mt-2 text-sm text-white/70">Te faltan {formatCOP(s.remaining)}</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          {s.next ? (
            <div>
              <p className="text-sm text-text-2">Para alcanzar tu meta:</p>
              <p className="text-2xl font-extrabold text-navy">
                <span className="num">{formatCOP(s.next.amount)}</span> <span className="text-base font-semibold text-text-2">{PER_PERIOD[s.frequency]}</span>
              </p>
              <p className="text-sm text-text-2">
                Próxima cuota: {formatDate(s.next.date, { weekday: 'long', day: 'numeric', month: 'long' })}
                {s.frequency !== 'MONTHLY' && ` · ≈ ${formatCOP(s.monthlyNeeded)} al mes`}
              </p>
            </div>
          ) : (
            <p className="font-semibold text-navy">{s.status === 'completed' ? 'Ya tienes todo lo que necesitas para tu viaje.' : 'No quedan cuotas antes del viaje.'}</p>
          )}
          <button onClick={() => setContrib(true)} className="btn btn-primary btn-lg w-full sm:w-auto">
            <Icon name="plus" size={20} /> Actualizar progreso
          </button>
        </div>
      </section>

      {/* Estado y ajustes inteligentes */}
      {s.status === 'behind' && (
        <Alert tone="warn">
          Según tu plan deberías llevar {formatCOP(s.expectedToday)} y llevas {formatCOP(s.saved)} ({formatCOP(-s.delta)} menos). Ya recalculamos tu cuota para que
          igual llegues a tiempo.
        </Alert>
      )}
      {s.status === 'ahead' && <Alert tone="ok">Vas {formatCOP(s.delta)} por encima de lo planeado. ¡Bien! Tus próximas cuotas bajaron.</Alert>}
      {s.shortfalls.length > 0 && (
        <Alert tone="bad">
          {s.shortfalls.map((f) => (
            <p key={f.key}>
              Para <strong>{f.label.toLowerCase()}</strong> necesitarías tener {formatCOP(f.missing)} más el {formatDate(f.dueDate, { day: 'numeric', month: 'long' })} y no
              alcanzan las cuotas antes de esa fecha.
            </p>
          ))}
        </Alert>
      )}
      {s.fitsCapacity === false && <Alert tone="warn">Esta cuota equivale a {formatCOP(s.monthlyNeeded)} al mes y dijiste que puedes ahorrar {formatCOP(s.monthlyCapacity ?? 0)}.</Alert>}
      {s.suggestions.length > 0 && (
        <section className="card p-5">
          <h2 className="font-extrabold text-navy">Opciones para que tu plan cuadre</h2>
          <ul className="mt-3 space-y-3">
            {s.suggestions.map((g) => (
              <li key={g.kind} className="flex gap-3 rounded-2xl bg-surface p-4">
                <Icon name={g.kind === 'move_date' ? 'calendar' : g.kind === 'reduce_budget' ? 'wallet' : g.kind === 'raise_quota' ? 'trendingUp' : 'refresh'} className="mt-0.5 shrink-0 text-blue" />
                <div>
                  <p className="font-semibold text-navy">{g.text}</p>
                  <p className="text-sm text-text-2">
                    {g.kind === 'move_date' && typeof g.value === 'string' && `Si sales desde el ${formatDate(g.value, { day: 'numeric', month: 'long', year: 'numeric' })}, la cuota cabe en lo que puedes ahorrar.`}
                    {g.kind === 'reduce_budget' && typeof g.value === 'number' && `Bajando ${formatCOP(g.value)} el presupuesto, llegas con tus fechas actuales.`}
                    {g.kind === 'raise_quota' && typeof g.value === 'number' && `Necesitarías ${formatCOP(g.value)} más al mes.`}
                    {g.kind === 'frequency' && 'Con cuotas semanales tienes más fechas de ahorro antes de cada pago.'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Hitos */}
      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-navy">Qué pagas y cuándo</h2>
        <p className="mt-1 text-sm text-text-2">
          Tu plan va al ritmo de tu viaje: primero lo que se paga antes.
          {smarter && flight && (
            <>
              {' '}
              Si solo dividieras el total, ahorrarías {formatCOP(s.naiveQuota)} {PER_PERIOD[s.frequency]} y no tendrías listo{' '}
              {flight.label.toLowerCase()} para el {formatDate(flight.dueDate, { day: 'numeric', month: 'long' })}.
            </>
          )}
        </p>
        <ol className="relative mt-5 ml-2 border-l-2 border-line pl-6">
          {s.milestones.map((m) => (
            <li key={m.key} className="relative pb-5 last:pb-0">
              <span className={`absolute top-0 -left-[37px] grid size-6 place-items-center rounded-full ${m.funded ? 'bg-ok text-white' : 'border-2 border-line-2 bg-white text-text-3'}`}>
                <Icon name={m.funded ? 'check' : MILESTONE_ICON[m.key] ?? 'wallet'} size={12} strokeWidth={m.funded ? 3 : 2} />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-bold text-navy">{m.label}</p>
                <p className="num font-semibold text-navy">{formatCOP(m.amount)}</p>
              </div>
              <p className="text-sm text-text-2">
                {m.dueSource === 'reserva' ? 'Ya tienes reserva: ' : 'Normalmente se paga hacia el '}
                {formatDate(m.dueDate, { day: 'numeric', month: 'long' })}
              </p>
              <p className={`text-sm font-semibold ${m.funded ? 'text-ok' : 'text-blue'}`}>
                {m.funded ? 'Ya lo tienes cubierto ✓' : m.fundedOn ? `Lo cubres con la cuota del ${formatDate(m.fundedOn, { day: 'numeric', month: 'short' })}` : 'Todavía no alcanza en la fecha'}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Calendario de cuotas */}
      {s.schedule.length > 0 && (
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-navy">Tu calendario de ahorro</h2>
          <p className="mt-1 text-sm text-text-2">{FREQUENCIES.find((f) => f.key === s.frequency)?.detail}.</p>
          <ul className="mt-4 space-y-2">
            {segs.map((g) => (
              <li key={g.from} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface p-4">
                <span className="text-sm text-navy">
                  {g.count === 1 ? `El ${formatDate(g.from, { day: 'numeric', month: 'short' })}` : `Del ${formatDate(g.from, { day: 'numeric', month: 'short' })} al ${formatDate(g.to, { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  <span className="text-text-2"> · {g.count} {g.count === 1 ? 'cuota' : 'cuotas'}</span>
                </span>
                <span className="num font-extrabold text-navy">
                  {formatCOP(g.amount)} <span className="text-sm font-semibold text-text-2">{PER_PERIOD[s.frequency]}</span>
                </span>
              </li>
            ))}
          </ul>
          <button onClick={() => setAll((v) => !v)} className="btn btn-ghost btn-sm mt-3" aria-expanded={all}>
            {all ? 'Ocultar detalle' : 'Ver cuota por cuota'} <Icon name="chevronDown" size={16} className={all ? 'rotate-180' : ''} />
          </button>
          {all && (
            <ol className="mt-2 divide-y divide-line text-sm">
              {s.schedule.map((r, i) => (
                <li key={r.date} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-text-2">
                    {i + 1}. {formatDate(r.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                    {r.completes.length > 0 && (
                      <span className="ml-2 font-semibold text-ok">✓ {r.completes.map((k) => s.milestones.find((m) => m.key === k)?.label).join(', ')}</span>
                    )}
                  </span>
                  <span className="num font-semibold text-navy">{formatCOP(r.amount)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* Aportes */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">Tus aportes</h2>
          <button onClick={() => setSettings(true)} className="btn btn-ghost btn-sm">
            <Icon name="settings" size={16} /> Ajustar plan
          </button>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {savings.plan.contributions.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span className={`grid size-9 place-items-center rounded-xl ${c.amount < 0 ? 'bg-bad-bg text-bad' : 'bg-ok-bg text-ok'}`}>
                <Icon name={c.amount < 0 ? 'download' : 'upload'} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{c.note || (c.amount < 0 ? 'Retiro' : 'Aporte')}</p>
                <p className="text-xs text-text-2">{formatDate(c.date, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className={`num font-bold ${c.amount < 0 ? 'text-bad' : 'text-navy'}`}>{formatCOP(c.amount)}</span>
              {!trip.isDemo && (
                <button onClick={() => setRemoving(c.id)} className="btn btn-ghost size-9 p-0 text-text-3" aria-label="Eliminar aporte">
                  <Icon name="close" size={16} />
                </button>
              )}
            </li>
          ))}
          <li className="flex items-center gap-3 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-surface text-text-2">
              <Icon name="piggy" size={16} />
            </span>
            <p className="flex-1 font-semibold text-navy">Ahorro inicial</p>
            <span className="num font-bold text-navy">{formatCOP(savings.plan.initialSaved)}</span>
          </li>
        </ul>
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-sky p-4 text-sm text-navy">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-blue" />
        AITRAVA no guarda tu dinero. Ahorra en tu propia cuenta (por ejemplo, un bolsillo de tu banco) y registra aquí tus aportes para llevar el plan. Las fechas de
        pago son referencias generales, no precios ni promesas.
      </p>

      <ContributionSheet open={contrib} onClose={() => setContrib(false)} suggested={s.next?.amount ?? null} />
      <PlanSettings open={settings} onClose={() => setSettings(false)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Eliminar este aporte?"
        onConfirm={() => mutate(() => api(`/trips/${trip.id}/savings/contributions/${removing}`, { method: 'DELETE' }))}
      />
    </div>
  );
}

function ContributionSheet({ open, onClose, suggested }: { open: boolean; onClose: () => void; suggested: number | null }) {
  const { trip, mutate } = useLoadedTrip();
  const [amount, setAmount] = useState<number | null>(null);
  const [kind, setKind] = useState<'in' | 'out'>('in');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setAmount(suggested);
      setKind('in');
      setDate(todayISO());
      setNote('');
      setError('');
    }
  }, [open, suggested]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return setError('Escribe el valor');
    setBusy(true);
    try {
      await mutate(() =>
        api(`/trips/${trip.id}/savings/contributions`, { json: { amount: kind === 'out' ? -amount : amount, date: `${date}T12:00:00.000Z`, note: note || undefined } }),
      );
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Actualizar progreso">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setKind('in')} aria-pressed={kind === 'in'} className={`rounded-xl border-2 py-3 font-semibold ${kind === 'in' ? 'border-navy bg-sky text-navy' : 'border-line text-text-2'}`}>
            Ahorré
          </button>
          <button type="button" onClick={() => setKind('out')} aria-pressed={kind === 'out'} className={`rounded-xl border-2 py-3 font-semibold ${kind === 'out' ? 'border-navy bg-sky text-navy' : 'border-line text-text-2'}`}>
            Saqué plata
          </button>
        </div>
        <Field label="Valor" htmlFor="c-amount" hint={suggested && kind === 'in' ? `Tu cuota de este periodo es ${formatCOP(suggested)}.` : undefined}>
          <MoneyInput id="c-amount" value={amount} onChange={setAmount} required />
        </Field>
        <Field label="Fecha" htmlFor="c-date">
          <input id="c-date" type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Nota (opcional)" htmlFor="c-note">
          <input id="c-note" className="input" maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: Quincena de noviembre" />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy w-full" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
        <p className="text-center text-xs text-text-2">Es un registro tuyo: AITRAVA no mueve ni guarda dinero.</p>
      </form>
    </Sheet>
  );
}

function PlanFields({
  v,
  set,
}: {
  v: { targetAmount: number | null; initialSaved: number | null; frequency: Frequency; monthlyCapacity: number | null };
  set: (p: Partial<typeof v>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Meta (costo total del viaje)" htmlFor="p-target">
        <MoneyInput id="p-target" value={v.targetAmount} onChange={(x) => set({ targetAmount: x })} required />
      </Field>
      <Field label="Ahorro inicial" htmlFor="p-saved">
        <MoneyInput id="p-saved" value={v.initialSaved} onChange={(x) => set({ initialSaved: x })} />
      </Field>
      <div>
        <p className="label">¿Cada cuánto ahorras?</p>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCIES.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => set({ frequency: f.key })}
              aria-pressed={v.frequency === f.key}
              className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold ${v.frequency === f.key ? 'border-navy bg-sky text-navy' : 'border-line text-text-2'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="hint">{FREQUENCIES.find((f) => f.key === v.frequency)?.detail}</p>
      </div>
      <Field label="¿Cuánto puedes ahorrar al mes? (opcional)" htmlFor="p-cap" hint="Si no te alcanza, te proponemos opciones.">
        <MoneyInput id="p-cap" value={v.monthlyCapacity} onChange={(x) => set({ monthlyCapacity: x })} />
      </Field>
    </div>
  );
}

function SetupPlan() {
  const { trip, mutate } = useLoadedTrip();
  const [v, setV] = useState({ targetAmount: trip.budgetAmount as number | null, initialSaved: null as number | null, frequency: 'BIWEEKLY' as Frequency, monthlyCapacity: null as number | null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!v.targetAmount) return setError('Pon una meta');
    setBusy(true);
    try {
      await mutate(() => api(`/trips/${trip.id}/savings`, { method: 'PUT', json: { ...v, initialSaved: v.initialSaved ?? 0 } }));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-xl">
      <SectionTitle eyebrow="Meta de viaje" title="Arma tu plan de ahorro" />
      <div className="card p-5 sm:p-6">
        <p className="text-text-2">Te decimos cuánto ahorrar y cuándo, para que tengas la plata del vuelo, del hotel y de todo lo demás en la fecha en que lo vas a pagar.</p>
        <div className="mt-5">
          <PlanFields v={v} set={(p) => setV({ ...v, ...p })} />
        </div>
        {error && (
          <div className="mt-4">
            <Alert tone="bad">{error}</Alert>
          </div>
        )}
        <button onClick={save} disabled={busy} className="btn btn-primary btn-lg mt-6 w-full">
          {busy ? 'Calculando…' : 'Crear mi plan'}
        </button>
        <p className="mt-3 text-center text-xs text-text-2">AITRAVA no guarda tu dinero: tú ahorras en tu cuenta y aquí llevas el plan.</p>
      </div>
    </div>
  );
}

function PlanSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trip, mutate } = useLoadedTrip();
  const plan = trip.savings!.plan;
  const [v, setV] = useState({ targetAmount: plan.targetAmount as number | null, initialSaved: plan.initialSaved as number | null, frequency: plan.frequency, monthlyCapacity: plan.monthlyCapacity });
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (open) setV({ targetAmount: plan.targetAmount, initialSaved: plan.initialSaved, frequency: plan.frequency, monthlyCapacity: plan.monthlyCapacity });
  }, [open, plan]);
  const save = async () => {
    await mutate(() => api(`/trips/${trip.id}/savings`, { method: 'PUT', json: { ...v, targetAmount: v.targetAmount ?? plan.targetAmount, initialSaved: v.initialSaved ?? 0 } }));
    onClose();
  };
  return (
    <>
      <Sheet open={open && !confirm} onClose={onClose} title="Ajustar plan de ahorro">
        <PlanFields v={v} set={(p) => setV({ ...v, ...p })} />
        <button onClick={save} className="btn btn-navy mt-6 w-full">
          Guardar
        </button>
        {!trip.isDemo && (
          <button onClick={() => setConfirm(true)} className="btn btn-ghost mt-2 w-full text-bad">
            Eliminar plan de ahorro
          </button>
        )}
      </Sheet>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Eliminar tu plan de ahorro?"
        text="Se borran tus aportes registrados en este viaje."
        onConfirm={async () => {
          await mutate(() => api(`/trips/${trip.id}/savings`, { method: 'DELETE' }));
          onClose();
        }}
      />
    </>
  );
}
