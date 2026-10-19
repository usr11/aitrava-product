'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatTime, todayISO } from '@/lib/format';
import { useGeolocation } from '@/lib/geo';
import { freedWindow, itemsByDay } from '@/lib/itinerary';
import { itemType } from '@/lib/catalog';
import { useLoadedTrip } from '@/lib/trip-context';
import type { ItineraryItem, VaultDocument } from '@/lib/types';
import { Icon } from '../Icon';
import { Alert, ConfirmDialog } from '../ui';
import { DirectionsSheet } from './Directions';
import { ItemForm } from './forms';
import { DocumentViewer } from './vault';

/** Línea de tiempo vertical del itinerario (sin tablas horizontales). */
export function ItineraryTimeline({ onlyDay, compact = false }: { onlyDay?: string; compact?: boolean }) {
  const { trip, mutate } = useLoadedTrip();
  const geo = useGeolocation();
  const [editing, setEditing] = useState<ItineraryItem | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [route, setRoute] = useState<ItineraryItem | null>(null);
  const [removing, setRemoving] = useState<ItineraryItem | null>(null);
  const [freed, setFreed] = useState<{ day: string; text: string } | null>(null);
  const [doc, setDoc] = useState<VaultDocument | null>(null);

  const days = itemsByDay(trip.items).filter(([d]) => !onlyDay || d === onlyDay);
  const today = todayISO();
  const dayIndex = (d: string) => Math.round((new Date(d).getTime() - new Date(trip.startDate.slice(0, 10)).getTime()) / 86_400_000) + 1;

  const toggleDone = (it: ItineraryItem) =>
    mutate(() => api(`/trips/${trip.id}/items/${it.id}`, { method: 'PATCH', json: { status: it.status === 'done' ? 'planned' : 'done' } }));

  return (
    <>
      {freed && (
        <div className="mb-4">
          <Alert tone="info" icon="clock">
            Listo: {freed.text}{' '}
            <button onClick={() => (setAdding(freed.day), setFreed(null))} className="font-semibold underline">
              Agregar otra actividad
            </button>
          </Alert>
        </div>
      )}
      {!days.length ? (
        <p className="text-text-2">{onlyDay ? 'No tienes actividades este día.' : 'Tu itinerario está vacío.'}</p>
      ) : (
        <div className="space-y-8">
          {days.map(([day, items]) => (
            <section key={day} aria-label={`Día ${dayIndex(day)}`}>
              {!compact && (
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-extrabold text-navy uppercase">
                    {day === today ? 'Hoy · ' : ''}
                    {dayIndex(day) >= 1 && dayIndex(day) <= 120 ? `Día ${dayIndex(day)} · ` : ''}
                    {formatDate(day, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </h3>
                  <button onClick={() => setAdding(day)} className="btn btn-ghost btn-sm" aria-label="Agregar actividad a este día">
                    <Icon name="plus" size={16} /> Agregar
                  </button>
                </div>
              )}
              <ol className="relative ml-2 border-l-2 border-line pl-6">
                {items.map((it) => {
                  const t = itemType(it.type);
                  const docs = it.bookingId ? trip.documents.filter((d) => d.bookingId === it.bookingId) : [];
                  const cancelled = it.status === 'cancelled';
                  return (
                    <li key={it.id} className="relative pb-6 last:pb-0">
                      <span
                        className={`absolute top-1 -left-[34px] grid size-[18px] place-items-center rounded-full border-2 ${
                          it.status === 'done' ? 'border-ok bg-ok' : 'border-navy bg-white'
                        }`}
                        aria-hidden
                      >
                        {it.status === 'done' && <Icon name="check" size={10} strokeWidth={3.5} className="text-white" />}
                      </span>
                      <p className={`num text-sm font-bold ${cancelled ? 'text-text-3 line-through' : 'text-blue'}`}>
                        {formatTime(it.startAt)}
                        {it.endAt && ` – ${formatTime(it.endAt)}`}
                      </p>
                      <div className="mt-1 flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold ${cancelled || it.status === 'done' ? 'text-text-2' : 'text-navy'} ${cancelled ? 'line-through' : ''}`}>
                            <Icon name={t.icon} size={16} className="mr-1.5 inline -translate-y-px text-text-3" />
                            {it.title}
                          </p>
                          {it.locationName && <p className="text-sm text-text-2">{it.locationName}</p>}
                          {it.description && !compact && <p className="mt-0.5 text-sm text-text-3">{it.description}</p>}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {docs[0] && (
                          <button onClick={() => setDoc(docs[0])} className="btn btn-outline btn-sm min-h-9 px-3">
                            <Icon name="ticket" size={15} /> Reserva
                          </button>
                        )}
                        {(it.locationName || it.address || it.latitude != null) && (
                          <button onClick={() => setRoute(it)} className="btn btn-outline btn-sm min-h-9 px-3">
                            <Icon name="navigation" size={15} /> Ruta
                          </button>
                        )}
                        <button onClick={() => toggleDone(it)} className="btn btn-ghost btn-sm min-h-9 px-3" aria-pressed={it.status === 'done'}>
                          <Icon name="check" size={15} /> <span className={compact ? 'sr-only' : 'max-sm:sr-only'}>{it.status === 'done' ? 'Hecho' : 'Marcar hecho'}</span>
                        </button>
                        <button onClick={() => setEditing(it)} className="btn btn-ghost btn-sm min-h-9 px-3" aria-label={`Editar ${it.title}`}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button onClick={() => setRemoving(it)} className="btn btn-ghost btn-sm min-h-9 px-3 text-bad" aria-label={`Eliminar ${it.title}`}>
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      <ItemForm open={!!editing || !!adding} item={editing} defaultDay={adding ?? undefined} onClose={() => (setEditing(null), setAdding(null))} />
      <DirectionsSheet item={route} city={trip.destinationCity} open={!!route} onClose={() => setRoute(null)} geo={geo} tripId={trip.id} />
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Quitar esta actividad?"
        text={removing ? `Si quitas “${removing.title}”, ${freedWindow(trip.items, removing).text}` : ''}
        confirmLabel="Quitar del itinerario"
        onConfirm={async () => {
          const it = removing!;
          const info = freedWindow(trip.items, it);
          await mutate(() => api(`/trips/${trip.id}/items/${it.id}`, { method: 'DELETE' }));
          setFreed({ day: it.startAt.slice(0, 10), text: info.text });
        }}
      />
    </>
  );
}
