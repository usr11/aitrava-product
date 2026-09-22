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

export type TripPlan = {
  destinationId: string;
  destinationName: string;
  reason: string;
  vibes: string[];
  clues: ClueDraft[];
  itinerary: ItineraryDay[];
  aiGenerated: boolean;
};

/** Modelo de ingresos: una comisión por viaje, incluida dentro del tope del cliente (transparente). */
export const COMMISSION_RATE = 0.1;
export const MAX_REROLLS = 2;
export const DEPOSIT_AMOUNT = 50_000;

/** Mismo reparto que la landing: 39 % transporte, 32 % alojamiento, 29 % experiencias (sobre el neto después de la comisión). */
export const computeBreakdown = (budgetTotal: number) => {
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const comision = round(budgetTotal * COMMISSION_RATE);
  const net = budgetTotal - comision;
  const transporte = round(net * 0.39);
  const alojamiento = round(net * 0.32);
  const experiencias = net - transporte - alojamiento;
  return {
    transporte,
    alojamiento,
    experiencias,
    comision,
    commissionRate: COMMISSION_RATE,
    total: budgetTotal,
  };
};
