'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RING } from '@/components/Logo';
import { formatCOP, formatDay, formatTime } from '@/lib/format';
import { getVariant, track } from '@/lib/track';
import type { Salida } from '@/lib/types';
import { useSalidas } from '@/lib/useSalidas';
import { DemoBadge, SeatMeter } from '../ui';

/** Los dos ganchos del TC0 (documento §2.2 y §5.2). */
const HOOKS = {
  A: {
    title: ['Ve solo.', 'Sal acompañado.'],
    text: '¿Tus amigos cancelaron otra vez? No necesitas tener el parche antes de hacer el plan: reservas tu cupo en una experiencia con un anfitrión local y AITRAVA arma el grupo.',
  },
  B: {
    title: ['Tres horas', 'sin celular.'],
    text: 'En la naturaleza, con un grupo pequeño en tu misma pausa. Guardas el celular en un sobre sellado y al final lo abres para una sola foto del grupo.',
  },
} as const;

/** La ronda grande: los puntos llegan desde afuera y se sientan alrededor del sol (único momento animado de la página). */
function Ring() {
  return (
    <svg viewBox="0 0 64 64" className="h-auto w-full" aria-hidden>
      <circle cx="32" cy="32" r="8.5" fill="var(--color-ember)" />
      {RING.map((p, i) => {
        const dx = (p.x - 32) * 0.9;
        const dy = (p.y - 32) * 0.9;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.4"
            fill="var(--color-paper)"
            className="seat-in"
            style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${250 + i * 110}ms`, transformOrigin: `${p.x}px ${p.y}px` } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

function NextTicket({ s, variant }: { s: Salida; variant: 'A' | 'B' }) {
  return (
    <div className="ticket text-ink [--notch-bg:var(--color-pine)]">
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 text-sm text-ink-2">
          <span className="narrow font-semibold">Próxima salida</span>
          {s.isDemo && <DemoBadge />}
        </div>
        <p className="title mt-2 text-[1.3rem]">{s.title}</p>
        <p className="mt-1 text-ink-2">
          <span className="font-semibold text-ink">{formatDay(s.startsAt)}</span> · <span className="tnum">{formatTime(s.startsAt)}</span> · {s.place.name}
        </p>
      </div>
      <div className="perforation mx-5" aria-hidden />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <SeatMeter capacity={s.capacity} taken={s.seatsTaken} />
          <p className="display tnum text-[1.5rem]">
            {formatCOP(s.price)} <span className="text-sm font-normal text-ink-3 [font-stretch:100%]">por persona</span>
          </p>
        </div>
        <Link
          href={`/salidas/${s.slug}`}
          onClick={() => track('hook_cta_clicked', { to: 'salida', variant }, s.slug)}
          className="btn btn-ember shrink-0"
        >
          {s.bookable ? (s.paymentUrl ? `Comprar mi cupo — ${formatCOP(s.price + s.serviceFee)}` : 'Reservar mi cupo') : 'Ver la salida'}
        </Link>
      </div>
    </div>
  );
}

export function Hero() {
  const [variant, setVariant] = useState<'A' | 'B' | null>(null);
  const { data, loading } = useSalidas();
  useEffect(() => setVariant(getVariant()), []);
  const next = data?.find((s) => s.bookable) ?? data?.[0];
  const hook = variant ? HOOKS[variant] : null;

  return (
    <section className="bg-pine text-paper [--notch-bg:var(--color-pine)]">
      <div className="wrap grid gap-10 pt-10 pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="min-w-0">
          {/* Mientras se decide la variante se reserva el espacio, para no mostrar un gancho y cambiarlo. */}
          <h1 className="display min-h-[2.1em] text-[clamp(2.2rem,10.6vw,5.4rem)]" aria-busy={!hook}>
            {hook && (
              <span className="block [animation:fade-in_.4s_ease]">
                {hook.title[0]}
                <br />
                {hook.title[1]}
              </span>
            )}
          </h1>
          <p className="lede mt-5 min-h-[4.6em] text-on-pine-2">{hook?.text}</p>
          <div className="mt-8">
            {loading ? (
              <div className="skeleton h-[200px] rounded-[18px] opacity-20" />
            ) : next && variant ? (
              <NextTicket s={next} variant={variant} />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#lista" onClick={() => track('hook_cta_clicked', { to: 'lista', variant })} className="btn btn-ember">
                  Avísame de la próxima salida
                </a>
                <Link href="/lugares" className="btn btn-line text-paper">
                  Ver los lugares
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto hidden w-full max-w-[380px] lg:block">
          <Ring />
        </div>
      </div>
    </section>
  );
}
