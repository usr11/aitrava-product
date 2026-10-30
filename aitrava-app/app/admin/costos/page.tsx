'use client';

import { useState } from 'react';
import { AdminTitle, ExportButton, Table } from '@/components/admin/kit';
import { Icon } from '@/components/Icon';
import { Alert, ErrorState, Field, LoadingState } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { AdminSalida } from '@/lib/admin-types';
import { formatCOP, formatDateTime } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

type Cost = { id: string; category: string; kind: string; channel: string | null; amount: number; description: string | null; date: string; salida: { title: string } | null };

const CATEGORIES = [
  { v: 'pauta', l: 'Pauta (anuncios)', kind: 'variable' },
  { v: 'kit', l: 'Kit (tarjetas, sobres, bitácoras)', kind: 'variable' },
  { v: 'horas', l: 'Horas del equipo', kind: 'variable' },
  { v: 'fijos', l: 'Fijos (dominio, herramientas, contador)', kind: 'fijo' },
  { v: 'formalizacion', l: 'Formalización', kind: 'fijo' },
  { v: 'otros', l: 'Otros', kind: 'variable' },
];

const today = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);

export default function Costos() {
  const { data, error, loading, reload } = useApi<Cost[]>('/admin/costs');
  const { data: salidas } = useApi<AdminSalida[]>('/admin/salidas');
  const [f, setF] = useState({ category: 'pauta', channel: 'IG', amount: '', description: '', date: today(), salidaId: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/costs', {
        json: {
          category: f.category,
          kind: CATEGORIES.find((c) => c.v === f.category)?.kind ?? 'variable',
          channel: f.category === 'pauta' ? f.channel : null,
          amount: Number(f.amount),
          description: f.description || null,
          date: new Date(`${f.date}T12:00:00-05:00`).toISOString(),
          salidaId: f.salidaId || null,
        },
      });
      setF((p) => ({ ...p, amount: '', description: '' }));
      reload();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Borrar este costo?')) return;
    await api(`/admin/costs/${id}`, { method: 'DELETE' }).catch(() => null);
    reload();
  };

  const total = data?.reduce((a, c) => a + c.amount, 0) ?? 0;

  return (
    <>
      <AdminTitle
        title="Costos y pauta"
        text="Registra lo que realmente se gasta. La pauta por canal calcula el CAC; el kit y las horas alimentan la contribución por reserva."
        action={<ExportButton path="/admin/export/costos.csv" file="aitrava-costos.csv" />}
      />
      <form onSubmit={add} className="panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <Field label="Categoría" htmlFor="c-cat">
          <select id="c-cat" className="input" value={f.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.v} value={c.v}>
                {c.l}
              </option>
            ))}
          </select>
        </Field>
        {f.category === 'pauta' && (
          <Field label="Canal" htmlFor="c-ch">
            <select id="c-ch" className="input" value={f.channel} onChange={set('channel')}>
              <option value="IG">IG (Instagram/TikTok)</option>
              <option value="GRP">GRP (grupos)</option>
              <option value="REF">REF (referidos)</option>
              <option value="ALI">ALI (aliados)</option>
            </select>
          </Field>
        )}
        <Field label="Valor" htmlFor="c-amt">
          <input id="c-amt" className="input tnum" type="number" min={1} required value={f.amount} onChange={set('amount')} />
        </Field>
        <Field label="Fecha" htmlFor="c-date">
          <input id="c-date" className="input" type="date" required value={f.date} onChange={set('date')} />
        </Field>
        <Field label="Salida" htmlFor="c-sal" optional>
          <select id="c-sal" className="input" value={f.salidaId} onChange={set('salidaId')}>
            <option value="">—</option>
            {salidas?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Detalle" htmlFor="c-desc" optional>
          <input id="c-desc" className="input" value={f.description} onChange={set('description')} />
        </Field>
        <button disabled={busy} className="btn btn-pine lg:col-span-6 lg:justify-self-start">
          <Icon name="plus" size={17} /> Registrar costo
        </button>
        {msg && <Alert tone="bad">{msg}</Alert>}
      </form>
      <div className="mt-6">
        {loading && !data && <LoadingState />}
        {error && <ErrorState text={error} onRetry={reload} />}
        {data && (
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Canal</th>
                <th>Detalle</th>
                <th className="text-right">Valor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td className="text-ink-3">{formatDateTime(c.date).split(',')[0]}</td>
                  <td>{c.category}</td>
                  <td>{c.channel ?? '—'}</td>
                  <td className="text-ink-2">{[c.description, c.salida?.title].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="tnum text-right font-semibold">{formatCOP(c.amount)}</td>
                  <td className="text-right">
                    <button onClick={() => remove(c.id)} className="btn btn-sm size-9 min-h-0 p-0 hover:bg-paper-2" aria-label="Borrar costo">
                      <Icon name="trash" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="font-bold">
                  Total
                </td>
                <td className="tnum text-right font-bold">{formatCOP(total)}</td>
                <td />
              </tr>
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
}
