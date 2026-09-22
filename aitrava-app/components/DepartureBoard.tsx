'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const MESSAGES = [
  'Leyendo tu ADN viajero…',
  'Cruzando presupuesto y fechas…',
  'Buscando cupos con aliados…',
  'Escribiendo tus pistas…',
  'Sellando el sobre…',
];

/** Tablero de salidas animado (mientras la IA arma el viaje). */
export function DepartureBoard({ status, letters = 8 }: { status?: string; letters?: number }) {
  const [msg, setMsg] = useState(0);
  useEffect(() => {
    if (status) return;
    const id = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 1400);
    return () => clearInterval(id);
  }, [status]);

  return (
    <div className="rounded-2xl border border-line bg-board p-4 font-mono shadow-2xl shadow-black/60 sm:p-6" role="img" aria-label="Tablero de salidas con tu destino oculto">
      <div className="flex items-center justify-between border-b border-[#2a2d33] pb-3 text-xs uppercase">
        <span className="flex items-center gap-2 font-semibold tracking-[0.2em] text-primary">
          <Icon name="departures" size={18} /> Salidas
        </span>
        <span className="tracking-[0.12em] text-dim">Actualizado ahora</span>
      </div>
      <div className="mt-4 flex gap-1" style={{ perspective: 400 }}>
        {Array.from({ length: letters }, (_, i) => (
          <span key={i} className="flap flap-anim h-12 flex-1 text-2xl sm:h-14 sm:text-3xl" style={{ animationDelay: `${i * 0.15}s` }}>
            ?
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">AT-0000</span>
        <span className="rounded bg-primary px-2.5 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
          {status ?? MESSAGES[msg]}
        </span>
      </div>
    </div>
  );
}
