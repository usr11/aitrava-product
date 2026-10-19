'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError, apiBlob, saveBlob, upload } from '@/lib/api';
import { BOOKING_TO_VAULT, VAULT_CATEGORIES, vaultCat } from '@/lib/catalog';
import { useConfig } from '@/lib/config';
import { formatBytes, formatDate, formatTime } from '@/lib/format';
import { track } from '@/lib/track';
import { useLoadedTrip } from '@/lib/trip-context';
import type { Booking, VaultDocument } from '@/lib/types';
import { Icon } from '../Icon';
import { Alert, Field, Sheet } from '../ui';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export function UploadDocumentModal({
  open,
  onClose,
  booking,
  onPassRequired,
}: {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  onPassRequired?: () => void;
}) {
  const { trip, mutate } = useLoadedTrip();
  const config = useConfig();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('vuelos');
  const [bookingId, setBookingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const max = config?.upload.maxBytes ?? 5 * 1024 * 1024;

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setError('');
    setTitle(booking ? booking.title : '');
    setCategory(booking ? (BOOKING_TO_VAULT[booking.category] ?? 'otros') : 'vuelos');
    setBookingId(booking?.id ?? '');
  }, [open, booking]);

  const pick = (f: File | undefined) => {
    setError('');
    if (!f) return;
    if (!ACCEPT.split(',').includes(f.type)) return setError('Archivo inválido: solo PDF, JPG, PNG o WEBP.');
    if (f.size > max) return setError(`El archivo pesa ${formatBytes(f.size)}: el máximo es ${formatBytes(max)}.`);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').slice(0, 120));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Elige un archivo');
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim() || file.name);
    form.append('category', category);
    if (bookingId) form.append('bookingId', bookingId);
    try {
      await mutate(() => upload(`/trips/${trip.id}/documents`, form));
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.code === 'PASS_REQUIRED') {
        onClose();
        onPassRequired?.();
      } else setError(apiErr.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Agregar a tu Bóveda">
      <form onSubmit={submit} className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-line-2 px-4 py-7 text-center transition hover:border-blue"
        >
          <Icon name={file ? 'file' : 'upload'} size={28} className="text-blue" />
          <span className="mt-2 font-semibold text-navy">{file ? file.name : 'Elige un archivo o toma una foto'}</span>
          <span className="text-sm text-text-2">{file ? formatBytes(file.size) : 'PDF, JPG, PNG o WEBP · máximo 5 MB'}</span>
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Archivo" />
        <Field label="Nombre" htmlFor="v-title">
          <input id="v-title" className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Tiquete Bogotá → Madrid" />
        </Field>
        <Field label="Categoría" htmlFor="v-cat">
          <select id="v-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {VAULT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        {trip.bookings.length > 0 && (
          <Field label="Reserva asociada (opcional)" htmlFor="v-booking">
            <select id="v-booking" className="input" value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
              <option value="">Ninguna</option>
              {trip.bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </Field>
        )}
        {trip.limits.vaultDocuments != null && (
          <p className="text-sm text-text-2">
            Plan gratis: {trip.documents.length} de {trip.limits.vaultDocuments} documentos en este viaje.
          </p>
        )}
        {error && <Alert tone="bad">{error}</Alert>}
        <button className="btn btn-navy w-full" disabled={busy || !file}>
          {busy ? 'Subiendo…' : 'Guardar en la Bóveda'}
        </button>
        <p className="text-center text-xs text-text-2">Tus archivos son privados: solo tú los ves con tu sesión.</p>
      </form>
    </Sheet>
  );
}

