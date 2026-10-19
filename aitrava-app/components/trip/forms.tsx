'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BOOKING_CATEGORIES, BUDGET_CATEGORIES, ITEM_TYPES } from '@/lib/catalog';
import { formatDate, isoToLocalInput, localInputToISO, todayISO } from '@/lib/format';
import { geocode } from '@/lib/itinerary';
import { useLoadedTrip } from '@/lib/trip-context';
import type { Booking, BudgetCategory, ItineraryItem, Trip } from '@/lib/types';
import { Alert, Field, MoneyInput, Sheet } from '../ui';

function tripDays(trip: Trip) {
  const out: string[] = [];
  const start = new Date(trip.startDate.slice(0, 10));
  const end = new Date(trip.endDate.slice(0, 10));
  for (let d = start; d <= end; d = new Date(d.getTime() + 86_400_000)) out.push(d.toISOString().slice(0, 10));
  return out;
}

/* ── Actividad del itinerario ─────────────────────────────────────────── */

export function ItemForm({
  open,
  onClose,
  item,
  defaultDay,
}: {
  open: boolean;
  onClose: () => void;
  item?: ItineraryItem | null;
  defaultDay?: string;
}) {
  const { trip, mutate } = useLoadedTrip();
  const days = tripDays(trip);
  const blank = () => ({
    type: 'actividad',
    title: '',
    day: defaultDay ?? (days.includes(todayISO()) ? todayISO() : days[0]),
    time: '10:00',
    endTime: '',
    locationName: '',
    address: '',
    estimatedCost: null as number | null,
    description: '',
  });
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setF(
      item
        ? {
            type: item.type,
            title: item.title,
            day: item.startAt.slice(0, 10),
            time: item.startAt.slice(11, 16),
            endTime: item.endAt?.slice(11, 16) ?? '',
            locationName: item.locationName ?? '',
            address: item.address ?? '',
            estimatedCost: item.estimatedCost,
            description: item.description ?? '',
          }
        : blank(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const place = [f.address || f.locationName, trip.destinationCity].filter(Boolean).join(', ');
      const changedPlace = !item || item.address !== (f.address || null) || item.locationName !== (f.locationName || null);
      const coords = (f.locationName || f.address) && changedPlace ? await geocode(place) : null;
      const body = {
        type: f.type,
        title: f.title.trim(),
        startAt: localInputToISO(`${f.day}T${f.time}`),
        endAt: f.endTime ? localInputToISO(`${f.day}T${f.endTime}`) : item ? null : undefined,
        locationName: f.locationName || undefined,
        address: f.address || undefined,
        estimatedCost: f.estimatedCost ?? (item ? null : undefined),
        description: f.description || undefined,
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      };
      await mutate(() =>
        item ? api(`/trips/${trip.id}/items/${item.id}`, { method: 'PATCH', json: body }) : api(`/trips/${trip.id}/items`, { json: body }),
      );
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={item ? 'Editar actividad' : 'Agregar al itinerario'}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tipo" htmlFor="i-type">
          <select id="i-type" className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {ITEM_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="¿Qué vas a hacer?" htmlFor="i-title">
          <input id="i-title" className="input" required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ej.: Museo del Prado" />
        </Field>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
          <Field label="Día" htmlFor="i-day">
            <select id="i-day" className="input" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })}>
              {days.map((d, i) => (
                <option key={d} value={d}>
                  Día {i + 1} · {formatDate(d, { weekday: 'short', day: 'numeric', month: 'short' })}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hora" htmlFor="i-time">
            <input id="i-time" type="time" className="input" required value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
          </Field>
          <Field label="Hasta" htmlFor="i-end">
            <input id="i-end" type="time" className="input" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} />
          </Field>
        </div>
        <Field label="Lugar" htmlFor="i-place" hint="Lo ubicamos en el mapa para que puedas pedir la ruta.">
          <input id="i-place" className="input" maxLength={120} value={f.locationName} onChange={(e) => setF({ ...f, locationName: e.target.value })} placeholder="Nombre del lugar" />
        </Field>
        <Field label="Dirección (opcional)" htmlFor="i-address">
          <input id="i-address" className="input" maxLength={200} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </Field>
        <Field label="Costo estimado (opcional)" htmlFor="i-cost">
          <MoneyInput id="i-cost" value={f.estimatedCost} onChange={(v) => setF({ ...f, estimatedCost: v })} />
        </Field>
        <Field label="Notas" htmlFor="i-notes">
          <textarea id="i-notes" className="input min-h-20" maxLength={500} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy w-full" disabled={busy}>
          {busy ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar'}
        </button>
      </form>
    </Sheet>
  );
}

/* ── Reserva (dentro o fuera de AITRAVA) ─────────────────────────────── */

export function BookingForm({
  open,
  onClose,
  booking,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  categories?: string[];
  onSaved?: (b: Booking) => void;
}) {
  const { trip, mutate } = useLoadedTrip();
  const cats = BOOKING_CATEGORIES.filter((c) => !categories || categories.includes(c.key));
  const blank = () => ({
    category: cats[0].key,
    title: '',
    provider: '',
    reference: '',
    startAt: `${trip.startDate.slice(0, 10)}T10:00`,
    endAt: '',
    cost: null as number | null,
    isPaid: true,
    address: '',
    notes: '',
    addToItinerary: true,
  });
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setF(
      booking
        ? {
            category: booking.category,
            title: booking.title,
            provider: booking.provider ?? '',
            reference: booking.reference ?? '',
            startAt: isoToLocalInput(booking.startAt),
            endAt: isoToLocalInput(booking.endAt),
            cost: booking.cost,
            isPaid: booking.isPaid,
            address: booking.address ?? '',
            notes: booking.notes ?? '',
            addToItinerary: false,
          }
        : blank(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = {
        category: f.category,
        title: f.title.trim(),
        provider: f.provider || undefined,
        reference: f.reference || undefined,
        startAt: f.startAt ? localInputToISO(f.startAt) : booking ? null : undefined,
        endAt: f.endAt ? localInputToISO(f.endAt) : booking ? null : undefined,
        cost: f.cost ?? (booking ? null : undefined),
        isPaid: f.isPaid,
        address: f.address || undefined,
        notes: f.notes || undefined,
        ...(booking ? {} : { addToItinerary: f.addToItinerary }),
      };
      const saved = await mutate(() =>
        booking
          ? api<Booking>(`/trips/${trip.id}/bookings/${booking.id}`, { method: 'PATCH', json: body })
          : api<Booking>(`/trips/${trip.id}/bookings`, { json: body }),
      );
      onClose();
      onSaved?.(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={booking ? 'Editar reserva' : 'Agregar reserva'}>
      {!booking && <p className="-mt-1 mb-4 text-sm text-text-2">Lo hayas comprado donde lo hayas comprado, agrégalo a tu viaje.</p>}
      <form onSubmit={submit} className="space-y-4">
        <div className="scroll-x -mx-1 px-1 pb-1" role="radiogroup" aria-label="Categoría">
          {cats.map((c) => (
            <button type="button" key={c.key} role="radio" aria-checked={f.category === c.key} onClick={() => setF({ ...f, category: c.key })} className="chip">
              {c.label}
            </button>
          ))}
        </div>
        <Field label="Nombre" htmlFor="b-title">
          <input id="b-title" className="input" required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ej.: Vuelo Bogotá → Madrid" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dónde lo compraste" htmlFor="b-provider">
            <input id="b-provider" className="input" maxLength={80} value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} placeholder="Aerolínea, Booking…" />
          </Field>
          <Field label="Código de reserva" htmlFor="b-ref">
            <input id="b-ref" className="input uppercase" maxLength={80} value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} placeholder="ABC123" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Desde" htmlFor="b-start">
            <input id="b-start" type="datetime-local" className="input" value={f.startAt} onChange={(e) => setF({ ...f, startAt: e.target.value })} />
          </Field>
          <Field label="Hasta (opcional)" htmlFor="b-end">
            <input id="b-end" type="datetime-local" className="input" value={f.endAt} min={f.startAt} onChange={(e) => setF({ ...f, endAt: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-[1.3fr_1fr] items-end gap-3">
          <Field label="Costo" htmlFor="b-cost">
            <MoneyInput id="b-cost" value={f.cost} onChange={(v) => setF({ ...f, cost: v })} />
          </Field>
          <label className="flex min-h-[52px] cursor-pointer items-center gap-2 rounded-2xl bg-surface px-3 text-sm font-semibold text-navy">
            <input type="checkbox" className="size-5 accent-navy" checked={f.isPaid} onChange={(e) => setF({ ...f, isPaid: e.target.checked })} /> Ya está pagado
          </label>
        </div>
        <Field label="Dirección (opcional)" htmlFor="b-address">
          <input id="b-address" className="input" maxLength={200} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </Field>
        <Field label="Notas" htmlFor="b-notes">
          <textarea id="b-notes" className="input min-h-20" maxLength={500} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        </Field>
        {!booking && (
          <label className="flex cursor-pointer items-center gap-3 text-sm text-navy">
            <input type="checkbox" className="size-5 accent-navy" checked={f.addToItinerary} onChange={(e) => setF({ ...f, addToItinerary: e.target.checked })} />
            Agregarlo también al itinerario
          </label>
        )}
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy w-full" disabled={busy}>
          {busy ? 'Guardando…' : booking ? 'Guardar cambios' : 'Agregar reserva'}
        </button>
      </form>
    </Sheet>
  );
}

/* ── Gasto ───────────────────────────────────────────────────────────── */

export function ExpenseForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trip, mutate } = useLoadedTrip();
  const [amount, setAmount] = useState<number | null>(null);
  const [category, setCategory] = useState<BudgetCategory>('comida');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(null);
      setDescription('');
      setError('');
      setDate(todayISO());
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return setError('Escribe el valor del gasto');
    setBusy(true);
    try {
      await mutate(() => api(`/trips/${trip.id}/expenses`, { json: { amount, category, description: description || undefined, date: `${date}T12:00:00.000Z` } }));
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Registrar gasto">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Valor" htmlFor="e-amount">
          <MoneyInput id="e-amount" value={amount} onChange={setAmount} required />
        </Field>
        <div>
          <p className="label">Categoría</p>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
                className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold ${category === c.key ? 'border-navy bg-sky text-navy' : 'border-line text-text-2'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <Field label="Descripción" htmlFor="e-desc">
          <input id="e-desc" className="input" maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej.: Almuerzo" />
        </Field>
        <Field label="Fecha" htmlFor="e-date">
          <input id="e-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy w-full" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar gasto'}
        </button>
      </form>
    </Sheet>
  );
}
