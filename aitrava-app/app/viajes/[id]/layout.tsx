'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { DemoBadge, ErrorState, LoadingState } from '@/components/ui';
import { formatRange, tripPhase } from '@/lib/format';
import { TripProvider, useTrip } from '@/lib/trip-context';

const TABS: { seg: string; label: string; icon: IconName }[] = [
  { seg: '', label: 'Resumen', icon: 'home' },
  { seg: 'itinerario', label: 'Itinerario', icon: 'calendar' },
  { seg: 'meta', label: 'Ahorro', icon: 'piggy' },
  { seg: 'transporte', label: 'Transporte', icon: 'plane' },
  { seg: 'alojamiento', label: 'Alojamiento', icon: 'bed' },
  { seg: 'actividades', label: 'Actividades', icon: 'ticket' },
  { seg: 'restaurantes', label: 'Restaurantes', icon: 'utensils' },
  { seg: 'presupuesto', label: 'Presupuesto', icon: 'wallet' },
  { seg: 'boveda', label: 'Bóveda', icon: 'vault' },
  { seg: 'modo-viaje', label: 'Modo Viaje', icon: 'navigation' },
];

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireAuth>
      <TripProvider id={id}>
        <TripFrame>{children}</TripFrame>
      </TripProvider>
    </RequireAuth>
  );
}

function TripFrame({ children }: { children: React.ReactNode }) {
  const { trip, error, refresh } = useTrip();
  const pathname = usePathname();
  const seg = pathname.split('/')[3] ?? '';

  if (error) {
    return (
      <div className="container-app py-10">
        <ErrorState
          title={error.status === 404 ? 'No encontramos ese viaje' : 'No pudimos cargar tu viaje'}
          text={error.status === 404 ? 'Puede que se haya eliminado o que no sea tuyo.' : error.message}
          onRetry={error.status === 404 ? undefined : refresh}
        />
        <div className="mt-4 text-center">
          <Link href="/mis-viajes" className="btn btn-outline">
            Ir a Mis viajes
          </Link>
        </div>
      </div>
    );
  }
  if (!trip) {
    return (
      <div className="container-app py-8">
        <LoadingState />
      </div>
    );
  }

  // Modo Viaje tiene su propia cabecera, pensada para el celular.
  if (seg === 'modo-viaje') return <>{children}</>;

  const p = tripPhase(trip);
  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="container-app pt-4 lg:pt-6">
          <Link href="/mis-viajes" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-text-2 hover:text-navy">
            <Icon name="back" size={18} /> Mis viajes
          </Link>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3 pb-4">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight text-navy uppercase sm:text-3xl">
                <span className="truncate">{trip.title}</span> {trip.isDemo && <DemoBadge />}
              </h1>
              <p className="mt-0.5 text-text-2">
                {trip.destinationCity}, {trip.destinationCountry} · {formatRange(trip.startDate, trip.endDate)}
              </p>
            </div>
            <p className="rounded-full bg-sky px-3 py-1.5 text-sm font-bold text-navy">
              {p.phase === 'planning' ? `Faltan ${p.daysToTrip} ${p.daysToTrip === 1 ? 'día' : 'días'}` : p.phase === 'active' ? `Día ${p.dayOfTrip} de ${p.totalDays}` : 'Viaje terminado'}
            </p>
          </div>
          <nav className="scroll-x -mx-4 px-4 pb-3" aria-label="Módulos del viaje">
            {TABS.map((t) => {
              const active = seg === t.seg;
              return (
                <Link
                  key={t.seg}
                  href={`/viajes/${trip.id}${t.seg ? `/${t.seg}` : ''}`}
                  aria-current={active ? 'page' : undefined}
                  className="chip shrink-0 py-2"
                >
                  <Icon name={t.icon} size={16} /> {t.label}
                  {t.seg === 'modo-viaje' && !trip.hasPass && <Icon name="lock" size={14} />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="container-app py-6 lg:py-8">{children}</div>
    </>
  );
}
