'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, apiBlob, saveBlob } from '@/lib/api';
import { Icon, type IconName } from '../Icon';

export function AdminTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-text-2">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon?: IconName }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-text-2">
        {icon && <Icon name={icon} size={14} />} {label}
      </p>
      <p className="num mt-1 text-2xl font-extrabold text-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-text-3">{hint}</p>}
    </div>
  );
}

export function ExportButton({ entity, label = 'Exportar CSV' }: { entity: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          saveBlob(await apiBlob(`/admin/export/${entity}.csv`), `aitrava-${entity}.csv`);
        } finally {
          setBusy(false);
        }
      }}
      className="btn btn-outline btn-sm"
    >
      <Icon name="download" size={16} /> {busy ? 'Exportando…' : label}
    </button>
  );
}

/** Rango de fechas: Hoy, 7 días, 30 días, Mes actual, Todo, Personalizado. */
export type Range = { from?: string; to?: string; key: string };

export function useRange(initial = '30d') {
  const [range, setRange] = useState<Range>(() => rangeFor(initial));
  return { range, setRange };
}

export function rangeFor(key: string, custom?: { from: string; to: string }): Range {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === 'hoy') return { key, from: startOfDay.toISOString() };
  if (key === '7d') return { key, from: new Date(startOfDay.getTime() - 6 * 86_400_000).toISOString() };
  if (key === '30d') return { key, from: new Date(startOfDay.getTime() - 29 * 86_400_000).toISOString() };
  if (key === 'mes') return { key, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  if (key === 'custom' && custom?.from)
    return { key, from: new Date(`${custom.from}T00:00:00`).toISOString(), to: custom.to ? new Date(new Date(`${custom.to}T00:00:00`).getTime() + 86_400_000).toISOString() : undefined };
  return { key: 'todo' };
}

export const rangeQuery = (r: Range) => {
  const q = new URLSearchParams();
  if (r.from) q.set('from', r.from);
  if (r.to) q.set('to', r.to);
  const s = q.toString();
  return s ? `?${s}` : '';
};

export function RangePicker({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  const [custom, setCustom] = useState({ from: '', to: '' });
  const opts = [
    ['hoy', 'Hoy'],
    ['7d', '7 días'],
    ['30d', '30 días'],
    ['mes', 'Mes actual'],
    ['todo', 'Todo'],
    ['custom', 'Personalizado'],
  ];
  return (
    <div className="mb-6">
      <div className="scroll-x -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Rango de fechas">
        {opts.map(([k, l]) => (
          <button key={k} className="chip shrink-0 py-2" aria-pressed={range.key === k} onClick={() => (k === 'custom' ? onChange({ ...range, key: 'custom' }) : onChange(rangeFor(k)))}>
            {l}
          </button>
        ))}
      </div>
      {range.key === 'custom' && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="label">Desde</span>
            <input type="date" className="input" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="label">Hasta</span>
            <input type="date" className="input" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </label>
          <button className="btn btn-navy" disabled={!custom.from} onClick={() => onChange(rangeFor('custom', custom))}>
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}


/** Carga datos del panel y permite recargar. */
export function useAdminData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    api<T>(path)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [path]);
  useEffect(load, [load]);
  return { data, error, reload: load, setData };
}

export type Metrics = {
  kpis: Record<string, number>;
  funnel: { key: string; label: string; value: number; fromPrevious: number; fromStart: number }[];
  daily: Record<string, number | string>[];
  events: { name: string; people: number; total: number }[];
};

export const DAILY_SERIES = [
  { key: 'page_view', name: 'Visitantes' },
  { key: 'signup_completed', name: 'Registros' },
  { key: 'trip_created', name: 'Viajes creados' },
  { key: 'checkout_viewed', name: 'Checkouts' },
];

