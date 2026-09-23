export type TripPreferences = {
  originCity: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetTotal: number;
  vibes: string[];
  avoid: string[];
  isGift?: boolean;
  giftTo?: string;
  giftMessage?: string;
  excluded?: string[]; // destinos descartados por re-sorteo
};

export type TravelDna = {
  tagCounts: Record<string, number>;
  visited: string[];
};

export type ClueDraft = { type: string; text: string };
export type ItineraryDay = { day: number; title: string; items: string[] };

export type Provider = {
  name: string;
  detail: string;
  /** Comisión que nos paga el aliado por llevarle el cliente y gestionar la reserva. */
  rate: number;
};

export type Booking = {
  transporte: Provider & { amount: number };
  alojamiento: Provider & { amount: number };
  experiencias: (Provider & { amount: number })[];
};

export type TripPlan = {
  destinationId: string;
  destinationName: string;
  reason: string;
  vibes: string[];
  clues: ClueDraft[];
  itinerary: ItineraryDay[];
  booking: Booking;
  aiGenerated: boolean;
};

/**
 * Modelo de ingresos (decidido el 2026-09-23):
 *  1. Tarifa fija de $50.000 por viaje, que sale del tope que pone el cliente.
 *  2. Comisión de los aliados (transporte, alojamiento y experiencias) por promover el destino
 *     y gestionar toda la reserva. Cada aliado tiene su `rate` en el catálogo.
 */
export const COMMISSION_FIXED = 50_000;
export const DEPOSIT_RATE = 0.2; // "apartar" = 20 % del viaje
export const MAX_REROLLS = 2;

export const depositFor = (total: number) =>
  Math.round((total * DEPOSIT_RATE) / 10_000) * 10_000;

/** Mismo reparto que la landing: 39 % transporte, 32 % alojamiento, 29 % experiencias (sobre el neto tras la tarifa fija). */
export const computeBreakdown = (budgetTotal: number) => {
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const comision = COMMISSION_FIXED;
  const net = budgetTotal - comision;
  const transporte = round(net * 0.39);
  const alojamiento = round(net * 0.32);
  const experiencias = net - transporte - alojamiento;
  return {
    transporte,
    alojamiento,
    experiencias,
    comision,
    total: budgetTotal,
  };
};

/** Lo que nos dejan los aliados por el viaje, según lo que se reserva con cada uno. */
export const partnerCommissionOf = (booking: Booking) =>
  Math.round(
    booking.transporte.amount * booking.transporte.rate +
      booking.alojamiento.amount * booking.alojamiento.rate +
      booking.experiencias.reduce((sum, e) => sum + e.amount * e.rate, 0),
  );
