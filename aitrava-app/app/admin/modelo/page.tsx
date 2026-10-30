'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminTitle, ExportButton, Metric, Table } from '@/components/admin/kit';
import { Alert, ErrorState, Field, LoadingState } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { formatCOP, formatCOPShort, formatPct } from '@/lib/format';

type Row = { mes: number; salidas: number; reservas: number; gmv: number; ingreso: number; cac: number; kit: number; horas: number; fijos: number; resultado: number; caja: number };
type LineA = { name: string; price: number; cupo: number; mix: number };
type Assumptions = {
  lines: LineA[];
  comision: number;
  feeServicio: number;
  salidas: number[];
  ocupacion: number[];
  recompra: number[];
  cac: number;
  kitSalida: number;
  horasSalida: number[];
  valorHora: number;
  fijos: number[];
};
type Unit = { ticket: number; ingreso: number; cac: number; kit: number; horas: number; contribucion: number; asistentes: number };
type Model = {
  ticketProm: number;
  cupoProm: number;
  scenarios: { name: 'Pesimista' | 'Base' | 'Optimista'; assumptions: Assumptions; rows: Row[]; tot: Record<string, number>; breakEven: number | null; cajaMin: number; cajaMinMes: number | null }[];
  unit: { pilotoNuevo: Unit; estandarNuevo: Unit; estandarRecompra40: Unit };
  breakEven: { unit: Unit; reservasMes: number | null; salidasMes: number | null };
  sensitivity: { name: string; low: number; high: number; range: number }[];
  baseResult: number;
};
type Actuals = {
  salidasDone: number;
  ticket: number | null;
  occupancy: number | null;
  cac: number | null;
  hours: number | null;
  repurchase: number | null;
  commission: number | null;
  kitPerSalida: number | null;
};

/** Colores de los escenarios: rojo = pesimista, pino = base, naranja = optimista. */
const COLORS = { Pesimista: 'var(--color-flare)', Base: 'var(--color-pine)', Optimista: 'var(--color-ember)' } as const;

type Overrides = {
  comision: string;
  feeServicio: string;
  cac: string;
  kitSalida: string;
  valorHora: string;
  prices: string[];
  mixes: string[];
  ocupacion?: number;
  horas?: number;
  recompra?: number;
};

const DEFAULT: Overrides = { comision: '20', feeServicio: '0', cac: '10400', kitSalida: '15000', valorHora: '15000', prices: ['65000', '110000', '220000'], mixes: ['50', '35', '15'] };

function body(o: Overrides, base: Assumptions | null) {
  if (!base) return {};
  const b: Record<string, unknown> = {
    comision: Number(o.comision) / 100,
    feeServicio: Number(o.feeServicio),
    cac: Number(o.cac),
    kitSalida: Number(o.kitSalida),
    valorHora: Number(o.valorHora),
    lines: base.lines.map((l, i) => ({ ...l, price: Number(o.prices[i]), mix: Number(o.mixes[i]) / 100 })),
  };
  if (o.ocupacion != null) b.ocupacion = Array(12).fill(o.ocupacion);
  if (o.horas != null) b.horasSalida = Array(12).fill(o.horas);
  if (o.recompra != null) b.recompra = Array(12).fill(o.recompra);
  return b;
}

