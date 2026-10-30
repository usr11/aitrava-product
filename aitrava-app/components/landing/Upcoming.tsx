'use client';

import Link from 'next/link';
import { useSalidas } from '@/lib/useSalidas';
import { track } from '@/lib/track';
import { SalidaTicket, TicketSkeleton } from '../salidas/SalidaTicket';
import { EmptyState, ErrorState } from '../ui';

/** Próximas salidas con cupos en vivo. `limit` para la landing. */
export function Upcoming({ limit }: { limit?: number }) {
  const { data, error, loading, reload } = useSalidas();
  if (loading)
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TicketSkeleton />
        <TicketSkeleton />
        <TicketSkeleton />
      </div>
    );
  if (error) return <ErrorState text={error} onRetry={reload} />;
  if (!data?.length)
    return (
      <EmptyState
        icon="calendar"
        title="Estamos armando las próximas fechas"
        text="Déjanos tu WhatsApp y te escribimos apenas abramos una salida. Sin spam: solo fechas reales."
        action={
          <a href="#lista" className="btn btn-ember">
            Avísame de la próxima salida
          </a>
        }
      />
    );
  const list = limit ? data.slice(0, limit) : data;
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.slug}>
            <SalidaTicket s={s} onSelect={() => track('hook_cta_clicked', { to: 'salida', from: 'lista' }, s.slug)} />
          </li>
        ))}
      </ul>
      {limit && data.length > limit && (
        <Link href="/salidas" className="btn btn-line mt-6">
          Ver las {data.length} salidas
        </Link>
      )}
    </>
  );
}
