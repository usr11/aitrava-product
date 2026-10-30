'use client';

import { useCallback, useState } from 'react';
import { AdminTitle, ExportButton, Metric, prettyPhone, waLink } from '@/components/admin/kit';
import { Icon } from '@/components/Icon';
import { Alert, Badge, ErrorState, Field, LoadingState, Sheet } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { AdminHost } from '@/lib/admin-types';
import { useApi } from '@/lib/useSalidas';

const HOST_STATUS = {
  prospect: 'Por contactar',
  contacted: 'Contactado',
  interested: 'Interesado',
  accepted: 'Aceptó por escrito',
  declined: 'No aceptó',
  active: 'Activo (ya operó)',
} as const;

function HostForm({ host, onSaved }: { host?: AdminHost; onSaved: () => void }) {
  const [f, setF] = useState({
    name: host?.name ?? '',
    phone: host?.phone?.replace(/^57/, '') ?? '',
    email: host?.email ?? '',
    organization: host?.organization ?? '',
    activity: host?.activity ?? '',
    area: host?.area ?? '',
    rnt: host?.rnt ?? '',
    status: host?.status ?? 'prospect',
    commission: host?.commissionAccepted != null ? String(Math.round(host.commissionAccepted * 100)) : '',
    isTestHost: host?.isTestHost ?? false,
    notes: host?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(host ? `/admin/hosts/${host.id}` : '/admin/hosts', {
        method: host ? 'PATCH' : 'POST',
        json: {
          name: f.name,
          phone: f.phone || null,
          email: f.email || null,
          organization: f.organization || null,
          activity: f.activity,
          area: f.area || null,
          rnt: f.rnt || null,
          status: f.status,
          commissionAccepted: f.commission === '' ? null : Number(f.commission) / 100,
          isTestHost: f.isTestHost,
          notes: f.notes || null,
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="h-n">
          <input id="h-n" className="input" required minLength={2} value={f.name} onChange={set('name')} />
        </Field>
        <Field label="WhatsApp" htmlFor="h-p" optional>
          <input id="h-p" className="input tnum" type="tel" value={f.phone} onChange={set('phone')} />
        </Field>
        <Field label="Empresa o marca" htmlFor="h-o" optional>
          <input id="h-o" className="input" value={f.organization} onChange={set('organization')} />
        </Field>
        <Field label="Zona" htmlFor="h-a" optional>
          <input id="h-a" className="input" value={f.area} onChange={set('area')} />
        </Field>
      </div>
      <Field label="Experiencia que ofrece" htmlFor="h-act">
        <textarea id="h-act" className="input" rows={2} required minLength={2} value={f.activity} onChange={set('activity')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Estado" htmlFor="h-s">
          <select id="h-s" className="input" value={f.status} onChange={set('status')}>
            {Object.entries(HOST_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Comisión aceptada %" htmlFor="h-c" optional>
          <input id="h-c" className="input tnum" type="number" min={0} max={50} value={f.commission} onChange={set('commission')} />
        </Field>
        <Field label="RNT" htmlFor="h-r" optional>
          <input id="h-r" className="input tnum" value={f.rnt} onChange={set('rnt')} />
        </Field>
      </div>
      <Field label="Notas" htmlFor="h-no" optional>
        <textarea id="h-no" className="input" rows={2} value={f.notes} onChange={set('notes')} />
      </Field>
      <label className="choice">
        <input type="checkbox" checked={f.isTestHost} onChange={set('isTestHost')} /> Anfitrión de prueba (no suma a la meta 3/15)
      </label>
      {error && <Alert tone="bad">{error}</Alert>}
      <button disabled={busy} className="btn btn-pine">
        {busy ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}

export default function Anfitriones() {
  const { data, error, loading, reload } = useApi<AdminHost[]>('/admin/hosts');
  const [editing, setEditing] = useState<AdminHost | 'new' | null>(null);
  const close = useCallback(() => setEditing(null), []);
  const real = data?.filter((h) => !h.isTestHost) ?? [];
  const contacted = real.filter((h) => h.status !== 'prospect').length;
  const accepted = real.filter((h) => (h.commissionAccepted ?? 0) >= 0.16 && ['accepted', 'active'].includes(h.status)).length;

  return (
    <>
      <AdminTitle
        title="Anfitriones"
        text="TC1-A: contactar 15 y lograr que ≥ 3 acepten por escrito una comisión ≥ 16 %. Guarda el número de RNT de cada uno."
        action={
          <>
            <ExportButton path="/admin/export/anfitriones.csv" file="aitrava-anfitriones.csv" />
            <button onClick={() => setEditing('new')} className="btn btn-ember btn-sm">
              <Icon name="plus" size={17} /> Agregar
            </button>
          </>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Contactados" value={`${contacted} / 15`} />
        <Metric label="Aceptan ≥ 16 %" value={String(accepted)} target="≥ 3" ok={contacted ? accepted >= 3 : null} />
      </div>
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {data && !data.length && <p className="panel p-6 text-ink-2">Agrega los anfitriones que vas a contactar. Los que se postulan en /anfitriones aparecen aquí solos.</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {data?.map((h) => (
          <li key={h.id} className="panel flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{h.name}</span>
              <Badge tone={h.status === 'accepted' || h.status === 'active' ? 'ok' : h.status === 'declined' ? 'bad' : 'info'}>{HOST_STATUS[h.status]}</Badge>
              {h.isTestHost && <Badge tone="warn">De prueba</Badge>}
              {h.source === 'form' && <Badge>Se postuló</Badge>}
            </div>
            <p className="text-sm text-ink-2">{h.activity}</p>
            <p className="text-sm text-ink-3">
              {[h.organization, h.area, h.rnt ? `RNT ${h.rnt}` : 'Sin RNT', h.commissionAccepted != null ? `Acepta ${Math.round(h.commissionAccepted * 100)} %` : null].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {h.phone && (
                <a href={waLink(h.phone)} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                  <Icon name="whatsapp" size={17} /> {prettyPhone(h.phone)}
                </a>
              )}
              <button onClick={() => setEditing(h)} className="btn btn-sm hover:bg-paper-2">
                <Icon name="edit" size={17} /> Editar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Sheet open={!!editing} onClose={close} title={editing === 'new' ? 'Agregar anfitrión' : 'Editar anfitrión'} wide>
        {editing && (
          <HostForm
            host={editing === 'new' ? undefined : editing}
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
