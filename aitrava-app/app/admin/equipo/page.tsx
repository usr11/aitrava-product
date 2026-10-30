'use client';

import { AdminTitle, Table } from '@/components/admin/kit';
import { Badge, ErrorState, LoadingState } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

type TeamUser = { id: string; firstName: string; lastName: string; email: string; role: 'USER' | 'ADMIN'; emailVerifiedAt: string | null; createdAt: string };

export default function Equipo() {
  const { data, error, loading, reload } = useApi<TeamUser[]>('/admin/users');
  const { user } = useAuth();
  const act = async (path: string, body?: unknown) => {
    try {
      await api(path, body ? { method: 'PATCH', json: body } : { method: 'POST' });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
    reload();
  };
  return (
    <>
      <AdminTitle title="Equipo" text="Solo los correos de ADMIN_EMAILS pueden crear cuenta; reciben el rol admin al verificar su correo." />
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {data && (
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Creada</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td className="font-semibold">
                  {u.firstName} {u.lastName}
                </td>
                <td>
                  {u.email} {!u.emailVerifiedAt && <Badge tone="warn">Sin verificar</Badge>}
                </td>
                <td>{u.role === 'ADMIN' ? <Badge tone="pine">Admin</Badge> : 'Sin acceso'}</td>
                <td className="text-ink-3">{formatDateTime(u.createdAt)}</td>
                <td className="space-x-2 text-right">
                  {!u.emailVerifiedAt && (
                    <button className="link text-sm" onClick={() => act(`/admin/users/${u.id}/verify-email`)}>
                      Verificar
                    </button>
                  )}
                  {u.id !== user?.id && (
                    <button className="link text-sm" onClick={() => act(`/admin/users/${u.id}/role`, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}>
                      {u.role === 'ADMIN' ? 'Quitar acceso' : 'Dar acceso'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
