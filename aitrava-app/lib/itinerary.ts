import { dayKey, formatDuration, formatTime, wallNow } from './format';
import type { ItineraryItem, Trip } from './types';

const DEFAULT_MIN = 90; // duración asumida si la actividad no tiene hora de fin

export const endOf = (it: ItineraryItem) => (it.endAt ? new Date(it.endAt) : new Date(new Date(it.startAt).getTime() + DEFAULT_MIN * 60_000));

export const activeItems = (items: ItineraryItem[]) => items.filter((i) => i.status !== 'cancelled');

export function itemsByDay(items: ItineraryItem[]) {
  const map = new Map<string, ItineraryItem[]>();
  for (const it of [...items].sort((a, b) => a.startAt.localeCompare(b.startAt))) {
    const k = dayKey(it.startAt);
    map.set(k, [...(map.get(k) ?? []), it]);
  }
  return [...map.entries()];
}

/** Ahora / siguiente / después según la hora local del viajero (o de un día de vista previa). */
export function nowNextAfter(items: ItineraryItem[], day: string, now = wallNow()) {
  const today = activeItems(items)
    .filter((i) => dayKey(i.startAt) === day)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const isToday = day === now.toISOString().slice(0, 10);
  const ref = isToday ? now : new Date(`${day}T00:00:00.000Z`);
  const current = isToday ? today.find((i) => new Date(i.startAt) <= ref && endOf(i) > ref && i.status !== 'done') : undefined;
  const upcoming = today.filter((i) => new Date(i.startAt) > ref && i.status !== 'done');
  return { today, current: current ?? null, next: upcoming[0] ?? null, after: upcoming[1] ?? null, rest: upcoming.slice(2) };
}

/** Próxima actividad de todo el viaje (para el resumen de Mi Viaje). */
export function nextActivity(trip: Trip, now = wallNow()) {
  return (
    activeItems(trip.items)
      .filter((i) => endOf(i) > now && i.status !== 'done')
      .sort((a, b) => a.startAt.localeCompare(b.startAt))[0] ?? null
  );
}

/** Minutos libres entre ahora (o el fin de la actividad actual) y la siguiente. */
export function freeMinutesBefore(next: ItineraryItem | null, current: ItineraryItem | null, now = wallNow()) {
  if (!next) return null;
  const from = current ? endOf(current) : now;
  const min = Math.round((new Date(next.startAt).getTime() - from.getTime()) / 60_000);
  return min > 0 ? min : 0;
}

/** Replan: cuánto tiempo queda libre si se quita una actividad. */
export function freedWindow(items: ItineraryItem[], removed: ItineraryItem) {
  const sameDay = activeItems(items)
    .filter((i) => i.id !== removed.id && dayKey(i.startAt) === dayKey(removed.startAt))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const prev = [...sameDay].reverse().find((i) => i.startAt <= removed.startAt);
  const next = sameDay.find((i) => i.startAt > removed.startAt);
  const from = prev ? endOf(prev) : new Date(removed.startAt);
  const to = next ? new Date(next.startAt) : endOf(removed);
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60_000));
  return {
    minutes,
    text: next
      ? `tendrás aproximadamente ${formatDuration(minutes)} libres, de ${formatTime(from.toISOString())} a ${formatTime(to.toISOString())} (antes de “${next.title}”).`
      : `tendrás libre el resto del día desde las ${formatTime(from.toISOString())}.`,
  };
}

export type TravelMode = 'walking' | 'transit' | 'driving';

/** Ruta real en Google Maps (sin clave). Desde la ubicación actual del celular hasta la actividad. */
export function directionsUrl(target: { latitude?: number | null; longitude?: number | null; locationName?: string | null; address?: string | null; city?: string }, mode: TravelMode) {
  const dest =
    target.latitude != null && target.longitude != null
      ? `${target.latitude},${target.longitude}`
      : [target.address || target.locationName, target.city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=${mode}`;
}

export const placeUrl = (q: string, lat?: number, lng?: number) =>
  lat != null && lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/** Busca coordenadas de un lugar (OpenStreetMap Nominatim). Devuelve null si no lo encuentra. */
export async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&q=${encodeURIComponent(q)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = (await res.json()) as { lat: string; lon: string }[];
    return data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
  } catch {
    return null;
  }
}
