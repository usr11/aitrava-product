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

export type Plan = 'basico' | 'plus' | 'dorado';

export const PLANS: Record<
  Plan,
  { name: string; feeRate: number; addOn: number }
> = {
  basico: { name: 'Básico', feeRate: 0.08, addOn: 0 },
  plus: { name: 'Plus', feeRate: 0.12, addOn: 0 },
  dorado: { name: 'Sobre Dorado', feeRate: 0.15, addOn: 89_000 },
};

export const EXTRA_CLUE_PRICE = 9_900;
export const REROLL_PRICE = 19_900;
export const DEPOSIT_AMOUNT = 50_000;

/** Mismo reparto que la landing: 39 % transporte, 32 % alojamiento, 29 % experiencias (sobre el neto después de la tarifa). */
export const computeBreakdown = (
  budgetTotal: number,
  plan: Plan = 'basico',
) => {
  const { feeRate, addOn, name } = PLANS[plan];
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const tarifa = round(budgetTotal * feeRate);
  const net = budgetTotal - tarifa;
  const transporte = round(net * 0.39);
  const alojamiento = round(net * 0.32);
  const experiencias = net - transporte - alojamiento;
  return {
    plan,
    planName: name,
    transporte,
    alojamiento,
    experiencias,
    tarifa,
    addOn,
    total: budgetTotal + addOn,
  };
};
