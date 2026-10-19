'use client';

import { AdminTitle, ExportButton, useAdminData } from '@/components/admin/common';
import { DemoBadge, ErrorState, LoadingState, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';

type U = { id: string; firstName: string; lastName: string; email: string; role: 'USER' | 'ADMIN'; isDemo: boolean; emailVerifiedAt: string | null; utmSource: string | null; createdAt: string; trips: number; paidPasses: number };

export default function UsuariosPage() {
  const { user } = useAuth();
  const { data, error, reload } = useAdminData<U[]>('/admin/users');
  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <>
      <AdminTitle title="Usuarios" text="El rol admin solo se asigna aquí o con ADMIN_EMAILS en el servidor." action={<ExportButton entity="usuarios" />} />
      {error ? (
        <ErrorState text={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Cargando…" />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {data.map((u) => (
            <li key={u.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy">
                    {u.firstName} {u.lastName} {u.isDemo && <DemoBadge />}
                  </p>
                  <p className="truncate text-sm text-text-2">{u.email}</p>
                </div>
                <div className="flex gap-1.5">
                  {u.role === 'ADMIN' && <Tone tone="blue">Admin</Tone>}
                  {u.emailVerifiedAt ? <Tone tone="ok">Verificado</Tone> : <Tone tone="warn">Sin verificar</Tone>}
                </div>
              </div>
              <p className="mt-2 text-xs text-text-2">
                {u.trips} viajes · {u.paidPasses} Pass pagados · fuente {u.utmSource ?? 'directo'} · desde {formatDate(u.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!u.emailVerifiedAt && (
                  <button className="btn btn-outline btn-sm" onClick={() => confirm(`¿Marcar ${u.email} como verificado manualmente?`) && act(() => api(`/admin/users/${u.id}/verify-email`, { method: 'POST' }))}>
                    Verificar manualmente
                  </button>
                )}
                {u.id !== user?.id && u.emailVerifiedAt && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      confirm(u.role === 'ADMIN' ? `¿Quitar el rol admin a ${u.email}?` : `¿Dar rol admin a ${u.email}?`) &&
                      act(() => api(`/admin/users/${u.id}/role`, { method: 'PATCH', json: { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' } }))
                    }
                  >
                    {u.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
