'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { MODULE_PAGES } from '@/lib/catalog';
import { formatCOP } from '@/lib/format';
import { useLoadedTrip } from '@/lib/trip-context';
import type { Booking, VaultDocument } from '@/lib/types';
import { Icon } from '../Icon';
import { Alert, ConfirmDialog, EmptyState, SectionTitle, Sheet } from '../ui';
import { BookingCard } from './BookingCard';
import { BookingForm } from './forms';
import { PassCard } from './Paywall';
import { DocumentViewer, UploadDocumentModal } from './vault';

export function BookingsModule({ moduleKey }: { moduleKey: keyof typeof MODULE_PAGES }) {
  const { trip, mutate } = useLoadedTrip();
  const mod = MODULE_PAGES[moduleKey];
  const list = trip.bookings.filter((b) => mod.categories.includes(b.category));
  const [form, setForm] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [attach, setAttach] = useState<Booking | null>(null);
  const [justSaved, setJustSaved] = useState<Booking | null>(null);
  const [removing, setRemoving] = useState<Booking | null>(null);
  const [doc, setDoc] = useState<VaultDocument | null>(null);
  const [paywall, setPaywall] = useState(false);
  const total = list.reduce((s, b) => s + (b.cost ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionTitle
        eyebrow={trip.destinationCity}
        title={mod.title}
        action={
          <button onClick={() => setForm({ open: true, booking: null })} className="btn btn-navy btn-sm">
            <Icon name="plus" size={16} /> Agregar
          </button>
        }
      />
      {justSaved && (
        <div className="mb-4">
          <Alert tone="ok">
            Guardamos <strong>{justSaved.title}</strong>. ¿Tienes el tiquete, la confirmación o el QR?{' '}
            <button className="font-semibold underline" onClick={() => (setAttach(justSaved), setJustSaved(null))}>
              Súbelo a tu Bóveda
            </button>
          </Alert>
        </div>
      )}
      {!list.length ? (
        <EmptyState
          icon={mod.icon}
          title="Lo hayas comprado donde lo hayas comprado, agrégalo a tu viaje."
          text={mod.empty}
          action={
            <button onClick={() => setForm({ open: true, booking: null })} className="btn btn-primary">
              Agregar reserva
            </button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {list.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                docs={trip.documents.filter((d) => d.bookingId === b.id)}
                onEdit={() => setForm({ open: true, booking: b })}
                onDelete={() => setRemoving(b)}
                onOpenDoc={setDoc}
                onAttach={() => setAttach(b)}
              />
            ))}
          </div>
          {total > 0 && (
            <p className="mt-4 text-right text-sm text-text-2">
              Total en {mod.title.toLowerCase()}: <strong className="num text-navy">{formatCOP(total)}</strong>
            </p>
          )}
        </>
      )}

      <BookingForm
        open={form.open}
        booking={form.booking}
        categories={mod.categories}
        onClose={() => setForm({ open: false, booking: null })}
        onSaved={(b) => !form.booking && setJustSaved(b)}
      />
      <UploadDocumentModal open={!!attach} booking={attach} onClose={() => setAttach(null)} onPassRequired={() => setPaywall(true)} />
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Eliminar esta reserva?"
        text="También se quitará del itinerario. Los documentos de la Bóveda se conservan."
        onConfirm={() => mutate(() => api(`/trips/${trip.id}/bookings/${removing!.id}`, { method: 'DELETE' }))}
      />
      <Sheet open={paywall} onClose={() => setPaywall(false)} title="Bóveda completa">
        <PassCard trip={trip} reason={`Llegaste al límite de ${trip.limits.vaultDocuments ?? 3} documentos del plan gratis.`} />
      </Sheet>
    </div>
  );
}
