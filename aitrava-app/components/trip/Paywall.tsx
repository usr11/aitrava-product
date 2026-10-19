'use client';

import Link from 'next/link';
import { useConfig } from '@/lib/config';
import { formatCOP, tripPhase } from '@/lib/format';
import type { Trip } from '@/lib/types';
import { Icon } from '../Icon';

/** Paywall en contexto: nunca de entrada, siempre ligado a lo que el usuario quiere hacer en ESTE viaje. */
export function PassCard({ trip, reason, compact = false }: { trip: Trip; reason?: string; compact?: boolean }) {
  const config = useConfig();
  const p = tripPhase(trip);
  const lead =
    reason ??
    (p.phase === 'planning'
      ? `Tu viaje comienza en ${p.daysToTrip} ${p.daysToTrip === 1 ? 'día' : 'días'}.`
      : p.phase === 'active'
        ? 'Estás de viaje.'
        : 'Lleva este viaje contigo.');

  if (compact) {
    return (
      <Link href={`/checkout/${trip.id}`} className="flex items-center gap-4 rounded-[24px] bg-navy p-4 text-white transition hover:bg-navy-2">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-yellow text-navy">
          <Icon name="navigation" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{lead}</p>
          <p className="text-sm text-white/75">Activa Modo Viaje, rutas y Bóveda completa · {config ? formatCOP(config.passPriceCop) : ''} por este viaje</p>
        </div>
        <Icon name="chevronRight" className="text-yellow" />
      </Link>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] bg-navy text-white">
      <div className="p-6 sm:p-8">
        <p className="eyebrow text-yellow">AITRAVA Pass</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Lleva este viaje contigo.</h2>
        <p className="mt-2 text-white/80">
          {lead} Activa Modo Viaje y lleva contigo rutas, Bóveda completa, herramientas de viaje y acompañamiento.
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {(config?.passFeatures ?? ['Bóveda completa', 'Modo Viaje', 'Rutas', 'Explora cerca', 'Cambiar mis planes']).map((f) => (
            <li key={f} className="flex items-start gap-2 text-white/90">
              <Icon name="check" size={18} className="mt-0.5 shrink-0 text-yellow" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p>
            <span className="num text-3xl font-extrabold">{config ? formatCOP(config.passPriceCop) : '—'}</span>{' '}
            <span className="text-white/70">COP por este viaje</span>
          </p>
          <Link href={`/checkout/${trip.id}`} className="btn btn-primary btn-lg w-full sm:w-auto">
            Activar AITRAVA Pass
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/60">Pago único, no es una suscripción. Pago seguro procesado mediante Wompi.</p>
      </div>
    </div>
  );
}
