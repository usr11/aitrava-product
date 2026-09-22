'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AXIS = { stroke: '#6d737c', fontSize: 12, tickLine: false, axisLine: false } as const;
const TOOLTIP = {
  contentStyle: { background: '#111316', border: '1px solid #3a3e45', borderRadius: 12, color: '#f8f9fa' },
  labelStyle: { color: '#b9bec6' },
  cursor: { fill: 'rgb(255 255 255 / 0.04)', stroke: '#3a3e45' },
} as const;

/** Barras horizontales de una sola serie (top de gustos, destinos, etc.). */
export function BarList({ data, color = '#ffd700' }: { data: { label: string; value: number }[]; color?: string }) {
  if (!data.length) return <Empty />;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.value}`}>
          <div className="flex justify-between text-sm">
            <span className="text-text-soft capitalize">{d.label}</span>
            <span className="font-mono text-muted">{d.value}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-line">
            <div className="h-2 rounded-full transition-all group-hover:opacity-80" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Embudo: cada paso con su conversión respecto al anterior y al inicio. */
export function Funnel({ data }: { data: { label: string; value: number }[] }) {
  const top = data[0]?.value || 1;
  return (
    <ol className="space-y-3">
      {data.map((d, i) => {
        const prev = i ? data[i - 1].value : d.value;
        const step = prev ? Math.round((d.value / prev) * 100) : 0;
        return (
          <li key={d.label} title={`${d.label}: ${d.value}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-text-soft">{d.label}</span>
              <span className="font-mono">
                <strong className="text-text">{d.value}</strong>
                {i > 0 && <span className="ml-2 text-muted-2">{step} % del paso anterior</span>}
              </span>
            </div>
            <div className="mt-1 h-7 rounded-md bg-line/60">
              <div className="h-7 rounded-md bg-primary" style={{ width: `${Math.max(2, (d.value / top) * 100)}%`, opacity: 1 - i * 0.09 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Paleta validada (dataviz/validate_palette.js, modo oscuro sobre #25282e).
const SERIES = [
  { key: 'page_view', name: 'Visitantes', color: '#3987e5' },
  { key: 'signup', name: 'Registros', color: '#d95926' },
  { key: 'trip_generated', name: 'Viajes generados', color: '#199e70' },
  { key: 'reservation', name: 'Reservas', color: '#c98500' },
];

export function DailyChart({ data }: { data: Record<string, number | string>[] }) {
  if (!data.length) return <Empty />;
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#2e3137" vertical={false} />
          <XAxis dataKey="day" {...AXIS} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis {...AXIS} allowDecimals={false} />
          <Tooltip {...TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#b9bec6' }} iconType="plainline" />
          {SERIES.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: '#25282e' }} activeDot={{ r: 6 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StepChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <Empty />;
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#2e3137" vertical={false} />
          <XAxis dataKey="label" {...AXIS} />
          <YAxis {...AXIS} allowDecimals={false} />
          <Tooltip {...TOOLTIP} />
          <Bar dataKey="value" name="Personas" fill="#ffd700" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Empty() {
  return <p className="py-8 text-center font-mono text-xs text-dim">Sin datos todavía</p>;
}
