import Link from 'next/link';
import { Icon } from '../Icon';
import { DemoBadge, ProgressBar } from '../ui';
import { formatCOP, formatRange, tripPhase } from '@/lib/format';
import type { TripSummary } from '@/lib/types';

export function TripCard({ t }: { t: TripSummary }) {
  const p = tripPhase(t);
  return (
    <Link href={`/viajes/${t.id}`} className="card group flex flex-col p-5 transition hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-text-2">{t.destinationCountry}</p>
          <h2 className="truncate text-xl font-extrabold text-navy">{t.title}</h2>
          <p className="mt-0.5 text-sm text-text-2">
            {formatRange(t.startDate, t.endDate)} · {t.travelerCount} {t.travelerCount === 1 ? 'viajero' : 'viajeros'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {t.isDemo && <DemoBadge />}
          {p.phase === 'active' ? (
            <span className="badge bg-yellow text-navy">En curso · día {p.dayOfTrip}</span>
          ) : p.phase === 'finished' ? (
            <span className="badge bg-surface text-text-2">Terminado</span>
          ) : (
            <span className="badge bg-sky text-blue">Faltan {p.daysToTrip} días</span>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-text-2">Preparado</span>
            <span className="num font-bold text-navy">{t.readiness} %</span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={t.readiness} tone="navy" size="sm" label="Preparación del viaje" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-text-2">Ahorro</span>
            <span className="num font-bold text-navy">{t.savings ? `${t.savings.progress} %` : '—'}</span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={t.savings?.progress ?? 0} size="sm" label="Progreso del ahorro" />
          </div>
          {t.savings && (
            <p className="num mt-1 text-xs text-text-2">
              {formatCOP(t.savings.saved)} de {formatCOP(t.savings.target)}
            </p>
          )}
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
        Abrir Mi Viaje <Icon name="chevronRight" size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
