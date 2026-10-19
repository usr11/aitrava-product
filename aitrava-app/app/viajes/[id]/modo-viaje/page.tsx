'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { DirectionsSheet, distanceTo } from '@/components/trip/Directions';
import { ExpenseForm, ItemForm } from '@/components/trip/forms';
import { NearbyExplorer } from '@/components/trip/Nearby';
import { PassCard } from '@/components/trip/Paywall';
import { ItineraryTimeline } from '@/components/trip/Timeline';
import { DocumentViewer } from '@/components/trip/vault';
import { Alert, ConfirmDialog, DemoBadge, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { itemType } from '@/lib/catalog';
import { formatCOP, formatDate, formatDuration, formatKm, formatTime, tripPhase, walkMinutes, wallNow } from '@/lib/format';
import { useGeolocation } from '@/lib/geo';
import { freeMinutesBefore, freedWindow, nowNextAfter } from '@/lib/itinerary';
import { track } from '@/lib/track';
import { useLoadedTrip } from '@/lib/trip-context';
import type { ItineraryItem, VaultDocument } from '@/lib/types';

export default function ModoViajePage() {
  const { trip } = useLoadedTrip();
  const p = tripPhase(trip);
  useEffect(() => {
    if (trip.hasPass) track('travel_mode_opened', { phase: p.phase }, trip.id);
  }, [trip.id, trip.hasPass, p.phase]);

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <header className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur-md lg:top-[72px]">
        <div className="container-app flex items-center gap-3 py-3">
          <Link href={`/viajes/${trip.id}`} className="btn btn-ghost size-11 shrink-0 rounded-full p-0" aria-label="Volver a Mi Viaje">
            <Icon name="back" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-blue">Modo Viaje</p>
            <h1 className="truncate text-xl font-extrabold text-navy uppercase">{trip.destinationCity}</h1>
          </div>
          {trip.isDemo && <DemoBadge />}
          <span className="shrink-0 rounded-full bg-yellow px-3 py-1.5 text-sm font-bold text-navy">
            {p.phase === 'active' ? `Día ${p.dayOfTrip} de ${p.totalDays}` : p.phase === 'planning' ? `En ${p.daysToTrip} días` : 'Terminado'}
          </span>
        </div>
      </header>
      <div className="container-app max-w-2xl pt-5">{trip.hasPass ? <TravelMode /> : <Locked />}</div>
    </div>
  );
}

function Locked() {
  const { trip } = useLoadedTrip();
  return (
    <div className="space-y-5">
      <PassCard trip={trip} />
      <div className="card p-5">
        <p className="font-bold text-navy">Así te acompaña Modo Viaje</p>
        <ul className="mt-3 space-y-2 text-text-2">
          <li>• Qué tienes ahora, qué sigue y qué viene después.</li>
          <li>• Tu reserva o QR a un toque.</li>
          <li>• Cómo llegar a pie, en transporte público o en carro.</li>
          <li>• Lugares cerca de ti cuando tienes tiempo libre.</li>
          <li>• Cambiar tus planes sin perder el orden.</li>
        </ul>
      </div>
    </div>
  );
}

