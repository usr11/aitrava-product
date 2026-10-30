'use client';

import { useCallback, useState } from 'react';
import { AdminTitle } from '@/components/admin/kit';
import { Icon } from '@/components/Icon';
import { Alert, Badge, ErrorState, Field, LoadingState, Sheet } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { AdminPlace } from '@/lib/admin-types';
import { LINES } from '@/lib/config';
import { formatCOP } from '@/lib/format';
import type { Line } from '@/lib/types';
import { useApi } from '@/lib/useSalidas';

const PLACE_STATUS = { active: 'Activo', verify: 'Por verificar', excluded: 'Excluido' } as const;

function PlaceForm({ place, onSaved }: { place?: AdminPlace; onSaved: () => void }) {
  const [f, setF] = useState({
    line: place?.line ?? 'URBANO',
    name: place?.name ?? '',
    area: place?.area ?? '',
    experience: place?.experience ?? '',
    duration: place?.duration ?? '',
    distance: place?.distance ?? '',
    refPrice: String(place?.refPrice ?? ''),
    note: place?.note ?? '',
    status: place?.status ?? 'verify',
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api(place ? `/admin/places/${place.id}` : '/admin/places', {
        method: place ? 'PATCH' : 'POST',
        json: { ...f, refPrice: Number(f.refPrice), distance: f.distance || null, note: f.note || null },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="p-n">
          <input id="p-n" className="input" required value={f.name} onChange={set('name')} />
        </Field>
        <Field label="Zona" htmlFor="p-a">
          <input id="p-a" className="input" required value={f.area} onChange={set('area')} />
        </Field>
      </div>
      <Field label="Experiencia" htmlFor="p-e">
        <textarea id="p-e" className="input" rows={2} required value={f.experience} onChange={set('experience')} />
      </Field>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Línea" htmlFor="p-l">
          <select id="p-l" className="input" value={f.line} onChange={set('line')}>
            {(Object.keys(LINES) as Line[]).map((l) => (
              <option key={l} value={l}>
                {LINES[l].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duración" htmlFor="p-d">
          <input id="p-d" className="input" required value={f.duration} onChange={set('duration')} />
        </Field>
        <Field label="Distancia" htmlFor="p-di" optional>
          <input id="p-di" className="input" value={f.distance} onChange={set('distance')} />
        </Field>
        <Field label="Precio ref." htmlFor="p-pr">
          <input id="p-pr" className="input tnum" type="number" min={0} step={1000} required value={f.refPrice} onChange={set('refPrice')} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <Field label="Nota" htmlFor="p-no" optional>
          <input id="p-no" className="input" value={f.note} onChange={set('note')} />
        </Field>
        <Field label="Estado" htmlFor="p-s">
          <select id="p-s" className="input" value={f.status} onChange={set('status')}>
            {Object.entries(PLACE_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && <Alert tone="bad">{error}</Alert>}
      <button className="btn btn-pine">Guardar</button>
    </form>
  );
}

export default function Lugares() {
  const { data, error, loading, reload } = useApi<AdminPlace[]>('/admin/places');
  const [editing, setEditing] = useState<AdminPlace | 'new' | null>(null);
  const close = useCallback(() => setEditing(null), []);
  return (
    <>
      <AdminTitle
        title="Lugares"
        text="Catálogo del documento. Cambia “Por verificar” a “Activo” cuando confirmes accesos, seguridad y tarifas; reemplaza el precio estimado por la cotización real."
        action={
          <button onClick={() => setEditing('new')} className="btn btn-ember btn-sm">
            <Icon name="plus" size={17} /> Agregar lugar
          </button>
        }
      />
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {(Object.keys(LINES) as Line[]).map((l) => (
        <section key={l} className="mb-8">
          <h2 className="title mb-3 text-[1.3rem]">{LINES[l].label}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {data
              ?.filter((p) => p.line === l)
              .map((p) => (
                <li key={p.id}>
                  <button onClick={() => setEditing(p)} className="panel flex w-full flex-col gap-1 p-4 text-left hover:border-ink-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      <Badge tone={p.status === 'active' ? 'ok' : p.status === 'verify' ? 'warn' : 'bad'}>{PLACE_STATUS[p.status]}</Badge>
                    </span>
                    <span className="text-sm text-ink-2">{p.experience}</span>
                    <span className="tnum text-sm text-ink-3">
                      {formatCOP(p.refPrice)} estimado · {p._count?.salidas ?? 0} salidas
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <Sheet open={!!editing} onClose={close} title={editing === 'new' ? 'Agregar lugar' : 'Editar lugar'} wide>
        {editing && (
          <PlaceForm
            place={editing === 'new' ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        )}
      </Sheet>
    </>
  );
}
