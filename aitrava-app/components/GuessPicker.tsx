'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DestinationOption } from '@/lib/types';
import { Icon } from './Icon';

/** Modal para apostar por un destino. */
export function GuessPicker({
  open,
  onClose,
  onPick,
  askName = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (slug: string, name?: string) => Promise<void>;
  askName?: boolean;
}) {
  const [options, setOptions] = useState<DestinationOption[]>([]);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && !options.length) api<DestinationOption[]>('/destinations').then(setOptions).catch(() => {});
  }, [open, options.length]);

  if (!open) return null;
  const filtered = options.filter((o) => `${o.name} ${o.region}`.toLowerCase().includes(query.toLowerCase()));

  const confirm = async () => {
    if (!picked) return;
    setBusy(true);
    try {
      await onPick(picked, name.trim() || undefined);
      setPicked(null);
      setQuery('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div className="card animate-pop flex max-h-[88dvh] w-full max-w-lg flex-col rounded-b-none p-5 sm:rounded-b-3xl sm:p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Adivinar destino">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-secondary">Haz tu apuesta</p>
            <h2 className="display mt-2 text-4xl">¿A dónde crees que va?</h2>
          </div>
          <button onClick={onClose} className="btn-ghost -mt-2 -mr-2 rounded-full p-2" aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        {askName && (
          <input className="input mt-4" placeholder="Tu nombre" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="input mt-3" placeholder="Buscar destino…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <ul className="mt-3 -mx-1 flex-1 overflow-y-auto px-1">
          {filtered.map((o) => (
            <li key={o.slug}>
              <button
                onClick={() => setPicked(o.slug)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left ${picked === o.slug ? 'bg-primary text-ink' : 'hover:bg-surface-2'}`}
              >
                <span>
                  <span className="font-semibold">{o.name}</span>
                  <span className={`block text-xs ${picked === o.slug ? 'text-ink/70' : 'text-muted-2'}`}>{o.region}</span>
                </span>
                {picked === o.slug && <Icon name="check" strokeWidth={2.4} />}
              </button>
            </li>
          ))}
        </ul>
        <button className="btn btn-primary btn-lg mt-4 w-full" disabled={!picked || busy || (askName && !name.trim())} onClick={confirm}>
          {busy ? 'Guardando…' : 'Esa es mi apuesta'}
        </button>
      </div>
    </div>
  );
}
