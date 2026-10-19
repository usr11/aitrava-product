'use client';

import { useCallback, useEffect, useState } from 'react';

export type GeoState = 'idle' | 'asking' | 'granted' | 'denied' | 'unavailable';
export type LatLng = { lat: number; lng: number };

/**
 * Ubicación SOLO cuando el usuario la pide (especificación §15). Si ya la había permitido antes,
 * se usa sin volver a preguntar. La app funciona igual si la rechaza. No se guarda en el servidor.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>('idle');
  const [pos, setPos] = useState<LatLng | null>(null);

  const read = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState('unavailable');
      return;
    }
    setState('asking');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setState('granted');
      },
      (err) => setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  // Si ya hay permiso concedido, se lee sin mostrar el aviso del navegador.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' as PermissionName })
      .then((r) => {
        if (r.state === 'granted') read();
        if (r.state === 'denied') setState('denied');
      })
      .catch(() => {});
  }, [read]);

  return { state, pos, request: read };
}

export const GEO_EXPLAIN = 'AITRAVA utiliza tu ubicación para ayudarte a encontrar rutas y lugares cercanos durante tu viaje.';
