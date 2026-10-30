/** Todas las fechas se guardan en UTC y se muestran en hora de Cali (America/Bogota, UTC−5 sin horario de verano). */
export const TZ = 'America/Bogota';

export const formatCOP = (value: number) => {
  const n = Math.round(value);
  return `${n < 0 ? '−' : ''}$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.abs(n))}`;
};

/** $1,2 M / $850 mil, para espacios pequeños. */
export const formatCOPShort = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000).toLocaleString('es-CO')} mil`;
  return formatCOP(value);
};

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-CO', { timeZone: TZ, ...opts });
const clean = (s: string) => s.replace(/\./g, '').replace(/\s/g, ' ');
/** Primera letra en mayúscula ("domingo 8 de noviembre" → "Domingo 8 de noviembre"). */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "sáb 8 nov" */
export const formatDay = (iso: string) => cap(clean(fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso))));
/** "sábado 8 de noviembre" */
export const formatLongDate = (iso: string) => cap(fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso)));
/** "6:30 a. m." */
export const formatTime = (iso: string) => clean(fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))).replace('a m', 'a. m.').replace('p m', 'p. m.');
/** "8 nov 2026, 6:30 a. m." */
export const formatDateTime = (iso: string) =>
  `${clean(fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)))}, ${formatTime(iso)}`;

export const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  const hs = m === 30 ? `${h},5 h` : `${h} h${m ? ` ${m} min` : ''}`;
  return hs;
};

export const formatPct = (v: number | null | undefined, digits = 0) =>
  v == null ? '—' : `${(v * 100).toLocaleString('es-CO', { maximumFractionDigits: digits })} %`;

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "faltan 3 días", "mañana", "hoy". */
export function relativeDays(iso: string, now = new Date()) {
  // en-CA da AAAA-MM-DD, que Date.parse lee sin ambigüedad.
  const day = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const diff = Math.round((Date.parse(day(new Date(iso))) - Date.parse(day(now))) / 86_400_000);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff > 1) return `en ${diff} días`;
  return 'ya pasó';
}

/** Valor para <input type="datetime-local"> en hora de Cali, y de vuelta a ISO. */
export const isoToLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() - 5 * 3_600_000);
  return d.toISOString().slice(0, 16);
};
export const localInputToISO = (v: string) => (v ? new Date(`${v}:00-05:00`).toISOString() : '');
