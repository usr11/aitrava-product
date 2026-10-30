/**
 * Reglas de negocio de las reservas (funciones puras, probadas en rules.spec.ts).
 */
import type { ReservationStatus } from '@prisma/client';
import { AITRAVA_CHANNELS, type Channel } from '../common/config';

/** Estados que ocupan cupo. `requested` solo mientras no venza el apartado. */
export const SEAT_STATUSES: ReservationStatus[] = [
  'requested',
  'confirmed',
  'payment_reported',
  'paid',
  'attended',
];

/** Estados en los que la reserva sigue "viva" (para la idempotencia por WhatsApp). */
export const ACTIVE_STATUSES = SEAT_STATUSES;

export const holdsSeat = (
  r: { status: ReservationStatus; holdUntil: Date },
  now = new Date(),
) =>
  SEAT_STATUSES.includes(r.status) &&
  (r.status !== 'requested' || r.holdUntil > now);

/** Referencia que el viajero pone en el pago: AITRAVA-C01, C02… C100. */
export const codeOf = (n: number) => `AITRAVA-C${String(n).padStart(2, '0')}`;

/** Acepta "AITRAVA-C07", "c07", "7". Devuelve el número o null. */
export function numberOf(code: string): number | null {
  const m = /^(?:aitrava-)?c?0*(\d{1,9})$/i.exec(code.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return n > 0 ? n : null;
}

/**
 * Normaliza un celular colombiano a 57XXXXXXXXXX (10 dígitos empezando por 3).
 * Devuelve null si no es un celular válido.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0057')) d = d.slice(4);
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  if (d.length !== 10 || !d.startsWith('3')) return null;
  return `57${d}`;
}

/** Canal desde la URL (?c= o utm_source). Cualquier otra cosa queda como texto corto. */
export function normalizeChannel(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase().slice(0, 30);
  if (!v) return null;
  if (['IG', 'INSTAGRAM', 'TIKTOK', 'TT', 'META', 'FB'].includes(v))
    return 'IG';
  if (['GRP', 'WHATSAPP', 'WA', 'TELEGRAM', 'GRUPO'].includes(v)) return 'GRP';
  if (['REF', 'REFERIDO'].includes(v)) return 'REF';
  if (['ALI', 'ALIADO', 'ANFITRION'].includes(v)) return 'ALI';
  return v.replace(/[^A-Z0-9_-]/g, '') || null;
}

export const normalizeVariant = (v?: string | null) =>
  v === 'A' || v === 'B' ? v : null;

/** Perfil V1–V5 (documento §5.2). V5 null = el equipo todavía no lo revisa. */
export function profile(r: {
  isAdult: boolean;
  inCali: boolean;
  knowsTeam: boolean;
  heardFrom: string;
  channel: string | null;
  intentValid: boolean | null;
}) {
  const v4 =
    AITRAVA_CHANNELS.includes(r.heardFrom as Channel) ||
    AITRAVA_CHANNELS.includes((r.channel ?? '') as Channel);
  const checks = {
    v1: r.isAdult,
    v2: r.inCali,
    v3: !r.knowsTeam,
    v4,
    v5: r.intentValid,
  };
  return {
    ...checks,
    /** true = cumple V1–V5; false = no cumple alguno; null = falta revisar V5. */
    qualifies:
      checks.v1 && checks.v2 && checks.v3 && checks.v4
        ? r.intentValid === null
          ? null
          : r.intentValid
        : false,
  };
}

/** Transiciones que puede hacer el equipo desde /admin. */
export const ADMIN_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> =
  {
    requested: [
      'confirmed',
      'payment_reported',
      'paid',
      'cancelled',
      'expired',
    ],
    confirmed: ['payment_reported', 'paid', 'cancelled', 'requested'],
    payment_reported: ['paid', 'confirmed', 'cancelled'],
    paid: ['attended', 'no_show', 'cancelled'],
    attended: ['paid', 'no_show'],
    no_show: ['attended', 'paid'],
    cancelled: ['requested'],
    expired: ['requested'],
  };

/** Reembolso según la política (documento §6.1). */
export function refundFor(startsAt: Date, now = new Date()) {
  const hours = (startsAt.getTime() - now.getTime()) / 3_600_000;
  if (hours >= 72) return { percent: 100, text: 'Te devolvemos el 100 %.' };
  if (hours >= 24)
    return {
      percent: 50,
      text: 'Te devolvemos el 50 % (o cedes tu cupo sin costo).',
    };
  return {
    percent: 0,
    text: 'Faltan menos de 24 horas: no hay devolución, pero puedes ceder tu cupo sin costo.',
  };
}

/** Slug legible y único: "lago-de-las-garzas-2026-11-08". */
export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
