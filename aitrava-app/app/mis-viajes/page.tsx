'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { flightCode, formatCOP, formatDate } from '@/lib/format';
import type { Trip } from '@/lib/types';

const STATUS: Record<Trip['status'], { label: string; cls: string; path: string }> = {
  GENERATED: { label: 'Por reservar', cls: 'bg-surface-2 text-muted', path: '' },
  RESERVED: { label: 'Pistas en curso', cls: 'bg-primary text-ink', path: '/pistas' },
  REVEALED: { label: 'Revelado', cls: 'bg-ok/20 text-ok', path: '/revelacion' },
  COMPLETED: { label: 'Completado', cls: 'bg-ok/20 text-ok', path: '/revelacion' },
};

export default function MyTripsPage() {
  return (
    <RequireAuth>
      <MyTrips />
    </RequireAuth>
  );
}

function MyTrips() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  useEffect(() => {
    api<Trip[]>('/trips').then(setTrips).catch(() => setTrips([]));
  }, []);

  if (!trips) return <Spinner full />;

  return (
    <div className="container-app max-w-4xl py-6 md:py-12">
      <p className="eyebrow text-secondary">Tus salidas</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Mis viajes</h1>

      {trips.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <p className="display text-4xl text-primary">???</p>
          <p className="mt-3 text-muted">Todavía no tienes viajes. El primero tarda 2 minutos.</p>
          <Link href="/crear" className="btn btn-primary mt-6">
            Crear mi viaje sorpresa <Icon name="arrow" size={18} />
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {trips.map((t) => {
            const s = t.status === 'RESERVED' && t.canReveal ? { ...STATUS.RESERVED, label: '¡Listo para abrir!', path: '/revelacion' } : STATUS[t.status];
            return (
              <li key={t.id}>
                <Link href={`/viaje/${t.id}${s.path}`} className="card flex items-center gap-4 p-4 transition hover:border-line-strong sm:p-5">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-board font-display text-2xl font-black text-primary">
                    {t.destination ? t.destination.name.slice(0, 2).toUpperCase() : '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {t.destination?.name ?? (t.isGift ? `Regalo para ${t.giftTo}` : 'Destino sorpresa')}
                    </p>
                    <p className="text-sm text-muted">
                      {t.originCity} · {formatDate(t.startDate)} – {formatDate(t.endDate)} · {formatCOP(t.budgetTotal)}
                    </p>
                    <p className="font-mono text-xs text-dim">{flightCode(t.id)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
