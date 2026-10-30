'use client';

import { useState } from 'react';
import { API_URL, ApiError, tokenStore } from '@/lib/api';
import { formatPct } from '@/lib/format';
import type { ReservationStatus } from '@/lib/types';
import { Icon } from '../Icon';
import { Badge } from '../ui';

export function AdminTitle({ title, text, action }: { title: string; text?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="title text-[1.9rem] sm:text-[2.2rem]">{title}</h1>
        {text && <div className="mt-1.5 text-ink-2">{text}</div>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

/** Un número contra su meta. ok = cumple, bad = no cumple, null = sin datos suficientes. */
export function Metric({
  label,
  value,
  target,
  ok,
  hint,
}: {
  label: string;
  value: string;
  target?: string;
  ok?: boolean | null;
  hint?: string;
}) {
  return (
    <div className="panel flex flex-col gap-1 p-4">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="display tnum text-[1.9rem] leading-none">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        {target && <span className="text-ink-3">Meta {target}</span>}
        {ok === true && <Badge tone="ok">Cumple</Badge>}
        {ok === false && <Badge tone="bad">No cumple</Badge>}
        {ok === null && target && <Badge>Sin datos suficientes</Badge>}
      </div>
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

/** Indicador con n: "73 % (n = 11)". */
export const pctN = (v: { value: number | null; n: number }) => (v.value == null ? '—' : `${formatPct(v.value)}`);

export const STATUS: Record<ReservationStatus, { label: string; tone: 'info' | 'ok' | 'warn' | 'bad' | 'pine' | 'ember' }> = {
  requested: { label: 'Apartada', tone: 'warn' },
  confirmed: { label: 'Confirmada', tone: 'info' },
  payment_reported: { label: 'Pago reportado', tone: 'ember' },
  paid: { label: 'Pagada', tone: 'ok' },
  attended: { label: 'Asistió', tone: 'pine' },
  no_show: { label: 'No llegó', tone: 'bad' },
  cancelled: { label: 'Cancelada', tone: 'bad' },
  expired: { label: 'Vencida', tone: 'bad' },
};

/** Lo que el equipo puede hacer desde cada estado (espejo de ADMIN_TRANSITIONS del backend, que es quien manda). */
export const NEXT: Record<ReservationStatus, ReservationStatus[]> = {
  requested: ['confirmed', 'payment_reported', 'paid', 'cancelled', 'expired'],
  confirmed: ['payment_reported', 'paid', 'cancelled', 'requested'],
  payment_reported: ['paid', 'confirmed', 'cancelled'],
  paid: ['attended', 'no_show', 'cancelled'],
  attended: ['paid', 'no_show'],
  no_show: ['attended', 'paid'],
  cancelled: ['requested'],
  expired: ['requested'],
};

export function StatusBadge({ status, expired }: { status: ReservationStatus; expired?: boolean }) {
  const s = expired ? STATUS.expired : STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** Descarga un CSV protegido (con la sesión) sin abrir una URL pública. */
export function ExportButton({ path, file, label = 'Exportar CSV' }: { path: string; file: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/api${path}`, { headers: { Authorization: `Bearer ${tokenStore.get() ?? ''}` } });
      if (!res.ok) throw new ApiError('No se pudo exportar', res.status);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setErr('No se pudo exportar. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <span className="inline-flex flex-col">
      <button onClick={go} disabled={busy} className="btn btn-line btn-sm">
        <Icon name="download" size={17} /> {busy ? 'Exportando…' : label}
      </button>
      {err && <span className="error-text">{err}</span>}
    </span>
  );
}

export function Table({ children, min = 640 }: { children: React.ReactNode; min?: number }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-left text-[0.92rem] [&_td]:border-t [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-ink-2" style={{ minWidth: min }}>
        {children}
      </table>
    </div>
  );
}

export const waLink = (phone: string, text = '') => `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const prettyPhone = (p: string) => (p.length === 12 ? `${p.slice(2, 5)} ${p.slice(5, 8)} ${p.slice(8)}` : p);

export const SALIDA_STATUS = { draft: 'Borrador', open: 'Abierta', closed: 'Cerrada', done: 'Realizada', cancelled: 'Cancelada' } as const;
