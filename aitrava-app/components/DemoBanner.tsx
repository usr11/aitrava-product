'use client';

import { useConfig } from '@/lib/hooks';

export function DemoBanner() {
  const config = useConfig();
  if (!config?.demoMode) return null;
  return (
    <div className="bg-primary text-ink">
      <p className="container-app eyebrow py-1.5 text-center text-[10px] font-semibold">
        Prototipo · modo demo: las pistas se desbloquean cada 30 s · no se hace ningún cobro
      </p>
    </div>
  );
}
