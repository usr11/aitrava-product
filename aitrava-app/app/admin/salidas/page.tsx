'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { AdminTitle, ExportButton, SALIDA_STATUS } from '@/components/admin/kit';
import { SalidaForm } from '@/components/admin/SalidaForm';
import { Icon } from '@/components/Icon';
import { Badge, EmptyState, ErrorState, LoadingState, SeatMeter, Sheet } from '@/components/ui';
import type { AdminSalida } from '@/lib/admin-types';
import { formatCOP, formatDateTime } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

export default function SalidasAdmin() {
  const { data, error, loading, reload } = useApi<AdminSalida[]>('/admin/salidas');
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <AdminTitle
        title="Salidas"
        text="Crea la salida con lo que acordaste con el anfitrión. En “Borrador” no la ve nadie; en “Abierta” recibe reservas."
        action={
          <>
            <ExportButton path="/admin/export/salidas.csv" file="aitrava-salidas.csv" />
            <button onClick={() => setOpen(true)} className="btn btn-ember btn-sm">
              <Icon name="plus" size={17} /> Nueva salida
            </button>
          </>
        }
      />
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {data && !data.length && (
        <EmptyState
          icon="calendar"
          title="Todavía no hay salidas"
          text="Crea la primera con el lugar, el anfitrión, la fecha, el precio y los datos de pago."
          action={
            <button onClick={() => setOpen(true)} className="btn btn-ember">
              Crear la primera salida
            </button>
          }
        />
      )}
      <ul className="grid gap-3">
        {data?.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/salidas/${s.id}`} className="panel flex flex-col gap-3 p-4 transition-colors hover:border-ink-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{s.title}</span>
                  <Badge tone={s.status === 'open' ? 'ok' : s.status === 'cancelled' ? 'bad' : 'info'}>{SALIDA_STATUS[s.status]}</Badge>
                  {s.isSimulacro && <Badge tone="warn">Simulacro</Badge>}
                  {s.isDemo && <Badge tone="warn">DEMO</Badge>}
                </p>
                <p className="text-sm text-ink-2">
                  {formatDateTime(s.startsAt)} · {s.place.name} · {formatCOP(s.price)} · comisión {Math.round(s.commissionRate * 100)} %
                </p>
                {s.counts && (
                  <p className="text-sm text-ink-3">
                    {s.counts.requested} apartadas · {s.counts.confirmed} confirmadas · {s.counts.payment_reported} pago reportado · {s.counts.paid} pagadas ·{' '}
                    {s.counts.attended} asistieron
                  </p>
                )}
              </div>
              <SeatMeter capacity={s.capacity} taken={s.seatsTaken} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
      <Sheet open={open} onClose={close} title="Nueva salida" wide>
        <SalidaForm
          onSaved={() => {
            setOpen(false);
            reload();
          }}
        />
      </Sheet>
    </>
  );
}
