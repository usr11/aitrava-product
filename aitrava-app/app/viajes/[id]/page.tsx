'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { DirectionsSheet } from '@/components/trip/Directions';
import { PassCard } from '@/components/trip/Paywall';
import { Alert, ConfirmDialog, Field, MoneyInput, ProgressBar, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCOP, formatDate, formatTime, plural, tripPhase } from '@/lib/format';
import { useGeolocation } from '@/lib/geo';
import { nextActivity } from '@/lib/itinerary';
import { itemType } from '@/lib/catalog';
import { useLoadedTrip } from '@/lib/trip-context';
import { invalidateTrips } from '@/lib/trips';
import { PER_PERIOD } from '@/lib/catalog';
import type { Trip } from '@/lib/types';

export default function TripOverviewPage() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}

const STATUS_TEXT: Record<string, { text: string; tone: 'ok' | 'warn' | 'info' }> = {
  completed: { text: '¡Meta cumplida!', tone: 'ok' },
  ahead: { text: 'Vas adelantado', tone: 'ok' },
  on_track: { text: 'Vas al día', tone: 'ok' },
  behind: { text: 'Vas un poco atrasado', tone: 'warn' },
  trip_started: { text: 'El viaje ya empezó', tone: 'info' },
};

function Overview() {
  const { trip } = useLoadedTrip();
  const params = useSearchParams();
  const isNew = params.get('nuevo') === '1';
  const geo = useGeolocation();
  const [dir, setDir] = useState(false);
  const [edit, setEdit] = useState(false);
  const p = tripPhase(trip);
  const next = nextActivity(trip);
  const s = trip.savings?.computed;
  const counts = (cats: string[]) => trip.bookings.filter((b) => cats.includes(b.category)).length;
  const showPass = !trip.hasPass && (p.phase === 'active' || p.daysToTrip <= 45 || trip.bookings.length + trip.documents.length > 0);

  const modules: { href: string; label: string; icon: IconName; detail: string }[] = [
    { href: 'transporte', label: 'Vuelo y transporte', icon: 'plane', detail: plural(counts(['vuelo', 'transporte']), 'reserva', 'reservas') },
    { href: 'alojamiento', label: 'Hotel', icon: 'bed', detail: plural(counts(['alojamiento']), 'reserva', 'reservas') },
    { href: 'actividades', label: 'Actividades', icon: 'ticket', detail: plural(counts(['actividad', 'seguro', 'otro']), 'reserva', 'reservas') },
    { href: 'restaurantes', label: 'Restaurantes', icon: 'utensils', detail: plural(counts(['restaurante']), 'reserva', 'reservas') },
    { href: 'boveda', label: 'Bóveda', icon: 'vault', detail: plural(trip.documents.length, 'documento', 'documentos') },
    { href: 'presupuesto', label: 'Presupuesto', icon: 'wallet', detail: `${formatCOP(trip.budget.remaining)} disponibles` },
    { href: 'itinerario', label: 'Itinerario', icon: 'calendar', detail: plural(trip.items.filter((i) => i.status !== 'cancelled').length, 'actividad', 'actividades') },
    { href: 'meta', label: 'Meta de ahorro', icon: 'piggy', detail: s ? `${s.progress} % ahorrado` : 'Sin plan todavía' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        {isNew && (
          <Alert tone="ok" icon="checkCircle">
            <strong>¡Tu viaje está creado!</strong> {trip.savings ? 'Ya tienes tu plan de ahorro. ' : ''}Siguiente paso: agrega tus reservas, las hayas comprado
            donde las hayas comprado.
          </Alert>
        )}

        {/* Estado del viaje */}
        <section className="card overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="p-5">
              <p className="eyebrow text-text-2">{p.phase === 'planning' ? 'Faltan' : p.phase === 'active' ? 'Estás en el' : 'Viaje'}</p>
              <p className="mt-1 text-3xl font-extrabold text-navy">
                {p.phase === 'planning' ? plural(p.daysToTrip, 'día', 'días') : p.phase === 'active' ? `Día ${p.dayOfTrip} de ${p.totalDays}` : 'Terminado'}
              </p>
            </div>
            <div className="p-5">
              <p className="eyebrow text-text-2">Preparado</p>
              <p className="mt-1 text-3xl font-extrabold text-navy">{trip.readiness.percent} %</p>
              <div className="mt-2">
                <ProgressBar value={trip.readiness.percent} tone="navy" size="sm" label="Preparación" />
              </div>
            </div>
          </div>
          {p.phase === 'active' && (
            <Link href={`/viajes/${trip.id}/modo-viaje`} className="flex items-center justify-between gap-3 bg-yellow px-5 py-4 font-bold text-navy">
              <span className="flex items-center gap-2">
                <Icon name="navigation" size={20} /> Entrar a Modo Viaje
              </span>
              <Icon name="chevronRight" />
            </Link>
          )}
        </section>

        {/* Próxima actividad */}
        <section className="card p-5">
          <p className="eyebrow text-blue">Tu próxima actividad</p>
          {next ? (
            <div className="mt-3 flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky text-blue">
                <Icon name={itemType(next.type).icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold text-navy">{next.title}</p>
                <p className="text-text-2">
                  {formatDate(next.startAt, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(next.startAt)}
                </p>
                {next.locationName && <p className="text-sm text-text-2">{next.locationName}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setDir(true)} className="btn btn-navy btn-sm">
                    <Icon name="navigation" size={16} /> Cómo llegar
                  </button>
                  <Link href={`/viajes/${trip.id}/itinerario`} className="btn btn-outline btn-sm">
                    Ver itinerario
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-text-2">Aún no tienes actividades en tu itinerario.</p>
              <Link href={`/viajes/${trip.id}/itinerario`} className="btn btn-outline btn-sm mt-3">
                <Icon name="plus" size={16} /> Armar mi itinerario
              </Link>
            </div>
          )}
        </section>

        {/* Ahorro */}
        <section className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-blue">Meta de ahorro</p>
              {s ? (
                <p className="mt-1 text-2xl font-extrabold text-navy">
                  {formatCOP(s.saved)} <span className="text-base font-semibold text-text-2">de {formatCOP(s.target)}</span>
                </p>
              ) : (
                <p className="mt-1 font-bold text-navy">Aún no tienes plan de ahorro</p>
              )}
            </div>
            {s && (
              <span className={`badge ${STATUS_TEXT[s.status].tone === 'warn' ? 'bg-warn-bg text-warn' : STATUS_TEXT[s.status].tone === 'ok' ? 'bg-ok-bg text-ok' : 'bg-sky text-blue'}`}>
                {STATUS_TEXT[s.status].text}
              </span>
            )}
          </div>
          {s ? (
            <>
              <div className="mt-3">
                <ProgressBar value={s.progress} size="lg" label="Progreso del ahorro" />
              </div>
              {s.next && (
                <p className="mt-3 text-sm text-text-2">
                  Próxima cuota: <strong className="num text-navy">{formatCOP(s.next.amount)}</strong> el {formatDate(s.next.date, { day: 'numeric', month: 'long' })} ({PER_PERIOD[s.frequency]})
                </p>
              )}
              <Link href={`/viajes/${trip.id}/meta`} className="btn btn-outline btn-sm mt-4">
                Ver mi plan de ahorro
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-text-2">Te decimos cuánto ahorrar y cuándo, para que tengas la plata de cada parte del viaje a tiempo.</p>
              <Link href={`/viajes/${trip.id}/meta`} className="btn btn-primary btn-sm mt-4">
                <Icon name="piggy" size={16} /> Crear mi plan de ahorro
              </Link>
            </>
          )}
        </section>

        {/* Módulos */}
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-navy">Tu viaje</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {modules.map((m) => (
              <Link key={m.href} href={`/viajes/${trip.id}/${m.href}`} className="card flex flex-col gap-3 p-4 transition hover:shadow-[var(--shadow-lift)]">
                <span className="grid size-11 place-items-center rounded-2xl bg-navy text-yellow">
                  <Icon name={m.icon} size={20} />
                </span>
                <span>
                  <span className="block font-bold text-navy">{m.label}</span>
                  <span className="block text-sm text-text-2">{m.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        {showPass && <PassCard trip={trip} compact />}
        {trip.hasPass && (
          <div className="flex items-center gap-3 rounded-2xl bg-ok-bg p-4 text-ok">
            <Icon name="checkCircle" />
            <p className="font-semibold">{trip.isDemo ? 'Viaje DEMO: Pass incluido para la demostración.' : 'AITRAVA Pass activo para este viaje.'}</p>
          </div>
        )}

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-navy">Checklist</h2>
          <ul className="mt-3 space-y-1">
            {trip.readiness.items.map((i) => (
              <li key={i.key} className="flex items-center gap-3 py-1.5">
                <Icon name={i.done ? 'checkCircle' : 'circle'} size={20} className={i.done ? 'text-ok' : 'text-line-2'} />
                <span className={i.done ? 'font-semibold text-navy' : 'text-text-2'}>{i.label}</span>
                <span className="sr-only">{i.done ? 'listo' : 'pendiente'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-extrabold text-navy">Datos del viaje</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-2">Salida desde</dt>
              <dd className="font-semibold text-navy">{trip.originCity}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-2">Viajeros</dt>
              <dd className="font-semibold text-navy">{trip.travelerCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-2">Presupuesto</dt>
              <dd className="num font-semibold text-navy">{formatCOP(trip.budgetAmount)}</dd>
            </div>
          </dl>
          {!trip.isDemo && (
            <button onClick={() => setEdit(true)} className="btn btn-outline btn-sm mt-4 w-full">
              <Icon name="edit" size={16} /> Editar viaje
            </button>
          )}
        </section>
      </aside>

      <DirectionsSheet item={next} city={trip.destinationCity} open={dir} onClose={() => setDir(false)} geo={geo} tripId={trip.id} />
      <TripEditSheet open={edit} onClose={() => setEdit(false)} trip={trip} />
    </div>
  );
}

function TripEditSheet({ open, onClose, trip }: { open: boolean; onClose: () => void; trip: Trip }) {
  const { mutate } = useLoadedTrip();
  const router = useRouter();
  const [f, setF] = useState({ title: '', destinationCity: '', destinationCountry: '', originCity: '', startDate: '', endDate: '', travelerCount: 1, budgetAmount: 0 as number | null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (open)
      setF({
        title: trip.title,
        destinationCity: trip.destinationCity,
        destinationCountry: trip.destinationCountry,
        originCity: trip.originCity,
        startDate: trip.startDate.slice(0, 10),
        endDate: trip.endDate.slice(0, 10),
        travelerCount: trip.travelerCount,
        budgetAmount: trip.budgetAmount,
      });
  }, [open, trip]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.endDate < f.startDate) return setError('El regreso debe ser después de la salida');
    setBusy(true);
    setError('');
    try {
      await mutate(() => api(`/trips/${trip.id}`, { method: 'PATCH', json: { ...f, budgetAmount: f.budgetAmount ?? trip.budgetAmount } }));
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Sheet open={open && !confirm} onClose={onClose} title="Editar viaje">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre del viaje" htmlFor="t-title">
            <input id="t-title" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={80} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Destino" htmlFor="t-city">
              <input id="t-city" className="input" value={f.destinationCity} onChange={(e) => setF({ ...f, destinationCity: e.target.value })} required />
            </Field>
            <Field label="País" htmlFor="t-country">
              <input id="t-country" className="input" value={f.destinationCountry} onChange={(e) => setF({ ...f, destinationCountry: e.target.value })} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salida" htmlFor="t-start">
              <input id="t-start" type="date" className="input" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} required />
            </Field>
            <Field label="Regreso" htmlFor="t-end">
              <input id="t-end" type="date" className="input" value={f.endDate} min={f.startDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sales desde" htmlFor="t-origin">
              <input id="t-origin" className="input" value={f.originCity} onChange={(e) => setF({ ...f, originCity: e.target.value })} required />
            </Field>
            <Field label="Viajeros" htmlFor="t-pax">
              <input id="t-pax" type="number" min={1} max={30} inputMode="numeric" className="input" value={f.travelerCount} onChange={(e) => setF({ ...f, travelerCount: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Presupuesto total" htmlFor="t-budget">
            <MoneyInput id="t-budget" value={f.budgetAmount} onChange={(v) => setF({ ...f, budgetAmount: v })} />
          </Field>
          {error && <Alert tone="bad">{error}</Alert>}
          <button className="btn btn-navy w-full" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => setConfirm(true)} className="btn btn-ghost w-full text-bad">
            Eliminar este viaje
          </button>
        </form>
      </Sheet>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Eliminar este viaje?"
        text="Se borrarán su itinerario, reservas, documentos de la Bóveda, gastos y plan de ahorro. No se puede deshacer."
        confirmLabel="Eliminar viaje"
        onConfirm={async () => {
          await api(`/trips/${trip.id}`, { method: 'DELETE' });
          invalidateTrips();
          router.push('/mis-viajes');
        }}
      />
    </>
  );
}
