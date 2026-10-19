'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { PassCard } from '@/components/trip/Paywall';
import { DocumentViewer, UploadDocumentModal, useVaultOpened } from '@/components/trip/vault';
import { ConfirmDialog, EmptyState, ProgressBar, SectionTitle, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { BOOKING_TO_VAULT, VAULT_CATEGORIES, bookingCat, vaultCat } from '@/lib/catalog';
import { formatDate, formatTime } from '@/lib/format';
import { useLoadedTrip } from '@/lib/trip-context';
import type { Booking, VaultDocument } from '@/lib/types';

export default function BovedaPage() {
  const { trip, mutate } = useLoadedTrip();
  useVaultOpened();
  const [cat, setCat] = useState('todos');
  const [q, setQ] = useState('');
  const [upload, setUpload] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [doc, setDoc] = useState<VaultDocument | null>(null);
  const [removing, setRemoving] = useState<VaultDocument | null>(null);
  const [paywall, setPaywall] = useState(false);

  const limit = trip.limits.vaultDocuments;
  const full = limit != null && trip.documents.length >= limit;
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const bookingOf = (d: VaultDocument) => trip.bookings.find((b) => b.id === d.bookingId);
  const docs = trip.documents.filter((d) => {
    if (cat !== 'todos' && d.category !== cat) return false;
    if (!q) return true;
    const b = bookingOf(d);
    return norm(`${d.title} ${d.fileName} ${b?.title ?? ''} ${b?.reference ?? ''} ${b?.provider ?? ''}`).includes(norm(q));
  });
  const withoutDoc = trip.bookings.filter((b) => !trip.documents.some((d) => d.bookingId === b.id) && (cat === 'todos' || BOOKING_TO_VAULT[b.category] === cat));
  const openUpload = (booking: Booking | null = null) => (full ? setPaywall(true) : setUpload({ open: true, booking }));

  return (
    <div className="mx-auto max-w-3xl">
      <SectionTitle
        eyebrow="Bóveda"
        title="Tus documentos y reservas"
        action={
          <button onClick={() => openUpload()} className="btn btn-navy btn-sm">
            <Icon name="plus" size={16} /> Agregar
          </button>
        }
      />

      {limit != null && (
        <div className="card-flat mb-4 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-2">Plan gratis</span>
            <span className="num font-semibold text-navy">
              {trip.documents.length} de {limit} documentos
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={(trip.documents.length / limit) * 100} tone={full ? 'navy' : 'blue'} size="sm" label="Uso de la Bóveda" />
          </div>
          {full && (
            <button onClick={() => setPaywall(true)} className="mt-3 text-sm font-semibold text-blue">
              Tener la Bóveda completa con AITRAVA Pass →
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-3" />
        <input className="input pl-12" type="search" placeholder="Buscar por nombre, reserva o proveedor" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en la Bóveda" />
      </div>
      <div className="scroll-x -mx-4 mt-3 px-4 pb-1" aria-label="Filtrar por categoría">
        <button className="chip" aria-pressed={cat === 'todos'} onClick={() => setCat('todos')}>
          Todos
        </button>
        {VAULT_CATEGORIES.map((c) => (
          <button key={c.key} className="chip" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {!trip.documents.length && !trip.bookings.length ? (
          <EmptyState
            icon="vault"
            title="Tu Bóveda está esperando tu primer documento."
            text="Tiquetes, reservas, QR de entradas y pólizas: todo en un solo lugar y solo para ti."
            action={
              <button onClick={() => openUpload()} className="btn btn-primary">
                Agregar reserva o documento
              </button>
            }
          />
        ) : !docs.length && !withoutDoc.length ? (
          <p className="py-8 text-center text-text-2">No hay nada con ese filtro.</p>
        ) : (
          docs.map((d) => {
            const b = bookingOf(d);
            const isImg = d.mimeType.startsWith('image/');
            return (
              <article key={d.id} className="card flex items-center gap-3 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky text-blue">
                  <Icon name={b ? bookingCat(b.category).icon : vaultCat(d.category).icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-navy">{d.title}</p>
                  <p className="truncate text-sm text-text-2">
                    {b?.reference ? `${b.reference} · ` : ''}
                    {b?.startAt ? `${formatDate(b.startAt)} · ${formatTime(b.startAt)}` : vaultCat(d.category).label}
                  </p>
                </div>
                <button onClick={() => setDoc(d)} className="btn btn-navy btn-sm shrink-0">
                  {isImg ? 'Ver QR' : 'Abrir'}
                </button>
                <button onClick={() => setRemoving(d)} className="btn btn-ghost size-10 shrink-0 p-0 text-bad" aria-label={`Eliminar ${d.title}`}>
                  <Icon name="trash" size={16} />
                </button>
              </article>
            );
          })
        )}
      </div>

      {withoutDoc.length > 0 && (
        <section className="mt-8">
          <h2 className="font-extrabold text-navy">Reservas sin documento</h2>
          <p className="text-sm text-text-2">Adjunta el tiquete, la confirmación o el QR para tenerlo a mano.</p>
          <ul className="mt-3 space-y-2">
            {withoutDoc.map((b) => (
              <li key={b.id} className="card-flat flex items-center gap-3 p-3">
                <Icon name={bookingCat(b.category).icon} size={20} className="shrink-0 text-text-2" />
                <span className="min-w-0 flex-1 truncate font-semibold text-navy">
                  {b.title}
                  {b.reference && <span className="font-normal text-text-2"> · {b.reference}</span>}
                </span>
                <button onClick={() => openUpload(b)} className="btn btn-outline btn-sm shrink-0">
                  <Icon name="upload" size={16} /> Adjuntar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <UploadDocumentModal open={upload.open} booking={upload.booking} onClose={() => setUpload({ open: false, booking: null })} onPassRequired={() => setPaywall(true)} />
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Eliminar este documento?"
        text="Se borra de tu Bóveda. No se puede deshacer."
        onConfirm={() => mutate(() => api(`/trips/${trip.id}/documents/${removing!.id}`, { method: 'DELETE' }))}
      />
      <Sheet open={paywall} onClose={() => setPaywall(false)} title="Bóveda completa">
        <PassCard trip={trip} reason={`El plan gratis guarda hasta ${limit ?? 3} documentos por viaje.`} />
      </Sheet>
    </div>
  );
}