function TravelMode() {
  const { trip, mutate } = useLoadedTrip();
  const p = tripPhase(trip);
  const geo = useGeolocation();
  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < p.totalDays; i++) out.push(new Date(new Date(trip.startDate.slice(0, 10)).getTime() + i * 86_400_000).toISOString().slice(0, 10));
    return out;
  }, [trip.startDate, p.totalDays]);
  const [day, setDay] = useState(() => (p.phase === 'active' ? days[(p.dayOfTrip ?? 1) - 1] : days[0]));
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const { current, next, after, today } = nowNextAfter(trip.items, day);
  const free = freeMinutesBefore(next, current);
  const [route, setRoute] = useState<ItineraryItem | null>(null);
  const [doc, setDoc] = useState<VaultDocument | null>(null);
  const [replan, setReplan] = useState(false);
  const [expense, setExpense] = useState(false);
  const isToday = day === wallNow().toISOString().slice(0, 10);
  const focus = next ?? current;
  const docFor = (it: ItineraryItem | null) => (it?.bookingId ? trip.documents.find((d) => d.bookingId === it.bookingId) ?? null : null);
  const focusDoc = docFor(focus) ?? docFor(current);

  const quick: { label: string; icon: IconName; onClick?: () => void; href?: string; disabled?: boolean }[] = [
    { label: 'Cómo llegar', icon: 'navigation', onClick: () => focus && setRoute(focus), disabled: !focus },
    { label: 'Mi reserva', icon: 'ticket', onClick: () => (focusDoc ? setDoc(focusDoc) : undefined), href: focusDoc ? undefined : `/viajes/${trip.id}/boveda` },
    { label: 'Cerca de mí', icon: 'pin', href: '#cerca' },
    { label: 'Cambiar plan', icon: 'refresh', onClick: () => setReplan(true) },
  ];

  return (
    <div className="space-y-5">
      {p.phase !== 'active' && (
        <Alert tone="info">
          {p.phase === 'planning' ? `Tu viaje empieza el ${formatDate(trip.startDate, { day: 'numeric', month: 'long' })}. Esta es una vista previa.` : 'Este viaje ya terminó. Puedes revisar cada día.'}
        </Alert>
      )}

      <div className="scroll-x -mx-4 px-4" aria-label="Elegir día">
        {days.map((d, i) => (
          <button key={d} className="chip shrink-0 py-2" aria-pressed={day === d} onClick={() => setDay(d)}>
            Día {i + 1} · {formatDate(d, { day: 'numeric', month: 'short' })}
          </button>
        ))}
      </div>

      {/* AHORA / SIGUIENTE / DESPUÉS */}
      <section className="space-y-3" aria-label="Agenda inmediata">
        {current && <Slot label="Ahora" item={current} tone="muted" />}
        {next ? (
          <div className="card overflow-hidden">
            <div className="p-5">
              <p className="eyebrow text-blue">{isToday ? 'Siguiente' : 'Primera actividad'}</p>
              <div className="mt-2 flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-yellow">
                  <Icon name={itemType(next.type).icon} size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-extrabold text-navy">{next.title}</p>
                  <p className="num text-lg font-semibold text-blue">{formatTime(next.startAt)}</p>
                  {next.locationName && <p className="text-text-2">{next.locationName}</p>}
                  {(() => {
                    const km = distanceTo(next, geo.pos);
                    return km != null ? (
                      <p className="mt-1 text-sm text-navy">
                        <Icon name="pin" size={14} className="inline -translate-y-px" /> {formatKm(km)} · a pie ≈ {formatDuration(walkMinutes(km))}{' '}
                        <span className="text-text-3">(aprox.)</span>
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
            <button onClick={() => setRoute(next)} className="flex w-full items-center justify-center gap-2 bg-yellow py-4 text-lg font-bold text-navy">
              <Icon name="navigation" size={22} /> Cómo llegar
            </button>
          </div>
        ) : (
          <div className="card p-5 text-center">
            <p className="font-bold text-navy">{today.length ? 'Ya no tienes más actividades este día.' : 'No tienes actividades este día.'}</p>
            <p className="mt-1 text-sm text-text-2">Explora lo que hay cerca o agrega algo a tu itinerario.</p>
          </div>
        )}
        {after && <Slot label="Después" item={after} tone="muted" />}
        {isToday && free != null && free >= 30 && next && (
          <p className="rounded-2xl bg-yellow-soft p-4 text-navy">
            <Icon name="clock" size={18} className="mr-1.5 inline -translate-y-px" />
            Tienes <strong>{formatDuration(free)} libres</strong>. Tu próxima actividad empieza a las {formatTime(next.startAt)}.{' '}
            <a href="#cerca" className="font-semibold underline">
              Ver qué hay cerca
            </a>
          </p>
        )}
      </section>

      {/* Acciones rápidas (a una mano) */}
      <section className="grid grid-cols-4 gap-2" aria-label="Acciones rápidas">
        {quick.map((q) => {
          const inner = (
            <>
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-navy shadow-[var(--shadow-soft)]">
                <Icon name={q.icon} size={22} />
              </span>
              <span className="text-center text-xs leading-tight font-semibold text-navy">{q.label}</span>
            </>
          );
          return q.href && !q.onClick ? (
            <a key={q.label} href={q.href} className="flex flex-col items-center gap-1.5 rounded-2xl p-1 py-2">
              {inner}
            </a>
          ) : q.href ? (
            <Link key={q.label} href={q.href} className="flex flex-col items-center gap-1.5 rounded-2xl p-1 py-2">
              {inner}
            </Link>
          ) : (
            <button key={q.label} onClick={q.onClick} disabled={q.disabled} className="flex flex-col items-center gap-1.5 rounded-2xl p-1 py-2 disabled:opacity-40">
              {inner}
            </button>
          );
        })}
      </section>

      {/* Agenda del día */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy uppercase">{isToday ? `Hoy · ${formatDate(day)}` : formatDate(day, { weekday: 'long', day: 'numeric', month: 'short' })}</h2>
          <button onClick={() => setReplan(true)} className="btn btn-ghost btn-sm">
            <Icon name="refresh" size={16} /> Cambiar
          </button>
        </div>
        <ItineraryTimeline onlyDay={day} compact />
      </section>

      {/* Plata del día */}
      <section className="card flex items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-2">Te quedan del presupuesto</p>
          <p className={`num text-2xl font-extrabold ${trip.budget.remaining < 0 ? 'text-bad' : 'text-navy'}`}>{formatCOP(trip.budget.remaining)}</p>
        </div>
        <button onClick={() => setExpense(true)} className="btn btn-navy btn-sm shrink-0">
          <Icon name="plus" size={16} /> Gasto
        </button>
      </section>

      <NearbyExplorer
        tripId={trip.id}
        city={`${trip.destinationCity}, ${trip.destinationCountry}`}
        fallback={focus?.latitude != null && focus.longitude != null ? { lat: focus.latitude, lng: focus.longitude } : null}
        freeMinutes={isToday ? free : null}
        nextTitle={next?.title}
      />

      <DirectionsSheet item={route} city={trip.destinationCity} open={!!route} onClose={() => setRoute(null)} geo={geo} tripId={trip.id} />
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} />
      <ReplanSheet open={replan} onClose={() => setReplan(false)} day={day} items={today} onChanged={() => mutate(async () => undefined)} />
      <ExpenseForm open={expense} onClose={() => setExpense(false)} />
    </div>
  );

  function Slot({ label, item }: { label: string; item: ItineraryItem; tone: 'muted' }) {
    return (
      <div className="card flex items-center gap-4 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-text-2">
          <Icon name={itemType(item.type).icon} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-text-2">{label}</p>
          <p className="truncate font-bold text-navy">{item.title}</p>
        </div>
        <span className="num shrink-0 font-semibold text-navy">{formatTime(item.startAt)}</span>
      </div>
    );
  }
}

/** "Cambiar mis planes": mover, cambiar hora, quitar o agregar, con el tiempo libre que queda. */
function ReplanSheet({ open, onClose, day, items }: { open: boolean; onClose: () => void; day: string; items: ItineraryItem[]; onChanged: () => void }) {
  const { trip, mutate } = useLoadedTrip();
  const [edit, setEdit] = useState<ItineraryItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<ItineraryItem | null>(null);
  const [freed, setFreed] = useState('');
  const pending = items.filter((i) => i.status === 'planned');

  return (
    <>
      <Sheet open={open && !edit && !adding && !removing} onClose={onClose} title="Cambiar mis planes">
        {freed && (
          <div className="mb-4">
            <Alert tone="info" icon="clock">
              Listo: {freed}{' '}
              <a href="#cerca" onClick={onClose} className="font-semibold underline">
                Ver alternativas cerca
              </a>
            </Alert>
          </div>
        )}
        {!pending.length ? (
          <p className="text-text-2">No tienes actividades pendientes este día.</p>
        ) : (
          <ul className="divide-y divide-line">
            {pending.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <span className="num w-16 shrink-0 text-sm font-bold text-blue">{formatTime(it.startAt)}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-navy">{it.title}</span>
                <button onClick={() => setEdit(it)} className="btn btn-outline btn-sm min-h-9 px-3">
                  Mover
                </button>
                <button onClick={() => setRemoving(it)} className="btn btn-ghost size-9 p-0 text-bad" aria-label={`Quitar ${it.title}`}>
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setAdding(true)} className="btn btn-navy mt-4 w-full">
          <Icon name="plus" size={18} /> Agregar actividad
        </button>
      </Sheet>
      <ItemForm open={!!edit || adding} item={edit} defaultDay={day} onClose={() => (setEdit(null), setAdding(false))} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Quitar esta actividad?"
        text={removing ? `Al eliminar “${removing.title}”, ${freedWindow(trip.items, removing).text}` : ''}
        confirmLabel="Quitar"
        onConfirm={async () => {
          const it = removing!;
          const info = freedWindow(trip.items, it);
          await mutate(() => api(`/trips/${trip.id}/items/${it.id}`, { method: 'DELETE' }));
          setFreed(info.text);
        }}
      />
    </>
  );
}
