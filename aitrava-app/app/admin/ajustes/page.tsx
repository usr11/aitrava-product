'use client';

import { useState } from 'react';
import { AdminTitle } from '@/components/admin/kit';
import { Icon } from '@/components/Icon';
import { Alert, ErrorState, Field, LoadingState } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { formatLongDate } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

type Iteration = { id: string; version: string; date: string; hypothesis: string; metric: string; result: string; decision: string; change: string };

const EMPTY = { version: '', date: new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10), hypothesis: '', metric: '', change: '', result: '', decision: '' };

/** Reglas de ajuste fijadas antes de salir (documento §5.6): sirven de guía al anotar. */
const RULES = [
  'Canal con CAC > $10.400 durante 2 salidas seguidas → se le quita el presupuesto y pasa al otro canal.',
  'Menos de 30 conversaciones en una semana → el problema es el canal, no la oferta.',
  '30 o más conversaciones y menos de 3 pagos → confianza o precio: probar anticipo del 50 % o reembolso del 100 %.',
];

export default function Ajustes() {
  const { data, error, loading, reload } = useApi<Iteration[]>('/admin/iterations');
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/iterations', { json: { ...f, date: new Date(`${f.date}T12:00:00-05:00`).toISOString() } });
      setF(EMPTY);
      reload();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Borrar este ajuste?')) return;
    await api(`/admin/iterations/${id}`, { method: 'DELETE' }).catch(() => null);
    reload();
  };

  return (
    <>
      <AdminTitle title="Registro de ajustes" text="Cada cambio con su fecha, el dato que lo provocó y lo que pasó después. Es la evidencia del nivel 5 (mejoras aplicadas)." />
      <ul className="mb-6 space-y-1.5 text-sm text-ink-2">
        {RULES.map((r) => (
          <li key={r} className="flex gap-2">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" /> {r}
          </li>
        ))}
      </ul>
      <form onSubmit={save} className="panel grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Versión o ronda" htmlFor="i-v">
          <input id="i-v" className="input" required maxLength={20} placeholder="Ronda 2" value={f.version} onChange={set('version')} />
        </Field>
        <Field label="Fecha" htmlFor="i-d">
          <input id="i-d" className="input" type="date" required value={f.date} onChange={set('date')} />
        </Field>
        <Field label="Dato que lo provocó" htmlFor="i-h">
          <textarea id="i-h" className="input" rows={2} required value={f.hypothesis} onChange={set('hypothesis')} />
        </Field>
        <Field label="Métrica que se mira" htmlFor="i-m">
          <textarea id="i-m" className="input" rows={2} required value={f.metric} onChange={set('metric')} />
        </Field>
        <Field label="Cambio aplicado" htmlFor="i-c">
          <textarea id="i-c" className="input" rows={2} required value={f.change} onChange={set('change')} />
        </Field>
        <Field label="Resultado" htmlFor="i-r">
          <textarea id="i-r" className="input" rows={2} required placeholder="Pendiente" value={f.result} onChange={set('result')} />
        </Field>
        <Field label="Decisión" htmlFor="i-de">
          <textarea id="i-de" className="input" rows={2} required value={f.decision} onChange={set('decision')} />
        </Field>
        <div className="flex items-end">
          <button disabled={busy} className="btn btn-pine">
            <Icon name="plus" size={17} /> Anotar ajuste
          </button>
        </div>
        {msg && <Alert tone="bad">{msg}</Alert>}
      </form>
      <div className="mt-6">
        {loading && !data && <LoadingState />}
        {error && <ErrorState text={error} onRetry={reload} />}
        <ol className="grid gap-3">
          {data?.map((it) => (
            <li key={it.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">
                  {it.version} · <span className="font-normal text-ink-2">{formatLongDate(it.date)}</span>
                </p>
                <button onClick={() => remove(it.id)} className="btn btn-sm size-9 min-h-0 p-0 hover:bg-paper-2" aria-label="Borrar ajuste">
                  <Icon name="trash" size={17} />
                </button>
              </div>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                {(
                  [
                    ['Dato', it.hypothesis],
                    ['Métrica', it.metric],
                    ['Cambio', it.change],
                    ['Resultado', it.result],
                    ['Decisión', it.decision],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-3">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
