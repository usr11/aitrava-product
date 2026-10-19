'use client';

import { bookingCat } from '@/lib/catalog';
import { formatCOP, formatDate, formatTime } from '@/lib/format';
import type { Booking, VaultDocument } from '@/lib/types';
import { Icon } from '../Icon';
import { Tone } from '../ui';

export function BookingCard({
  b,
  docs,
  onEdit,
  onDelete,
  onOpenDoc,
  onAttach,
}: {
  b: Booking;
  docs: VaultDocument[];
  onEdit: () => void;
  onDelete: () => void;
  onOpenDoc: (d: VaultDocument) => void;
  onAttach: () => void;
}) {
  const c = bookingCat(b.category);
  return (
    <article className="card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky text-blue">
          <Icon name={c.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-navy">{b.title}</h3>
          <p className="text-sm text-text-2">
            {[b.provider, b.reference && `Ref. ${b.reference}`].filter(Boolean).join(' · ') || c.label}
          </p>
          {b.startAt && (
            <p className="mt-1 text-sm text-navy">
              {formatDate(b.startAt, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(b.startAt)}
              {b.endAt && ` → ${formatDate(b.endAt)}${b.endAt.slice(11, 16) !== '00:00' ? ` ${formatTime(b.endAt)}` : ''}`}
            </p>
          )}
          {b.address && <p className="text-sm text-text-2">{b.address}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {b.cost != null && <span className="num text-sm font-semibold text-navy">{formatCOP(b.cost)}</span>}
            {b.isPaid ? <Tone tone="ok">Pagado</Tone> : <Tone tone="warn">Por pagar</Tone>}
            {b.source === 'externa' && <Tone tone="muted">Comprado fuera de AITRAVA</Tone>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {docs.map((d) => (
          <button key={d.id} onClick={() => onOpenDoc(d)} className="btn btn-navy btn-sm">
            <Icon name={d.mimeType.startsWith('image/') ? 'qr' : 'file'} size={16} /> {d.mimeType.startsWith('image/') ? 'Ver QR / imagen' : 'Ver documento'}
          </button>
        ))}
        <button onClick={onAttach} className="btn btn-outline btn-sm">
          <Icon name="upload" size={16} /> Adjuntar
        </button>
        <button onClick={onEdit} className="btn btn-ghost btn-sm" aria-label={`Editar ${b.title}`}>
          <Icon name="edit" size={16} /> Editar
        </button>
        <button onClick={onDelete} className="btn btn-ghost btn-sm ml-auto text-bad" aria-label={`Eliminar ${b.title}`}>
          <Icon name="trash" size={16} />
        </button>
      </div>
    </article>
  );
}
