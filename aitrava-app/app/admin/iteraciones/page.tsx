'use client';

import { useState } from 'react';
import { AdminTitle, useAdminData } from '@/components/admin/common';
import { ErrorState, Field, LoadingState, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate, todayISO } from '@/lib/format';

type I = { id: string; version: string; date: string; hypothesis: string; metric: string; result: string; decision: string; change: string };
const FIELDS: [keyof Omit<I, 'id' | 'version' | 'date'>, string][] = [
  ['hypothesis', 'Hipótesis'],
  ['metric', 'Métrica'],
  ['result', 'Resultado'],
  ['decision', 'Decisión'],
  ['change', 'Cambio aplicado'],
];

export default function IteracionesPage() {
  const { data, error, reload } = useAdminData<I[]>('/admin/iterations');
  const [edit, setEdit] = useState<Partial<I> | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, ...body } = edit!;
    const json = { ...body, date: `${(body.date ?? todayISO()).slice(0, 10)}T12:00:00.000Z` };
    await (id ? api(`/admin/iterations/${id}`, { method: 'PATCH', json }) : api('/admin/iterations', { json }));
    setEdit(null);
    reload();
  };
  return (
    <>
      <AdminTitle title="Iteraciones" text="Vimos X → cambiamos Y → resultó Z." action={<button className="btn btn-navy btn-sm" onClick={() => setEdit({ version: 'v1', date: todayISO() })}>Nueva iteración</button>} />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : (
        <ol className="space-y-3">
          {data.map((it) => (
            <li key={it.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold text-navy">{it.version} · {formatDate(it.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEdit(it)}>Editar</button>
                  <button className="btn btn-ghost btn-sm text-bad" onClick={() => confirm('¿Eliminar esta iteración?') && api(`/admin/iterations/${it.id}`, { method: 'DELETE' }).then(reload)}>Eliminar</button>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {FIELDS.map(([k, l]) => (
                  <div key={k}><dt className="font-semibold text-text-2">{l}</dt><dd className="text-navy">{it[k]}</dd></div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Editar iteración' : 'Nueva iteración'}>
        {edit && (
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Versión" htmlFor="it-v"><input id="it-v" className="input" required value={edit.version ?? ''} onChange={(e) => setEdit({ ...edit, version: e.target.value })} /></Field>
              <Field label="Fecha" htmlFor="it-d"><input id="it-d" type="date" className="input" value={(edit.date ?? '').slice(0, 10)} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
            </div>
            {FIELDS.map(([k, l]) => (
              <Field key={k} label={l} htmlFor={`it-${k}`}><textarea id={`it-${k}`} className="input min-h-16" required value={edit[k] ?? ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>
            ))}
            <button className="btn btn-navy w-full">Guardar</button>
          </form>
        )}
      </Sheet>
    </>
  );
}
