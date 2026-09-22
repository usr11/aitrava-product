'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { BoardingPass } from '@/components/BoardingPass';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { formatCOP } from '@/lib/format';
import type { Trip } from '@/lib/types';
import { useTrip } from '@/lib/useTrip';

export default function TripPage() {
  return (
    <RequireAuth>
      <TripView />
    </RequireAuth>
  );
}

function TripView() {
  const { id } = useParams<{ id: string }>();
  const { trip, setTrip, error } = useTrip(id);
  const [rerolling, setRerolling] = useState(false);

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip) return <Spinner full />;

  const reroll = async () => {
    setRerolling(true);
    try {
      setTrip(await api<Trip>(`/trips/${id}/reroll`, { method: 'POST' }));
    } finally {
      setRerolling(false);
    }
  };

  const b = trip.breakdown;
  const rows: [string, string, number][] = [
    ['plane', 'Transporte ida y vuelta', b.transporte],
    ['home', 'Alojamiento', b.alojamiento],
    ['mountain', 'Experiencias locales', b.experiencias],
    ['sparkle', `Comisión AiTrava (${Math.round(b.commissionRate * 100)} %)`, b.comision],
  ];

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div className="animate-fade-up">
          <p className="eyebrow text-secondary">
            {trip.status === 'GENERATED' ? '¡Tu viaje está listo!' : trip.status === 'RESERVED' ? 'Reservado · esperando la revelación' : 'Destino revelado'}
          </p>
          <h1 className="display mt-3 mb-6 text-5xl sm:text-6xl">
            {trip.destination ? trip.destination.name : trip.isGift ? `Un regalo para ${trip.giftTo}` : 'Tu destino: ???'}
          </h1>
          <div className={rerolling ? 'animate-wiggle opacity-60' : ''}>
            <BoardingPass trip={trip} />
          </div>
          {trip.status === 'GENERATED' && (
            <p className="mt-4 text-sm text-muted">
              Ya elegimos el lugar, el transporte, el alojamiento y los planes. Lo único que no sabrás es <strong className="text-text">a dónde vas</strong>.
            </p>
          )}
        </div>

        <aside className="card animate-fade-up p-5 sm:p-6" style={{ animationDelay: '0.1s' }}>
          <p className="eyebrow text-muted-2">Tu presupuesto, transparente</p>
          <ul className="mt-4 space-y-3">
            {rows.map(([icon, label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm">
                <span className="flex items-center gap-2.5 text-text-soft">
                  <Icon name={icon as 'plane'} size={18} className="text-secondary" /> {label}
                </span>
                <span className="font-mono">{formatCOP(value)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="display text-4xl text-primary">{formatCOP(b.total)}</span>
          </div>

          {trip.status === 'GENERATED' && (
            <>
              <Link href={`/viaje/${id}/pago`} className="btn btn-primary btn-lg mt-6 w-full">
                Reservar mi sorpresa <Icon name="arrow" size={20} strokeWidth={2.2} />
              </Link>
              <button onClick={reroll} disabled={rerolling || trip.rerolls >= trip.maxRerolls} className="btn btn-dark mt-3 w-full">
                <Icon name="refresh" size={18} />
                {rerolling ? 'Sorteando otro destino…' : trip.rerolls >= trip.maxRerolls ? 'Ya usaste tus re-sorteos' : `Re-sortear destino (${trip.maxRerolls - trip.rerolls} gratis)`}
              </button>
              <p className="mt-3 text-center text-xs text-dim">¿Presientes que no te va a gustar? Re-sortea sin ver el destino.</p>
            </>
          )}
          {trip.status === 'RESERVED' && (
            <Link href={`/viaje/${id}/${trip.canReveal ? 'revelacion' : 'pistas'}`} className="btn btn-primary btn-lg mt-6 w-full">
              {trip.canReveal ? 'Abrir el sobre' : 'Ver mis pistas'} <Icon name={trip.canReveal ? 'envelope' : 'lock'} size={20} />
            </Link>
          )}
          {(trip.status === 'REVEALED' || trip.status === 'COMPLETED') && (
            <Link href={`/viaje/${id}/revelacion`} className="btn btn-primary btn-lg mt-6 w-full">
              Ver itinerario completo <Icon name="arrow" size={20} />
            </Link>
          )}
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li className="flex gap-2"><Icon name="headset" size={18} className="shrink-0 text-secondary" /> Una persona real te responde si algo cambia.</li>
            <li className="flex gap-2"><Icon name="shield" size={18} className="shrink-0 text-secondary" /> Aliados verificados de transporte y alojamiento.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
