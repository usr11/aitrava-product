'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ErrorState, LoadingState } from '@/components/ui';
import { api } from '@/lib/api';
import type { Destination } from '@/lib/types';

const SCOPES = [
  { key: 'todos', label: 'Todos' },
  { key: 'internacional', label: 'Internacionales' },
  { key: 'colombia', label: 'Colombia' },
];

export function DestinationsGrid() {
  const [list, setList] = useState<Destination[] | null>(null);
  const [error, setError] = useState('');
  const [scope, setScope] = useState('todos');

  const load = () => {
    setError('');
    api<Destination[]>('/destinations').then(setList).catch((e: Error) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <ErrorState text={error} onRetry={load} />;
  if (!list) return <LoadingState label="Cargando destinos…" />;
  const shown = list.filter((d) => (scope === 'colombia' ? d.country === 'Colombia' : scope === 'internacional' ? d.country !== 'Colombia' : true));

  return (
    <>
      <div className="scroll-x -mx-4 px-4 pb-1" role="tablist" aria-label="Filtrar destinos">
        {SCOPES.map((s) => (
          <button key={s.key} role="tab" aria-selected={scope === s.key} onClick={() => setScope(s.key)} className="chip">
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((d) => (
          <article key={d.slug} className="card group overflow-hidden">
            <div className="relative aspect-[16/10]">
              <Image src={d.imageUrl} alt={d.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <p className="text-sm text-text-2">
                {d.region} · {d.country}
              </p>
              <h2 className="mt-0.5 text-xl font-extrabold text-navy">{d.name}</h2>
              <p className="mt-2 text-text-2">{d.description}</p>
              <Link href={`/planear?destino=${d.slug}`} className="btn btn-outline btn-sm mt-4">
                Planear este viaje <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-8 text-xs text-text-3">Fotos: Wikimedia Commons (ver créditos en /img/destinos/creditos.json).</p>
    </>
  );
}
