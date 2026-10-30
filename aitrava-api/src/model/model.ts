/**
 * Modelo financiero de AiTrava a 12 meses: port fiel de docs/modelo.py (funciones puras).
 * Todas las cifras en COP. Los supuestos son estimaciones [EST] y se reemplazan con datos de campo.
 * model.spec.ts comprueba que reproduce las cifras del documento (docs/AiTrava-final.md §7).
 */

export type Line = { name: string; price: number; cupo: number; mix: number };

export type Assumptions = {
  lines: Line[];
  comision: number;
  feeServicio: number; // cargo extra al viajero por reserva
  salidas: number[]; // 12 meses
  ocupacion: number[];
  recompra: number[]; // participación de reservas sin CAC
  cac: number;
  kitSalida: number;
  horasSalida: number[];
  valorHora: number;
  fijos: number[];
  formalizacion: { mes: number; costo: number };
};

export type MonthRow = {
  mes: number;
  salidas: number;
  reservas: number;
  gmv: number;
  ingreso: number;
  cac: number;
  kit: number;
  horas: number;
  fijos: number;
  resultado: number;
  caja: number;
};

export type ScenarioName = 'Pesimista' | 'Base' | 'Optimista';

/** n veces el mismo valor (tipado, a diferencia de Array(n).fill). */
const rep = (n: number, v: number): number[] =>
  Array.from({ length: n }, () => v);

const range12 = <T>(f: (i: number) => T): T[] =>
  Array.from({ length: 12 }, (_, i) => f(i));

