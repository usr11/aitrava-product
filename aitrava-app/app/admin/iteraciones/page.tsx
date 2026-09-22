'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';

type Iteration = { id: string; version: string; date: string; hypothesis: string; metric: string; result: string; decision: string; change: string };
type Form = Omit<Iteration, 'id'>;

const FIELDS: { key: keyof Form; label: string; hint: string }[] = [
  { key: 'hypothesis', label: 'Hipótesis', hint: 'Creemos que…' },
  { key: 'metric', label: 'Métrica / dato', hint: 'Lo medimos con… (ej. abandono en paso 4 = 45 %)' },
  { key: 'result', label: 'Resultado', hint: 'Qué pasó después del cambio' },
  { key: 'decision', label: 'Decisión', hint: 'Qué decidimos hacer' },
  { key: 'change', label: 'Cambio en el producto / modelo', hint: 'Qué cambió concretamente' },
];

const empty = (): Form => ({ version: '', date: new Date().toISOString().slice(0, 10), hypothesis: '', metric: '', result: '', decision: '', change: '' });

/** Registro de aprendizajes: la evidencia de "los resultados orientaron ajustes" (rúbrica, criterio 3). */
export default function AdminIterations() {
  const [items, setItems] = useState<Iteration[] | null>(null);
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);

  const load = () => api<Iteration[]>('/admin/iterations').then(setItems);
  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const body = { ...editing.form, date: new Date(editing.form.date).toISOString() };
    if (editing.id) await api(`/admin/iterations/${editing.id}`, { method: 'PATCH', json: body });
    else await api('/admin/iterations', { json: body });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Borrar esta iteración?')) return;
    await api(`/admin/iterations/${id}`, { method: 'DELETE' });
    load();
  };

  if (!items) return <Spinner full />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted">Cada cambio del producto o del modelo de negocio con el dato que lo motivó. Esto es lo que se muestra en la presentación.</p>
        <button className="btn btn-primary" onClick={() => setEditing({ form: { ...empty(), version: `v${items.length}` } })}>
          <Icon name="plus" size={18} /> Nueva iteración
        </button>
      </div>

      <ol className="relative mt-8 space-y-6 border-l border-line-strong pl-6">
        {items.map((it) => (
          <li key={it.id} className="relative">
            <span className="absolute top-1 -left-[33px] grid size-4 place-items-center rounded-full bg-primary ring-4 ring-bg" />
            <div className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="display text-3xl text-primary">{it.version}</p>
                <div className="flex items-center gap-1">
                  <span className="mr-2 font-mono text-xs text-dim">{new Date(it.date).toLocaleDateString('es-CO')}</span>
                  <button className="btn-ghost rounded-full p-2 text-sm" onClick={() => setEditing({ id: it.id, form: { ...it, date: it.date.slice(0, 10) } })}>Editar</button>
                  <button className="btn-ghost rounded-full p-2 text-sm" onClick={() => remove(it.id)} aria-label="Borrar"><Icon name="close" size={16} /></button>
                </div>
              </div>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className={f.key === 'change' ? 'sm:col-span-2' : ''}>
                    <dt className="eyebrow text-[10px] text-muted-2">{f.label}</dt>
                    <dd className="mt-1 text-text-soft">{it[f.key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ol>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} className="card animate-pop max-h-[90dvh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="display text-4xl">{editing.id ? 'Editar iteración' : 'Nueva iteración'}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label><span className="field-label">Versión</span><input className="input" required value={editing.form.version} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, version: e.target.value } })} /></label>
              <label><span className="field-label">Fecha</span><input className="input" type="date" required value={editing.form.date} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, date: e.target.value } })} /></label>
            </div>
            <div className="mt-3 space-y-3">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="field-label">{f.label}</span>
                  <textarea className="input min-h-16 resize-y" required placeholder={f.hint} value={editing.form[f.key]} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, [f.key]: e.target.value } })} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" className="btn btn-dark flex-1" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary flex-1">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
