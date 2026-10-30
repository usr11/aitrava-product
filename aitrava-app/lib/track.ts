import { api } from './api';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const ANON = 'aitrava_anon';
const VARIANT = 'aitrava_v';
const CHANNEL = 'aitrava_c';

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

/** Id anónimo por navegador: permite contar visitantes únicos del embudo. */
export function getAnonId() {
  let id = store.get(ANON);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    store.set(ANON, id);
  }
  return id;
}

/**
 * Variante del gancho (TC0). `?v=A` o `?v=B` la fuerza; si no, se sortea 50/50 la primera vez y se recuerda,
 * así una misma persona siempre ve el mismo mensaje.
 */
export function getVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  const q = new URLSearchParams(window.location.search).get('v')?.toUpperCase();
  if (q === 'A' || q === 'B') {
    store.set(VARIANT, q);
    return q;
  }
  const saved = store.get(VARIANT);
  if (saved === 'A' || saved === 'B') return saved;
  const v = Math.random() < 0.5 ? 'A' : 'B';
  store.set(VARIANT, v);
  return v;
}

/** Canal de llegada (`?c=IG`, `?c=GRP` o `utm_source`). Se guarda el primero que llegó. */
export function captureChannel() {
  try {
    const q = new URLSearchParams(window.location.search);
    const c = (q.get('c') ?? q.get('utm_source'))?.trim().slice(0, 30);
    if (c && !store.get(CHANNEL)) store.set(CHANNEL, c);
  } catch {}
}

export const getChannel = () => store.get(CHANNEL) ?? undefined;

/** Lo que viaja con cada reserva o registro para atribuir canal y variante. */
export const attribution = () => ({ anonId: getAnonId(), variant: getVariant(), channel: getChannel() });

const PIXEL_STANDARD: Record<string, string> = {
  reserve_started: 'InitiateCheckout',
  whatsapp_clicked: 'Contact',
};

/** Evento propio (y Meta Pixel). Nunca se manda información personal. */
export function track(name: string, props: Record<string, string | number | boolean | null> = {}, salida?: string) {
  if (typeof window === 'undefined') return;
  api('/events', { json: { name, salida, props, ...attribution() } }).catch(() => {});
  try {
    const std = PIXEL_STANDARD[name];
    if (std) window.fbq?.('track', std, props);
    else window.fbq?.('trackCustom', name, props);
  } catch {}
}

export function pixel(standardEvent: string, props: Record<string, unknown> = {}) {
  try {
    window.fbq?.('track', standardEvent, props);
  } catch {}
}

/** Reservas hechas desde este celular: así la persona vuelve a su reserva sin cuenta. */
const MINE = 'aitrava_reservas';
export type SavedReservation = { code: string; token: string; title: string; startsAt: string };
export const myReservations = {
  list(): SavedReservation[] {
    try {
      const v = JSON.parse(store.get(MINE) ?? '[]');
      return Array.isArray(v) ? v.slice(0, 10) : [];
    } catch {
      return [];
    }
  },
  add(r: SavedReservation) {
    const rest = myReservations.list().filter((x) => x.code !== r.code);
    store.set(MINE, JSON.stringify([r, ...rest].slice(0, 10)));
  },
};
