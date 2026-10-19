'use client';

import { AdminTitle, useAdminData } from '@/components/admin/common';
import { ErrorState, LoadingState, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';

type M = { id: string; name: string; email: string; subject: string; message: string; handled: boolean; createdAt: string };

export default function MensajesPage() {
  const { data, error, reload } = useAdminData<M[]>('/admin/messages');
  return (
    <>
      <AdminTitle title="Mensajes de contacto" text="Lo que llega desde /contacto." />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : !data.length ? <p className="text-text-3">Sin mensajes todavía.</p> : (
        <ul className="space-y-3">
          {data.map((m) => (
            <li key={m.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-navy">{m.subject}</p>
                  <p className="text-sm text-text-2">{m.name} · <a className="text-blue" href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.createdAt, { day: 'numeric', month: 'short' })}</p>
                </div>
                {m.handled ? <Tone tone="ok">Atendido</Tone> : <Tone tone="warn">Pendiente</Tone>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-text-2">{m.message}</p>
              <button className="btn btn-ghost btn-sm mt-2" onClick={() => api(`/admin/messages/${m.id}`, { method: 'PATCH', json: { handled: !m.handled } }).then(reload)}>
                {m.handled ? 'Marcar pendiente' : 'Marcar atendido'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
