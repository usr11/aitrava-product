'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useConfig } from '@/lib/config';
import { formatCOP, formatRange } from '@/lib/format';
import { useMyTrips } from '@/lib/trips';
import { Icon } from './Icon';
import { ProgressBar } from './ui';

/** Si hay sesión: acceso directo al viaje en curso o al próximo. */
export function ContinueTrip() {
  const { user } = useAuth();
  const { trips } = useMyTrips();
  if (!user) return null;
  const next = trips?.find((t) => t.phase === 'active') ?? trips?.find((t) => t.phase === 'planning');
  return (
    <div className="container-app pt-4">
      <Link
        href={next ? `/viajes/${next.id}` : '/planear'}
        className="card flex items-center gap-4 p-4 transition hover:shadow-[var(--shadow-lift)]"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow text-navy">
          <Icon name={next ? 'plane' : 'plus'} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-2">Hola, {user.firstName}</p>
          {next ? (
            <p className="truncate font-bold text-navy">
              {next.title} · {formatRange(next.startDate, next.endDate)}
              {next.phase === 'planning' ? ` · faltan ${next.daysToTrip} días` : ` · día ${next.dayOfTrip}`}
            </p>
          ) : (
            <p className="font-bold text-navy">Tu próximo viaje empieza aquí</p>
          )}
        </div>
        <Icon name="chevronRight" className="text-text-3" />
      </Link>
    </div>
  );
}

export function PassPrice({ className = '' }: { className?: string }) {
  const config = useConfig();
  return <span className={className}>{config ? formatCOP(config.passPriceCop) : '—'}</span>;
}

/** Plan de ejemplo para la sección de ahorro (claramente marcado como ejemplo). */
export function SavingsExample() {
  const milestones = [
    { label: 'Vuelos', amount: 1_050_000, when: 'Cubierto en la cuota 4', done: true, icon: 'plane' as const },
    { label: 'Alojamiento', amount: 900_000, when: 'Cubierto en la cuota 7', done: true, icon: 'bed' as const },
    { label: 'Actividades y seguro', amount: 390_000, when: 'Cubierto en la cuota 8', done: false, icon: 'ticket' as const },
    { label: 'Gastos en el destino', amount: 660_000, when: 'Cubierto en la cuota 10', done: false, icon: 'wallet' as const },
  ];
  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <span className="badge absolute top-4 right-4 bg-surface text-text-2">Ejemplo</span>
      <p className="eyebrow text-blue">Meta de viaje</p>
      <p className="mt-1 text-xl font-extrabold text-navy">Cartagena · marzo</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-2">Ahorrado</p>
          <p className="num text-2xl font-extrabold text-navy">{formatCOP(1_350_000)}</p>
        </div>
        <p className="num text-right text-sm text-text-2">
          de {formatCOP(3_000_000)}
          <br />
          <strong className="text-navy">45 %</strong>
        </p>
      </div>
      <div className="mt-3">
        <ProgressBar value={45} label="Progreso del ahorro" />
      </div>
      <div className="mt-5 rounded-2xl bg-sky p-4">
        <p className="text-sm text-navy">
          Tu cuota: <strong className="num text-lg">{formatCOP(270_000)}</strong> por quincena
        </p>
        <p className="mt-0.5 text-xs text-text-2">Calculada para pagar cada cosa a tiempo, no solo el total.</p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {milestones.map((m) => (
          <li key={m.label} className="flex items-center gap-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${m.done ? 'bg-ok-bg text-ok' : 'bg-surface text-text-2'}`}>
              <Icon name={m.done ? 'check' : m.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy">{m.label}</p>
              <p className="text-xs text-text-2">{m.when}</p>
            </div>
            <span className="num text-sm font-semibold text-navy">{formatCOP(m.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
