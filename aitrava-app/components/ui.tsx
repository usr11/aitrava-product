'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { lockScroll } from '@/lib/scroll-lock';
import { Icon, type IconName } from './Icon';

/* ── Medidor de cupos: cada punto es una persona del grupo ──────────────── */

export function SeatMeter({
  capacity,
  taken,
  onPine = false,
  size = 'md',
}: {
  capacity: number;
  taken: number;
  onPine?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const left = Math.max(0, capacity - taken);
  const few = left > 0 && left <= 2;
  const dot = size === 'lg' ? 'size-4' : size === 'sm' ? 'size-2.5' : 'size-3';
  const filled = onPine ? 'bg-paper' : 'bg-pine';
  const empty = onPine ? 'border-on-pine-2' : 'border-ink-3';
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="flex gap-1.5" aria-hidden>
        {Array.from({ length: capacity }, (_, i) => (
          <span
            key={i}
            className={`${dot} rounded-full ${i < taken ? filled : few ? 'bg-flare' : `border-[1.5px] ${empty}`}`}
          />
        ))}
      </span>
      <span className={`narrow tnum text-sm font-semibold ${onPine ? 'text-on-pine' : few ? 'text-flare-ink' : 'text-ink-2'}`}>
        {left === 0 ? 'Cupos agotados' : left === 1 ? 'Queda 1 cupo' : `Quedan ${left} de ${capacity} cupos`}
      </span>
    </div>
  );
}

/* ── Estados ─────────────────────────────────────────────────────────── */

export function EmptyState({
  icon = 'sun',
  title,
  text,
  action,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-start gap-3 p-6 sm:p-8">
      <span className="grid size-12 place-items-center rounded-full bg-paper-2 text-pine">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="title text-xl">{title}</h3>
      {text && <p className="max-w-prose text-ink-2">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Cargando…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-20" />
      ))}
    </div>
  );
}

export function ErrorState({
  title = 'No pudimos cargar esto',
  text,
  onRetry,
}: {
  title?: string;
  text?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="panel flex flex-col items-start gap-3 border-flare-ink/30 p-6">
      <span className="grid size-11 place-items-center rounded-full bg-flare-bg text-flare-ink">
        <Icon name="alert" size={22} />
      </span>
      <h3 className="title text-lg">{title}</h3>
      {text && <p className="text-ink-2">{text}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-line btn-sm mt-1">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

const TONES = {
  info: 'bg-paper-2 text-ink',
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-flare-bg text-flare-ink',
} as const;

export function Alert({ tone = 'info', children, icon }: { tone?: keyof typeof TONES; children: React.ReactNode; icon?: IconName }) {
  const i: IconName = icon ?? (tone === 'ok' ? 'checkCircle' : tone === 'info' ? 'info' : 'alert');
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl p-4 text-[0.95rem] ${TONES[tone]}`}>
      <Icon name={i} size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Badge({ tone = 'info', children }: { tone?: keyof typeof TONES | 'pine' | 'ember'; children: React.ReactNode }) {
  const cls =
    tone === 'pine' ? 'bg-pine text-paper' : tone === 'ember' ? 'bg-ember text-pine' : TONES[tone];
  return <span className={`narrow inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.8rem] font-semibold ${cls}`}>{children}</span>;
}

/** Marca lo que no es real (regla de oro 1). */
export function DemoBadge() {
  return (
    <Badge tone="warn">
      <Icon name="info" size={13} /> DEMO
    </Badge>
  );
}

/* ── Hoja inferior (móvil) / modal (escritorio) ─────────────────────────── */

export function Sheet({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const unlock = lockScroll();
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])')?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      unlock();
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-pine/50 [animation:fade-in_.15s_ease] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[94dvh] w-full flex-col rounded-t-[24px] bg-paper [animation:sheet-up_.25s_cubic-bezier(.2,.8,.2,1)] sm:rounded-[24px] sm:[animation:fade-in_.15s_ease] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2 sm:px-6 sm:pt-5">
          <h2 id={titleId} className="title text-xl">
            {title}
          </h2>
          <button data-close onClick={onClose} className="btn -mr-2 size-11 min-h-0 rounded-full p-0 hover:bg-paper-2" aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(20px+var(--safe-bottom))] sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {text && <div className="text-ink-2">{text}</div>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button onClick={onClose} className="btn btn-line">
          Volver
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
          className="btn btn-pine"
        >
          {busy ? 'Un momento…' : confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}

/* ── Formularios ─────────────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  optional = false,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label} {optional && <span className="font-normal text-ink-3">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

/** Sí / No grande, accesible (radios nativos). */
export function YesNo({
  name,
  value,
  onChange,
  yes = 'Sí',
  no = 'No',
}: {
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  yes?: string;
  no?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        [true, yes],
        [false, no],
      ].map(([v, l]) => (
        <label key={String(v)} className="choice">
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v as boolean)} />
          {l as string}
        </label>
      ))}
    </div>
  );
}

export function SectionHeading({ title, text, id }: { title: string; text?: string; id?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="title text-[1.9rem] sm:text-[2.4rem]">
        {title}
      </h2>
      {text && <p className="mt-3 text-[1.05rem] text-ink-2">{text}</p>}
    </div>
  );
}
