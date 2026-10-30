import {
  BASE,
  breakEvenBookings,
  cupoProm,
  fullModel,
  run,
  scenario,
  sensitivity,
  summary,
  ticketProm,
  unit,
} from './model';

/** Cifras de referencia: salida de `python3 docs/modelo.py` (docs/AiTrava-final.md §7). */
describe('modelo financiero (port de docs/modelo.py)', () => {
  const r = Math.round;

  it('ticket y cupo promedio', () => {
    expect(ticketProm(BASE)).toBe(104_000);
    expect(cupoProm(BASE)).toBeCloseTo(8.3, 10);
  });

  it('escenario base: 12 meses', () => {
    const rows = run(scenario('Base'));
    const s = summary(rows);
    expect(r(s.tot.resultado)).toBe(2_383_915);
    expect(r(s.tot.ingreso)).toBe(22_184_240);
    expect(r(s.tot.reservas)).toBe(1_067);
    expect(s.breakEven).toBe(5);
    expect(r(s.cajaMin)).toBe(-1_049_758);
    expect(s.cajaMinMes).toBe(4);
    // mes 4 incluye la formalización
    expect(rows[3].fijos).toBe(750_000);
    expect(r(rows[3].resultado)).toBe(-582_600);
    expect(r(rows[11].caja)).toBe(2_383_915);
  });

  it('escenarios pesimista y optimista', () => {
    const p = summary(run(scenario('Pesimista')));
    expect(r(p.tot.resultado)).toBe(-9_044_448);
    expect(r(p.tot.ingreso)).toBe(8_949_658);
    expect(p.breakEven).toBeNull();
    const o = summary(run(scenario('Optimista')));
    expect(r(o.tot.resultado)).toBe(12_205_480);
    expect(o.breakEven).toBe(1);
    expect(r(o.cajaMin)).toBe(12_775);
  });

  it('unidad económica por reserva', () => {
    expect(r(unit(BASE, 6).contribucion)).toBe(-5_413);
    expect(r(unit(BASE, 3).contribucion)).toBe(1_364);
    expect(r(unit(BASE, 3, 0.4).contribucion)).toBe(5_524);
  });

  it('punto de equilibrio ≈ 42 reservas al mes', () => {
    const be = breakEvenBookings(BASE);
    expect(r(be.unit.contribucion)).toBe(6_055);
    expect(Math.ceil(be.reservasMes!)).toBe(42);
  });

  it('sensibilidad: rango ordenado y valores del documento', () => {
    const s = sensitivity(BASE);
    const by = Object.fromEntries(
      s.map((x) => [x.name, [r(x.low), r(x.high)]]),
    );
    expect(by['Comisión 16 % / 24 %']).toEqual([-2_052_933, 6_820_763]);
    expect(by['CAC $18.000 / $7.000']).toEqual([-2_797_476, 4_701_906]);
    expect(by['Horas por salida 5 / 2 (desde el mes 4)']).toEqual([
      -1_936_085, 4_543_915,
    ]);
    expect(by['Cargo de servicio $0 / $5.000']).toEqual([2_383_915, 7_716_665]);
    expect(by['Ocupación −10 pp / +10 pp']).toEqual([556_521, 4_211_310]);
    expect(by['Recompra −15 pp / +15 pp']).toEqual([750_309, 4_047_733]);
    expect(s[0].name).toBe('Comisión 16 % / 24 %');
    for (let i = 1; i < s.length; i++)
      expect(s[i - 1].range).toBeGreaterThanOrEqual(s[i].range);
  });

  it('no muta los supuestos base', () => {
    const before = JSON.stringify(BASE);
    fullModel(BASE);
    expect(JSON.stringify(BASE)).toBe(before);
  });
});
