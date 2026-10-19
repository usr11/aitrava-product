'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { invalidateTrips, rememberTrip } from './trips';
import type { Trip } from './types';

type Ctx = {
  trip: Trip | null;
  error: ApiError | null;
  refresh: () => Promise<void>;
  setTrip: (t: Trip) => void;
  /** Llama al API y, si devuelve el viaje completo, lo actualiza; si no, recarga. */
  mutate: <T>(fn: () => Promise<T>) => Promise<T>;
};

const TripContext = createContext<Ctx | null>(null);

export function TripProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const [trip, setTripState] = useState<Trip | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const t = await api<Trip>(`/trips/${id}`);
      setTripState(t);
      rememberTrip(t.id);
    } catch (e) {
      setError(e as ApiError);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setTrip = useCallback((t: Trip) => {
    setTripState(t);
    invalidateTrips();
  }, []);

  const mutate = useCallback(
    async <T,>(fn: () => Promise<T>) => {
      const res = await fn();
      if (res && typeof res === 'object' && 'readiness' in (res as object) && 'items' in (res as object)) setTrip(res as unknown as Trip);
      else await refresh();
      invalidateTrips();
      return res;
    },
    [refresh, setTrip],
  );

  return <TripContext.Provider value={{ trip, error, refresh, setTrip, mutate }}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip fuera de TripProvider');
  return ctx;
}

/** Igual que useTrip pero asegura que el viaje ya cargó (usar dentro de <TripReady>). */
export function useLoadedTrip() {
  const ctx = useTrip();
  return { ...ctx, trip: ctx.trip as Trip };
}
