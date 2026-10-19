/**
 * Plan de ahorro inteligente (roadmap §1.1). Funciones puras, sin BD.
 *
 * Idea: un viaje no se paga todo el mismo día. El vuelo se compra ~60 días antes, el alojamiento ~30,
 * las actividades ~15, el seguro ~7 y los gastos en destino se necesitan al llegar. Un plan que solo
 * divide el total entre las cuotas que faltan deja al viajero sin plata para el vuelo a tiempo.
 * Este plan calcula la cuota MÍNIMA que paga cada cosa en su fecha, alineada con el día de pago
 * (viernes, quincena o fin de mes), y la va bajando cuando ya se cubrió lo más urgente.
 *
 * AITRAVA no custodia dinero: los aportes son declarados por el usuario.
 */

export type Frequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export const BUDGET_CATEGORIES = [
  'transporte',
  'alojamiento',
  'actividades',
  'comida',
  'seguros',
  'otros',
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
export type BudgetByCategory = Partial<Record<BudgetCategory, number>>;

/** Reparto sugerido cuando el usuario no detalla su presupuesto. */
export const DEFAULT_SPLIT: Record<BudgetCategory, number> = {
  transporte: 0.35,
  alojamiento: 0.3,
  actividades: 0.1,
  comida: 0.15,
  seguros: 0.03,
  otros: 0.07,
};

/** Hitos de pago: qué se paga y cuántos días antes del viaje se suele necesitar la plata. */
const MILESTONES: {
  key: string;
  label: string;
  categories: BudgetCategory[];
  leadDays: number;
}[] = [
  {
    key: 'transporte',
    label: 'Vuelos y transporte',
    categories: ['transporte'],
    leadDays: 60,
  },
  {
    key: 'alojamiento',
    label: 'Alojamiento',
    categories: ['alojamiento'],
    leadDays: 30,
  },
  {
    key: 'actividades',
    label: 'Actividades y entradas',
    categories: ['actividades'],
    leadDays: 15,
  },
  {
    key: 'seguros',
    label: 'Seguro de viaje',
    categories: ['seguros'],
    leadDays: 7,
  },
  {
    key: 'destino',
    label: 'Gastos en el destino',
    categories: ['comida', 'otros'],
    leadDays: 1,
  },
];

/** Categoría de una reserva → categoría del presupuesto. */
export const BOOKING_TO_BUDGET: Record<string, BudgetCategory> = {
  vuelo: 'transporte',
  transporte: 'transporte',
  alojamiento: 'alojamiento',
  actividad: 'actividades',
  restaurante: 'comida',
  seguro: 'seguros',
  otro: 'otros',
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  WEEKLY: 'cada viernes',
  BIWEEKLY: 'cada quincena (15 y fin de mes)',
  MONTHLY: 'cada fin de mes',
};

const DAY = 86_400_000;
const MONTHLY_FACTOR: Record<Frequency, number> = {
  WEEKLY: 52 / 12,
  BIWEEKLY: 2,
  MONTHLY: 1,
};

export const startOfDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const roundUp = (n: number, step = 1_000) => Math.ceil(n / step) * step;

/** Reparto del presupuesto por categoría (el detallado por el usuario, o el sugerido). */
export function splitBudget(
  total: number,
  byCat?: BudgetByCategory | null,
): Record<BudgetCategory, number> {
  const given = BUDGET_CATEGORIES.reduce((s, c) => s + (byCat?.[c] ?? 0), 0);
  if (byCat && given > 0) {
    return Object.fromEntries(
      BUDGET_CATEGORIES.map((c) => [c, Math.max(0, Math.round(byCat[c] ?? 0))]),
    ) as Record<BudgetCategory, number>;
  }
  const out = {} as Record<BudgetCategory, number>;
  let acc = 0;
  for (const c of BUDGET_CATEGORIES) {
    out[c] = Math.round((total * DEFAULT_SPLIT[c]) / 10_000) * 10_000;
    acc += out[c];
  }
  out.otros += total - acc;
  return out;
}

/** Días de pago estrictamente después de `from` y hasta `until` (inclusive). */
export function paydays(freq: Frequency, from: Date, until: Date): Date[] {
  const out: Date[] = [];
  for (let d = addDays(startOfDay(from), 1); d <= until; d = addDays(d, 1)) {
    const last = addDays(d, 1).getUTCDate() === 1;
    if (freq === 'WEEKLY' && d.getUTCDay() === 5) out.push(d);
    else if (freq === 'BIWEEKLY' && (d.getUTCDate() === 15 || last))
      out.push(d);
    else if (freq === 'MONTHLY' && last) out.push(d);
  }
  return out;
}

export type Milestone = {
  key: string;
  label: string;
  amount: number;
  dueDate: Date;
  /** "reserva" si la fecha sale de una reserva cargada; "sugerida" si es la anticipación típica. */
  dueSource: 'reserva' | 'sugerida';
  /** Plata acumulada que hace falta para cubrir este hito y todos los anteriores. */
  cumulative: number;
};

type BookingLike = {
  category: string;
  cost: number | null;
  startAt: Date | null;
  createdAt: Date;
};

/**
 * Hitos del viaje a partir del presupuesto. Si hay reservas con costo, el monto de la categoría es
 * el mayor entre lo presupuestado y lo reservado. La fecha es la anticipación típica, salvo que la
 * reserva ya exista (entonces se necesita desde que se creó, o sea ya).
 */
export function buildMilestones(params: {
  target: number;
  tripStart: Date;
  budgetAmount: number;
  budgetByCategory?: BudgetByCategory | null;
  bookings?: BookingLike[];
  today: Date;
}): Milestone[] {
  const today = startOfDay(params.today);
  const tripStart = startOfDay(params.tripStart);
  const split = splitBudget(params.budgetAmount, params.budgetByCategory);
  const booked: Partial<Record<BudgetCategory, number>> = {};
  for (const b of params.bookings ?? []) {
    const c = BOOKING_TO_BUDGET[b.category] ?? 'otros';
    booked[c] = (booked[c] ?? 0) + (b.cost ?? 0);
  }
  const raw = MILESTONES.map((m) => {
    const amount = m.categories.reduce(
      (s, c) => s + Math.max(split[c], booked[c] ?? 0),
      0,
    );
    const hasBooking = m.categories.some((c) => (booked[c] ?? 0) > 0);
    let due = addDays(tripStart, -m.leadDays);
    // Una reserva ya hecha se pagó/paga ahora: su plata se necesita desde hoy.
    if (hasBooking) due = today < due ? today : due;
    if (due < today) due = today;
    if (due > tripStart) due = tripStart;
    return {
      key: m.key,
      label: m.label,
      amount,
      dueDate: due,
      dueSource: hasBooking ? 'reserva' : 'sugerida',
    } as const;
  }).filter((m) => m.amount > 0);

  // El usuario puede ajustar la meta: los hitos se escalan para que sumen exactamente la meta.
  const sum = raw.reduce((s, m) => s + m.amount, 0) || 1;
  const scale = params.target / sum;
  const scaled = raw.map((m) => ({
    ...m,
    amount: Math.round(m.amount * scale),
  }));
  const diff = params.target - scaled.reduce((s, m) => s + m.amount, 0);
  if (scaled.length) scaled[scaled.length - 1].amount += diff;

  scaled.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  let acc = 0;
  return scaled.map((m) => ({ ...m, cumulative: (acc += m.amount) }));
}

export type ScheduleRow = {
  date: Date;
  amount: number;
  projected: number;
  completes: string[];
};

/**
 * Calendario de cuotas mínimas, no crecientes, que cubre cada hito en su fecha.
 * Algoritmo por tramos: la cuota del primer tramo es la mayor "necesidad por día de pago" entre
 * todos los hitos; cuando se cubre el hito que la define, se recalcula para lo que falta.
 */
export function buildSchedule(params: {
  milestones: Milestone[];
  saved: number;
  frequency: Frequency;
  from: Date;
}) {
  const { milestones, frequency } = params;
  const last = milestones.length
    ? milestones[milestones.length - 1].dueDate
    : startOfDay(params.from);
  const days = paydays(frequency, params.from, last);
  const amounts = new Array<number>(days.length).fill(0);
  const countUntil = (d: Date) => days.filter((p) => p <= d).length;

  // Hitos que no alcanzan a tener ni una cuota antes de su fecha: hay faltante en esa fecha.
  const shortfalls: {
    key: string;
    label: string;
    dueDate: Date;
    missing: number;
  }[] = [];
  let saved = params.saved;
  let idx = 0; // primer día de pago sin asignar
  let pending = milestones.filter((m) => m.cumulative > saved);
  while (pending.length) {
    let best = -1;
    let bestRate = 0;
    for (const m of pending) {
      const n = countUntil(m.dueDate) - idx;
      if (n <= 0) continue;
      const rate = (m.cumulative - saved) / n;
      if (rate >= bestRate) {
        bestRate = rate;
        best = milestones.indexOf(m);
      }
    }
    if (best < 0) break;
    const binding = milestones[best];
    const n = countUntil(binding.dueDate) - idx;
    const quota = roundUp(bestRate);
    for (let i = 0; i < n; i++) amounts[idx + i] = quota;
    saved += quota * n;
    idx += n;
    pending = milestones.filter(
      (m) => m.cumulative > saved && m.dueDate > binding.dueDate,
    );
  }

  // Proyección y en qué cuota se completa cada hito.
  const rows: ScheduleRow[] = [];
  let projected = params.saved;
  const done = new Set(
    milestones.filter((m) => m.cumulative <= projected).map((m) => m.key),
  );
  for (let i = 0; i < days.length; i++) {
    if (!amounts[i]) continue;
    projected += amounts[i];
    const completes = milestones
      .filter((m) => !done.has(m.key) && m.cumulative <= projected)
      .map((m) => m.key);
    completes.forEach((k) => done.add(k));
    rows.push({ date: days[i], amount: amounts[i], projected, completes });
  }
  for (const m of milestones) {
    const n = countUntil(m.dueDate);
    const funded =
      params.saved + amounts.slice(0, n).reduce((s, a) => s + a, 0);
    if (funded < m.cumulative) {
      shortfalls.push({
        key: m.key,
        label: m.label,
        dueDate: m.dueDate,
        missing: m.cumulative - funded,
      });
    }
  }
  const maxQuota = rows.reduce((mx, r) => Math.max(mx, r.amount), 0);
  return { rows, shortfalls, maxQuota, paydayCount: days.length };
}

/** Lo que daría "dividir el total entre las cuotas", para mostrar por qué el plan es distinto. */
export function naiveQuota(
  target: number,
  saved: number,
  frequency: Frequency,
  from: Date,
  tripStart: Date,
) {
  const n = paydays(frequency, from, addDays(startOfDay(tripStart), -1)).length;
  return n ? roundUp(Math.max(0, target - saved) / n) : 0;
}

export const monthlyEquivalent = (quota: number, f: Frequency) =>
  Math.round(quota * MONTHLY_FACTOR[f]);

type PlanInput = {
  targetAmount: number;
  initialSaved: number;
  frequency: Frequency;
  monthlyCapacity: number | null;
  startDate: Date;
  contributions: { amount: number; date: Date }[];
};

type TripInput = {
  startDate: Date;
  budgetAmount: number;
  budgetByCategory?: BudgetByCategory | null;
  bookings?: BookingLike[];
};

/** Todo lo que la pantalla "Meta de viaje" necesita. */
export function computePlan(
  plan: PlanInput,
  trip: TripInput,
  now = new Date(),
) {
  const today = startOfDay(now);
  const tripStart = startOfDay(trip.startDate);
  const target = plan.targetAmount;
  const saved =
    plan.initialSaved + plan.contributions.reduce((s, c) => s + c.amount, 0);
  const remaining = Math.max(0, target - saved);
  const progress = target
    ? Math.min(100, Math.round((saved / target) * 100))
    : 0;
  const daysToTrip = Math.round((tripStart.getTime() - today.getTime()) / DAY);

  const milestones = buildMilestones({
    target,
    tripStart,
    budgetAmount: trip.budgetAmount,
    budgetByCategory: trip.budgetByCategory,
    bookings: trip.bookings,
    today,
  });
  const schedule = buildSchedule({
    milestones,
    saved,
    frequency: plan.frequency,
    from: today,
  });

  // ¿Va al día? Se compara con lo que el plan original (desde que se creó) esperaba tener hoy.
  const planStart = startOfDay(plan.startDate);
  let expectedToday = plan.initialSaved;
  if (planStart < today) {
    const baseMilestones = buildMilestones({
      target,
      tripStart,
      budgetAmount: trip.budgetAmount,
      budgetByCategory: trip.budgetByCategory,
      bookings: trip.bookings,
      today: planStart,
    });
    const base = buildSchedule({
      milestones: baseMilestones,
      saved: plan.initialSaved,
      frequency: plan.frequency,
      from: planStart,
    });
    expectedToday += base.rows
      .filter((r) => r.date <= today)
      .reduce((s, r) => s + r.amount, 0);
    expectedToday = Math.min(expectedToday, target);
  }
  const delta = saved - expectedToday;
  const firstQuota = schedule.rows[0]?.amount ?? 0;
  let status: 'completed' | 'trip_started' | 'ahead' | 'on_track' | 'behind';
  if (saved >= target) status = 'completed';
  else if (daysToTrip <= 0) status = 'trip_started';
  else if (delta < 0 && -delta >= Math.max(1_000, firstQuota * 0.25))
    status = 'behind';
  else if (delta > firstQuota && firstQuota > 0) status = 'ahead';
  else status = 'on_track';

  // Capacidad mensual: ¿alcanza? Si no, opciones concretas.
  const monthlyNeeded = monthlyEquivalent(schedule.maxQuota, plan.frequency);
  const capacity = plan.monthlyCapacity ?? null;
  const suggestions: {
    kind:
      'move_date' | 'reduce_budget' | 'raise_quota' | 'frequency' | 'shortfall';
    text: string;
    value?: string | number;
  }[] = [];

  const feasibleWith = (shiftDays: number, scale = 1) => {
    const ms = buildMilestones({
      target: Math.round(target * scale),
      tripStart: addDays(tripStart, shiftDays),
      budgetAmount: trip.budgetAmount,
      budgetByCategory: trip.budgetByCategory,
      bookings: trip.bookings,
      today,
    });
    const s = buildSchedule({
      milestones: ms,
      saved,
      frequency: plan.frequency,
      from: today,
    });
    return {
      ok:
        !s.shortfalls.length &&
        (capacity == null ||
          monthlyEquivalent(s.maxQuota, plan.frequency) <= capacity),
    };
  };

  const fits =
    !schedule.shortfalls.length &&
    (capacity == null || monthlyNeeded <= capacity);
  if (status !== 'completed' && status !== 'trip_started' && !fits) {
    // 1. Fecha más cercana en la que sí alcanza (busca semana a semana, hasta 3 años).
    for (let w = 1; w <= 156; w++) {
      if (feasibleWith(w * 7).ok) {
        suggestions.push({
          kind: 'move_date',
          text: 'Mueve tu viaje y el plan cabe en tu bolsillo',
          value: addDays(tripStart, w * 7).toISOString(),
        });
        break;
      }
    }
    // 2. Presupuesto máximo que alcanza en las fechas actuales.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (feasibleWith(0, mid).ok) lo = mid;
      else hi = mid;
    }
    const maxTarget = Math.floor((target * lo) / 10_000) * 10_000;
    if (maxTarget > saved && maxTarget < target) {
      suggestions.push({
        kind: 'reduce_budget',
        text: 'Ajusta el presupuesto del viaje',
        value: target - maxTarget,
      });
    }
    if (capacity != null && monthlyNeeded > capacity) {
      suggestions.push({
        kind: 'raise_quota',
        text: 'Aumenta lo que ahorras al mes',
        value: monthlyNeeded - capacity,
      });
    }
    if (plan.frequency !== 'WEEKLY' && schedule.shortfalls.length) {
      suggestions.push({
        kind: 'frequency',
        text: 'Ahorra cada semana: tendrás más cuotas antes de las fechas de pago',
      });
    }
  }

  const nextRow = schedule.rows[0] ?? null;
  return {
    target,
    saved,
    remaining,
    progress,
    daysToTrip,
    frequency: plan.frequency,
    frequencyLabel: FREQUENCY_LABEL[plan.frequency],
    status,
    expectedToday,
    delta,
    next: nextRow ? { date: nextRow.date, amount: nextRow.amount } : null,
    monthlyNeeded,
    monthlyCapacity: capacity,
    fitsCapacity: capacity == null ? null : monthlyNeeded <= capacity,
    naiveQuota: naiveQuota(target, saved, plan.frequency, today, tripStart),
    milestones: milestones.map((m) => ({
      ...m,
      funded: saved >= m.cumulative,
      fundedOn:
        schedule.rows.find((r) => r.completes.includes(m.key))?.date ?? null,
    })),
    schedule: schedule.rows,
    shortfalls: schedule.shortfalls,
    suggestions,
  };
}
