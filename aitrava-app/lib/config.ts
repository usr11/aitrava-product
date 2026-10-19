'use client';

import { useEffect, useState } from 'react';
import { api } from './api';
import type { PublicConfig } from './types';
import { CONTACT } from './site';

/**
 * Precio del Pass, link de pago y límites: vienen del backend (GET /api/config).
 * Nunca se escriben a mano en los componentes.
 */
let cache: Promise<PublicConfig | null> | null = null;

export function loadConfig() {
  cache ??= api<PublicConfig>('/config').catch(() => {
    cache = null;
    return null;
  });
  return cache;
}

export function useConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  useEffect(() => {
    let alive = true;
    loadConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

export { CONTACT };

/** A dónde seguir después de registrarse o verificar: la página pedida, el borrador del wizard o Mis viajes. */
export function continueHref() {
  try {
    const next = sessionStorage.getItem('aitrava_next');
    if (next) {
      sessionStorage.removeItem('aitrava_next');
      return next;
    }
    if (sessionStorage.getItem('aitrava_draft')) return '/planear?continuar=1';
  } catch {}
  return '/mis-viajes';
}
