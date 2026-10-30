'use client';

import { useEffect, useState } from 'react';
import { AdminTitle, ExportButton, STATUS } from '@/components/admin/kit';
import { ReservationCard } from '@/components/admin/ReservationCard';
import { ErrorState, LoadingState } from '@/components/ui';
import type { AdminReservation } from '@/lib/admin-types';
import type { ReservationStatus } from '@/lib/types';
import { useApi } from '@/lib/useSalidas';

export default function ReservasAdmin() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (debounced) params.set('q', debounced);
  const { data, error, loading, reload, setData } = useApi<AdminReservation[]>(`/admin/reservations?${params}`);
  const pending = data?.filter((r) => r.profile.qualifies === null).length ?? 0;

  return (
    <>
      <AdminTitle
        title="Reservas"
        text={`Cada reserva es evidencia: confirma el cupo, verifica el pago con el comprobante y marca V5 leyendo la motivación.${pending ? ` Hay ${pending} por revisar V5.` : ''}`}
        action={<ExportButton path="/admin/export/reservas.csv" file="aitrava-reservas.csv" />}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <label>
          <span className="sr-only">Buscar</span>
          <input className="input" placeholder="Buscar por nombre, WhatsApp o código" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {(Object.keys(STATUS) as ReservationStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS[s].label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {data && !data.length && <p className="panel p-6 text-ink-2">No hay reservas con ese filtro.</p>}
      <ul className="grid gap-3">
        {data?.map((r) => (
          <li key={r.id}>
            <ReservationCard r={r} showSalida onChange={(n) => setData(data.map((x) => (x.id === n.id ? { ...x, ...n } : x)))} />
          </li>
        ))}
      </ul>
    </>
  );
}