/** Abre un documento privado (como blob, sin URL pública). Imágenes y QR en grande. */
export function DocumentViewer({ doc, onClose }: { doc: VaultDocument | null; onClose: () => void }) {
  const { trip } = useLoadedTrip();
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const [qrMode, setQrMode] = useState(false);
  const [zoom, setZoom] = useState(false);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!doc) return;
    let objectUrl: string | null = null;
    setError('');
    setUrl(null);
    setQrMode(false);
    setZoom(false);
    apiBlob(`/trips/${trip.id}/documents/${doc.id}/file`)
      .then((b) => {
        setBlob(b);
        objectUrl = URL.createObjectURL(b);
        setUrl(objectUrl);
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, trip.id]);

  // Mantener la pantalla encendida mientras se muestra el QR (si el navegador lo permite).
  useEffect(() => {
    if (!qrMode) {
      wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
      return;
    }
    navigator.wakeLock
      ?.request('screen')
      .then((w) => (wakeRef.current = w))
      .catch(() => {});
  }, [qrMode]);

  if (!doc) return null;
  const booking = trip.bookings.find((b) => b.id === doc.bookingId);
  const isImage = doc.mimeType.startsWith('image/');
  const looksQr = isImage && /qr|entrada|ticket|boarding|pase/i.test(`${doc.title} ${doc.fileName}`);

  if (qrMode && url) {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label={`QR: ${doc.title}`}>
        <div className="flex items-center justify-between p-4" style={{ paddingTop: 'calc(16px + var(--safe-top))' }}>
          <p className="font-bold text-navy">{booking?.title ?? doc.title}</p>
          <button onClick={() => setQrMode(false)} className="btn btn-outline btn-sm">
            Cerrar
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={doc.title} className="max-h-full w-full max-w-md object-contain" />
        </div>
        {booking && (
          <div className="border-t border-line p-4 text-center" style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}>
            {booking.startAt && (
              <p className="font-semibold text-navy">
                {formatDate(booking.startAt, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(booking.startAt)}
              </p>
            )}
            {booking.reference && <p className="font-mono text-lg tracking-wider text-navy">{booking.reference}</p>}
            <p className="mt-1 text-xs text-text-2">Sube el brillo de tu pantalla si el lector no lo reconoce.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Sheet open={!!doc} onClose={onClose} title={doc.title} wide>
      {booking && (
        <div className="mb-4 rounded-2xl bg-surface p-3 text-sm">
          <p className="font-semibold text-navy">{booking.title}</p>
          <p className="text-text-2">
            {booking.startAt && `${formatDate(booking.startAt)} · ${formatTime(booking.startAt)}`}
            {booking.reference && ` · Ref. ${booking.reference}`}
          </p>
        </div>
      )}
      {error ? (
        <Alert tone="bad">{error}</Alert>
      ) : !url ? (
        <div className="skeleton h-72" />
      ) : isImage ? (
        <button onClick={() => setZoom((z) => !z)} className={`block w-full overflow-auto rounded-2xl bg-surface ${zoom ? 'max-h-[70dvh]' : ''}`} aria-label={zoom ? 'Alejar' : 'Acercar'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={doc.title} className={`mx-auto ${zoom ? 'max-w-none' : 'max-h-[60dvh] w-full object-contain'}`} style={zoom ? { width: '200%' } : undefined} />
        </button>
      ) : (
        <object data={url} type="application/pdf" className="hidden h-[60dvh] w-full rounded-2xl border border-line sm:block" aria-label={doc.title}>
          <p className="p-4 text-sm text-text-2">Tu navegador no muestra PDFs aquí. Ábrelo o descárgalo.</p>
        </object>
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {looksQr && url && (
          <button onClick={() => setQrMode(true)} className="btn btn-primary">
            <Icon name="qr" size={18} /> Ver QR en grande
          </button>
        )}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-navy">
            <Icon name="eye" size={18} /> Abrir
          </a>
        )}
        {blob && (
          <button onClick={() => saveBlob(blob, doc.fileName)} className="btn btn-outline">
            <Icon name="download" size={18} /> Descargar
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-text-2">
        {vaultCat(doc.category).label} · {formatBytes(doc.size)} · agregado el {formatDate(doc.createdAt, { day: 'numeric', month: 'long' })}
      </p>
    </Sheet>
  );
}

export function useVaultOpened() {
  const { trip } = useLoadedTrip();
  useEffect(() => {
    track('vault_opened', {}, trip.id);
  }, [trip.id]);
}