export const BASE: Assumptions = {
  lines: [
    { name: 'L1 Urbano', price: 65_000, cupo: 8, mix: 0.5 },
    { name: 'L2 Naturaleza', price: 110_000, cupo: 8, mix: 0.35 },
    { name: 'L3 Escapada', price: 220_000, cupo: 10, mix: 0.15 },
  ],
  comision: 0.2,
  feeServicio: 0,
  salidas: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
  ocupacion: [
    0.7, 0.7, 0.75, 0.75, 0.8, 0.8, 0.8, 0.85, 0.85, 0.85, 0.85, 0.85,
  ],
  recompra: [0, 0.1, 0.2, 0.25, 0.3, 0.35, 0.35, 0.4, 0.4, 0.4, 0.4, 0.4],
  cac: 10_400,
  kitSalida: 15_000,
  horasSalida: [6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  valorHora: 15_000,
  fijos: [...rep(3, 20_000), ...rep(9, 250_000)],
  formalizacion: { mes: 4, costo: 500_000 },
};

const clone = (a: Assumptions): Assumptions => structuredClone(a);

export function scenario(name: ScenarioName, base: Assumptions = BASE) {
  const e = clone(base);
  if (name === 'Pesimista') {
    e.comision = 0.16;
    e.cac = 18_000;
    e.salidas = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    e.ocupacion = base.ocupacion.map((o) => o - 0.1);
    e.recompra = base.recompra.map((r) => r * 0.6);
    e.horasSalida = [...rep(6, 6), ...rep(6, 4)];
  }
  if (name === 'Optimista') {
    e.cac = 7_000;
    e.feeServicio = 5_000;
    e.ocupacion = base.ocupacion.map((o) => Math.min(o + 0.05, 0.95));
    e.recompra = base.recompra.map((r) => Math.min(r + 0.1, 0.55));
  }
  return e;
}

export const ticketProm = (a: Assumptions) =>
  a.lines.reduce((s, l) => s + l.price * l.mix, 0);

/** Cupo promedio por salida, ponderado por la mezcla. */
export const cupoProm = (a: Assumptions) =>
  a.lines.reduce((s, l) => s + l.cupo * l.mix, 0);

export function run(e: Assumptions): MonthRow[] {
  const tk = ticketProm(e);
  const cupo = cupoProm(e);
  let caja = 0;
  return range12((m) => {
    const sal = e.salidas[m];
    const res = sal * cupo * e.ocupacion[m];
    const nuevas = res * (1 - e.recompra[m]);
    const gmv = res * tk;
    const ingreso = gmv * e.comision + res * e.feeServicio;
    const cac = nuevas * e.cac;
    const kit = sal * e.kitSalida;
    const horas = sal * e.horasSalida[m] * e.valorHora;
    const fijos =
      e.fijos[m] + (m + 1 === e.formalizacion.mes ? e.formalizacion.costo : 0);
    const resultado = ingreso - cac - kit - horas - fijos;
    caja += resultado;
    return {
      mes: m + 1,
      salidas: sal,
      reservas: res,
      gmv,
      ingreso,
      cac,
      kit,
      horas,
      fijos,
      resultado,
      caja,
    };
  });
}

const TOTAL_KEYS = [
  'reservas',
  'gmv',
  'ingreso',
  'cac',
  'kit',
  'horas',
  'fijos',
  'resultado',
] as const;

export function summary(rows: MonthRow[]) {
  const tot = Object.fromEntries(
    TOTAL_KEYS.map((k) => [k, rows.reduce((s, r) => s + r[k], 0)]),
  ) as Record<(typeof TOTAL_KEYS)[number], number>;
  const breakEven = rows.find((r) => r.resultado > 0)?.mes ?? null;
  const cajaMin = Math.min(...rows.map((r) => r.caja));
  const cajaMinMes = rows.find((r) => r.caja === cajaMin)?.mes ?? null;
  return { tot, breakEven, cajaMin, cajaMinMes };
}

/** Unidad económica por reserva. */
export function unit(
  e: Assumptions,
  horas: number,
  recompra = 0,
  asistentes?: number,
) {
  const tk = ticketProm(e);
  const asist = asistentes ?? cupoProm(e) * 0.8;
  const ingreso = tk * e.comision + e.feeServicio;
  const cac = e.cac * (1 - recompra);
  const kit = e.kitSalida / asist;
  const hr = (horas * e.valorHora) / asist;
  return {
    ticket: tk,
    ingreso,
    cac,
    kit,
    horas: hr,
    contribucion: ingreso - cac - kit - hr,
    asistentes: asist,
  };
}

/** Reservas al mes que cubren los fijos en estado estándar (3 h, recompra 40 %, ocupación 85 %). */
export function breakEvenBookings(e: Assumptions, fijosMes = 250_000) {
  const u = unit(e, 3, 0.4, cupoProm(e) * 0.85);
  return {
    unit: u,
    reservasMes: u.contribucion > 0 ? fijosMes / u.contribucion : null,
    salidasMes:
      u.contribucion > 0 ? fijosMes / u.contribucion / u.asistentes : null,
  };
}

type Tweak = (e: Assumptions) => Partial<Assumptions>;

const SENSITIVITY: { name: string; low: Tweak; high: Tweak }[] = [
  {
    name: 'Comisión 16 % / 24 %',
    low: () => ({ comision: 0.16 }),
    high: () => ({ comision: 0.24 }),
  },
  {
    name: 'CAC $18.000 / $7.000',
    low: () => ({ cac: 18_000 }),
    high: () => ({ cac: 7_000 }),
  },
  {
    name: 'Horas por salida 5 / 2 (desde el mes 4)',
    low: () => ({ horasSalida: [6, 6, 6, ...rep(9, 5)] }),
    high: () => ({ horasSalida: [6, 6, 6, ...rep(9, 2)] }),
  },
  {
    name: 'Cargo de servicio $0 / $5.000',
    low: () => ({ feeServicio: 0 }),
    high: () => ({ feeServicio: 5_000 }),
  },
  {
    name: 'Ocupación −10 pp / +10 pp',
    low: (b) => ({ ocupacion: b.ocupacion.map((o) => o - 0.1) }),
    high: (b) => ({ ocupacion: b.ocupacion.map((o) => Math.min(o + 0.1, 1)) }),
  },
  {
    name: 'Recompra −15 pp / +15 pp',
    low: (b) => ({ recompra: b.recompra.map((r) => Math.max(r - 0.15, 0)) }),
    high: (b) => ({ recompra: b.recompra.map((r) => Math.min(r + 0.15, 0.6)) }),
  },
];

/** Resultado acumulado a 12 meses con el peor y el mejor valor de cada variable, de mayor a menor rango. */
export function sensitivity(base: Assumptions) {
  const result = (e: Assumptions) => summary(run(e)).tot.resultado;
  return SENSITIVITY.map(({ name, low, high }) => {
    const lo = result({ ...clone(base), ...low(base) });
    const hi = result({ ...clone(base), ...high(base) });
    return { name, low: lo, high: hi, range: Math.abs(hi - lo) };
  }).sort((a, b) => b.range - a.range);
}

/** Todo lo que muestra /admin/modelo para un juego de supuestos base. */
export function fullModel(base: Assumptions = BASE) {
  const scenarios = (['Pesimista', 'Base', 'Optimista'] as const).map((n) => {
    const a = scenario(n, base);
    const rows = run(a);
    return { name: n, assumptions: a, rows, ...summary(rows) };
  });
  return {
    ticketProm: ticketProm(base),
    cupoProm: cupoProm(base),
    scenarios,
    unit: {
      pilotoNuevo: unit(base, base.horasSalida[0]),
      estandarNuevo: unit(base, 3),
      estandarRecompra40: unit(base, 3, 0.4),
    },
    breakEven: breakEvenBookings(base),
    sensitivity: sensitivity(base),
    baseResult: summary(run(base)).tot.resultado,
  };
}
