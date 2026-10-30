/**
 * Configuración de negocio en UN solo lugar (roadmap §4 y §7). La app la lee de GET /api/config,
 * así que la comisión, el apartado, las metas y la política de reembolso nunca se duplican.
 */

export const appUrl = () =>
  (process.env.APP_URL ?? 'http://localhost:3000')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

export const isProduction = () =>
  process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

/** Correos del equipo: son los únicos que pueden crear cuenta y reciben rol admin al verificar. */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Comisión por defecto de una salida nueva (se pide 20 %, el piso es 16 %). */
export const defaultCommission = () => num(process.env.COMMISSION_RATE, 0.2);
export const COMMISSION_FLOOR = 0.16;

/** Horas que se aparta un cupo mientras el viajero paga. */
export const holdHours = () => num(process.env.HOLD_HOURS, 48);

/** Canales de AiTrava (V4 del perfil). */
export const CHANNELS = {
  GRP: 'Grupo de WhatsApp o Telegram',
  IG: 'Instagram o TikTok',
  REF: 'Me lo recomendó alguien',
  ALI: 'Un anfitrión o aliado',
  OTRO: 'Otro',
} as const;
export type Channel = keyof typeof CHANNELS;
export const AITRAVA_CHANNELS: Channel[] = ['GRP', 'IG', 'REF', 'ALI'];

export const LINES = {
  URBANO: { label: 'Urbano', detail: 'Dentro de Cali', refTicket: 65_000 },
  NATURALEZA: {
    label: 'Naturaleza cerca',
    detail: 'A una hora o menos de Cali',
    refTicket: 110_000,
  },
  ESCAPADA: {
    label: 'Escapada de un día',
    detail: 'De 1,5 a 2,5 horas de Cali',
    refTicket: 220_000,
  },
} as const;

/** Política de reembolso (documento §6.1). Se acepta al reservar. */
export const REFUND_POLICY = [
  'Te devolvemos el 100 % si cancelas con 72 horas o más de anticipación.',
  'Te devolvemos el 50 % si cancelas entre 72 y 24 horas antes.',
  'Puedes ceder tu cupo a otra persona sin costo hasta el día de la salida.',
  'Si la salida no se realiza, te devolvemos el 100 %.',
];

/** Metas fijadas antes de salir (documento §4.3, §5.1, §6.3 y §6.4). */
export const TARGETS = {
  tc0ClicksPerVariant: 60,
  tc0DiffPp: 5,
  hostsAccepted: 3,
  hostsContacted: 15,
  paidBuyers: 5,
  conversionToPay: 0.25,
  cacMax: 10_400,
  newContactRate: 0.7,
  wouldReturnRate: 0.6,
  nps: 40,
  challengeRate: 0.5,
  hostConfirmsRate: 0.8, // 4 de 5
  repurchaseMin: 0.25,
};

export const publicConfig = () => ({
  holdHours: holdHours(),
  refundPolicy: REFUND_POLICY,
  channels: CHANNELS,
  lines: LINES,
});
