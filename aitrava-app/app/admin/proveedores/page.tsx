'use client';

import { useState } from 'react';
import { AdminTitle, useAdminData } from '@/components/admin/common';
import { Alert, ErrorState, Field, LoadingState, Sheet, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { PROVIDER_CATEGORIES } from '@/lib/catalog';
import type { Provider } from '@/lib/types';

const STATUS = { demo: 'Demo', prospect: 'Prospecto', active: 'Activo (aliado real)', inactive: 'Inactivo' } as const;
const blank = { name: '', category: 'aerolineas', country: 'Colombia', websiteUrl: '', logoUrl: '', description: '', status: 'demo' as Provider['status'] };

export default function ProveedoresAdmin() {
  const { data, error, reload } = useAdminData<Provider[]>('/admin/providers');
  const [edit, setEdit] = useState<Provider | null>(null);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');

  const start = (p: Provider | null) => {
    setEdit(p);
    setF(p ? { name: p.name, category: p.category, country: p.country, websiteUrl: p.websiteUrl ?? '', logoUrl: p.logoUrl ?? '', description: p.description, status: p.status } : blank);
    setErr('');
    setOpen(true);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...f, websiteUrl: f.websiteUrl || undefined, logoUrl: f.logoUrl || undefined };
    try {
      await (edit ? api(`/admin/providers/${edit.id}`, { method: 'PATCH', json: body }) : api('/admin/providers', { json: body }));
      setOpen(false);
      reload();
    } catch (x) {
      setErr((x as Error).message);
    }
  };

  return (
    <>
      <AdminTitle title="Proveedores" text="Solo un proveedor “Activo” (con acuerdo real) se presenta como aliado. Los “Demo” muestran el disclaimer." action={<button onClick={() => start(null)} className="btn btn-navy btn-sm">Nuevo proveedor</button>} />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {data.map((p) => (
            <li key={p.id} className="card flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{p.name}</p>
                <p className="text-sm text-text-2">{PROVIDER_CATEGORIES.find((c) => c.key === p.category)?.label} · {p.country}</p>
              </div>
              <Tone tone={p.status === 'active' ? 'ok' : p.status === 'inactive' ? 'bad' : 'muted'}>{STATUS[p.status]}</Tone>
              <button onClick={() => start(p)} className="btn btn-ghost btn-sm">Editar</button>
            </li>
          ))}
        </ul>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={edit ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Nombre" htmlFor="p-name"><input id="p-name" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría" htmlFor="p-cat">
              <select id="p-cat" className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {PROVIDER_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="País" htmlFor="p-country"><input id="p-country" className="input" required value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></Field>
          </div>
          <Field label="Sitio web" htmlFor="p-web"><input id="p-web" type="url" className="input" value={f.websiteUrl} onChange={(e) => setF({ ...f, websiteUrl: e.target.value })} placeholder="https://" /></Field>
          <Field label="URL del logo (opcional)" htmlFor="p-logo"><input id="p-logo" type="url" className="input" value={f.logoUrl} onChange={(e) => setF({ ...f, logoUrl: e.target.value })} /></Field>
          <Field label="Descripción" htmlFor="p-desc"><textarea id="p-desc" className="input min-h-20" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Estado" htmlFor="p-status" hint="Marca “Activo” solo si existe un acuerdo comercial real firmado.">
            <select id="p-status" className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Provider['status'] })}>
              {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          {err && <Alert tone="bad">{err}</Alert>}
          <button className="btn btn-navy w-full">Guardar</button>
        </form>
      </Sheet>
    </>
  );
}
