'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import type { Place, Salida } from './types';

type State<T> = { data: T | null; error: string | null; loading: boolean };

/** Carga con estados de cargando / error / reintento. Ignora respuestas viejas si el componente se desmonta. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: !!path });
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!path) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api<T>(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((e: unknown) => alive && setState({ data: null, error: e instanceof ApiError ? e.message : 'Algo salió mal.', loading: false }));
    return () => {
      alive = false;
    };
  }, [path, nonce]);

  return { ...state, reload, setData: (data: T) => setState({ data, error: null, loading: false }) };
}

export const useSalidas = () => useApi<Salida[]>('/salidas');
export const usePlaces = () => useApi<Place[]>('/places');
