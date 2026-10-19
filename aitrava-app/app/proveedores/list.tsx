'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Alert, DemoBadge, EmptyState, ErrorState, LoadingState, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { PROVIDER_CATEGORIES } from '@/lib/catalog';
import type { Provider } from '@/lib/types';

export function ProviderDisclaimer() {
  return (
    <Alert tone="warn" icon="info">
      <strong>Prototipo académico:</strong> los proveedores y marcas representados en esta sección se muestran con fines demostrativos para
      ilustrar el ecosistema de servicios que AITRAVA busca integrar. Su aparición no implica una alianza, convenio o relación comercial
      vigente con AITRAVA.
    </Alert>
  );
}

export function ProvidersList() {
  const [list, setList] = useState<Provider[] | null>(null);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('todos');
  const load = () => {
    setError('');
    api<Provider[]>('/providers').then(setList).catch((e: Error) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <ErrorState text={error} onRetry={load} />;
  if (!list) return <LoadingState label="Cargando proveedores…" />;
  const shown = list.filter((p) => cat === 'todos' || p.category === cat);
  const used = PROVIDER_CATEGORIES.filter((c) => list.some((p) => p.category === c.key));

  return (
    <>
      <div className="scroll-x -mx-4 px-4 pb-1">
        <button className="chip" aria-pressed={cat === 'todos'} onClick={() => setCat('todos')}>
          Todos
        </button>
        {used.map((c) => (
          <button key={c.key} className="chip" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
            <Icon name={c.icon} size={16} /> {c.label}
          </button>
        ))}
      </div>
      {!shown.length ? (
        <div className="mt-6">
          <EmptyState title="Sin proveedores en esta categoría" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const c = PROVIDER_CATEGORIES.find((x) => x.key === p.category);
            return (
              <article key={p.id} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky text-lg font-extrabold text-navy" aria-hidden>
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-extrabold text-navy">{p.name}</h2>
                    <p className="text-sm text-text-2">
                      {c?.label ?? p.category} · {p.country}
                    </p>
                  </div>
                  {p.status === 'active' ? <Tone tone="ok">Aliado</Tone> : <DemoBadge />}
                </div>
                <p className="mt-3 flex-1 text-sm text-text-2">{p.description}</p>
                {p.websiteUrl && (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:underline">
                    Sitio oficial <Icon name="externalLink" size={14} />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-sm text-text-2">
        Las marcas mostradas con estado <strong>demo</strong> tienen fines demostrativos y no implican una alianza comercial vigente con AITRAVA.
      </p>
    </>
  );
}
