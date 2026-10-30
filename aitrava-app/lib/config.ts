'use client';

import { useEffect, useState } from 'react';
import { api } from './api';
import type { PublicConfig } from './types';

/** Política de reembolso, horas de apartado, canales y líneas: vienen del backend (GET /api/config). */
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

/** Copia local para pintar sin esperar la red (el backend manda; si cambia, se actualiza al cargar). */
export const LINES = {
  URBANO: { label: 'Urbano', detail: 'Dentro de Cali', short: 'L1' },
  NATURALEZA: { label: 'Naturaleza cerca', detail: 'A una hora o menos de Cali', short: 'L2' },
  ESCAPADA: { label: 'Escapada de un día', detail: 'De 1,5 a 2,5 horas de Cali', short: 'L3' },
} as const;

export const CHANNEL_OPTIONS = [
  { value: 'GRP', label: 'Un grupo de WhatsApp o Telegram' },
  { value: 'IG', label: 'Instagram o TikTok' },
  { value: 'REF', label: 'Me lo recomendó alguien' },
  { value: 'ALI', label: 'Un anfitrión o aliado' },
  { value: 'OTRO', label: 'Otro' },
] as const;
