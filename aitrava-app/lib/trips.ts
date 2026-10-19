'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import type { TripSummary } from './types';

const LAST_KEY = 'aitrava_last_trip';

let listCache: { userId: string; at: number; data: Promise<TripSummary[]> } | null = null;

export function invalidateTrips() {
  listCache = null;
}

export function rememberTrip(id: string) {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {}
}

/** Mis viajes (con caché corta para la navegación). Solo con sesión. */
export function useMyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(
    async (force = false) => {
      // Sin sesión no hay viajes. La verificación del correo la decide el servidor (fase de prueba: opcional).
      if (!user) {
        setTrips(null);
        return;
      }
      if (force || !listCache || listCache.userId !== user.id || Date.now() - listCache.at > 30_000) {
        listCache = { userId: user.id, at: Date.now(), data: api<TripSummary[]>('/trips') };
      }
      try {
        setError('');
        setTrips(await listCache.data);
      } catch (e) {
        listCache = null;
        setError((e as Error).message);
      }
    },
    [user],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { trips, error, reload: () => load(true) };
}

/** El viaje "actual": el de la URL, el último abierto, el que está en curso o el próximo. */
export function pickCurrentTrip(trips: TripSummary[] | null, pathname: string) {
  const fromUrl = pathname.match(/^\/viajes\/([^/]+)/)?.[1];
  if (fromUrl) return fromUrl;
  if (!trips?.length) return null;
  const active = trips.find((t) => t.phase === 'active');
  if (active) return active.id;
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_KEY);
  } catch {}
  if (last && trips.some((t) => t.id === last)) return last;
  return (trips.find((t) => t.phase === 'planning') ?? trips[0]).id;
}
