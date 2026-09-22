'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Trip } from './types';

export function useTrip(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setTrip(await api<Trip>(`/trips/${id}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trip, setTrip, error, refresh };
}
