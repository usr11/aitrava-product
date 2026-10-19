/**
 * Fechas: las del viaje y las de las actividades se guardan como "hora local del destino" en UTC
 * (2026-12-15T10:30 → 2026-12-15T10:30Z), así que SIEMPRE se muestran con timeZone UTC.
 */

export const formatCOP = (value: number) =>
  `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(value))}`;

/** $1,2 M / $850 mil, para espacios pequeños. */
export const formatCOPShort = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000).toLocaleString('es-CO')} mil`;
  return formatCOP(value);
};

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', ...opts });

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  fmt(opts).format(new Date(iso)).replace('.', '');

export const formatLongDate = (iso: string) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));

export const formatTime = (iso: string) =>
  fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso)).replace(/\s/g, ' ');

export const formatRange = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  const sameMonth = da.getUTCMonth() === db.getUTCMonth() && da.getUTCFullYear() === db.getUTCFullYear();
  return sameMonth
    ? `${da.getUTCDate()}–${formatDate(b, { day: 'numeric', month: 'short' })}`
    : `${formatDate(a)} – ${formatDate(b)}`;
};

/** Fecha y hora real de quien usa la app, expresada como "hora local en UTC" para comparar con el itinerario. */
export const wallNow = (d = new Date()) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));

export const todayISO = () => wallNow().toISOString().slice(0, 10);

export const dayKey = (iso: string) => iso.slice(0, 10);

/** "2027-03-20T08:00" (input datetime-local) → ISO con Z, sin conversión de zona. */
export const localInputToISO = (v: string) => (v ? `${v.length === 16 ? `${v}:00` : v}.000Z` : '');
export const isoToLocalInput = (iso?: string | null) => (iso ? iso.slice(0, 16) : '');

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b.slice(0, 10)).getTime() - new Date(a.slice(0, 10)).getTime()) / 86_400_000);

/** Fase del viaje según la fecha local del usuario. */
export function tripPhase(trip: { startDate: string; endDate: string }) {
  const today = todayISO();
  const toStart = daysBetween(today, trip.startDate);
  const totalDays = daysBetween(trip.startDate, trip.endDate) + 1;
  if (toStart > 0) return { phase: 'planning' as const, daysToTrip: toStart, dayOfTrip: null, totalDays };
  const day = -toStart + 1;
  if (day > totalDays) return { phase: 'finished' as const, daysToTrip: 0, dayOfTrip: null, totalDays };
  return { phase: 'active' as const, daysToTrip: 0, dayOfTrip: day, totalDays };
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const formatBytes = (n: number) => (n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`);

/** Distancia en línea recta (km) entre dos puntos. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString('es-CO', { maximumFractionDigits: 1 })} km`);

/** Minutos a pie estimados (≈4,8 km/h sobre la distancia en línea recta). Es una aproximación. */
export const walkMinutes = (km: number) => Math.max(1, Math.round((km / 4.8) * 60 * 1.25));

export const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};
