'use client';

import { useEffect, useState } from 'react';
import { api } from './api';

type Config = { demoMode: boolean; aiEnabled: boolean };
let configCache: Promise<Config> | null = null;

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    configCache ??= api<Config>('/config').catch(() => ({ demoMode: false, aiEnabled: false }));
    configCache.then(setConfig);
  }, []);
  return config;
}

/** Re-renderiza cada `ms` para cuentas regresivas. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function splitDuration(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}
