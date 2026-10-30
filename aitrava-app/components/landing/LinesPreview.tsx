'use client';

import Link from 'next/link';
import { LINES } from '@/lib/config';
import { formatCOP } from '@/lib/format';
import type { Line } from '@/lib/types';
import { usePlaces } from '@/lib/useSalidas';

/** Las tres líneas con sus lugares y el precio de referencia más bajo (estimado). */
export function LinesPreview() {
  const { data } = usePlaces();
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
      {(Object.keys(LINES) as Line[]).map((l) => {
        const places = (data ?? []).filter((p) => p.line === l);
        const from = places.length ? Math.min(...places.map((p) => p.refPrice)) : null;
        return (
          <Link key={l} href={`/lugares#${l.toLowerCase()}`} className="group flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-paper">
            <h3 className="title text-[1.5rem]">{LINES[l].label}</h3>
            <p className="text-ink-2">{LINES[l].detail}</p>
            <p className="min-h-[3em] text-[0.95rem] text-ink-3">{places.map((p) => p.name).join(' · ') || ' '}</p>
            <p className="mt-auto flex items-baseline justify-between gap-2">
              <span className="narrow text-sm text-ink-3">{from ? 'Desde (estimado)' : ''}</span>
              <span className="display tnum text-[1.3rem]">{from ? formatCOP(from) : ''}</span>
            </p>
          </Link>
        );
      })}
    </div>
  );
}
