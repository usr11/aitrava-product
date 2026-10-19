'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { TripCard } from '@/components/trip/TripCard';
import { Alert, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useMyTrips } from '@/lib/trips';

export default function MisViajesPage() {
  return (
    <RequireAuth>
      <MyTrips />
    </RequireAuth>
  );
}

function MyTrips() {
  const { trips, error, reload } = useMyTrips();
  const { user } = useAuth();
  const upcoming = trips?.filter((t) => t.phase !== 'finished') ?? [];
  const past = trips?.filter((t) => t.phase === 'finished') ?? [];
  return (
    <div className="container-app py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-blue">Mis viajes</p>
          <h1 className="h-display mt-2 text-4xl text-navy">Tus viajes viven aquí</h1>
        </div>
        <Link href="/planear" className="btn btn-primary">
          <Icon name="plus" size={20} /> Crear viaje
        </Link>
      </div>
      {user && !user.emailVerified && (
        <div className="mt-6">
          <Alert tone="info" icon="mail">
            Tu correo aún no está verificado. Puedes seguir usando AITRAVA;{' '}
            <Link href="/verificar-correo" className="font-semibold underline">
              verifícalo cuando puedas
            </Link>
            .
          </Alert>
        </div>
      )}
      <div className="mt-8">
        {error ? (
          <ErrorState text={error} onRetry={reload} />
        ) : !trips ? (
          <LoadingState label="Cargando tus viajes…" />
        ) : !trips.length ? (
          <EmptyState
            icon="plane"
            title="Tu próximo viaje empieza aquí."
            text="Crea tu viaje, arma tu plan de ahorro y guarda todo en un solo lugar."
            action={
              <Link href="/planear" className="btn btn-primary">
                Crear mi primer viaje
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {upcoming.map((t) => (
                <TripCard key={t.id} t={t} />
              ))}
            </div>
            {past.length > 0 && (
              <>
                <h2 className="mt-12 text-lg font-extrabold text-navy">Viajes anteriores</h2>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  {past.map((t) => (
                    <TripCard key={t.id} t={t} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
