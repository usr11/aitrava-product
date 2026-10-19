'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCOP } from '@/lib/format';

// Paleta categórica validada (skill dataviz, modo claro), en orden fijo.
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
const AXIS = { stroke: '#7d8ba1', fontSize: 12, tickLine: false, axisLine: false } as const;
const TOOLTIP = {
  contentStyle: { background: '#ffffff', border: '1px solid #e3e8f0', borderRadius: 12, color: '#0b1f3a', boxShadow: '0 8px 24px rgb(11 31 58 / .08)' },
  labelStyle: { color: '#4f5f77', fontWeight: 600 },
  cursor: { stroke: '#cdd6e3', fill: 'rgb(11 31 58 / 0.04)' },
} as const;

export function EmptyChart({ text = 'Sin datos suficientes.' }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-text-3">{text}</p>;
}

/** Serie diaria (personas únicas por día). Una sola escala. */
export function DailyChart({ data, series }: { data: Record<string, number | string>[]; series: { key: string; name: string }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-72" role="img" aria-label="Actividad diaria">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="day" {...AXIS} tickFormatter={(d: string) => d.slice(5)} minTickGap={16} />
          <YAxis {...AXIS} allowDecimals={false} />
          <Tooltip {...TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#4f5f77' }} iconType="plainline" />
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={SERIES_COLORS[i]} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: SERIES_COLORS[i] }} activeDot={{ r: 6, fill: SERIES_COLORS[i] }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: { month: string; revenue: number; sales: number }[] }) {
  if (!data.length) return <EmptyChart text="Aún no hay pagos aprobados." />;
  return (
    <div className="h-64" role="img" aria-label="Ingresos por mes">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} width={56} />
          <Tooltip {...TOOLTIP} formatter={(v) => [formatCOP(Number(v)), 'Ingresos']} />
          <Bar dataKey="revenue" name="Ingresos" fill={SERIES_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Embudo como barras horizontales con conversión respecto al paso anterior y al inicio. */
export function FunnelChart({ data }: { data: { label: string; value: number; fromPrevious: number; fromStart: number }[] }) {
  const top = data[0]?.value || 0;
  if (!top && !data.some((d) => d.value)) return <EmptyChart />;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ol className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label} title={`${d.label}: ${d.value}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-navy">
              {i + 1}. {d.label}
            </span>
            <span className="num shrink-0 text-text-2">
              <strong className="text-navy">{d.value}</strong>
              {i > 0 && data[i - 1].value > 0 && <span className="ml-2">{d.fromPrevious} % del anterior</span>}
            </span>
          </div>
          <div className="mt-1 h-6 rounded-md bg-surface">
            <div className="h-6 rounded-md" style={{ width: `${Math.max(d.value ? 2 : 0, (d.value / max) * 100)}%`, background: SERIES_COLORS[0] }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