export default function Modelo() {
  const [base, setBase] = useState<Model | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [o, setO] = useState<Overrides>(DEFAULT);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<'Pesimista' | 'Base' | 'Optimista'>('Base');
  const [actualsMsg, setActualsMsg] = useState<string | null>(null);

  useEffect(() => {
    api<Model>('/admin/model')
      .then((m) => {
        setBase(m);
        setModel(m);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar el modelo.'));
  }, []);

  const baseAssumptions = base?.scenarios.find((s) => s.name === 'Base')?.assumptions ?? null;
  const mixTotal = o.mixes.reduce((a, m) => a + Number(m || 0), 0);
  const payload = useMemo(() => JSON.stringify(body(o, baseAssumptions)), [o, baseAssumptions]);

  // Recalcula en el servidor (misma lógica probada contra modelo.py) con un pequeño retraso al escribir.
  useEffect(() => {
    if (!baseAssumptions || Math.abs(mixTotal - 100) > 0.1) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api<Model>('/admin/model', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal })
        .then((m) => {
          setModel(m);
          setError(null);
        })
        .catch((e) => {
          if (!ctrl.signal.aborted) setError(e instanceof ApiError ? e.message : 'No se pudo recalcular.');
        });
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [payload, baseAssumptions, mixTotal]);

  const useActuals = async () => {
    setActualsMsg(null);
    try {
      const a = await api<Actuals>('/admin/model/actuals');
      const applied: string[] = [];
      const next = { ...o };
      if (a.commission != null) {
        next.comision = String(Math.round(a.commission * 100));
        applied.push('comisión');
      }
      if (a.cac != null) {
        next.cac = String(Math.round(a.cac));
        applied.push('CAC');
      }
      if (a.kitPerSalida != null) {
        next.kitSalida = String(Math.round(a.kitPerSalida));
        applied.push('kit');
      }
      if (a.occupancy != null) {
        next.ocupacion = Math.min(1, a.occupancy);
        applied.push('ocupación');
      }
      if (a.hours != null) {
        next.horas = a.hours;
        applied.push('horas por salida');
      }
      if (a.repurchase != null) {
        next.recompra = a.repurchase;
        applied.push('recompra');
      }
      setO(next);
      setActualsMsg(
        applied.length
          ? `Con ${a.salidasDone} salidas reales se reemplazó: ${applied.join(', ')}. Lo demás sigue siendo estimado.`
          : 'Sin datos suficientes: todavía no hay salidas reales realizadas con pagos y costos registrados.',
      );
    } catch (e) {
      setActualsMsg(e instanceof ApiError ? e.message : 'No se pudieron leer los datos reales.');
    }
  };

  if (error && !model) return <ErrorState text={error} />;
  if (!model || !base) return <LoadingState rows={5} />;

  const sc = model.scenarios.find((s) => s.name === scenario)!;
  const chart = model.scenarios[0].rows.map((r, i) => ({
    mes: `M${r.mes}`,
    Pesimista: Math.round(model.scenarios[0].rows[i].caja),
    Base: Math.round(model.scenarios[1].rows[i].caja),
    Optimista: Math.round(model.scenarios[2].rows[i].caja),
  }));
  const set = (k: 'comision' | 'feeServicio' | 'cac' | 'kitSalida' | 'valorHora') => (e: React.ChangeEvent<HTMLInputElement>) => setO((p) => ({ ...p, [k]: e.target.value }));
  const setLine = (k: 'prices' | 'mixes', i: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setO((p) => ({ ...p, [k]: p[k].map((v, j) => (j === i ? e.target.value : v)) }));
  const changed = JSON.stringify(o) !== JSON.stringify(DEFAULT);
  const maxRange = Math.max(...model.sensitivity.map((s) => Math.max(Math.abs(s.low - model.baseResult), Math.abs(s.high - model.baseResult))), 1);

  return (
    <>
      <AdminTitle
        title="Modelo financiero"
        text="Port de docs/modelo.py: 12 meses, tres escenarios, unidad económica, equilibrio y sensibilidad. Cifras en COP; los supuestos son estimados hasta tener datos de campo."
        action={
          <>
            <button onClick={useActuals} className="btn btn-pine btn-sm">
              Usar datos reales
            </button>
            {changed && (
              <button
                onClick={() => {
                  setO(DEFAULT);
                  setActualsMsg(null);
                }}
                className="btn btn-line btn-sm"
              >
                Volver al documento
              </button>
            )}
            <ExportButton path="/admin/model/export.csv" file="aitrava-modelo-escenarios.csv" label="CSV para Excel" />
          </>
        }
      />
      {actualsMsg && (
        <div className="mb-4">
          <Alert>{actualsMsg}</Alert>
        </div>
      )}

      <details className="panel mb-6 p-4" open={changed}>
        <summary className="cursor-pointer font-bold">Supuestos (escenario base)</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="Comisión %" htmlFor="m-c">
            <input id="m-c" className="input tnum" type="number" min={0} max={60} value={o.comision} onChange={set('comision')} />
          </Field>
          <Field label="Cargo de servicio" htmlFor="m-f">
            <input id="m-f" className="input tnum" type="number" min={0} step={1000} value={o.feeServicio} onChange={set('feeServicio')} />
          </Field>
          <Field label="CAC" htmlFor="m-cac">
            <input id="m-cac" className="input tnum" type="number" min={0} step={100} value={o.cac} onChange={set('cac')} />
          </Field>
          <Field label="Kit por salida" htmlFor="m-k">
            <input id="m-k" className="input tnum" type="number" min={0} step={1000} value={o.kitSalida} onChange={set('kitSalida')} />
          </Field>
          <Field label="Valor hora equipo" htmlFor="m-h">
            <input id="m-h" className="input tnum" type="number" min={0} step={1000} value={o.valorHora} onChange={set('valorHora')} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {baseAssumptions?.lines.map((l, i) => (
            <fieldset key={l.name} className="rounded-xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">
                {l.name} · cupo {l.cupo}
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio" htmlFor={`m-p${i}`}>
                  <input id={`m-p${i}`} className="input tnum" type="number" min={0} step={1000} value={o.prices[i]} onChange={setLine('prices', i)} />
                </Field>
                <Field label="Mezcla %" htmlFor={`m-x${i}`}>
                  <input id={`m-x${i}`} className="input tnum" type="number" min={0} max={100} value={o.mixes[i]} onChange={setLine('mixes', i)} />
                </Field>
              </div>
            </fieldset>
          ))}
        </div>
        {Math.abs(mixTotal - 100) > 0.1 && <p className="error-text">La mezcla suma {mixTotal} %: debe sumar 100 %.</p>}
        {(o.ocupacion != null || o.horas != null || o.recompra != null) && (
          <p className="mt-3 text-sm text-ink-2">
            Datos reales aplicados a los 12 meses:
            {o.ocupacion != null && ` ocupación ${formatPct(o.ocupacion)}`}
            {o.horas != null && ` · ${o.horas.toLocaleString('es-CO', { maximumFractionDigits: 1 })} h por salida`}
            {o.recompra != null && ` · recompra ${formatPct(o.recompra)}`}
          </p>
        )}
        {error && <p className="error-text">{error}</p>}
      </details>

      <div className="grid gap-3 md:grid-cols-3">
        {model.scenarios.map((s) => (
          <button
            key={s.name}
            onClick={() => setScenario(s.name)}
            aria-pressed={scenario === s.name}
            className={`panel p-4 text-left transition-colors ${scenario === s.name ? 'border-pine ring-2 ring-pine' : 'hover:border-ink-3'}`}
          >
            <span className="flex items-center gap-2 font-bold">
              <span className="size-3 rounded-full" style={{ background: COLORS[s.name] }} aria-hidden />
              {s.name}
            </span>
            <span className={`display tnum mt-2 block text-[1.8rem] ${s.tot.resultado < 0 ? 'text-flare-ink' : ''}`}>{formatCOPShort(s.tot.resultado)}</span>
            <span className="block text-sm text-ink-2">Resultado a 12 meses</span>
            <span className="mt-2 block text-sm text-ink-3">
              {Math.round(s.tot.reservas).toLocaleString('es-CO')} reservas · ingreso {formatCOPShort(s.tot.ingreso)}
              <br />
              Primer mes positivo: {s.breakEven ? `mes ${s.breakEven}` : 'nunca'} · caja mínima {formatCOPShort(s.cajaMin)}
            </span>
          </button>
        ))}
      </div>

      <section className="panel mt-6 p-4">
        <h2 className="font-bold">Caja acumulada</h2>
        <div className="mt-3 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-ink-2)' }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v: number) => formatCOPShort(v)} tick={{ fontSize: 12, fill: 'var(--color-ink-2)' }} width={78} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-line)', borderRadius: 10 }} />
              <Legend />
              <ReferenceLine y={0} stroke="var(--color-ink-3)" />
              {(['Pesimista', 'Base', 'Optimista'] as const).map((n) => (
                <Line key={n} type="monotone" dataKey={n} stroke={COLORS[n]} strokeWidth={n === 'Base' ? 3 : 2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="title text-[1.4rem]">Proyección mensual · {scenario}</h2>
        <div className="mt-4">
          <Table min={900}>
            <thead>
              <tr>
                {['Mes', 'Salidas', 'Reservas', 'Valor reservado', 'Ingreso AiTrava', 'CAC', 'Kit + horas', 'Fijos', 'Resultado', 'Caja'].map((h) => (
                  <th key={h} className={h === 'Mes' ? '' : 'text-right'}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sc.rows.map((r) => (
                <tr key={r.mes}>
                  <td>{r.mes}</td>
                  <td className="tnum text-right">{r.salidas}</td>
                  <td className="tnum text-right">{Math.round(r.reservas)}</td>
                  <td className="tnum text-right">{formatCOP(r.gmv)}</td>
                  <td className="tnum text-right">{formatCOP(r.ingreso)}</td>
                  <td className="tnum text-right">{formatCOP(r.cac)}</td>
                  <td className="tnum text-right">{formatCOP(r.kit + r.horas)}</td>
                  <td className="tnum text-right">{formatCOP(r.fijos)}</td>
                  <td className={`tnum text-right font-semibold ${r.resultado < 0 ? 'text-flare-ink' : 'text-forest'}`}>{formatCOP(r.resultado)}</td>
                  <td className={`tnum text-right ${r.caja < 0 ? 'text-flare-ink' : ''}`}>{formatCOP(r.caja)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2 [&>*]:min-w-0">
        <div>
          <h2 className="title text-[1.4rem]">Unidad económica por reserva</h2>
          <div className="mt-4">
            <Table min={520}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th className="text-right">Piloto (nuevo)</th>
                  <th className="text-right">Estándar 3 h</th>
                  <th className="text-right">3 h, 40 % recompra</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['Ingreso', 'ingreso', 1],
                    ['CAC', 'cac', -1],
                    ['Kit', 'kit', -1],
                    ['Horas del equipo', 'horas', -1],
                  ] as const
                ).map(([label, k, sign]) => (
                  <tr key={k}>
                    <td>{label}</td>
                    {[model.unit.pilotoNuevo, model.unit.estandarNuevo, model.unit.estandarRecompra40].map((u, i) => (
                      <td key={i} className="tnum text-right">
                        {sign < 0 ? '−' : ''}
                        {formatCOP(u[k])}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="font-bold">Contribución</td>
                  {[model.unit.pilotoNuevo, model.unit.estandarNuevo, model.unit.estandarRecompra40].map((u, i) => (
                    <td key={i} className={`tnum text-right font-bold ${u.contribucion < 0 ? 'text-flare-ink' : 'text-forest'}`}>
                      {formatCOP(u.contribucion)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric label="Ticket promedio" value={formatCOP(model.ticketProm)} hint={`Cupo promedio ${model.cupoProm.toLocaleString('es-CO', { maximumFractionDigits: 1 })}`} />
            <Metric
              label="Punto de equilibrio"
              value={model.breakEven.reservasMes == null ? 'No se alcanza' : `${Math.ceil(model.breakEven.reservasMes)} reservas/mes`}
              hint={
                model.breakEven.salidasMes == null
                  ? 'La contribución por reserva es negativa.'
                  : `≈ ${Math.ceil(model.breakEven.salidasMes)} salidas al mes para cubrir $250.000 de fijos (aporte ${formatCOP(model.breakEven.unit.contribucion)} por reserva)`
              }
            />
          </div>
        </div>
        <div>
          <h2 className="title text-[1.4rem]">Sensibilidad del resultado a 12 meses</h2>
          <p className="mt-1 text-ink-2">Base: {formatCOP(model.baseResult)}. Barras: peor y mejor valor de cada variable.</p>
          <ul className="mt-4 space-y-4">
            {model.sensitivity.map((s) => {
              const lo = ((s.low - model.baseResult) / maxRange) * 50;
              const hi = ((s.high - model.baseResult) / maxRange) * 50;
              const left = 50 + Math.min(lo, hi);
              const width = Math.max(Math.abs(hi - lo), 0.5);
              return (
                <li key={s.name}>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <div className="relative mt-1 h-5 rounded bg-paper-2">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-ink-3" aria-hidden />
                    <span className="absolute inset-y-0.5 rounded bg-forest" style={{ left: `${left}%`, width: `${width}%` }} />
                  </div>
                  <p className="tnum mt-1 flex justify-between text-xs text-ink-2">
                    <span className={s.low < 0 ? 'text-flare-ink' : ''}>{formatCOPShort(s.low)}</span>
                    <span>{formatCOPShort(s.high)}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
