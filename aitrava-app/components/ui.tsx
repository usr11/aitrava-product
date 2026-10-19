'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { lockScroll } from '@/lib/scroll-lock';
import { Icon, type IconName } from './Icon';

/* ── Estados ─────────────────────────────────────────────────────────── */

export function EmptyState({
  icon = 'sparkle',
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
    <div className="card-flat flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-white text-blue shadow-[var(--shadow-soft)]">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-text-2">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Cargando tu viaje…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      <div className="skeleton h-28" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-16" />
      ))}
      <p className="pt-1 text-center text-sm text-text-3">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = 'No pudimos cargar esto',
  text,
  onRetry,
  icon = 'alert',
}: {
  title?: string;
  text?: string;
  onRetry?: () => void;
  icon?: IconName;
}) {
  return (
    <div className="card-flat flex flex-col items-center px-6 py-10 text-center" role="alert">
      <span className="grid size-12 place-items-center rounded-2xl bg-bad-bg text-bad">
        <Icon name={icon} />
      </span>
      <h3 className="mt-3 font-bold text-navy">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-text-2">{text}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-sm mt-4">
          <Icon name="refresh" size={18} /> Intentar de nuevo
        </button>
      )}
    </div>
  );
}

export function Alert({
  tone = 'info',
  children,
  icon,
}: {
  tone?: 'info' | 'ok' | 'warn' | 'bad';
  children: React.ReactNode;
  icon?: IconName;
}) {
  const styles = {
    info: 'bg-sky text-navy',
    ok: 'bg-ok-bg text-ok',
    warn: 'bg-warn-bg text-warn',
    bad: 'bg-bad-bg text-bad',
  }[tone];
  const defaultIcon: IconName = { info: 'info', ok: 'checkCircle', warn: 'alert', bad: 'alert' }[tone] as IconName;
  return (
    <div className={`flex gap-3 rounded-2xl px-4 py-3 text-sm ${styles}`} role={tone === 'bad' ? 'alert' : 'status'}>
      <Icon name={icon ?? defaultIcon} size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ── Etiquetas y progreso ────────────────────────────────────────────── */

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`badge bg-yellow-soft text-warn ring-1 ring-yellow/60 ${className}`} title="Datos de demostración">
      Demo
    </span>
  );
}

export function Tone({ tone, children }: { tone: 'ok' | 'warn' | 'bad' | 'muted' | 'blue'; children: React.ReactNode }) {
  const styles = {
    ok: 'bg-ok-bg text-ok',
    warn: 'bg-warn-bg text-warn',
    bad: 'bg-bad-bg text-bad',
    muted: 'bg-surface text-text-2',
    blue: 'bg-sky text-blue',
  }[tone];
  return <span className={`badge ${styles}`}>{children}</span>;
}

export function ProgressBar({
  value,
  tone = 'yellow',
  label,
  size = 'md',
}: {
  value: number;
  tone?: 'yellow' | 'blue' | 'ok' | 'navy';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const color = { yellow: 'bg-yellow', blue: 'bg-blue', ok: 'bg-ok', navy: 'bg-navy' }[tone];
  const h = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }[size];
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`${h} w-full overflow-hidden rounded-full bg-line`}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`${h} ${color} rounded-full transition-[width] duration-700`} style={{ width: `${v}%` }} />
    </div>
  );
}

/* ── Sheet (bottom sheet en móvil, modal en escritorio) ──────────────── */

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
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])')?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlock();
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`animate-sheet flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-white shadow-[var(--shadow-lift)] sm:rounded-[28px] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-2 sm:hidden" aria-hidden />
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2 sm:px-6 sm:pt-5">
          <h2 id={titleId} className="text-lg font-bold text-navy">
            {title}
          </h2>
          <button data-close onClick={onClose} className="btn btn-ghost -mr-2 size-11 rounded-full p-0" aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-[calc(20px+var(--safe-bottom))] sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = 'Eliminar',
  onConfirm,
  onClose,
  danger = true,
}: {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {text && <p className="text-text-2">{text}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button onClick={onClose} className="btn btn-outline">
          Cancelar
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
          className={`btn ${danger ? 'btn-danger' : 'btn-navy'}`}
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
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-bad">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

/** Valor en pesos con separador de miles mientras se escribe. Abre el teclado numérico. */
export function MoneyInput({
  value,
  onChange,
  id,
  placeholder = '0',
  required,
  allowNegative = false,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  allowNegative?: boolean;
}) {
  const [neg, setNeg] = useState(false);
  const shown = value == null ? '' : new Intl.NumberFormat('es-CO').format(Math.abs(value));
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-text-3">
        {allowNegative && neg ? '−$' : '$'}
      </span>
      <input
        id={id}
        className={`input num ${allowNegative && neg ? 'pl-10' : 'pl-8'}`}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        value={shown}
        onChange={(e) => {
          const raw = e.target.value;
          const isNeg = allowNegative && raw.trim().startsWith('-');
          setNeg(isNeg);
          const digits = raw.replace(/\D/g, '');
          onChange(digits ? Number(digits) * (isNeg ? -1 : 1) : null);
        }}
      />
    </div>
  );
}

/* ── Navegación ──────────────────────────────────────────────────────── */

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-text-2 hover:text-navy">
      <Icon name="back" size={18} /> {label}
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow text-blue">{eyebrow}</p>}
        <h2 className="text-xl font-extrabold tracking-tight text-navy sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
