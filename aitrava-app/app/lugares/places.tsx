'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorState } from '@/components/ui';
import { LINES } from '@/lib/config';
import { formatCOP } from '@/lib/format';
import { track } from '@/lib/track';
import type { Line } from '@/lib/types';
import { usePlaces } from '@/lib/useSalidas';

export function PlacesByLine() {
  const { data, error, loading, reload } = usePlaces();
  useEffect(() => track('places_viewed'), []);

  if (loading)
    return (
      <div className="wrap space-y-4 py-10">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    );
  if (error || !data)
    return (
      <div className="wrap py-10">
        <ErrorState text={error ?? undefined} onRetry={reload} />
      </div>
    );

  return (
    <div className="wrap py-10 lg:py-14">
      {(Object.keys(LINES) as Line[]).map((l) => {
        const places = data.filter((p) => p.line === l);
        return (
          <section key={l} id={l.toLowerCase()} className="border-b border-line py-10 first:pt-0 last:border-0" aria-labelledby={`t-${l}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`t-${l}`} className="title text-[1.8rem]">
                {LINES[l].label}
              </h2>
              <p className="text-ink-2">{LINES[l].detail}</p>
            </div>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {places.map((p) => (
                <li key={p.slug} className="panel flex flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="title text-[1.2rem]">{p.name}</h3>
                      <p className="text-sm text-ink-3">
                        {p.area}
                        {p.distance ? ` · ${p.distance} de Cali` : ''} · {p.duration}
                      </p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="display tnum block text-[1.2rem]">{formatCOP(p.refPrice)}</span>
                      <span className="text-xs text-ink-3">estimado</span>
                    </p>
                  </div>
                  <p className="text-ink-2">{p.experience}</p>
                  {p.note && <p className="text-sm text-ink-3">{p.note}</p>}
                  {p.status === 'verify' && (
                    <p className="narrow mt-1 self-start rounded-full bg-warn-bg px-2.5 py-0.5 text-sm font-semibold text-warn">Por confirmar antes de abrir fechas</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <div className="panel mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-2">¿Quieres ir a alguno de estos lugares? Dinos cuál línea te interesa y te avisamos.</p>
        <Link href="/salidas#lista" className="btn btn-ember shrink-0">
          Avísame de la próxima salida
        </Link>
      </div>
    </div>
  );
}
